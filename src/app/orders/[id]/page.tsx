import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Package,
  MapPin,
  CreditCard,
  ChevronLeft,
  ShieldCheck,
  Star,
  Download,
  RotateCcw,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { OrderTrackerTimeline } from "@/components/orders/OrderTrackerTimeline";
import { WhatsAppUpdatesModal } from "@/components/orders/WhatsAppUpdatesModal";
import { formatCurrency } from "@/lib/currency";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
          variant: true,
        },
      },
      payment: true,
      shipment: true,
      address: true,
      user: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <Link
            href="/orders"
            className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline mb-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Order #{order.orderNumber}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <WhatsAppUpdatesModal order={order} />
          <Link
            href={`/orders/${order.id}/return`}
            id="order-return-request-btn"
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>Return / Replace</span>
          </Link>
          <Link
            href={`/orders/${order.id}/invoice`}
            target="_blank"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>GST Tax Invoice</span>
          </Link>
        </div>
      </div>

      {/* Visual Timeline Tracking */}
      <OrderTrackerTimeline
        status={order.status}
        orderDate={order.createdAt}
        carrier={order.shipment?.carrier}
        trackingNumber={order.shipment?.trackingNumber}
        estimatedDelivery={order.shipment?.estimatedDelivery}
      />

      {/* Details Grid: Address, Payment, Invoice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b pb-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Delivery Address</span>
          </div>

          {order.address ? (
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900">{order.address.name}</p>
              <p>{order.address.street}</p>
              {order.address.apartment && <p>{order.address.apartment}</p>}
              <p>
                {order.address.city}, {order.address.state} -{" "}
                <strong>{order.address.pincode}</strong>
              </p>
              <p className="text-slate-500">Phone: {order.address.phone}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Standard customer delivery address</p>
          )}
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b pb-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Payment Summary</span>
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <strong className="text-slate-900 uppercase">
                {order.payment?.provider || "Online Payment"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className="font-bold text-emerald-600">
                {order.payment?.status || "SUCCESS"}
              </span>
            </div>
            {order.payment?.transactionId && (
              <div className="flex justify-between">
                <span>Transaction Ref:</span>
                <span className="font-mono text-slate-500 text-[11px]">
                  {order.payment.transactionId}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ordered Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 border-b pb-3">Items in This Order</h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.product?.images?.[0]?.url || "https://placehold.co/100"}
                  alt={item.product?.name || "Product"}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-50 border shrink-0"
                />
                <div>
                  <Link
                    href={`/products/${item.product?.slug}`}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {item.product?.name}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Variant: {item.variant.title}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Quantity: {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-sm font-black text-slate-900">
                  {formatCurrency(item.total)}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/orders/${order.id}/return`}
                    className="text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100"
                  >
                    Return / Replace
                  </Link>
                  <Link
                    href={`/products/${item.product?.slug}`}
                    className="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                  >
                    Write Review
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-slate-900">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Discount ({order.couponCode || "Promo"})</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-bold text-slate-900">
              {order.shippingAmount === 0 ? "FREE" : formatCurrency(order.shippingAmount)}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between text-sm font-black text-slate-950">
            <span>Total Paid</span>
            <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
