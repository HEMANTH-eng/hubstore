import React from "react";
import { ShieldCheck, Truck, RotateCcw, FileText, Lock } from "lucide-react";

export function TrustGuarantees() {
  const guarantees = [
    {
      icon: ShieldCheck,
      title: "100% Genuine Direct",
      desc: "Brand-authorized inventory with 1-Year official warranty",
      badge: "Verified Sourcing",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      icon: Truck,
      title: "Free Express Delivery",
      desc: "Dispatched via BlueDart & Delhivery on orders over ₹999",
      badge: "Fast Logistics",
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      icon: RotateCcw,
      title: "7-Day Easy Returns",
      desc: "No-questions-asked replacement or instant bank refund",
      badge: "Buyer Protection",
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      icon: FileText,
      title: "Indian GST Tax Invoices",
      desc: "Download official tax invoices with ITC business credit",
      badge: "Tax Compliant",
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      icon: Lock,
      title: "100% Secure Checkout",
      desc: "256-bit encrypted UPI, RuPay, Cards & Netbanking",
      badge: "Safe Payments",
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HubStore Trust & Authenticity Guarantee</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Why 50,000+ Customers Trust HubStore
            </h3>
          </div>
          <p className="text-xs text-slate-300 max-w-md">
            Directly partnered with authorized merchants and verified logistics networks to deliver absolute peace of mind on every order.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {guarantees.map((g, idx) => {
            const Icon = g.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:text-amber-400 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-700/80 text-slate-300">
                      {g.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white mb-1 group-hover:text-blue-300 transition-colors">
                    {g.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {g.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
