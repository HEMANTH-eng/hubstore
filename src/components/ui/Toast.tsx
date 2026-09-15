"use client";

import React, { createContext, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium border transition-all duration-300 transform translate-y-0 ${
              t.type === "success"
                ? "bg-slate-900 text-white border-emerald-500/30"
                : t.type === "error"
                ? "bg-rose-950 text-rose-100 border-rose-800"
                : "bg-slate-900 text-slate-100 border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {t.type === "info" && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
