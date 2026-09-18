"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Store,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Master account role picker state
  const [roleSelectionRequired, setRoleSelectionRequired] = useState(false);
  const [masterUserInfo, setMasterUserInfo] = useState<{ name: string; email: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent, explicitRole?: "ADMIN" | "SELLER" | "CUSTOMER") => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          selectedRole: explicitRole,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Master user needs to select role first
        if (data.requireRoleSelection && !explicitRole) {
          setMasterUserInfo(data.user);
          setRoleSelectionRequired(true);
          setIsLoading(false);
          return;
        }

        toast(`Welcome back, ${data.user.name || "Hemanth"}!`, "success");
        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else if (data.user.role === "SELLER") {
          router.push("/seller");
        } else {
          router.push("/");
        }
        router.refresh();
      } else {
        toast(data.error || "Invalid credentials", "error");
      }
    } catch (err) {
      toast("An unexpected error occurred during login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (role: "ADMIN" | "SELLER" | "CUSTOMER") => {
    handleSubmit(undefined as any, role);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl max-w-md w-full space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-lg tracking-wider flex items-center justify-center mx-auto shadow-md border border-blue-400/30">
            HS
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {roleSelectionRequired ? "Select Your Workspace" : "Sign In to HypperStore"}
          </h1>
          <p className="text-xs text-slate-500">
            {roleSelectionRequired
              ? "Choose your active role for this session"
              : "Access your orders, saved addresses, and account"}
          </p>
        </div>

        {/* ROLE SELECTION SCREEN (Shown when Hemanth logs in) */}
        {roleSelectionRequired ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center gap-2.5 text-xs text-blue-950">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold">Owner Access: </span>
                <span>{masterUserInfo?.name || "Boda Hemanth"} ({email})</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Admin */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectRole("ADMIN")}
                className="w-full text-left p-4 rounded-2xl border-2 border-purple-200 hover:border-purple-600 bg-purple-50/30 hover:bg-purple-50 transition-all cursor-pointer group shadow-xs active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm group-hover:text-purple-700">
                        Admin Portal
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Marketplace analytics, orders, products & settings
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              {/* Option 2: Seller */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectRole("SELLER")}
                className="w-full text-left p-4 rounded-2xl border-2 border-emerald-200 hover:border-emerald-600 bg-emerald-50/30 hover:bg-emerald-50 transition-all cursor-pointer group shadow-xs active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm group-hover:text-emerald-700">
                        Seller Hub
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Manage inventory, batch stock & fulfillment
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>

              {/* Option 3: Customer */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectRole("CUSTOMER")}
                className="w-full text-left p-4 rounded-2xl border-2 border-blue-200 hover:border-blue-600 bg-blue-50/30 hover:bg-blue-50 transition-all cursor-pointer group shadow-xs active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm group-hover:text-blue-700">
                        Customer Store
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Browse, buy items & manage your personal cart
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setRoleSelectionRequired(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 mx-auto pt-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to login</span>
            </button>
          </div>
        ) : (
          /* STANDARD LOGIN FORM */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email or User ID</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hemanth2006t or your email"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Password</label>
                <span className="text-blue-600 hover:underline cursor-pointer">Forgot password?</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-50 text-sm cursor-pointer"
            >
              <span>{isLoading ? "Signing in..." : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
