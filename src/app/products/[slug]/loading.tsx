import React from "react";

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3.5 w-12 bg-slate-200 rounded-md" />
        <div className="h-3.5 w-3 bg-slate-200 rounded-md" />
        <div className="h-3.5 w-20 bg-slate-200 rounded-md" />
        <div className="h-3.5 w-3 bg-slate-200 rounded-md" />
        <div className="h-3.5 w-36 bg-slate-200 rounded-md" />
      </div>

      {/* Main Product Info Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery Skeleton */}
        <div className="lg:col-span-5 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-2.5 overflow-hidden shrink-0">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-slate-200 shrink-0"
              />
            ))}
          </div>
          <div className="flex-1 aspect-square bg-slate-200 rounded-2xl" />
        </div>

        {/* Right Column: Details Skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-200 rounded-md" />
              <div className="h-4 w-20 bg-slate-200 rounded-md" />
            </div>
            <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
            <div className="h-6 w-1/2 bg-slate-200 rounded-lg" />
            <div className="flex items-center gap-3 pt-2">
              <div className="h-5 w-16 bg-slate-200 rounded-md" />
              <div className="h-4 w-36 bg-slate-200 rounded-md" />
            </div>
          </div>

          {/* Price Block Skeleton */}
          <div className="p-5 rounded-2xl bg-slate-100 space-y-3">
            <div className="flex items-baseline gap-3">
              <div className="h-9 w-32 bg-slate-200 rounded-lg" />
              <div className="h-5 w-24 bg-slate-200 rounded-md" />
              <div className="h-5 w-20 bg-slate-200 rounded-md" />
            </div>
            <div className="h-4 w-44 bg-slate-200 rounded-md" />
          </div>

          {/* Variant Selector Skeleton */}
          <div className="space-y-3 pt-2">
            <div className="h-4 w-24 bg-slate-200 rounded-md" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-20 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>

          {/* CTA Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="h-12 flex-1 bg-slate-200 rounded-xl" />
            <div className="h-12 flex-1 bg-slate-200 rounded-xl" />
          </div>

          {/* Seller / Delivery Info Skeleton */}
          <div className="h-20 bg-slate-100 rounded-2xl" />

          {/* Trust Strip Skeleton */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 rounded-md" />
          <div className="h-4 w-5/6 bg-slate-200 rounded-md" />
          <div className="h-4 w-4/6 bg-slate-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}
