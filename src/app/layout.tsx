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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.hypperstore.tech"),
  title: {
    template: "%s | HypperStore",
    default: "HypperStore — India's Next-Gen Premium E-Commerce Marketplace",
  },
  description:
    "Shop verified electronics, noise-cancelling audio, designer fashion, kitchenware & wellness tech with 100% genuine guarantee and free express delivery across India.",
  keywords: [
    "hypperstore",
    "hypperstore.tech",
    "ecommerce india",
    "electronics online",
    "smartphones",
    "wireless headphones",
    "designer fashion",
    "home appliances",
    "express delivery",
  ],
  authors: [{ name: "HypperStore Technologies" }],
  creator: "HypperStore",
  publisher: "HypperStore",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "HypperStore — India's Next-Gen Premium E-Commerce Marketplace",
    description: "Shop curated electronics, audio, apparel & lifestyle gadgets with free express shipping across India.",
    url: "https://www.hypperstore.tech",
    siteName: "HypperStore",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HypperStore — India's Next-Gen Premium E-Commerce Marketplace",
    description: "Shop curated electronics, audio, apparel & lifestyle gadgets with free express shipping across India.",
    creator: "@hypperstore",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
