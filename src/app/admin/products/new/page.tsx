"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Package,
  Layers,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [taxRate, setTaxRate] = useState("18");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("25");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [deliveryTime, setDeliveryTime] = useState("5-8 business days");
  const [dispatchDays, setDispatchDays] = useState("2");

  // Images state
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=800&fit=crop",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Variants state
  const [variants, setVariants] = useState<
    Array<{ title: string; sku: string; price: string; stock: string }>
  >([]);

  // Load categories
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          setCategoryId(data.categories[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCats();
  }, []);

  // Auto-fill slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setSlug(generatedSlug);
    if (!sku && val.length >= 3) {
      setSku(
        `${val.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
      );
    }
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    const variantIndex = variants.length + 1;
    setVariants([
      ...variants,
      {
        title: `Option ${variantIndex}`,
        sku: `${sku || "VAR"}-OPT${variantIndex}`,
        price: price || "999",
        stock: "15",
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId || !sku) {
      toast("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          sku,
          description,
          shortDescription,
          price,
          compareAtPrice: compareAtPrice || undefined,
          taxRate,
          categoryId,
          stock,
          lowStockThreshold,
          images,
          variants,
          deliveryTime,
          dispatchDays: parseInt(dispatchDays, 10) || 2,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Product "${name}" created successfully!`, "success");
        router.push("/admin/products");
      } else {
        toast(data.error || "Failed to create product", "error");
      }
    } catch (err) {
      toast("Error creating product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Top Header */}
      <div>
        <Link
          href="/admin/products"
          className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline mb-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Create New Marketplace Product
        </h1>
        <p className="text-xs text-slate-500">
          Publish a new item with variants, gallery images, and inventory
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Card 1: Basic Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span>Basic Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. NovaAudio Echo Wireless Studio Speaker"
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. NOVA-SPK-01"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-name"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-slate-600 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Short Description</label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary shown on cards"
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Full Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive product specifications, features, and warranty details..."
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Pricing & Inventory */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2">Pricing & Inventory</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2499"
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">MRP / Compare (₹)</label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="3499"
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500 text-slate-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Initial Stock Units</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Low Stock Alert Level</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2.5: Sourcing, Fulfillment & Delivery Estimation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sourcing & Delivery Estimation</h2>
              <p className="text-xs text-slate-500">Configure customer delivery timeline and dispatch SLAs for this product</p>
            </div>
            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              Wholesale & Micro-Inventory Friendly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 text-xs">
                Customer Delivery Window
              </label>
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500 bg-white text-xs font-semibold"
              >
                <option value="3-5 business days">3 – 5 Business Days (Fast / Ready Stock)</option>
                <option value="5-8 business days">5 – 8 Business Days (Standard Sourcing & QC)</option>
                <option value="7-10 business days">7 – 10 Business Days (Wholesale Procurement & Inspection)</option>
                <option value="10-14 business days">10 – 14 Business Days (Custom Batch / Sourced on Demand)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Shown to buyers on the Product Page and Checkout Agreement notice.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 text-xs">
                Handling & Packing SLA (Days to Courier Handover)
              </label>
              <select
                value={dispatchDays}
                onChange={(e) => setDispatchDays(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500 bg-white text-xs font-semibold"
              >
                <option value="1">1 Business Day (Same-Day / Next-Day Dispatch)</option>
                <option value="2">2 Business Days (Inspection & Safe Packing)</option>
                <option value="3">3 Business Days (Wholesale Arrival & Inspection)</option>
                <option value="4">4 Business Days (Extended Procurement & Repackaging)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Time required before parcel is handed over to courier partner.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Product Gallery Images */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>Product Gallery Images</span>
          </h2>

          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste Image URL (Unsplash, CDN, or web URL)..."
              className="flex-1 p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl"
            >
              Add Image
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group"
              >
                <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1 rounded-md bg-rose-600 text-white shadow-md opacity-90 hover:opacity-100"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Product Variants */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Product Variants (Optional)</span>
            </h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">
              No variants defined. The base price and stock above will be used.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
                >
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500">Variant Title</label>
                    <input
                      type="text"
                      value={v.title}
                      onChange={(e) => handleVariantChange(idx, "title", e.target.value)}
                      placeholder="e.g. Midnight Black / 256GB"
                      className="w-full p-2 rounded-lg border bg-white border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500">SKU</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                      className="w-full p-2 rounded-lg border bg-white border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Price (₹)</label>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                      className="w-full p-2 rounded-lg border bg-white border-slate-300"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-3 sm:pt-0">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-500">Stock</label>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                        className="w-full p-2 rounded-lg border bg-white border-slate-300"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 mt-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link
            href="/admin/products"
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-50 text-sm"
          >
            {isSubmitting ? "Publishing Listing..." : "Publish Product Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
