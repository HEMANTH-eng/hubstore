// HubStore Central Type Definitions

export type UserRole = "CUSTOMER" | "SELLER" | "ADMIN";

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export type ShipmentStatus =
  | "LABEL_CREATED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type CouponType = "PERCENTAGE" | "FIXED";

export type PaymentMethod = "RAZORPAY" | "COD" | "STRIPE";

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image?: string | null;
  sellerId?: string | null;
}

export interface ProductVariantItem {
  id: string;
  productId: string;
  sku: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  image?: string | null;
  attributes?: Record<string, string> | string | null;
}

export interface ProductImageItem {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  order: number;
}

export interface ProductWithDetails {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  compareAtPrice?: number | null;
  discountPercent?: number | null;
  taxRate?: number | null;
  status: ProductStatus | string;
  featured: boolean;
  rating: number;
  reviewCount: number;
  categoryId: string;
  subcategoryId?: string | null;
  brandId?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  } | null;
  images: ProductImageItem[];
  variants: ProductVariantItem[];
  attributeValues?: {
    id: string;
    value: string;
    attribute: {
      name: string;
    };
  }[];
  inventory?: {
    quantity: number;
    reservedQuantity: number;
    lowStockThreshold: number;
  } | null;
  reviews?: ReviewWithUser[];
  createdAt: string | Date;
}

export interface ReviewWithUser {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerified: boolean;
  helpfulVotes: number;
  createdAt: string | Date;
  user: {
    name: string | null;
    image: string | null;
  };
  images?: { id: string; url: string }[];
}

export interface CartItemWithProduct {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    images: { url: string; alt?: string | null }[];
    inventory?: { quantity: number } | null;
  };
  variant?: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    image?: string | null;
  } | null;
}

export interface CartCalculation {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  appliedCoupon?: {
    code: string;
    type: CouponType | string;
    value: number;
    discountAmount: number;
  } | null;
}

export interface AddressItem {
  id: string;
  userId: string;
  name: string;
  phone: string;
  street: string;
  apartment?: string | null;
  area?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface OrderWithDetails {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus | string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  address?: AddressItem | null;
  items: {
    id: string;
    productId: string;
    variantId?: string | null;
    quantity: number;
    price: number;
    total: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: { url: string }[];
    };
    variant?: {
      title: string;
    } | null;
  }[];
  payment?: {
    provider: string;
    method?: string | null;
    status: string;
    transactionId?: string | null;
  } | null;
  shipment?: {
    carrier: string;
    trackingNumber?: string | null;
    status: string;
    estimatedDelivery?: string | Date | null;
    shippedAt?: string | Date | null;
    deliveredAt?: string | Date | null;
  } | null;
}
