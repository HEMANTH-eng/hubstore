"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast(`Welcome back, ${data.user.name || "Customer"}!`, "success");
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

  // Quick helper to fill demo credentials
  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl max-w-md w-full space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md">
            N
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to HubStore
          </h1>
          <p className="text-xs text-slate-500">
            Access your orders, saved addresses, and wishlist
          </p>
        </div>

        {/* Demo Credentials Quick Picker */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>One-Click Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => fillDemo("customer@hubstore.com", "Customer@12345")}
              className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 font-semibold"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin@hubstore.com", "Admin@12345")}
              className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg hover:bg-purple-50 hover:text-purple-600 font-semibold"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo("seller@hubstore.com", "Seller@12345")}
              className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 font-semibold"
            >
              Seller
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
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
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
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
