"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  Package,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Store,
  KeyRound,
  Phone,
  Mail,
  ExternalLink,
  Download,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { SessionUser } from "@/types";
import { useToast } from "@/components/ui/Toast";
import { AddressModal } from "@/components/account/AddressModal";
import { formatCurrency } from "@/lib/currency";

export default function AccountPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<SessionUser | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"addresses" | "profile" | "orders">("addresses");
  const [isLoading, setIsLoading] = useState(true);

  // Address Modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  // Profile Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [meRes, addrRes, ordersRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/user/addresses"),
        fetch("/api/orders"),
      ]);

      const meData = await meRes.json();
      if (!meData.authenticated) {
        router.push("/login?redirect=/account");
        return;
      }

      setUser(meData.user);
      setName(meData.user.name || "");
      setPhone(meData.user.phone || "");

      if (addrRes.ok) {
        const addrData = await addrRes.json();
        setAddresses(addrData.addresses || []);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.orders?.slice(0, 5) || []);
      }
    } catch (err) {
      console.error(err);
      toast("Failed to load account data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error(err);
    }
    toast("Signed out successfully", "info");
    router.push("/login");
    router.refresh();
  };

  const handleSaveAddress = async (addressData: any) => {
    try {
      const isEdit = Boolean(addressData.id);
      const url = "/api/user/addresses";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData),
      });

      const data = await res.json();
      if (res.ok) {
        toast(isEdit ? "Address updated successfully" : "New address saved successfully", "success");
        // Reload addresses
        const addrRes = await fetch("/api/user/addresses");
        const addrData = await addrRes.json();
        setAddresses(addrData.addresses || []);
      } else {
        toast(data.error || "Failed to save address", "error");
      }
    } catch (err) {
      toast("Error saving address", "error");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch("/api/user/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDefault: true }),
      });

      if (res.ok) {
        toast("Default shipping address updated", "success");
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }))
        );
      } else {
        toast("Failed to set default address", "error");
      }
    } catch (err) {
      toast("Error updating default address", "error");
    }
  };

  const handleDeleteAddress = async (id: string, addrName: string) => {
    if (!confirm(`Are you sure you want to delete delivery address for "${addrName}"?`)) return;

    try {
      const res = await fetch(`/api/user/addresses?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast("Address deleted successfully", "success");
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      } else {
        toast("Failed to delete address", "error");
      }
    } catch (err) {
      toast("Error deleting address", "error");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (res.ok) {
        toast("Profile details updated successfully!", "success");
        setUser((prev) => (prev ? { ...prev, name: data.user.name, phone: data.user.phone } : prev));
      } else {
        toast(data.error || "Failed to update profile", "error");
      }
    } catch (err) {
      toast("Error updating profile", "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast("New passwords do not match", "error");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast("Password changed successfully!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast(data.error || "Failed to change password", "error");
      }
    } catch (err) {
      toast("Error updating password", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500 text-xs">
        Loading your account center...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Account Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 font-black text-2xl flex items-center justify-center">
            {user.name?.[0] || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">{user.name || "Customer"}</h1>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/orders"
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2 rounded-xl border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>My Orders</span>
          </Link>

          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Center</span>
            </Link>
          )}

          {(user.role === "SELLER" || user.role === "ADMIN") && (
            <Link
              href="/seller"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>Seller Portal</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            id="account-page-signout-btn"
            className="bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab("addresses")}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "addresses"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Security</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "orders"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Recent Purchases</span>
        </button>
      </div>

      {/* Tab 1: Addresses */}
      {activeTab === "addresses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Delivery Addresses</h2>
              <p className="text-xs text-slate-500">
                Addresses used for standard & express doorstep deliveries
              </p>
            </div>

            <button
              onClick={() => {
                setEditingAddress(null);
                setIsAddressModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">No addresses saved yet</h3>
              <p className="text-xs text-slate-500">Add an address to speed up your checkout.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white rounded-2xl border p-5 space-y-3 transition-all relative ${
                    addr.isDefault
                      ? "border-blue-500 ring-2 ring-blue-100 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Phone: {addr.phone}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingAddress(addr);
                          setIsAddressModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                        title="Edit Address"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id, addr.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-0.5">
                    <p>{addr.street}</p>
                    {addr.apartment && <p>{addr.apartment}</p>}
                    {addr.area && <p>{addr.area}</p>}
                    <p>
                      {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                    </p>
                    <p className="text-slate-400 text-[11px]">{addr.country}</p>
                  </div>

                  {!addr.isDefault && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Set as Default Address
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile & Security */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal Information</span>
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed directly.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9988776655"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingProfile ? "Saving..." : "Save Profile Details"}
              </button>
            </form>
          </div>

          {/* Security / Password Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Password & Security</span>
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Account Session & Sign Out Card */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900">Active Account Session</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign out from this device to protect your account details and order history.
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Recent Orders */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-slate-900">Recent Order History</h2>
            <Link href="/orders" className="text-xs text-blue-600 font-bold hover:underline">
              View All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No recent orders found.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Order #{order.orderNumber}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      {order.items?.length || 1} item(s) • Total: {formatCurrency(order.totalAmount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-600 font-bold hover:underline px-2 py-1"
                    >
                      Track Order
                    </Link>
                    <Link
                      href={`/orders/${order.id}/invoice`}
                      target="_blank"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Address Modal */}
      {isAddressModalOpen && (
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => {
            setIsAddressModalOpen(false);
            setEditingAddress(null);
          }}
          onSave={handleSaveAddress}
          initialData={editingAddress}
        />
      )}
    </div>
  );
}
