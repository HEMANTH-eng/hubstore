"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const CartDrawer = dynamic(
  () => import("@/components/cart/CartDrawer").then((mod) => mod.CartDrawer),
  { ssr: false }
);

const SupportChatWidget = dynamic(
  () => import("@/components/support/SupportChatWidget").then((mod) => mod.SupportChatWidget),
  { ssr: false }
);

const ComparisonDock = dynamic(
  () => import("@/components/compare/ComparisonDock").then((mod) => mod.ComparisonDock),
  { ssr: false }
);

export function ClientOverlays() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Render floating widgets after initial paint
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <CartDrawer />
      <SupportChatWidget />
      <ComparisonDock />
    </>
  );
}
