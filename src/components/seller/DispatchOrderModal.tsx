"use client";

import React, { useState } from "react";
import { Truck, X, RefreshCw, Calendar, ShieldCheck, ArrowRight } from "lucide-react";

interface DispatchOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    address?: {
      name: string;
      city: string;
      state: string;
      pincode: string;
    } | null;
  };
  onConfirmDispatch: (carrier: string, trackingNumber: string, estimatedDelivery: string) => Promise<void>;
}

const CARRIERS = [
  { name: "BlueDart Express", prefix: "BD-IND" },
  { name: "Delhivery Air", prefix: "DLV" },
  { name: "DTDC Prime", prefix: "DTDC" },
  { name: "Shadowfax Express", prefix: "SFX" },
];

export function DispatchOrderModal({
  isOpen,
  onClose,
  order,
  onConfirmDispatch,
}: DispatchOrderModalProps) {
  const [selectedCarrier, setSelectedCarrier] = useState(CARRIERS[0].name);
  const [trackingNumber, setTrackingNumber] = useState(
    `BD-IND-${Math.floor(10000000 + Math.random() * 90000000)}`
  );

  // Default ETA: 3 days from now (YYYY-MM-DD)
  const defaultEta = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const [estimatedDelivery, setEstimatedDelivery] = useState(defaultEta);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGenerateNewAwb = () => {
    const carrierObj = CARRIERS.find((c) => c.name === selectedCarrier) || CARRIERS[0];
    const newAwb = `${carrierObj.prefix}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTrackingNumber(newAwb);
  };

  const handleCarrierChange = (carrierName: string) => {
    setSelectedCarrier(carrierName);
    const carrierObj = CARRIERS.find((c) => c.name === carrierName) || CARRIERS[0];
    setTrackingNumber(`${carrierObj.prefix}-${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmDispatch(selectedCarrier, trackingNumber, estimatedDelivery);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Courier Dispatch Manifest</h2>
              <p className="text-xs text-slate-400">Order #{order.orderNumber}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Destination Preview */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Shipping Destination
            </span>
            <p className="font-bold text-slate-900">
              {order.address?.name || "Customer"}
            </p>
            <p className="text-slate-600">
              {order.address?.city}, {order.address?.state} - {order.address?.pincode}
            </p>
          </div>

          {/* Carrier Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Select Logistics Partner
            </label>
            <select
              value={selectedCarrier}
              onChange={(e) => handleCarrierChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 text-xs font-semibold"
            >
              {CARRIERS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} (Integrated Air Fleet)
                </option>
              ))}
            </select>
          </div>

          {/* AWB Tracking Code */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">AWB Tracking Number</label>
              <button
                type="button"
                onClick={handleGenerateNewAwb}
                className="text-blue-600 font-bold flex items-center gap-1 hover:underline text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                Generate New
              </button>
            </div>
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Estimated Delivery Date */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Estimated Delivery Date
            </label>
            <input
              type="date"
              required
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? "Dispatching..." : "Confirm & Dispatch"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
