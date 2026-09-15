"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  ChevronLeft,
  RefreshCw,
  ExternalLink,
  MapPin,
  CreditCard,
  Download,
  AlertTriangle,
  ArrowRight,
  Boxes,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";
import { DispatchOrderModal } from "@/components/seller/DispatchOrderModal";

export default function SellerOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dispatchModalOrder, setDispatchModalOrder] = useState<any | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTab !== "ALL") params.set("status", selectedTab);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/seller/orders?${params.toString()}`);
      if (res.status === 401 || res.status === 403) {
        toast("Please sign in with merchant credentials", "error");
        router.push("/login?redirect=/seller/orders");
        return;
      }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
      toast("Failed to load seller orders", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handlePackOrder = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action: "PACK",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast("Order marked as PACKED. Ready for courier pickup!", "success");
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "PACKED" } : o))
        );
      } else {
        toast(data.error || "Failed to pack order", "error");
      }
    } catch (err) {
      toast("An error occurred while packing the order", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmDispatch = async (
    carrier: string,
    trackingNumber: string,
    estimatedDelivery: string
  ) => {
    if (!dispatchModalOrder) return;
    const orderId = dispatchModalOrder.id;

    try {
      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action: "DISPATCH",
          carrier,
          trackingNumber,
          estimatedDelivery,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast(
          `Order dispatched via ${carrier}! Tracking: ${trackingNumber}`,
          "success"
        );
        loadOrders();
      } else {
        toast(data.error || "Failed to dispatch order", "error");
      }
    } catch (err) {
      toast("Failed to dispatch order", "error");
    }
  };

  const handleUpdateStatus = async (orderId: string, action: string) => {
    setActionLoadingId(orderId);
    try {
      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });

      if (res.ok) {
        toast(`Order updated successfully!`, "success");
        loadOrders();
      } else {
        toast("Failed to update status", "error");
      }
    } catch (err) {
      toast("Error updating order status", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <Link
            href="/seller"
            className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline mb-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Seller Portal</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Customer Order Fulfillment</span>
          </h1>
          <p className="text-xs text-slate-500">
            Accept, package, and dispatch orders directly from your verified merchant warehouse
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/seller/inventory"
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all"
          >
            <Boxes className="w-4 h-4" />
            <span>Inventory Studio</span>
          </Link>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Manifest</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 text-xs">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "CONFIRMED", label: "Ready to Pack" },
            { id: "PACKED", label: "Ready to Ship" },
            { id: "SHIPPED", label: "In Transit" },
            { id: "DELIVERED", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, city..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-blue-500"
          />
        </form>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-500 text-xs">
          Loading fulfillment manifest...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">No orders matching criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no orders under the selected filter tab.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isActionLoading = actionLoadingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Order #{order.orderNumber}
                        </span>
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            order.status === "CONFIRMED"
                              ? "bg-amber-100 text-amber-800"
                              : order.status === "PACKED"
                              ? "bg-purple-100 text-purple-800"
                              : order.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "OUT_FOR_DELIVERY"
                              ? "bg-indigo-100 text-indigo-800"
                              : order.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <Link
                      href={`/orders/${order.id}/invoice`}
                      target="_blank"
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-bold bg-slate-100 px-3 py-1.5 rounded-lg"
                      title="View GST Tax Invoice"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </Link>
                  </div>
                </div>

                {/* Items and Destination Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Items List */}
                  <div className="md:col-span-2 space-y-3">
                    <span className="font-bold text-slate-700 block">Package Items:</span>
                    <div className="space-y-2">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <img
                            src={item.product?.images?.[0]?.url || "https://placehold.co/80"}
                            alt={item.product?.name || "Product"}
                            className="w-12 h-12 rounded-lg object-cover bg-white border shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">{item.product?.name}</p>
                            {item.variant && (
                              <p className="text-[10px] text-slate-500">Variant: {item.variant.title}</p>
                            )}
                            <p className="text-[10px] text-slate-500">
                              Qty: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                          <span className="font-bold text-slate-900">{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Destination & Logistics Details */}
                  <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Delivery Destination</span>
                      </span>
                      <p className="font-bold text-slate-900">{order.address?.name || "Customer"}</p>
                      <p className="text-slate-600">{order.address?.street}</p>
                      <p className="text-slate-600">
                        {order.address?.city}, {order.address?.state} - <strong>{order.address?.pincode}</strong>
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Phone: {order.address?.phone}</p>
                    </div>

                    {order.shipment && (
                      <div className="border-t border-slate-200 pt-2 space-y-1">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Shipment Assignment</span>
                        </span>
                        <p className="text-slate-700">
                          Carrier: <strong>{order.shipment.carrier}</strong>
                        </p>
                        {order.shipment.trackingNumber && (
                          <p className="font-mono text-slate-600 text-[11px]">
                            AWB: <strong>{order.shipment.trackingNumber}</strong>
                          </p>
                        )}
                        {order.shipment.estimatedDelivery && (
                          <p className="text-slate-500 text-[11px]">
                            ETA: {new Date(order.shipment.estimatedDelivery).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fulfillment Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Fulfillment Target: Same-Day Dispatch</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Action: Pack */}
                    {(order.status === "CONFIRMED" || order.status === "PLACED") && (
                      <button
                        onClick={() => handlePackOrder(order.id)}
                        disabled={isActionLoading}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>{isActionLoading ? "Packing..." : "Pack Order"}</span>
                      </button>
                    )}

                    {/* Action: Dispatch */}
                    {order.status === "PACKED" && (
                      <button
                        onClick={() => setDispatchModalOrder(order)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch & Ship</span>
                      </button>
                    )}

                    {/* Action: Out for Delivery */}
                    {order.status === "SHIPPED" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "OUT_FOR_DELIVERY")}
                        disabled={isActionLoading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Mark Out for Delivery</span>
                      </button>
                    )}

                    {/* Action: Mark Delivered */}
                    {(order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY") && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "DELIVER")}
                        disabled={isActionLoading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Delivered</span>
                      </button>
                    )}

                    {order.status === "DELIVERED" && (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Delivered to Customer</span>
                      </span>
                    )}

                    {/* View Customer Tracker */}
                    <Link
                      href={`/orders/${order.id}`}
                      target="_blank"
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 px-2 py-1"
                    >
                      <span>Live Tracker</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchModalOrder && (
        <DispatchOrderModal
          isOpen={Boolean(dispatchModalOrder)}
          onClose={() => setDispatchModalOrder(null)}
          order={dispatchModalOrder}
          onConfirmDispatch={handleConfirmDispatch}
        />
      )}
    </div>
  );
}
