import React, { Suspense } from "react";
import ProductsPage from "@/app/products/page";

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading collection...</div>}>
      <ProductsPage />
    </Suspense>
  );
}
