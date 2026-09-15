import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { ClientOverlays } from "@/components/layout/ClientOverlays";

// Self-hosted Next.js Google Font with zero layout shift (CLS = 0)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    template: "%s | HyperStore Marketplace",
    default: "HyperStore — India's Next-Gen Premium E-Commerce Marketplace",
  },
  description:
    "Shop verified electronics, audio, designer apparel, culinary kitchenware, and wellness technology with 100% genuine guarantee and express delivery.",
  keywords: [
    "ecommerce",
    "electronics",
    "smartphones",
    "fashion",
    "india marketplace",
    "express delivery",
    "audio headphones",
  ],
  authors: [{ name: "HyperStore Technologies" }],
  openGraph: {
    title: "HyperStore — Next-Gen E-Commerce Marketplace",
    description: "Shop premium electronics, fashion, and home essentials with verified quality.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`}>
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white`}>
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <ClientOverlays />
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
