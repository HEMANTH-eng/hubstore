export type SupplierProviderType =
  | "CJ_DROPSHIPPING"
  | "BAAPSTORE"
  | "CUSTOM_FEED"
  | "DEMO_WHOLESALE";

export type MarkupMode = "PERCENTAGE" | "FIXED";

export interface SourcedProduct {
  supplierSku: string;
  title: string;
  category: string;
  costPrice: number; // In INR (₹)
  suggestedRetailPrice: number; // Calculated or recommended selling price in INR (₹)
  stock: number;
  images: string[];
  shortDescription?: string;
  description?: string;
  weightGrams?: number;
  specs?: Record<string, string>;
}

export interface SupplierConfig {
  id?: string;
  name: string;
  provider: SupplierProviderType;
  apiKey?: string;
  apiSecret?: string;
  endpointUrl?: string;
  markupType: MarkupMode;
  markupValue: number; // e.g., 35 for 35%, or 400 for ₹400
  autoFulfill: boolean;
  isActive: boolean;
}

export interface OrderDispatchPayload {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: {
    sku: string;
    title: string;
    quantity: number;
    costPrice: number;
  }[];
}

export interface DispatchResult {
  success: boolean;
  supplierOrderRef?: string;
  carrier?: string;
  trackingNumber?: string;
  status: "PENDING" | "DISPATCHED" | "SHIPPED" | "FAILED";
  errorMessage?: string;
}

export interface SupplierAdapter {
  provider: SupplierProviderType;
  testConnection(config: SupplierConfig): Promise<{ success: boolean; message: string }>;
  fetchCatalog(config: SupplierConfig, query?: string): Promise<SourcedProduct[]>;
  dispatchOrder(config: SupplierConfig, payload: OrderDispatchPayload): Promise<DispatchResult>;
}
