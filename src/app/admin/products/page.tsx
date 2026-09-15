"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  ChevronLeft,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/products?q=${encodeURIComponent(searchQuery)}`);
      if (res.status === 403) {
        toast("Access denied. Admin role required.", "error");
        router.push("/login?redirect=/admin/products");
        return;
      }
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchQuery]);

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast(`Product "${name}" deleted`, "success");
        setProducts(products.filter((p) => p.id !== id));
      } else {
        toast("Failed to delete product", "error");
      }
    } catch (err) {
      toast("Error deleting product", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <Link
            href="/admin"
            className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline mb-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Command Center</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-xs text-slate-500">
            Create, update, and manage all active listings and inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Toolbar: Search and Refresh */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={loadProducts}
          className="self-end sm:self-auto p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-900">No products found</p>
            <Link
              href="/admin/products/new"
              className="inline-block bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Category / Brand</th>
                  <th className="p-3.5">SKU</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Inventory</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const stock = p.inventory?.quantity ?? 0;
                  const isLow = stock <= (p.inventory?.lowStockThreshold ?? 5);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || "https://placehold.co/100"}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-50 border shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-1 truncate"
                          >
                            <span>{p.name}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                          </Link>
                          <span className="text-[11px] text-slate-500">
                            {p.variants?.length > 0 ? `${p.variants.length} Variants` : "Base Item"}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900 block">
                          {p.category?.name || "General"}
                        </span>
                        <span className="text-slate-400 text-[10px]">{p.brand?.name}</span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-600 font-semibold">{p.sku}</td>

                      <td className="p-3.5 font-black text-slate-900">{formatCurrency(p.price)}</td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            isLow ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {stock} in stock
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          disabled={isDeleting === p.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
