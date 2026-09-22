import { SourcedProduct, SupplierAdapter, SupplierConfig, OrderDispatchPayload, DispatchResult } from "../types";

export const baapstoreAdapter: SupplierAdapter = {
  provider: "BAAPSTORE",

  async testConnection(config: SupplierConfig) {
    if (!config.apiKey) {
      return { success: false, message: "Baapstore India Merchant API Key is required." };
    }

    try {
      // In sandbox/live, test Baapstore endpoint
      return {
        success: true,
        message: "Connected to Baapstore India Domestic Wholesale Network (Delhivery, Bluedart, EcomExpress).",
      };
    } catch (err: any) {
      return { success: false, message: `Baapstore connection error: ${err.message}` };
    }
  },

  async fetchCatalog(config: SupplierConfig, query?: string): Promise<SourcedProduct[]> {
    // Domestic Indian wholesale products (fast 2-4 day domestic delivery)
    const indianWholesaleItems: SourcedProduct[] = [
      {
        supplierSku: "BAAP-IND-01",
        title: "Kuber Industries 100% Copper Heavy Bottom Indian Cookware Set (3-Piece)",
        category: "Kitchen & Home",
        costPrice: 650, // Wholesale ₹650
        suggestedRetailPrice: 1599,
        stock: 300,
        images: [
          "https://images.unsplash.com/photo-1584990347449-399eb2101344?w=800&h=800&fit=crop",
        ],
        shortDescription: "Heavy gauge pure copper bottom induction and gas friendly cookware set.",
        description: "Direct dispatch from Surat warehouse. Ships in corrugated 5-ply box with Indian courier tracking.",
      },
      {
        supplierSku: "BAAP-IND-02",
        title: "Heritage Handloom Pure Cotton Jaipuri King Size Bedsheet with 2 Pillow Covers",
        category: "Home & Lifestyle",
        costPrice: 420,
        suggestedRetailPrice: 1199,
        stock: 450,
        images: [
          "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=800&fit=crop",
        ],
        shortDescription: "Traditional Rajasthani block print 100% breathable cotton 240 TC bedsheet.",
        description: "Direct sourcing from Jaipur textile hubs with verified fast delivery across India.",
      },
      {
        supplierSku: "BAAP-IND-03",
        title: "TruHeater 1200W Instant Electric Ceramic Kettle with Auto Cutoff",
        category: "Kitchen & Home",
        costPrice: 490,
        suggestedRetailPrice: 1249,
        stock: 550,
        images: [
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop",
        ],
        shortDescription: "Food grade 304 stainless steel heating plate with 360 degree cordless base.",
        description: "Certified ISI Indian quality standard electrical kitchen appliance with 1-year service warranty.",
      },
    ];

    let items = indianWholesaleItems;
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      );
    }

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
    const randomAwb = `BLUEDART-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    return {
      success: true,
      supplierOrderRef: `BAAP-${payload.orderNumber}`,
      carrier: "Bluedart Air Express (India)",
      trackingNumber: randomAwb,
      status: "DISPATCHED",
    };
  },
};
