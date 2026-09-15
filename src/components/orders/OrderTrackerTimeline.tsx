"use client";

import React from "react";
import { Check, Clock, PackageCheck, Truck, Home, XCircle } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

interface OrderTrackerProps {
  status: string;
  orderDate: string | Date;
  carrier?: string;
  trackingNumber?: string | null;
  estimatedDelivery?: string | Date | null;
}

const STEPS = [
  { id: "PLACED", label: "Order Placed", icon: Clock },
  { id: "CONFIRMED", label: "Confirmed", icon: Check },
  { id: "PACKED", label: "Packed & Ready", icon: PackageCheck },
  { id: "SHIPPED", label: "Shipped", icon: Truck },
  { id: "DELIVERED", label: "Delivered", icon: Home },
];

export function OrderTrackerTimeline({
  status,
  orderDate,
  carrier = "HubStore Express",
  trackingNumber,
  estimatedDelivery,
}: OrderTrackerProps) {
  const isCancelled = status === "CANCELLED";
  const currentStepNum = ORDER_STATUS_LABELS[status]?.step || 1;

  if (isCancelled) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 flex items-center gap-3">
        <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
        <div>
          <h3 className="text-base font-bold">This order was cancelled</h3>
          <p className="text-xs text-rose-600 mt-0.5">
            If payment was deducted, your refund is processed within 3-5 business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs text-slate-500">Current Status:</span>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            {ORDER_STATUS_LABELS[status]?.label || status}
          </h3>
        </div>

        {trackingNumber && (
          <div className="text-left sm:text-right text-xs">
            <p className="text-slate-500">
              Carrier: <strong className="text-slate-800">{carrier}</strong>
            </p>
            <p className="text-slate-500">
              Tracking ID:{" "}
              <strong className="text-blue-600 font-mono">{trackingNumber}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Horizontal Step Indicator */}
      <div className="relative">
        {/* Track Line */}
        <div className="absolute top-5 left-4 right-4 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, ((currentStepNum - 1) / (STEPS.length - 1)) * 100))}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between relative z-10">
          {STEPS.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStepNum >= stepNum;
            const isCurrent = currentStepNum === stepNum;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center text-center max-w-[80px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                    isCompleted
                      ? "bg-blue-600 text-white ring-4 ring-blue-50"
                      : "bg-white text-slate-400 border-2 border-slate-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[11px] mt-2 font-medium ${
                    isCurrent
                      ? "text-blue-600 font-bold"
                      : isCompleted
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {estimatedDelivery && (
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between">
          <span className="font-medium">Estimated Delivery Date:</span>
          <strong className="font-bold">
            {new Date(estimatedDelivery).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </strong>
        </div>
      )}
    </div>
  );
}
