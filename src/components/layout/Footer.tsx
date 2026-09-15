"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RefreshCw, Headphones, Mail, CheckCircle2 } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Value Proposition Trust Badges */}
      <div className="border-b border-slate-800/80 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Free Express Shipping</h4>
                <p className="text-xs text-slate-400">On all orders above ₹999 across India</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Genuine Products</h4>
                <p className="text-xs text-slate-400">Sourced directly from verified brands</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">7-Day Easy Returns</h4>
                <p className="text-xs text-slate-400">Hassle-free replacement or full refund</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">24/7 Priority Support</h4>
                <p className="text-xs text-slate-400">Dedicated assistance via phone & email</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                H
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Hub<span className="text-blue-400">Store</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              HubStore is a premier marketplace offering curated electronics, cutting-edge audio,
              designer apparel, culinary kitchenware, and wellness technology.
            </p>

            <div className="pt-2">
              <p className="text-xs font-semibold text-white mb-2">Subscribe to Insider Deals & Offers</p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 p-2.5 rounded-lg max-w-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Thank you for subscribing! Check your email for a ₹200 welcome gift voucher.</span>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="bg-slate-900 border border-slate-700 text-xs px-3 py-2.5 rounded-lg text-white placeholder:text-slate-500 flex-1 outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Popular Categories</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/category/electronics" className="hover:text-white transition-colors">
                  Flagship Smartphones
                </Link>
              </li>
              <li>
                <Link href="/category/electronics" className="hover:text-white transition-colors">
                  Noise-Cancelling Audio
                </Link>
              </li>
              <li>
                <Link href="/category/fashion" className="hover:text-white transition-colors">
                  Men&apos;s Oxford Shirts
                </Link>
              </li>
              <li>
                <Link href="/category/fashion" className="hover:text-white transition-colors">
                  Mulberry Silk Dresses
                </Link>
              </li>
              <li>
                <Link href="/category/home-kitchen" className="hover:text-white transition-colors">
                  Barista Espresso Machines
                </Link>
              </li>
              <li>
                <Link href="/category/fitness-wellness" className="hover:text-white transition-colors">
                  AMOLED Smartwatches
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Customer Support</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Manage Account & Addresses
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Shopping Cart & Coupons
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Helpline: {APP_CONFIG.supportPhone}</span>
              </li>
              <li>
                <span className="text-slate-400">Email: {APP_CONFIG.supportEmail}</span>
              </li>
            </ul>
          </div>

          {/* Business & Sellers */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Partner with Us</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/seller" className="hover:text-emerald-400 text-emerald-400/90 font-medium transition-colors">
                  Sell on HubStore
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-purple-400 text-purple-400/90 font-medium transition-colors">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Bengaluru, Karnataka 560038</span>
              </li>
              <li>
                <span className="text-slate-400">GSTIN: 29AAAAA0000A1Z5</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payment icons & Copyright */}
        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HubStore Technologies Pvt. Ltd. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-medium">100% Secure Payments:</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-bold border border-slate-800">
                UPI
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-bold border border-slate-800">
                Razorpay
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-bold border border-slate-800">
                Visa / MC
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-bold border border-slate-800">
                Cash on Delivery
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
