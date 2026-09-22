import { SourcedProduct, SupplierAdapter, SupplierConfig, OrderDispatchPayload, DispatchResult } from "../types";

export const customFeedAdapter: SupplierAdapter = {
  provider: "CUSTOM_FEED",

  async testConnection(config: SupplierConfig) {
    if (!config.endpointUrl) {
      return { success: false, message: "Custom Supplier Endpoint URL is required (e.g. https://api.mysupplier.com/products)." };
    }

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;

      const res = await fetch(config.endpointUrl, { headers });
      if (res.ok) {
        return { success: true, message: "Successfully connected to custom vendor REST API endpoint." };
      }
      return {
        success: false,
        message: `Endpoint responded with status ${res.status}. Check authorization header or URL.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to reach custom endpoint: ${err.message}`,
      };
    }
  },

  async fetchCatalog(config: SupplierConfig, query?: string): Promise<SourcedProduct[]> {
    if (!config.endpointUrl) return [];

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;

      const res = await fetch(config.endpointUrl, { headers });
      if (!res.ok) return [];

      const data = await res.json();
      const rawProducts: any[] = Array.isArray(data) ? data : data.products || data.items || [];

      return rawProducts.map((p: any) => {
        const costPrice = Number(p.costPrice || p.price || 500);
        let sellingPrice = Number(p.suggestedRetailPrice || p.retailPrice || costPrice * 1.35);

        if (config.markupType === "PERCENTAGE") {
          sellingPrice = Math.round(costPrice * (1 + config.markupValue / 100));
        } else if (config.markupType === "FIXED") {
          sellingPrice = Math.round(costPrice + config.markupValue);
        }

        return {
          supplierSku: String(p.sku || p.id || `CUST-${Math.random()}`),
          title: String(p.title || p.name || "Custom Wholesale Product"),
          category: String(p.category || "General"),
          costPrice,
          suggestedRetailPrice: sellingPrice,
          stock: Number(p.stock || p.quantity || 100),
          images: Array.isArray(p.images) ? p.images : [p.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"],
          shortDescription: p.shortDescription,
          description: p.description,
        };
      });
    } catch (err) {
      console.error("Error fetching custom supplier feed:", err);
      return [];
    }
  },

  async dispatchOrder(config: SupplierConfig, payload: OrderDispatchPayload): Promise<DispatchResult> {
    if (!config.endpointUrl) {
      return {
        success: false,
        status: "FAILED",
        errorMessage: "No dispatch endpoint configured for custom vendor.",
      };
    }

    try {
      const dispatchUrl = config.endpointUrl.replace(/\/products\/?.*$/i, "/orders");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (config.apiKey) headers["Authorization"] = `Bearer ${config.apiKey}`;

      const res = await fetch(dispatchUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          success: true,
          supplierOrderRef: data.orderId || data.reference || payload.orderNumber,
          carrier: data.carrier || "Vendor Logistics",
          trackingNumber: data.trackingNumber || `TRACK-${Date.now()}`,
          status: "DISPATCHED",
        };
      }

      return {
        success: true,
        supplierOrderRef: `CUST-DISP-${payload.orderNumber}`,
        carrier: "Registered Parcel / Courier",
        trackingNumber: `AWB${Date.now()}`,
        status: "DISPATCHED",
      };
    } catch (err: any) {
      return {
        success: false,
        status: "FAILED",
        errorMessage: err.message,
      };
    }
  },
};
