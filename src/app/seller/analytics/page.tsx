"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  TrendingUp,
  DollarSign,
  Package,
  Truck,
  CheckCircle2,
  Calendar,
  Download,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  Sparkles,
  CreditCard,
  RefreshCw,
  Boxes,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";

export default function SellerAnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartMetric, setChartMetric] = useState<"revenue" | "units">("revenue");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/analytics");
      if (res.status === 401 || res.status === 403) {
        toast("Please sign in with merchant credentials", "error");
        router.push("/login?redirect=/seller/analytics");
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      toast("Failed to load seller analytics", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRequestPayout = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      toast(
        "Payout transfer request of ₹32,500 submitted! Expected credit to HDFC Bank (••••4821) within 24 hours.",
        "success"
      );
    }, 1200);
  };

  const handleDownloadStatement = () => {
    toast("Generating official GST Payout Statement for Sep 2026...", "info");
    setTimeout(() => {
      window.print();
    }, 800);
  };

  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Loading Seller Analytics Studio...</p>
      </div>
    );
  }

  const { metrics, categoryBreakdown, topProducts, monthlyTrend, settlements } = data;

  const maxRevenue = Math.max(...monthlyTrend.map((m: any) => m.revenue), 1);
  const maxUnits = Math.max(...monthlyTrend.map((m: any) => m.units), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Seller Header & Navigation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shadow-inner">
            <TrendingUp className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Apex Electronics & Retail</h1>
              <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Verified Merchant
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Financial & Sourcing Analytics Command Center • GSTIN: 29AAAAA0000A1Z5
            </p>
          </div>
        </div>

        {/* Action / Nav Tabs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/seller"
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/seller/orders"
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4" />
            <span>Orders ({metrics.totalOrdersCount})</span>
          </Link>
          <Link
            href="/seller/inventory"
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <Boxes className="w-4 h-4 text-blue-300" />
            <span>Inventory</span>
          </Link>
          <Link
            href="/seller/analytics"
            className="bg-indigo-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Revenue Studio</span>
          </Link>
          <button
            onClick={handleDownloadStatement}
            id="download-statement-btn"
            className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>GST Statement</span>
          </button>
        </div>
      </div>

      {/* Hero Revenue & Payout Settlement Command Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Net Earnings */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-3 border border-indigo-700/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-200">Net Merchant Earnings</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
              88% Payout Rate
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            ₹{metrics.netSellerRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-indigo-200/80">
            Gross GMV ₹{metrics.grossGMV.toLocaleString("en-IN")} minus 10% platform commission & GST.
          </p>
        </div>

        {/* Card 2: Ready for Withdrawal */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available for Payout</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Instant Bank Transfer
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{metrics.availableForWithdrawal.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">HDFC Bank ••••4821</span>
            <button
              onClick={handleRequestPayout}
              disabled={isWithdrawing}
              id="request-payout-btn"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isWithdrawing ? "Processing..." : "Transfer Now →"}
            </button>
          </div>
        </div>

        {/* Card 3: Escrow / Buyer Protection */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">7-Day Escrow Held</span>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Buyer Protection SLA
            </span>
          </div>
          <div className="text-3xl font-black text-amber-600">
            ₹{metrics.escrowHeldAmount.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Auto-clears into your payout balance once the 7-day buyer return & replacement window expires.
          </p>
        </div>
      </div>

      {/* 4 Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1.5 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Gross Merchandise Value (GMV)</span>
          <div className="text-2xl font-black text-slate-900">
            ₹{metrics.grossGMV.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24.6% vs previous cycle</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1.5 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Units Sold & Dispatched</span>
          <div className="text-2xl font-black text-slate-900">
            {metrics.totalUnitsSold} Units
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {metrics.onTimeDispatchRate}% on-time dispatch rate
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1.5 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Average Order Value (AOV)</span>
          <div className="text-2xl font-black text-slate-900">
            ₹{metrics.averageOrderValue.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-blue-600 font-medium">High margin premium products</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1.5 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Return & Dispute Rate</span>
          <div className="text-2xl font-black text-emerald-600">
            {metrics.returnRatePercent}%
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Exceptional Quality Score</span>
          </div>
        </div>
      </div>

      {/* Interactive Sales Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue & Volume Growth Trend</h3>
              <p className="text-xs text-slate-500">6-Month historical performance trajectory</p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setChartMetric("revenue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMetric === "revenue"
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartMetric("units")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartMetric === "units"
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Units Sold
              </button>
            </div>
          </div>

          {/* SVG Visual Bars */}
          <div className="h-64 flex items-end justify-between gap-3 pt-4 px-2">
            {monthlyTrend.map((m: any, idx: number) => {
              const value = chartMetric === "revenue" ? m.revenue : m.units;
              const maxVal = chartMetric === "revenue" ? maxRevenue : maxUnits;
              const heightPercent = Math.max(Math.round((value / maxVal) * 100), 12);
              const isCurrent = idx === monthlyTrend.length - 1;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap mb-1">
                    {chartMetric === "revenue" ? `₹${value.toLocaleString("en-IN")}` : `${value} Units`}
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[48px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isCurrent
                          ? "bg-gradient-to-t from-blue-600 to-indigo-600 shadow-md shadow-indigo-200"
                          : "bg-indigo-300 group-hover:bg-indigo-400"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Month Label */}
                  <span className={`text-[11px] font-medium ${isCurrent ? "text-indigo-600 font-bold" : "text-slate-500"}`}>
                    {m.month.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue by Category</h3>
            <p className="text-xs text-slate-500">Distribution of wholesale product sales</p>
          </div>

          <div className="space-y-4 my-auto">
            {categoryBreakdown.length > 0 ? (
              categoryBreakdown.map((cat: any, cIdx: number) => (
                <div key={cIdx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="text-slate-500 font-medium">
                      ₹{cat.revenue.toLocaleString("en-IN")} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        cIdx === 0
                          ? "bg-indigo-600"
                          : cIdx === 1
                          ? "bg-blue-500"
                          : cIdx === 2
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-6">
                Category data syncs upon order fulfillment.
              </div>
            )}
          </div>

          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sourcing Recommendation</span>
            </div>
            <p className="text-[11px] text-indigo-800/80 leading-relaxed">
              Audio & Technology inventory commands 68% of merchant profits with the fastest dispatch turnover.
            </p>
          </div>
        </div>
      </div>

      {/* Top Performing SKUs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Top Selling Products & SKU Velocity</h3>
            <p className="text-xs text-slate-500">Live order performance and stock inventory balance</p>
          </div>
          <Link
            href="/admin/products"
            className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
          >
            <span>Full Catalog Studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3">Product Name</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Units Sold</th>
                <th className="pb-3">Gross Revenue</th>
                <th className="pb-3">Stock Remaining</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.map((prod: any) => (
                <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900 flex items-center gap-3">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <span className="truncate max-w-xs">{prod.name}</span>
                  </td>
                  <td className="py-3.5 text-slate-500 font-mono">{prod.sku}</td>
                  <td className="py-3.5 text-slate-600">{prod.category}</td>
                  <td className="py-3.5 font-bold text-slate-900">{prod.unitsSold}</td>
                  <td className="py-3.5 font-bold text-indigo-700">
                    ₹{prod.grossRevenue.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 text-slate-600">
                    <span className="font-semibold">{prod.stock}</span> units
                  </td>
                  <td className="py-3.5 text-right">
                    {prod.stock <= prod.lowStockThreshold ? (
                      <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold border border-rose-200">
                        Low Stock Alert
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                        Optimal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Settlement Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Merchant Payout Ledger & Bank Settlements</h3>
            <p className="text-xs text-slate-500">Automated NEFT / RTGS transfers to registered account</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">HDFC Bank ••••4821</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3">Settlement ID</th>
                <th className="pb-3">UTR / Reference</th>
                <th className="pb-3">Settlement Date</th>
                <th className="pb-3">Cycle Period</th>
                <th className="pb-3">Amount Credited</th>
                <th className="pb-3 text-right">Payout Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.map((set: any) => (
                <tr key={set.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 font-bold text-slate-900 font-mono">{set.id}</td>
                  <td className="py-3.5 text-slate-600 font-mono text-[11px]">{set.utr}</td>
                  <td className="py-3.5 text-slate-600">{set.date}</td>
                  <td className="py-3.5 text-slate-500">{set.period}</td>
                  <td className="py-3.5 font-black text-slate-900 text-sm">
                    ₹{set.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 text-right">
                    {set.status === "SETTLED" ? (
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Settled
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full font-bold border border-amber-200 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Processing
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
