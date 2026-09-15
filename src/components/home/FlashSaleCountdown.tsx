"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Clock, Zap, ArrowRight } from "lucide-react";

export function FlashSaleCountdown() {
  // Target countdown: 6 hours, 42 minutes, 18 seconds from initial mount, or end of today
  const [timeLeft, setTimeLeft] = useState({
    hours: 6,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset to 12 hours rolling cycle
          return { hours: 11, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/20">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-lg shrink-0">
          <Flame className="w-8 h-8 text-amber-200 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-200 bg-black/20 px-2.5 py-0.5 rounded-full">
              ⚡ Lightning Deals
            </span>
            <span className="text-xs text-white/80 font-semibold hidden sm:inline">
              Up to 60% OFF on Top Picks
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Flash SuperDeals
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Real-time Ticking Countdown Clock */}
        <div className="flex items-center gap-2 bg-slate-950/60 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl shadow-xl">
          <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span className="text-xs font-bold text-amber-100 uppercase tracking-wider mr-1">
            Ends In:
          </span>
          <div className="flex items-center gap-1 font-mono text-sm font-black text-white">
            <span className="bg-white/10 px-2 py-1 rounded-md min-w-[28px] text-center">
              {formatNumber(timeLeft.hours)}
            </span>
            <span className="text-amber-300">:</span>
            <span className="bg-white/10 px-2 py-1 rounded-md min-w-[28px] text-center">
              {formatNumber(timeLeft.minutes)}
            </span>
            <span className="text-amber-300">:</span>
            <span className="bg-amber-500 text-slate-950 px-2 py-1 rounded-md min-w-[28px] text-center font-extrabold">
              {formatNumber(timeLeft.seconds)}
            </span>
          </div>
        </div>

        {/* Claim status */}
        <div className="hidden sm:flex flex-col gap-1 min-w-[140px]">
          <div className="flex justify-between text-[11px] text-amber-100 font-bold">
            <span>Claimed: 84%</span>
            <span>16 left</span>
          </div>
          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full w-[84%]" />
          </div>
        </div>

        <Link
          href="/products?sort=discount"
          className="px-4 py-2.5 rounded-xl bg-white text-rose-600 hover:bg-amber-50 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>All Flash Deals</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
