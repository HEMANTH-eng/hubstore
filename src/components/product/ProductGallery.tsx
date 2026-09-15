"use client";

import React, { useState } from "react";

interface ProductGalleryProps {
  images: { id: string; url: string; alt?: string | null; isPrimary: boolean }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activeImage =
    images[selectedIndex]?.url ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails rail */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white shrink-0 ${
                selectedIndex === idx
                  ? "border-blue-600 ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <img
                src={img.url}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Viewport with interactive Zoom */}
      <div
        className="flex-1 relative aspect-square bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs cursor-crosshair"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={activeImage}
          alt={productName}
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isZoomed ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Zoomed Lens Layer */}
        {isZoomed && (
          <div
            className="absolute inset-0 bg-no-repeat pointer-events-none"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
              backgroundSize: "200%",
            }}
          />
        )}
      </div>
    </div>
  );
}
