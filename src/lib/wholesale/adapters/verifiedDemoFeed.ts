import { SourcedProduct, SupplierAdapter, SupplierConfig, OrderDispatchPayload, DispatchResult } from "../types";

export const VERIFIED_WHOLESALE_CATALOG: SourcedProduct[] = [
  {
    supplierSku: "WHL-AUD-NC99",
    title: "AuraBass ANC Pro Wireless Earbuds (Dual Mic & 45ms Low Latency)",
    category: "Audio",
    costPrice: 520, // Wholesale unit cost ₹520
    suggestedRetailPrice: 1499,
    stock: 450,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&h=800&fit=crop",
    ],
    shortDescription: "Active Noise Cancelling TWS with 38-hour battery, Bluetooth 5.3, and IPX5 water resistance.",
    description: "Factory direct wholesale batch of premium ANC Earbuds. Built with 13mm dynamic titanium drivers, ENC environmental noise reduction for crystal clear calling, instant touch controls, and ultra-fast Type-C charging. Comes with blister gift box packaging ready for retail.",
    weightGrams: 140,
    specs: {
      "Battery Life": "38 Hours with charging case",
      "Bluetooth": "Version 5.3 + EDR",
      "Noise Cancellation": "Active 32dB Hybrid ANC",
      "Warranty": "1 Year Manufacturer Direct",
    },
  },
  {
    supplierSku: "WHL-WAT-APX7",
    title: "Apex Horizon 2.02\" AMOLED Bluetooth Calling Smartwatch",
    category: "Wearables",
    costPrice: 780, // Wholesale unit cost ₹780
    suggestedRetailPrice: 2299,
    stock: 320,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&h=800&fit=crop",
    ],
    shortDescription: "Curved AMOLED display, IP68 water resistance, AI health tracking, and Bluetooth 5.2 phone calls.",
    description: "High-margin smart wearable direct from certified OEM factory. Features 1000 nits peak brightness, 24/7 continuous SpO2/Heart rate monitor, 120+ sport modes, and aircraft-grade aluminum alloy bezel with dual silicone straps.",
    weightGrams: 180,
    specs: {
      "Display": "2.02 inch Curved AMOLED 410x502",
      "Battery": "340mAh (7-day battery life)",
      "Calling": "High-fidelity speaker + mic",
      "Waterproof": "IP68 Certified",
    },
  },
  {
    supplierSku: "WHL-POW-65W",
    title: "HyperVolt 65W GaN 3-Port Ultra-Fast Wall Charger (Dual Type-C + USB-A)",
    category: "Accessories",
    costPrice: 390, // Wholesale unit cost ₹390
    suggestedRetailPrice: 1199,
    stock: 600,
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&h=800&fit=crop",
    ],
    shortDescription: "Gallium Nitride (GaN III) fast charger for Laptops, MacBooks, iPhones & Samsung Galaxy.",
    description: "Compact next-gen GaN semiconductor fast charger. Powers laptops up to 65W and fast-charges 3 devices simultaneously with dynamic power allocation. Multi-protection surge, overheat, and overvoltage defense.",
    weightGrams: 120,
    specs: {
      "Technology": "GaN III (Gallium Nitride)",
      "Output Ports": "2x USB-C (65W PD 3.0), 1x USB-A (Quick Charge 4.0)",
      "Input": "100-240V ~ 50/60Hz (Universal travel)",
    },
  },
  {
    supplierSku: "WHL-CAM-4KPRO",
    title: "VentureCam Ultra 4K 60FPS Waterproof Sports Action Camera",
    category: "Cameras",
    costPrice: 1650, // Wholesale unit cost ₹1,650
    suggestedRetailPrice: 3899,
    stock: 140,
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&h=800&fit=crop",
    ],
    shortDescription: "Dual screen 4K video recording with 6-axis gyro EIS stabilization and 30m waterproof casing.",
    description: "Rugged action camera bundle with 16-piece mounting accessory kit. Perfect for motovlogging, swimming, cycling, and travel reels. Wi-Fi smartphone app live preview and HDMI output.",
    weightGrams: 350,
    specs: {
      "Resolution": "4K at 60fps / 20MP Still Photos",
      "Stabilization": "6-Axis Electronic Image Stabilization",
      "Waterproof": "Up to 30 meters with included housing",
    },
  },
  {
    supplierSku: "WHL-KBD-RGB60",
    title: "Vortex Pro 60% RGB Mechanical Gaming Keyboard (Hot-Swappable Red Switches)",
    category: "Gaming",
    costPrice: 890, // Wholesale unit cost ₹890
    suggestedRetailPrice: 2499,
    stock: 280,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop",
    ],
    shortDescription: "Linear red mechanical switches, 16.8M RGB backlighting, detachable Type-C braided cable.",
    description: "Compact 61-key mechanical gaming keyboard with factory lubed linear switches. Anti-ghosting on all keys, double-shot ABS keycaps that never fade, and ergonomic low-profile deck.",
    weightGrams: 620,
    specs: {
      "Switches": "Custom Hot-Swap Red Linear (50M keystrokes)",
      "Layout": "60% Compact (61 Keys)",
      "Connection": "Detachable Braided Type-C to USB-A",
    },
  },
  {
    supplierSku: "WHL-LGT-RGB10",
    title: "LumiDesk RGB Smart Flow Ambient Light Bar (App & Music Sync)",
    category: "Home & Lifestyle",
    costPrice: 420, // Wholesale unit cost ₹420
    suggestedRetailPrice: 1299,
    stock: 500,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&h=800&fit=crop",
    ],
    shortDescription: "Dual ambient light bars with sound pickup, 32-bit ARM processor, and smartphone Bluetooth control.",
    description: "Immersive desk setup lighting bars. Built-in high-sensitivity microphone dynamically reacts to PC gaming, Spotify music, and movies. Includes dual desktop vertical stands and monitor back-mount adhesives.",
    weightGrams: 280,
    specs: {
      "Control": "Smartphone Bluetooth App + Physical buttons",
      "Color Modes": "16 Million Colors + 213 Dynamic Scene Presets",
      "Power": "USB 5V/2A powered",
    },
  },
];

export const verifiedDemoFeedAdapter: SupplierAdapter = {
  provider: "DEMO_WHOLESALE",

  async testConnection(config: SupplierConfig) {
    return {
      success: true,
      message: "Connected to HypperStore Verified Wholesale Sourcing Network (6 ready-to-ship product lines).",
    };
  },

  async fetchCatalog(config: SupplierConfig, query?: string) {
    let items = [...VERIFIED_WHOLESALE_CATALOG];
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.supplierSku.toLowerCase().includes(q)
      );
    }

    // Apply custom markup rules
    return items.map((item) => {
      let sellingPrice = item.suggestedRetailPrice;
      if (config.markupType === "PERCENTAGE") {
        sellingPrice = Math.round(item.costPrice * (1 + config.markupValue / 100));
      } else if (config.markupType === "FIXED") {
        sellingPrice = Math.round(item.costPrice + config.markupValue);
      }
      return {
        ...item,
        suggestedRetailPrice: Math.max(sellingPrice, item.costPrice + 100),
      };
    });
  },

  async dispatchOrder(config: SupplierConfig, payload: OrderDispatchPayload): Promise<DispatchResult> {
    const randomTracking = `DEL-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const randomRef = `WHL-ORD-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      supplierOrderRef: randomRef,
      carrier: "Delhivery Surface Express",
      trackingNumber: randomTracking,
      status: "DISPATCHED",
    };
  },
};
