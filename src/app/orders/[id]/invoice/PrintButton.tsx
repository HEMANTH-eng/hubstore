"use client";

import React from "react";
import { Printer, Download } from "lucide-react";

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
      title="Print or Save as PDF (Ctrl+P)"
    >
      <Printer className="w-4 h-4" />
      <span>Print / Save as PDF</span>
    </button>
  );
}
