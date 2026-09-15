import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "SELLER"]).default("CUSTOMER"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const addressSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid 10-digit mobile number is required"),
  street: z.string().min(3, "House / Flat number & street is required"),
  apartment: z.string().optional(),
  area: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian PIN code"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Delivery address is required"),
  deliveryMethod: z.enum(["STANDARD", "EXPRESS"]).default("STANDARD"),
  paymentMethod: z.enum(["RAZORPAY", "COD", "STRIPE"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  cartSubtotal: z.number().min(0),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(10, "Review must be at least 10 characters"),
  images: z.array(z.string()).max(5, "Maximum 5 photos allowed").optional(),
});

export const productCreateSchema = z.object({
  name: z.string().min(3, "Product name is required"),
  description: z.string().min(10, "Description is required"),
  shortDescription: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  compareAtPrice: z.number().positive().optional(),
  sku: z.string().min(3, "SKU is required"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
});
