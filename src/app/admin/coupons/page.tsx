"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tag,
  Plus,
  Trash2,
  ChevronLeft,
  Calendar,
  CheckCircle2,
  X,
  Percent,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";

export default function AdminCouponsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Coupon Form
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("15");
  const [minOrderValue, setMinOrderValue] = useState("999");
  const [maxDiscount, setMaxDiscount] = useState("500");
  const [usageLimit, setUsageLimit] = useState("500");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.status === 403) {
        toast("Access denied. Admin required.", "error");
        router.push("/login?redirect=/admin/coupons");
        return;
      }
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) {
      toast("Please provide code and discount value", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description,
          type,
          value,
          minOrderValue,
          maxDiscount: type === "PERCENTAGE" ? maxDiscount : undefined,
          usageLimit,
          expiresAt: expiresAt || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Coupon "${data.coupon.code}" created successfully!`, "success");
        setShowModal(false);
        setCode("");
        setDescription("");
        await loadCoupons();
      } else {
        toast(data.error || "Failed to create coupon", "error");
      }
    } catch (err) {
      toast("Error creating coupon", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string, codeStr: string) => {
    if (!confirm(`Delete coupon "${codeStr}"?`)) return;

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast(`Coupon "${codeStr}" removed`, "success");
        setCoupons(coupons.filter((c) => c.id !== id));
      }
    } catch (err) {
      toast("Failed to delete coupon", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <Link
            href="/admin"
            className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline mb-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Command Center</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Promotional Coupons & Deals
          </h1>
          <p className="text-xs text-slate-500">
            Create discount codes, configure minimum spend rules, and track redemption
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading coupons...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Discount Type</th>
                  <th className="p-3.5">Value</th>
                  <th className="p-3.5">Min Order</th>
                  <th className="p-3.5">Redemptions</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="p-3.5">
                      <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-1 rounded">
                        {c.code}
                      </span>
                      {c.description && (
                        <span className="text-[11px] text-slate-400 block mt-1">
                          {c.description}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-semibold text-slate-700">
                      {c.type === "PERCENTAGE" ? "Percentage %" : "Flat Amount"}
                    </td>

                    <td className="p-3.5 font-bold text-emerald-600">
                      {c.type === "PERCENTAGE" ? `${c.value}% OFF` : `Flat ${formatCurrency(c.value)}`}
                    </td>

                    <td className="p-3.5 font-medium text-slate-700">
                      {c.minOrderValue > 0 ? formatCurrency(c.minOrderValue) : "No Minimum"}
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-slate-900">{c.usageCount}</span>
                      {c.usageLimit && <span className="text-slate-400"> / {c.usageLimit}</span>}
                    </td>

                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Create New Promo Code</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH30"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Banner Note</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 30% discount on weekend orders"
                  className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                {type === "PERCENTAGE" && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Max Cap (₹)</label>
                    <input
                      type="number"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Usage Limit (Total uses)</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
