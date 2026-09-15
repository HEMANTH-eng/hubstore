"use client";

import React, { useState } from "react";
import { X, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: any) => Promise<void>;
  initialData?: any | null;
}

export function AddressModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddressModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    street: initialData?.street || "",
    apartment: initialData?.apartment || "",
    area: initialData?.area || "",
    city: initialData?.city || "Bengaluru",
    state: initialData?.state || "Karnataka",
    pincode: initialData?.pincode || "560038",
    isDefault: initialData?.isDefault || false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        ...(initialData?.id ? { id: initialData.id } : {}),
        ...formData,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {initialData ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h2>
              <p className="text-xs text-slate-400">Doorstep delivery destination</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Recipient Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number (10 Digits) *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9988776655"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Street Address / Flat No *</label>
            <input
              type="text"
              required
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="Flat 402, Skyline Heights, 12th Main Road"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Apartment / Society</label>
              <input
                type="text"
                value={formData.apartment}
                onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                placeholder="Tower B, Skyline"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Area / Landmark</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Near Metro Station"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">PIN Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full font-mono bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="font-bold text-slate-800">Set as my default shipping address</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? "Saving..." : "Save Address"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
