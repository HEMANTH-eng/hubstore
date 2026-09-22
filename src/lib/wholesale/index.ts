import { prisma } from "@/lib/db";
import { SupplierAdapter, SupplierConfig, SourcedProduct, OrderDispatchPayload, DispatchResult } from "./types";
import { verifiedDemoFeedAdapter } from "./adapters/verifiedDemoFeed";
import { cjDropshippingAdapter } from "./adapters/cjDropshipping";
import { baapstoreAdapter } from "./adapters/baapstore";
import { customFeedAdapter } from "./adapters/customFeed";

export class WholesaleService {
  private static adapters: Record<string, SupplierAdapter> = {
    DEMO_WHOLESALE: verifiedDemoFeedAdapter,
    CJ_DROPSHIPPING: cjDropshippingAdapter,
    BAAPSTORE: baapstoreAdapter,
    CUSTOM_FEED: customFeedAdapter,
  };

  static getAdapter(provider: string): SupplierAdapter {
    return this.adapters[provider] || verifiedDemoFeedAdapter;
  }

  /**
   * Initializes default verified wholesale supplier if database has none
   */
  static async ensureDefaultSupplier() {
    const count = await prisma.wholesaleSupplier.count();
    if (count === 0) {
      const defaultSupplier = await prisma.wholesaleSupplier.create({
        data: {
          name: "HypperStore Verified Wholesale Hub (Direct Factory India & Global)",
          provider: "DEMO_WHOLESALE",
          markupType: "PERCENTAGE",
          markupValue: 40.0, // 40% margin
          autoFulfill: false,
          isActive: true,
        },
      });

      // Populate initial catalog
      await this.syncSupplierCatalog(defaultSupplier.id);
      return defaultSupplier;
    }
    return null;
  }

  /**
   * Synchronizes products from a supplier adapter into WholesaleProduct database cache
   */
  static async syncSupplierCatalog(supplierId: string, query?: string) {
    const supplier = await prisma.wholesaleSupplier.findUnique({
      where: { id: supplierId },
    });
    if (!supplier) throw new Error("Supplier not found");

    const adapter = this.getAdapter(supplier.provider);
    const config: SupplierConfig = {
      id: supplier.id,
      name: supplier.name,
      provider: supplier.provider as any,
      apiKey: supplier.apiKey || undefined,
      apiSecret: supplier.apiSecret || undefined,
      endpointUrl: supplier.endpointUrl || undefined,
      markupType: supplier.markupType as any,
      markupValue: supplier.markupValue,
      autoFulfill: supplier.autoFulfill,
      isActive: supplier.isActive,
    };

    const items = await adapter.fetchCatalog(config, query);

    for (const item of items) {
      const profit = Math.max(0, item.suggestedRetailPrice - item.costPrice);
      await prisma.wholesaleProduct.upsert({
        where: {
          supplierId_supplierSku: {
            supplierId: supplier.id,
            supplierSku: item.supplierSku,
          },
        },
        create: {
          supplierId: supplier.id,
          supplierSku: item.supplierSku,
          title: item.title,
          category: item.category,
          costPrice: item.costPrice,
          suggestedRetailPrice: item.suggestedRetailPrice,
          profitMargin: profit,
          stock: item.stock,
          images: JSON.stringify(item.images),
          shortDescription: item.shortDescription || null,
          description: item.description || null,
        },
        update: {
          title: item.title,
          costPrice: item.costPrice,
          suggestedRetailPrice: item.suggestedRetailPrice,
          profitMargin: profit,
          stock: item.stock,
          images: JSON.stringify(item.images),
          lastSyncedAt: new Date(),
        },
      });
    }

    await prisma.wholesaleSupplier.update({
      where: { id: supplierId },
      data: { lastSyncAt: new Date() },
    });

    return items.length;
  }

  /**
   * One-Click Import a Wholesale Product into HypperStore's Live Product Catalog
   */
  static async importProductToStore(wholesaleProductId: string) {
    const wp = await prisma.wholesaleProduct.findUnique({
      where: { id: wholesaleProductId },
      include: { supplier: true },
    });

    if (!wp) throw new Error("Wholesale product not found");

    // Check if already imported
    if (wp.importedToStore && wp.hypperstoreProductId) {
      const existing = await prisma.product.findUnique({
        where: { id: wp.hypperstoreProductId },
      });
      if (existing) return existing;
    }

    // Find or create Category
    const categorySlug = wp.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: wp.category,
          slug: categorySlug,
          description: `Shop curated ${wp.category} at wholesale direct rates on HypperStore.`,
        },
      });
    }

    // Find or create Brand
    const brandName = "HypperDirect Sourced";
    const brandSlug = "hypperdirect-sourced";
    let brand = await prisma.brand.findUnique({ where: { slug: brandSlug } });
    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: brandName,
          slug: brandSlug,
          description: "Direct wholesale and manufacturer certified products on HypperStore.",
        },
      });
    }

    // Generate unique slug & SKU
    const baseSlug = wp.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    const uniqueSku = `HS-${wp.supplierSku}`;

    const parsedImages: string[] = JSON.parse(wp.images || "[]");
    const compareAtPrice = Math.round(wp.suggestedRetailPrice * 1.3); // 30% higher for compareAtPrice
    const discountPercent = Math.round(((compareAtPrice - wp.suggestedRetailPrice) / compareAtPrice) * 100);

    // Create live product
    const product = await prisma.product.create({
      data: {
        name: wp.title,
        slug: uniqueSlug,
        sku: uniqueSku,
        description: wp.description || wp.title,
        shortDescription: wp.shortDescription || wp.title,
        price: wp.suggestedRetailPrice,
        compareAtPrice,
        discountPercent,
        status: "PUBLISHED",
        featured: true,
        deliveryTime: "3-5 business days",
        dispatchDays: 1,
        rating: 4.8,
        reviewCount: Math.floor(18 + Math.random() * 80),
        categoryId: category.id,
        brandId: brand.id,
        inventory: {
          create: {
            quantity: wp.stock,
            reservedQuantity: 0,
            lowStockThreshold: 5,
          },
        },
        images: {
          create: parsedImages.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            order: idx,
          })),
        },
      },
    });

    // Mark as imported
    await prisma.wholesaleProduct.update({
      where: { id: wholesaleProductId },
      data: {
        importedToStore: true,
        hypperstoreProductId: product.id,
      },
    });

    return product;
  }

  /**
   * Dispatches a customer order to the wholesale supplier
   */
  static async dispatchOrderToSupplier(dispatchId: string) {
    const dispatch = await prisma.wholesaleOrderDispatch.findUnique({
      where: { id: dispatchId },
      include: { supplier: true },
    });

    if (!dispatch) throw new Error("Dispatch record not found");

    const adapter = this.getAdapter(dispatch.supplier.provider);
    const config: SupplierConfig = {
      id: dispatch.supplier.id,
      name: dispatch.supplier.name,
      provider: dispatch.supplier.provider as any,
      apiKey: dispatch.supplier.apiKey || undefined,
      apiSecret: dispatch.supplier.apiSecret || undefined,
      endpointUrl: dispatch.supplier.endpointUrl || undefined,
      markupType: dispatch.supplier.markupType as any,
      markupValue: dispatch.supplier.markupValue,
      autoFulfill: dispatch.supplier.autoFulfill,
      isActive: dispatch.supplier.isActive,
    };

    const payload: OrderDispatchPayload = {
      orderId: dispatch.orderId,
      orderNumber: dispatch.orderNumber,
      customerName: dispatch.customerName,
      customerPhone: dispatch.customerPhone || undefined,
      shippingAddress: JSON.parse(dispatch.shippingAddress || "{}"),
      items: JSON.parse(dispatch.items || "[]"),
    };

    const result = await adapter.dispatchOrder(config, payload);

    const updated = await prisma.wholesaleOrderDispatch.update({
      where: { id: dispatchId },
      data: {
        status: result.status as any,
        carrier: result.carrier || dispatch.carrier,
        trackingNumber: result.trackingNumber || dispatch.trackingNumber,
        supplierOrderRef: result.supplierOrderRef || dispatch.supplierOrderRef,
        errorMessage: result.errorMessage || null,
        dispatchedAt: result.success ? new Date() : undefined,
      },
    });

    return updated;
  }
}
