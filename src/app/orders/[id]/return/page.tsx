"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  RotateCcw,
  ShieldCheck,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Calendar,
  Clock,
  CreditCard,
  Wallet,
  ArrowRight,
  Printer,
  Sparkles,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";

const RETURN_REASONS = [
  {
    id: "DAMAGED",
    title: "Damaged in transit / Broken seal",
    desc: "Outer box crushed, broken parts, or tampered seal upon delivery",
    icon: "📦",
  },
  {
    id: "DEFECTIVE",
    title: "Defective or not functioning",
    desc: "Item does not turn on, audio distortion, or connectivity failure",
    icon: "⚡",
  },
  {
    id: "WRONG_ITEM",
    title: "Wrong item / Specification mismatch",
    desc: "Received different color, model, or size than ordered",
    icon: "🔄",
  },
  {
    id: "MISSING_PARTS",
    title: "Missing accessories or components",
    desc: "Cables, chargers, manuals, or warranty card missing from the box",
    icon: "🔍",
  },
];

const PHOTO_PRESETS = [
  { name: "Damaged Box 📦", url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop" },
  { name: "Defective Part ⚡", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop" },
  { name: "Accessories Issue 🔌", url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop" },
];

export default function ReturnOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState(RETURN_REASONS[0].id);
  const [details, setDetails] = useState("");
  const [resolution, setResolution] = useState<"REPLACEMENT" | "REFUND">("REFUND");
  const [refundMethod, setRefundMethod] = useState<"ORIGINAL_PAYMENT" | "WALLET">("ORIGINAL_PAYMENT");
  const [pickupDateOffset, setPickupDateOffset] = useState<number>(1);
  const [pickupSlot, setPickupSlot] = useState<string>("MORNING");
  const [pickupAddress, setPickupAddress] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [returnResult, setReturnResult] = useState<any | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error("Order not found");
        const json = await res.json();
        setOrder(json.order);

        // Pre-select all items
        if (json.order?.items) {
          const initialMap: Record<string, boolean> = {};
          json.order.items.forEach((it: any) => {
            initialMap[it.id] = true;
          });
          setSelectedItems(initialMap);
        }

        // Set default address
        if (json.order?.address) {
          const addr = json.order.address;
          setPickupAddress(`${addr.name}, ${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode} (Ph: ${addr.phone})`);
        }
      } catch (err) {
        console.error(err);
        toast("Failed to load order details", "error");
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [id, toast]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleAddPhoto = (url: string) => {
    if (!url.trim()) return;
    if (photos.length >= 4) {
      toast("Maximum 4 photos allowed", "info");
      return;
    }
    if (photos.includes(url.trim())) return;
    setPhotos((prev) => [...prev, url.trim()]);
    setCustomPhotoUrl("");
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosenItemIds = Object.keys(selectedItems).filter((k) => selectedItems[k]);
    if (chosenItemIds.length === 0) {
      toast("Please select at least one item to return", "error");
      return;
    }

    const calculatedPickupDate = new Date(Date.now() + pickupDateOffset * 24 * 60 * 60 * 1000).toISOString();

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIds: chosenItemIds,
          reason: RETURN_REASONS.find((r) => r.id === reason)?.title || reason,
          resolution,
          refundMethod,
          pickupDate: calculatedPickupDate,
          pickupSlot,
          pickupAddress,
          notes: details,
          photos,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit return request");
      }

      setReturnResult(data);
      toast("Return & reverse pickup scheduled successfully!", "success");
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Failed to process return request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-500">
        Loading return studio...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <Link href="/orders" className="text-indigo-600 font-bold hover:underline">
          Return to All Orders
        </Link>
      </div>
    );
  }

  // Render Confirmation Receipt View if submitted
  if (returnResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Return Request Authorized
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              Reverse Pickup Scheduled
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Reference: <strong className="text-slate-900 font-mono">{returnResult.returnReference}</strong> • Order #{order.orderNumber}
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left text-xs space-y-3">
            <div className="flex justify-between border-b pb-2.5">
              <span className="text-slate-500">Resolution Choice:</span>
              <span className="font-bold text-slate-900">
                {resolution === "REPLACEMENT" ? "Free Replacement Unit" : "100% Instant Refund"}
              </span>
            </div>

            <div className="flex justify-between border-b pb-2.5">
              <span className="text-slate-500">Reverse Courier Partner:</span>
              <span className="font-bold text-indigo-700 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> Delhivery Reverse Logistics
              </span>
            </div>

            <div className="flex justify-between border-b pb-2.5">
              <span className="text-slate-500">Reverse AWB Tracking:</span>
              <span className="font-mono font-bold text-slate-900">{returnResult.reverseAWB}</span>
            </div>

            <div className="flex justify-between border-b pb-2.5">
              <span className="text-slate-500">Scheduled Pickup Date:</span>
              <span className="font-bold text-slate-900">
                {new Date(returnResult.pickupDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })} ({returnResult.pickupSlot === "MORNING" ? "9 AM – 1 PM" : "2 PM – 7 PM"})
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Pickup Cost:</span>
              <span className="font-bold text-emerald-600">₹0 (100% Free Doorstep Collection)</span>
            </div>
          </div>

          {/* Instructions checklist */}
          <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100 text-left text-xs text-indigo-900 space-y-2">
            <span className="font-bold block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Easy Pickup Instructions:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-indigo-800/90 pl-1">
              <li>Place item in its original box with all cables, manuals, and accessories.</li>
              <li>You do NOT need to print any label; Delhivery courier brings a pre-printed barcode label.</li>
              <li>{resolution === "REPLACEMENT" ? "New replacement item will dispatch once courier inspects package." : "Refund will credit directly to your account within 24 hours of doorstep handover."}</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Return Receipt</span>
            </button>
            <Link
              href={`/orders/${order.id}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Back to Order Tracking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8" id="return-studio-container">
      {/* Top Header */}
      <div className="space-y-2 border-b pb-5">
        <Link
          href={`/orders/${order.id}`}
          className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Order #{order.orderNumber}</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <RotateCcw className="w-6 h-6 text-indigo-600" />
              <span>Return & Replacement Studio</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Hassle-free 7-day buyer protection policy • 100% free doorstep reverse pickup
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>7-Day Return Window Active</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitReturn} className="space-y-6 text-xs">
        {/* Step 1: Select Items */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="border-b pb-3">
            <h2 className="text-sm font-bold text-slate-900">Step 1: Select Item(s) to Return or Replace</h2>
            <p className="text-slate-500 text-[11px]">Choose which products from this order are being returned</p>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map((item: any) => (
              <label
                key={item.id}
                className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <input
                    type="checkbox"
                    checked={!!selectedItems[item.id]}
                    onChange={() => toggleItemSelection(item.id)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <img
                    src={item.product?.images?.[0]?.url || "https://placehold.co/100"}
                    alt={item.product?.name || "Product"}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{item.product?.name}</h3>
                    <p className="text-slate-500 text-[11px]">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                </div>

                <span className="font-bold text-slate-900 text-xs shrink-0">
                  {formatCurrency(item.total)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Step 2: Return Reason & Evidence */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="border-b pb-3">
            <h2 className="text-sm font-bold text-slate-900">Step 2: Reason for Return</h2>
            <p className="text-slate-500 text-[11px]">Help us and our verified sellers resolve your issue quickly</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RETURN_REASONS.map((r) => (
              <div
                key={r.id}
                onClick={() => setReason(r.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  reason === r.id
                    ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-200"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{r.icon}</span>
                  <span className="font-bold text-slate-900 text-xs">{r.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-7 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the defect, damage, or discrepancy in detail..."
              className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs"
            />
          </div>

          {/* Photo Evidence Uploader */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="block font-bold text-slate-700">
              Attach Photos / Proof of Damage (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                placeholder="Paste image URL (https://...)"
                className="flex-1 p-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleAddPhoto(customPhotoUrl)}
                className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1">Quick Presets:</span>
              {PHOTO_PRESETS.map((p, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleAddPhoto(p.url)}
                  className="text-[10px] bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
                >
                  + {p.name}
                </button>
              ))}
            </div>

            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {photos.map((ph, pIdx) => (
                  <div key={pIdx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={ph} alt="Proof" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(pIdx)}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Preferred Resolution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="border-b pb-3">
            <h2 className="text-sm font-bold text-slate-900">Step 3: Choose Desired Resolution</h2>
            <p className="text-slate-500 text-[11px]">How would you like us to settle this return?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Resolution A: Replacement */}
            <div
              onClick={() => setResolution("REPLACEMENT")}
              id="resolution-replacement-tile"
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                resolution === "REPLACEMENT"
                  ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-200"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-indigo-600" />
                  Free Replacement
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                  Fast Dispatch
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                We will dispatch a brand-new sealed unit with Delhivery Express as soon as the courier collects the return package.
              </p>
            </div>

            {/* Resolution B: Refund */}
            <div
              onClick={() => setResolution("REFUND")}
              id="resolution-refund-tile"
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                resolution === "REFUND"
                  ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-200"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  100% Money-Back Refund
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Full Value
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Direct refund credited within 24 hours of package pickup verification.
              </p>
            </div>
          </div>

          {/* Refund Sub-option if REFUND selected */}
          {resolution === "REFUND" && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 pt-3">
              <span className="font-bold text-slate-800 block">Refund Destination:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="refundMethod"
                    checked={refundMethod === "ORIGINAL_PAYMENT"}
                    onChange={() => setRefundMethod("ORIGINAL_PAYMENT")}
                    className="text-indigo-600"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Original Payment Source</span>
                    <span className="text-[10px] text-slate-500">UPI / Card / Netbanking (24–48h)</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="refundMethod"
                    checked={refundMethod === "WALLET"}
                    onChange={() => setRefundMethod("WALLET")}
                    className="text-indigo-600"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-900">HyperStore Wallet</span>
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 rounded">+5% Bonus</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Instant credit for future shopping</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Reverse Pickup Scheduling */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="border-b pb-3">
            <h2 className="text-sm font-bold text-slate-900">Step 4: Doorstep Reverse Pickup Scheduling</h2>
            <p className="text-slate-500 text-[11px]">Free pickup powered by Delhivery Reverse Logistics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Picker */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Preferred Pickup Date</span>
              </label>
              <select
                value={pickupDateOffset}
                onChange={(e) => setPickupDateOffset(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={1}>
                  Tomorrow ({new Date(Date.now() + 1 * 86400000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })})
                </option>
                <option value={2}>
                  In 2 Days ({new Date(Date.now() + 2 * 86400000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })})
                </option>
                <option value={3}>
                  In 3 Days ({new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })})
                </option>
              </select>
            </div>

            {/* Time Slot */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pickup Time Slot</span>
              </label>
              <select
                value={pickupSlot}
                onChange={(e) => setPickupSlot(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white font-medium outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="MORNING">Morning Slot (09:00 AM – 01:00 PM)</option>
                <option value="AFTERNOON">Afternoon Slot (02:00 PM – 07:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Pickup Address */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Pickup Address & Contact Phone
            </label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Full pickup address with PIN code..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href={`/orders/${order.id}`}
            className="text-xs text-slate-500 font-bold hover:underline"
          >
            Cancel and Return
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            id="submit-return-btn"
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Scheduling Reverse Pickup...</span>
            ) : (
              <>
                <span>Confirm {resolution === "REPLACEMENT" ? "Free Replacement" : "Instant Refund"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
