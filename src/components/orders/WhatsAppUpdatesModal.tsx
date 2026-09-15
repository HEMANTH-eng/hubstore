"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  MessageCircle,
  Smartphone,
  Check,
  CheckCheck,
  Truck,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";

interface WhatsAppUpdatesModalProps {
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string | Date;
    status: string;
    items: Array<{
      product: { name: string };
      quantity: number;
      price: number;
    }>;
    shipment?: {
      carrier?: string | null;
      trackingNumber?: string | null;
      estimatedDelivery?: string | Date | null;
    } | null;
    address?: {
      name?: string | null;
      phone?: string | null;
      city?: string | null;
      state?: string | null;
      pincode?: string | null;
    } | null;
    user?: {
      name?: string | null;
      phone?: string | null;
    } | null;
  };
}

export function WhatsAppUpdatesModal({ order }: WhatsAppUpdatesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [channel, setChannel] = useState<"WHATSAPP" | "SMS">("WHATSAPP");

  const getInitialStage = (st?: string) => {
    if (st === "SHIPPED") return "DISPATCHED";
    if (st === "CONFIRMED" || st === "PACKED") return "PLACED";
    return (st as any) || "DISPATCHED";
  };

  const [lifecycleStage, setLifecycleStage] = useState<"PLACED" | "DISPATCHED" | "OUT_FOR_DELIVERY" | "DELIVERED">(
    getInitialStage(order?.status)
  );
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const customerName = order.address?.name || order.user?.name || "Aarav Sharma";
  const customerPhone = order.address?.phone || order.user?.phone || "+91 98765 43210";
  const carrier = order.shipment?.carrier || "BlueDart Express";
  const awb = order.shipment?.trackingNumber || "BD-IND-86798194";
  const destination = `${order.address?.city || "Candolim"}, ${order.address?.state || "Goa"} - ${order.address?.pincode || "403515"}`;

  const handleSimulateLiveNotification = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/notifications/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          status: lifecycleStage,
          channel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(
          `${channel === "WHATSAPP" ? "🟢 WhatsApp" : "💬 SMS"} sent to ${customerPhone}: "${data.message.substring(0, 60)}..."`,
          "success"
        );
      } else {
        toast(data.error || "Failed to trigger simulation", "error");
      }
    } catch (err) {
      toast("Error sending notification", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer active:scale-98"
      >
        <MessageCircle className="w-4 h-4 fill-white" />
        <span>WhatsApp & SMS Updates</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Live WhatsApp & SMS Simulator
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Official dispatch alerts sent directly to {customerPhone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 bg-slate-100/60">
              {/* Channel & Stage Selectors */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                {/* Channel Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Notification Channel:</span>
                  <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                    <button
                      onClick={() => setChannel("WHATSAPP")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        channel === "WHATSAPP"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Business</span>
                    </button>
                    <button
                      onClick={() => setChannel("SMS")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        channel === "SMS"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Fast SMS (VM-NOVACRT)</span>
                    </button>
                  </div>
                </div>

                {/* Lifecycle Stages Tabs */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    Select Order Lifecycle Stage:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "PLACED", label: "1. Confirmed" },
                      { id: "DISPATCHED", label: "2. Dispatched" },
                      { id: "OUT_FOR_DELIVERY", label: "3. Out for Delivery" },
                      { id: "DELIVERED", label: "4. Delivered" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setLifecycleStage(st.id as any)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                          lifecycleStage === st.id
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SIMULATED DEVICE PREVIEW */}
              {channel === "WHATSAPP" ? (
                /* WhatsApp Device Mockup */
                <div className="rounded-2xl border border-slate-300 overflow-hidden shadow-lg bg-[#EFEAE2]">
                  {/* WhatsApp Header */}
                  <div className="bg-[#075E54] text-white p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-[#075E54] font-black text-sm border-2 border-white">
                          NC
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-400 border border-white w-3 h-3 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                          ✓
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs tracking-tight">HubStore Official</span>
                          <span className="bg-emerald-400/20 text-emerald-200 text-[9px] px-1 py-0.2 rounded font-bold">
                            Verified Business
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-100/80 block">
                          Official automated updates
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/90 font-mono">
                      +91 98000 12345
                    </span>
                  </div>

                  {/* WhatsApp Chat Area */}
                  <div className="p-4 space-y-3 min-h-[260px] flex flex-col justify-end">
                    {/* Timestamp Pill */}
                    <div className="text-center">
                      <span className="bg-white/90 shadow-2xs text-[10px] font-bold text-slate-500 px-2.5 py-0.5 rounded-md">
                        TODAY
                      </span>
                    </div>

                    {/* Chat Bubble */}
                    <div className="bg-white rounded-2xl rounded-tl-xs p-4 shadow-sm border border-slate-200/50 max-w-lg space-y-3">
                      {/* Message Body based on stage */}
                      {lifecycleStage === "PLACED" && (
                        <div className="space-y-2 text-xs text-slate-800 leading-relaxed">
                          <p>
                            👋 Hello <strong>{customerName}</strong>!
                          </p>
                          <p>
                            🎉 Your HubStore order <strong>#{order.orderNumber}</strong> has been
                            confirmed!
                          </p>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                            <p>
                              <strong>Amount:</strong> {formatCurrency(order.totalAmount)} (Paid via
                              Razorpay)
                            </p>
                            <p>
                              <strong>Estimated Delivery:</strong> 5 to 8 business days (Quality
                              inspected & packed)
                            </p>
                            <p>
                              <strong>Destination:</strong> {destination}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Our fulfillment team is procuring and physically inspecting your items.
                            You will receive a dispatch update once handed to the courier.
                          </p>
                        </div>
                      )}

                      {lifecycleStage === "DISPATCHED" && (
                        <div className="space-y-2 text-xs text-slate-800 leading-relaxed">
                          <p>
                            📦 Great news, <strong>{customerName}</strong>!
                          </p>
                          <p>
                            Your order <strong>#{order.orderNumber}</strong> has been dispatched via{" "}
                            <strong>{carrier}</strong>!
                          </p>
                          <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 space-y-1 text-[11px] text-emerald-950">
                            <p>
                              <strong>Courier:</strong> {carrier} (Air Priority)
                            </p>
                            <p>
                              <strong>AWB Tracking ID:</strong>{" "}
                              <span className="font-mono font-bold text-blue-700">{awb}</span>
                            </p>
                            <p>
                              <strong>Expected Doorstep Arrival:</strong> In 3 business days
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            You can track the live vehicle movement using the link below.
                          </p>
                        </div>
                      )}

                      {lifecycleStage === "OUT_FOR_DELIVERY" && (
                        <div className="space-y-2 text-xs text-slate-800 leading-relaxed">
                          <p>
                            🚚 <strong>Out for Delivery!</strong>
                          </p>
                          <p>
                            The delivery associate from <strong>{carrier}</strong> is arriving today
                            with your package for order <strong>#{order.orderNumber}</strong>.
                          </p>
                          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] space-y-1">
                            <p className="font-bold text-amber-900">
                              Secure Delivery Verification OTP:{" "}
                              <span className="text-base font-black text-slate-900 tracking-wider">
                                4 8 9 2
                              </span>
                            </p>
                            <p className="text-[10px] text-amber-700">
                              Share this OTP with the delivery executive upon receiving the parcel.
                            </p>
                          </div>
                        </div>
                      )}

                      {lifecycleStage === "DELIVERED" && (
                        <div className="space-y-2 text-xs text-slate-800 leading-relaxed">
                          <p>
                            ✅ <strong>Delivered Successfully!</strong>
                          </p>
                          <p>
                            Your package for order <strong>#{order.orderNumber}</strong> was handed
                            over at {destination}.
                          </p>
                          <p className="text-[11px] text-slate-500">
                            We hope you love your new purchase! Your Indian GST Tax Invoice is ready
                            for download.
                          </p>
                        </div>
                      )}

                      {/* Time & Read Receipts */}
                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                        <span>12:45 PM</span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>

                      {/* WhatsApp Interactive Action Buttons */}
                      <div className="border-t border-slate-100 pt-2 space-y-1.5">
                        <Link
                          href={`/orders/${order.id}`}
                          onClick={() => setIsOpen(false)}
                          className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-blue-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Package Live</span>
                        </Link>
                        <Link
                          href={`/orders/${order.id}/invoice`}
                          target="_blank"
                          className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download GST Invoice</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* SMS Device Mockup */
                <div className="rounded-2xl border border-slate-300 overflow-hidden shadow-lg bg-white">
                  {/* SMS Header */}
                  <div className="bg-slate-100 p-3.5 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-slate-900 block font-mono tracking-wider">
                        VM-NOVACRT
                      </span>
                      <span className="text-[10px] text-slate-500">Transactional Route • DLT Verified</span>
                    </div>
                    <span className="text-[10px] text-slate-500">To: {customerPhone}</span>
                  </div>

                  {/* SMS Bubble */}
                  <div className="p-4 bg-slate-50 min-h-[220px] flex flex-col justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs p-3.5 shadow-sm max-w-md ml-auto text-xs leading-relaxed space-y-2">
                      {lifecycleStage === "PLACED" && (
                        <p>
                          Order #{order.orderNumber} confirmed for ₹{order.totalAmount}. Estimated delivery in 5-8 business days. Sourced with quality guarantee. Track: hubstore.in/orders/{order.id} - HubStore
                        </p>
                      )}
                      {lifecycleStage === "DISPATCHED" && (
                        <p>
                          Your HubStore order #{order.orderNumber} is dispatched via {carrier} (AWB: {awb}). Live tracking: hubstore.in/orders/{order.id}
                        </p>
                      )}
                      {lifecycleStage === "OUT_FOR_DELIVERY" && (
                        <p>
                          Order #{order.orderNumber} is OUT FOR DELIVERY today with {carrier}. Give delivery OTP 4892 to courier partner upon receiving package. - HubStore
                        </p>
                      )}
                      {lifecycleStage === "DELIVERED" && (
                        <p>
                          Delivered! Order #{order.orderNumber} has been delivered. View & download your GST tax invoice at hubstore.in/orders/{order.id}/invoice - HubStore
                        </p>
                      )}
                      <div className="text-right text-[10px] text-blue-200">Delivered • 12:45 PM</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Simulates real-time webhook payload sent to customer phone</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSimulateLiveNotification}
                  disabled={isSending}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? "Dispatching..." : "Simulate Live Alert"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
