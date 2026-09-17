"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle2,
  Plus,
  Truck,
  ShieldCheck,
  Boxes,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";

export default function SellerPortalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sellerData, setSellerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSellerInfo() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.authenticated) {
          toast("Please log in as seller@hubstore.com", "info");
          router.push("/login?redirect=/seller");
          return;
        }

        if (data.user.role !== "SELLER" && data.user.role !== "ADMIN") {
          toast("You need a Seller account to access this portal.", "error");
          router.push("/register");
          return;
        }

        setSellerData(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSellerInfo();
  }, [router, toast]);

  if (isLoading || !sellerData) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">Loading Seller Portal...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Seller Store Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Apex Electronics & Retail</h1>
              <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Verified Merchant
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Authorized flagship store • GSTIN: 29AAAAA0000A1Z5 • 4.8★ Customer Rating
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/seller/inventory"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-colors flex items-center gap-2"
          >
            <Boxes className="w-4 h-4" />
            <span>Bulk Inventory Studio</span>
          </Link>
          <Link
            href="/seller/orders"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-colors flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Fulfill Orders</span>
          </Link>
          <Link
            href="/seller/analytics"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-colors flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Revenue Studio</span>
          </Link>
          <Link
            href="/admin/products"
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-colors"
          >
            Manage Catalog
          </Link>
          <Link
            href="/admin/products/new"
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/seller/analytics"
          className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-xs hover:border-indigo-400 transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Net Merchant Payout</span>
            <span className="text-[10px] text-indigo-600 font-bold group-hover:underline">Studio →</span>
          </div>
          <div className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
            ₹1,84,500
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">+18.4% vs last month</p>
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500">Orders Dispatched</span>
          <div className="text-2xl font-black text-slate-900">38 Units</div>
          <p className="text-[11px] text-slate-500 font-medium">99.4% on-time fulfillment</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500">Active Listings</span>
          <div className="text-2xl font-black text-slate-900">32 Products</div>
          <p className="text-[11px] text-blue-600 font-semibold">Across 4 major categories</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500">Return Rate</span>
          <div className="text-2xl font-black text-emerald-600">0.8%</div>
          <p className="text-[11px] text-emerald-600 font-semibold">Well below platform 3% avg</p>
        </div>
      </div>

      {/* Seller Inventory & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Assigned Merchant Inventory</h2>
            <p className="text-xs text-slate-500">Real-time sync with HypperStore fulfillment centers</p>
          </div>
          <Link href="/products" className="text-xs text-blue-600 font-bold hover:underline">
            View Live Storefront Listings →
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-950">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600 shrink-0" />
            <span>
              <strong>HypperStore Express Fulfillment</strong> is enabled for all your inventory items.
              Packages are picked up directly from your warehouse within 12 hours of order placement.
            </span>
          </div>
          <Link
            href="/seller/inventory"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shrink-0 transition-colors"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Bulk Inventory Studio →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
