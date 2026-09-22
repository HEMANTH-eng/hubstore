"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Truck,
  CheckCircle2,
  RefreshCw,
  Plus,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 403 || res.status === 401) {
        toast("Admin credentials required. Please log in as admin@hubstore.com", "error");
        router.push("/login?redirect=/admin");
        return;
      }
      const data = await res.json();
      setStatsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast(`Order updated to status: ${newStatus}`, "success");
        await loadStats();
      } else {
        toast("Failed to update status", "error");
      }
    } catch (err) {
      toast("Error updating order", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleQuickRestock = async (productId: string) => {
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 50 }),
      });
      if (res.ok) {
        toast("Inventory restocked to 50 units!", "success");
        await loadStats();
      }
    } catch (err) {
      toast("Error restocking inventory", "error");
    }
  };

  if (isLoading || !statsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading Admin Operations Control Center...
      </div>
    );
  }

  const { stats, ordersByStatus, recentOrders, lowStockProducts, topProducts } = statsData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
              Platform Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            HubStore Command Center
          </h1>
          <p className="text-xs text-slate-500">
            Real-time analytics, marketplace fulfillment, and inventory health
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/wholesale"
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Wholesale & Suppliers</span>
          </Link>
          <Link
            href="/admin/products"
            className="text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5 text-blue-600" />
            <span>Products</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Product</span>
          </Link>
          <Link
            href="/admin/coupons"
            className="text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3.5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span>Coupons</span>
          </Link>
          <button
            onClick={loadStats}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live Store Gross
          </p>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.ordersCount}</div>
          <p className="text-[11px] text-slate-500 font-medium">
            Avg Order Value: {formatCurrency(stats.averageOrderValue)}
          </p>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Customers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.customersCount}</div>
          <p className="text-[11px] text-indigo-600 font-semibold">Verified Registered Buyers</p>
        </div>

        {/* Catalog & Inventory Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Low Stock Items</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.lowStockCount}</div>
          <p className="text-[11px] text-amber-600 font-semibold">
            Across {stats.productsCount} Catalog Products
          </p>
        </div>
      </div>

      {/* Pipeline Status Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Order Fulfillment Pipeline</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center text-xs">
          {Object.entries(ordersByStatus).map(([statusKey, count]) => {
            const config = ORDER_STATUS_LABELS[statusKey] || { label: statusKey, color: "" };
            return (
              <div key={statusKey} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">{config.label}</span>
                <strong className="text-xl font-black text-slate-900 mt-0.5 block">
                  {count as number}
                </strong>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Management (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-base font-bold text-slate-900">Recent Marketplace Orders</h3>
            <span className="text-xs text-slate-500">Manage Status & Dispatch</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Order Number</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order: any) => {
                  const statusConfig = ORDER_STATUS_LABELS[order.status] || {
                    label: order.status,
                    color: "bg-slate-100",
                  };
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-blue-600">
                        <Link href={`/orders/${order.id}`}>{order.orderNumber}</Link>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900 block">
                          {order.user?.name || "Customer"}
                        </span>
                        <span className="text-[10px] text-slate-400">{order.user?.email}</span>
                      </td>
                      <td className="p-3 font-black text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.id}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="PLACED">Placed</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PACKED">Packed</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="border-b pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Low Inventory Alert</span>
            </h3>
            <span className="text-[11px] text-slate-400">Threshold &le; 10</span>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">All inventory thresholds are healthy.</p>
            ) : (
              lowStockProducts.map((inv: any) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{inv.product?.name}</p>
                    <p className="text-slate-500 font-mono text-[10px]">SKU: {inv.product?.sku}</p>
                    <span className="text-rose-600 font-bold text-[11px]">
                      Only {inv.quantity} in stock
                    </span>
                  </div>
                  <button
                    onClick={() => handleQuickRestock(inv.productId)}
                    className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px]"
                  >
                    +50 Stock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
