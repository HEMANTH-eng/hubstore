"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ChevronRight, Truck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders =
    activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-4">
        <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse" />
        <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Orders</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track packages, view receipts, and manage recent purchases
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs pb-2">
        {["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 ${
              activeTab === tab
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab === "ALL" ? "All Orders" : ORDER_STATUS_LABELS[tab]?.label || tab}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No orders found</h3>
          <p className="text-xs text-slate-500">
            {activeTab === "ALL"
              ? "You haven't placed any orders yet."
              : `No orders in status: ${activeTab}.`}
          </p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs"
          >
            Browse Store
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = ORDER_STATUS_LABELS[order.status] || {
              label: order.status,
              color: "bg-slate-100 text-slate-800",
            };

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Header Strip */}
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Order Number</span>
                      <strong className="font-mono text-slate-900">{order.orderNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Order Date</span>
                      <span className="font-medium text-slate-900">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Total Amount</span>
                      <span className="font-extrabold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                    <Link
                      href={`/orders/${order.id}`}
                      className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-lg border border-slate-300 text-xs flex items-center gap-1"
                    >
                      <span>Track & Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 divide-y divide-slate-100">
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product?.images?.[0]?.url || "https://placehold.co/100"}
                          alt={item.product?.name || "Product"}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-50 border"
                        />
                        <div>
                          <Link
                            href={`/products/${item.product?.slug}`}
                            className="text-xs font-bold text-slate-900 hover:text-blue-600 line-clamp-1"
                          >
                            {item.product?.name}
                          </Link>
                          <p className="text-[11px] text-slate-500">
                            Qty: {item.quantity} {item.variant ? `• ${item.variant.title}` : ""}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-extrabold text-slate-900">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
