import React, { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Store,
  ChevronRight,
  Share2,
  Heart,
  Tag,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductDetailsClient } from "./ProductDetailsClient";
import { formatCurrency, calculateDiscountPercentage } from "@/lib/currency";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch (error) {
    console.error("Failed to generate static params for products:", error);
    return [];
  }
}

const getProduct = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: true,
      subcategory: true,
      brand: true,
      inventory: true,
      reviews: {
        include: {
          user: { select: { name: true, image: true } },
          images: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return { title: "Product Not Found" };

  const priceText = `₹${product.price.toLocaleString("en-IN")}`;
  const desc = `${priceText} | ${product.shortDescription || product.description.substring(0, 140)} - Buy online with Free Express Delivery on HypperStore.`;
  const primaryImage = product.images?.[0]?.url || "/og-image.png";

  return {
    title: `${product.name} | HypperStore`,
    description: desc,
    openGraph: {
      title: `${product.name} — ${priceText}`,
      description: desc,
      url: `https://www.hypperstore.tech/products/${product.slug}`,
      siteName: "HypperStore",
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — ${priceText}`,
      description: desc,
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const [ratingDistribution, relatedProducts, sellerProduct] = await Promise.all([
    prisma.rating.findUnique({
      where: { productId: product.id },
    }),
    prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: "PUBLISHED",
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        brand: true,
        inventory: true,
      },
      take: 4,
    }),
    prisma.sellerProduct.findFirst({
      where: { productId: product.id },
      include: {
        seller: {
          include: { store: true },
        },
      },
    }),
  ]);

  const discountPercent =
    product.discountPercent ||
    calculateDiscountPercentage(product.price, product.compareAtPrice);

  const sellerName =
    sellerProduct?.seller?.store?.name ||
    sellerProduct?.seller?.businessName ||
    "HypperStore Retail Direct";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          href={`/category/${product.category.slug}`}
          className="hover:text-blue-600 transition-colors"
        >
          {product.category.name}
        </Link>
        {product.subcategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600">{product.subcategory.name}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Center/Right Column: Product Details & Purchase Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-blue-600 tracking-wider">
                {product.brand?.name || "HypperStore Exclusive"}
              </span>
              <span className="text-xs font-mono text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-xs font-extrabold">
                <span>{product.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {product.reviewCount.toLocaleString()} Verified Ratings & Reviews
              </span>
            </div>
          </div>

          {/* Interactive Client-Side Selector: Variants, Price, Quantity, Add to Cart */}
          <ProductDetailsClient
            product={product}
            variants={product.variants}
            initialStock={product.inventory?.quantity || 10}
            discountPercent={discountPercent}
          />

          {/* Available Offers Accordion */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
            <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-600" />
              <span>Available Marketplace Offers & Coupons</span>
            </h4>
            <ul className="space-y-1.5 text-amber-900">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>
                  <strong>WELCOME50</strong>: Flat 50% discount up to ₹500 on your first order.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>
                  <strong>FESTIVE20</strong>: Flat 20% discount on orders above ₹1,499.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>
                  <strong>Bank Offer</strong>: 10% instant discount on major credit cards.
                </span>
              </li>
            </ul>
          </div>

          {/* Seller / Fulfillment Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="text-slate-500">Sold by</p>
                <p className="font-bold text-slate-900">{sellerName}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                ★ 4.8 Seller Rating
              </span>
            </div>
          </div>

          {/* Trust Value Strip */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <Truck className="w-5 h-5 text-blue-600 mx-auto" />
              <div className="font-bold text-slate-900">Express Delivery</div>
              <div className="text-[10px] text-slate-500">Dispatched in 24h</div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <RotateCcw className="w-5 h-5 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-900">7-Day Return</div>
              <div className="text-[10px] text-slate-500">Hassle-free refund</div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
              <ShieldCheck className="w-5 h-5 text-purple-600 mx-auto" />
              <div className="font-bold text-slate-900">Genuine Guarantee</div>
              <div className="text-[10px] text-slate-500">100% Authentic</div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description & Specifications */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Product Overview & Details</h2>
        <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {product.description}
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Similar Products You Might Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews & Ratings Section */}
      <ReviewsSection
        productId={product.id}
        productName={product.name}
        averageRating={product.rating}
        totalReviews={product.reviewCount}
        reviews={product.reviews}
        ratingDistribution={ratingDistribution}
      />
    </div>
  );
}
