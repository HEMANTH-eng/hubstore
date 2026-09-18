"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { formatCurrency } from "@/lib/currency";
import { APP_CONFIG } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { PaymentGatewayModal } from "@/components/checkout/PaymentGatewayModal";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    items,
    couponCode,
    couponDiscount,
    clearCart,
    getSubtotal,
    getShippingFee,
    getTaxAmount,
    getGrandTotal,
  } = useCartStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD" | "STRIPE">("RAZORPAY");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [deliveryAgreed, setDeliveryAgreed] = useState(true);
  const [paymentModalData, setPaymentModalData] = useState<{
    isOpen: boolean;
    orderId: string;
    orderNumber: string;
    amount: number;
    provider: "RAZORPAY" | "STRIPE";
  } | null>(null);

  // New Address Form
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    apartment: "",
    area: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    country: "India",
    isDefault: true,
  });

  const subtotal = getSubtotal();
  const shippingFee = deliveryMethod === "EXPRESS" ? APP_CONFIG.expressShippingFee : getShippingFee();
  const grandTotal = Math.max(0, subtotal - couponDiscount) + shippingFee;

  // Fetch customer saved addresses
  useEffect(() => {
    async function loadAddresses() {
      try {
        const res = await fetch("/api/user/addresses");
        if (res.status === 401) {
          toast("Please log in to proceed with checkout", "info");
          router.push("/login?redirect=/checkout");
          return;
        }
        const data = await res.json();
        if (data.addresses && data.addresses.length > 0) {
          setAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddressModal(true);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAddresses();
  }, [router, toast]);

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses([data.address, ...addresses]);
        setSelectedAddressId(data.address.id);
        setShowNewAddressModal(false);
        toast("Delivery address saved successfully", "success");
      } else {
        toast(data.error || "Failed to save address", "error");
      }
    } catch (err) {
      toast("Error saving address", "error");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast("Please select a delivery address", "error");
      setStep(1);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            name: i.name,
            quantity: i.quantity,
          })),
          addressId: selectedAddressId,
          deliveryMethod,
          paymentMethod,
          couponCode: couponDiscount > 0 ? couponCode : undefined,
          notes: orderNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (paymentMethod === "COD") {
          clearCart();
          toast("Order placed successfully via Cash on Delivery!", "success");
          router.push(`/orders/${data.order.id}`);
        } else if (paymentMethod === "RAZORPAY") {
          await launchOfficialRazorpay(data.order);
        } else {
          setPaymentModalData({
            isOpen: true,
            orderId: data.order.id,
            orderNumber: data.order.orderNumber,
            amount: data.order.totalAmount,
            provider: paymentMethod,
          });
        }
      } else {
        toast(data.error || "Failed to place order", "error");
        setIsProcessing(false);
      }
    } catch (err) {
      toast("An unexpected error occurred during checkout", "error");
      setIsProcessing(false);
    }
  };

  const launchOfficialRazorpay = async (order: any) => {
    try {
      // Ensure Razorpay SDK script is loaded
      if (typeof window !== "undefined" && !(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }

      const createRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, provider: "RAZORPAY" }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        toast(createData.error || "Could not initialize Razorpay order", "error");
        setIsProcessing(false);
        return;
      }

      const pData = createData.paymentData;
      const selectedAddr = addresses.find((a) => a.id === selectedAddressId);

      const options = {
        key: pData.key,
        amount: pData.amount,
        currency: pData.currency || "INR",
        name: "HypperStore",
        description: `Order #${order.orderNumber}`,
        order_id: pData.order_id,
        prefill: {
          name: selectedAddr?.fullName || pData.prefill?.name || "",
          email: pData.prefill?.email || "",
          contact: selectedAddr?.phone || pData.prefill?.contact || "",
        },
        theme: { color: "#2563eb" },
        handler: async function (response: any) {
          setIsProcessing(true);
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: order.id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                provider: "RAZORPAY",
                method: "ONLINE",
                metadata: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              clearCart();
              toast("Payment verified successfully via Razorpay!", "success");
              router.push(`/orders/${order.id}`);
            } else {
              toast(verifyData.error || "Payment verification failed", "error");
              setIsProcessing(false);
            }
          } catch (vErr) {
            toast("Error verifying payment with server", "error");
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            toast("Payment window closed", "info");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast(`Payment failed: ${response.error?.description || "Transaction declined"}`, "error");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay popup launch error:", err);
      toast(err.message || "Failed to launch Razorpay", "error");
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !paymentModalData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/products"
          className="inline-block bg-blue-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const STEPS_NAV = [
    { num: 1, label: "Address", icon: MapPin },
    { num: 2, label: "Delivery", icon: Truck },
    { num: 3, label: "Payment", icon: CreditCard },
    { num: 4, label: "Review", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Steps Navigation */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          {STEPS_NAV.map((s) => {
            const Icon = s.icon;
            const isPassed = step > s.num;
            const isCurrent = step === s.num;
            return (
              <button
                key={s.num}
                onClick={() => {
                  if (s.num < step) setStep(s.num as any);
                }}
                className={`relative z-10 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  s.num < step ? "hover:opacity-80" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-xs ${
                    isCurrent
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : isPassed
                      ? "bg-emerald-600 text-white"
                      : "bg-white border-2 border-slate-300 text-slate-400"
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-bold ${
                    isCurrent ? "text-blue-600" : isPassed ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Step Content Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Address */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Select Delivery Address</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Where should we deliver your order?
                  </p>
                </div>
                <button
                  onClick={() => setShowNewAddressModal(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Saved addresses list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-2 relative ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {addr.street}
                        {addr.apartment ? `, ${addr.apartment}` : ""}
                        <br />
                        {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <p className="text-xs text-slate-500 font-mono">Mobile: {addr.phone}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedAddressId}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  <span>Continue to Delivery</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Speed */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-slate-900">Choose Shipping Method</h2>
                <p className="text-xs text-slate-500 mt-0.5">Select your preferred delivery speed</p>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setDeliveryMethod("STANDARD")}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === "STANDARD"
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={deliveryMethod === "STANDARD"}
                      onChange={() => setDeliveryMethod("STANDARD")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900">Standard Delivery (Ground / Air)</div>
                      <p className="text-xs text-slate-500">
                        Estimated 5–8 business days • Sourced, quality-inspected & securely packed
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600">
                    {subtotal >= APP_CONFIG.freeShippingThreshold
                      ? "FREE"
                      : formatCurrency(APP_CONFIG.standardShippingFee)}
                  </span>
                </label>

                <label
                  onClick={() => setDeliveryMethod("EXPRESS")}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    deliveryMethod === "EXPRESS"
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={deliveryMethod === "EXPRESS"}
                      onChange={() => setDeliveryMethod("EXPRESS")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        Priority Express Air Shipping
                      </div>
                      <p className="text-xs text-slate-500">
                        Next-day air express dispatch with real-time tracking
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">
                    {formatCurrency(APP_CONFIG.expressShippingFee)}
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-slate-900">Select Payment Method</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  100% secure payment through encrypted gateway abstraction
                </p>
              </div>

              <div className="space-y-3">
                {/* Razorpay option */}
                <label
                  onClick={() => setPaymentMethod("RAZORPAY")}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "RAZORPAY"
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => setPaymentMethod("RAZORPAY")}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>Razorpay (UPI / Cards / Net Banking)</span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Google Pay, PhonePe, Paytm, BHIM UPI, Visa, Mastercard, RuPay
                      </p>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery option */}
                <label
                  onClick={() => {
                    if (grandTotal <= APP_CONFIG.maxCodAmount) {
                      setPaymentMethod("COD");
                    }
                  }}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "COD"
                      ? "border-blue-600 bg-blue-50/50"
                      : grandTotal > APP_CONFIG.maxCodAmount
                      ? "border-slate-200 opacity-50 cursor-not-allowed"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      disabled={grandTotal > APP_CONFIG.maxCodAmount}
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pay cash or scan courier UPI QR on package delivery
                      </p>
                      {grandTotal > APP_CONFIG.maxCodAmount && (
                        <p className="text-[11px] text-rose-600 font-bold mt-1">
                          COD limit is ₹{APP_CONFIG.maxCodAmount.toLocaleString("en-IN")}. Please select online payment.
                        </p>
                      )}
                    </div>
                  </div>
                </label>

                {/* Stripe option */}
                <label
                  onClick={() => setPaymentMethod("STRIPE")}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "STRIPE"
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "STRIPE"}
                      onChange={() => setPaymentMethod("STRIPE")}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        International Credit & Debit Cards (Stripe)
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Global Visa, Mastercard, American Express
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center gap-2"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review Order & Place */}
          {step === 4 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-xs">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-slate-900">Review and Confirm Order</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Please verify your shipping details before placing the order
                </p>
              </div>

              {/* Items summary */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Order Items ({items.length})
                </span>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId || "base"}`}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-50 border"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                          <p className="text-slate-500">
                            Qty: {item.quantity} {item.variantTitle ? `• ${item.variantTitle}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery instructions / notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Instructions / Gate Code (Optional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Leave package with building security"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* Delivery Timeline & Sourcing Agreement Card */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      Estimated Delivery Timeline: 5 to 8 Business Days
                    </span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    Quality Inspected
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Every order is individually quality-checked, sealed, and bubble-wrapped for safe transit. Doorstep delivery takes <strong>5 to 8 business days</strong> depending on your destination PIN code. Real-time courier tracking (BlueDart/Delhivery) will be sent via SMS, WhatsApp & email as soon as your parcel is dispatched.
                </p>
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deliveryAgreed}
                    onChange={(e) => setDeliveryAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-900">
                    I agree to the estimated delivery timeline (5–8 business days) and verified fulfillment terms.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !deliveryAgreed}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isProcessing ? "Processing Order..." : `Pay ${formatCurrency(grandTotal)}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Summary Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">Price Details</h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST 18%)</span>
                <span>Included</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-base font-black text-slate-950">
                <span>Total Payable</span>
                <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
              <p className="flex items-center gap-1.5 font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                HypperStore Safe Shopping
              </p>
              <p className="text-[11px]">
                Your transactions are protected by bank-level 256-bit encryption.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Address Modal */}
      {showNewAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b pb-3">
              Add New Delivery Address
            </h3>

            <form onSubmit={handleSaveNewAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">10-Digit Mobile Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  placeholder="9876543210"
                  className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Flat / House No. / Building</label>
                <input
                  type="text"
                  required
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  placeholder="e.g. Flat 402, Skyline Heights"
                  className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNewAddressModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500"
                >
                  Save & Deliver Here
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Payment Gateway Sandbox Modal */}
      {paymentModalData && (
        <PaymentGatewayModal
          isOpen={paymentModalData.isOpen}
          orderId={paymentModalData.orderId}
          orderNumber={paymentModalData.orderNumber}
          amount={paymentModalData.amount}
          initialProvider={paymentModalData.provider}
          onClose={() => {
            const ordId = paymentModalData.orderId;
            setPaymentModalData(null);
            clearCart();
            router.push(`/orders/${ordId}`);
          }}
          onPaymentSuccess={(orderId) => {
            setPaymentModalData(null);
            clearCart();
            router.push(`/orders/${orderId}`);
          }}
        />
      )}
    </div>
  );
}
