"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, AlertTriangle, X, CheckCircle2, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/currency";

interface CancelOrderModalProps {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  isPaidOnline?: boolean;
}

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Expected delivery date is too late",
  "Want to change delivery address or phone number",
  "Want to change payment method",
  "Other reason",
];

export function CancelOrderModal({
  orderId,
  orderNumber,
  totalAmount,
  isPaidOnline,
}: CancelOrderModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [customNotes, setCustomNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancelOrder = async () => {
    setIsSubmitting(true);
    try {
      const fullReason = reason === "Other reason" && customNotes.trim()
        ? customNotes.trim()
        : reason;

      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: fullReason }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast("Order has been cancelled successfully", "success");
        setIsOpen(false);
        router.refresh();
      } else {
        toast(data.error || "Failed to cancel order", "error");
      }
    } catch (err) {
      toast("An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
      >
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>Cancel Order</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Cancel Order #{orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Are you sure you want to cancel this order? Once cancelled, fulfillment will stop immediately.
              </p>

              {isPaidOnline && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Instant Refund Protection</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    A full refund of <strong>{formatCurrency(totalAmount)}</strong> will be credited back to your original payment source (UPI/Bank/Card) within 3-5 business days.
                  </p>
                </div>
              )}

              {/* Reason Selector */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  Please select a cancellation reason:
                </label>
                <div className="space-y-1.5">
                  {CANCEL_REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        reason === r
                          ? "border-rose-500 bg-rose-50/50 text-rose-900 font-semibold ring-1 ring-rose-400"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              {reason === "Other reason" && (
                <div>
                  <textarea
                    rows={2}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="Tell us why you are cancelling..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-rose-500 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-white transition-all text-xs"
              >
                Don't Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Cancelling..." : "Confirm Cancellation"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
