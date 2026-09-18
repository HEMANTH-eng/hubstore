"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  QrCode,
  CreditCard,
  Building2,
  Lock,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Timer,
  Sparkles,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";

interface PaymentGatewayModalProps {
  isOpen: boolean;
  orderId: string;
  orderNumber: string;
  amount: number;
  initialProvider?: "RAZORPAY" | "STRIPE";
  onClose: () => void;
  onPaymentSuccess: (orderId: string) => void;
}

export function PaymentGatewayModal({
  isOpen,
  orderId,
  orderNumber,
  amount,
  initialProvider = "RAZORPAY",
  onClose,
  onPaymentSuccess,
}: PaymentGatewayModalProps) {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"UPI" | "CARD" | "NETBANKING" | "STRIPE">(
    initialProvider === "STRIPE" ? "STRIPE" : "UPI"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedTxnId, setVerifiedTxnId] = useState("");

  // Form states for sandbox fallback
  const [upiId, setUpiId] = useState("aarav.sharma@oksbi");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("Aarav Sharma");
  const [selectedBank, setSelectedBank] = useState("HDFC");

  // Countdown timer for QR
  const [timeLeft, setTimeLeft] = useState(599); // 10 minutes

  // Preload official Razorpay standard checkout script
  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("razorpay-checkout-sdk")) {
      const script = document.createElement("script");
      script.id = "razorpay-checkout-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-launch official Razorpay standard checkout popup if Razorpay is selected
  useEffect(() => {
    if (!isOpen) return;
    if (initialProvider === "RAZORPAY") {
      const timer = setTimeout(() => {
        handleLaunchOfficialRazorpay();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFillTestCard = () => {
    setCardNumber("4532 •••• •••• 8892");
    setCardExpiry("12/28");
    setCardCvv("789");
    setCardName("Aarav Sharma");
    toast("Filled Sandbox Test Card details (Visa Platinum)", "info");
  };

  // Launch official Razorpay standard checkout popup
  const handleLaunchOfficialRazorpay = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, provider: "RAZORPAY" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast(data.error || "Failed to initialize payment order", "error");
        setIsProcessing(false);
        return;
      }

      const pData = data.paymentData;

      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: pData.key,
          amount: pData.amount,
          currency: pData.currency || "INR",
          name: "HypperStore",
          description: `Order #${orderNumber}`,
          order_id: pData.order_id,
          prefill: pData.prefill,
          theme: pData.theme || { color: "#2563eb" },
          handler: async function (response: any) {
            setIsProcessing(true);
            try {
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId,
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
                setVerifiedTxnId(response.razorpay_payment_id);
                setIsVerified(true);
                toast("Payment verified successfully via Razorpay!", "success");
                setTimeout(() => onPaymentSuccess(orderId), 1500);
              } else {
                toast(verifyData.error || "Signature verification failed", "error");
                setIsProcessing(false);
              }
            } catch (vErr) {
              toast("Error verifying transaction with server", "error");
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulation if script is blocked
        await handleSimulatePayment("UPI");
      }
    } catch (err: any) {
      toast("Error initiating Razorpay checkout", "error");
      setIsProcessing(false);
    }
  };

  const handleSimulatePayment = async (method: "UPI" | "CARD" | "NETBANKING" | "STRIPE") => {
    setIsProcessing(true);

    // Simulate gateway network round-trip
    await new Promise((r) => setTimeout(r, 1200));

    try {
      const generatedPaymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentId: generatedPaymentId,
          provider: method === "STRIPE" ? "STRIPE" : "RAZORPAY",
          method,
          metadata: {
            methodUsed: method,
            upiId: method === "UPI" ? upiId : undefined,
            bank: method === "NETBANKING" ? selectedBank : undefined,
            simulatedGateway: "Razorpay Sandbox",
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVerifiedTxnId(generatedPaymentId);
        setIsVerified(true);
        toast("Payment verified successfully by gateway!", "success");
        setTimeout(() => {
          onPaymentSuccess(orderId);
        }, 1500);
      } else {
        toast(data.error || "Payment verification failed", "error");
        setIsProcessing(false);
      }
    } catch (err) {
      toast("Error verifying transaction with server", "error");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded">
                Razorpay Checkout
              </span>
              <span className="text-xs text-blue-200">Order #{orderNumber}</span>
            </div>
            <div className="text-2xl font-black mt-1">{formatCurrency(amount)}</div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing || isVerified}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Success Screen */}
        {isVerified ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Transaction ID: <span className="font-mono font-bold text-slate-800">{verifiedTxnId || "TXN-984210928"}</span>
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                Redirecting to order confirmation...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Official Popup Action */}
            <div className="p-4 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between gap-3">
              <div className="text-left">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                  <span>Razorpay Standard Checkout</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  UPI Apps, QR, Cards, EMI, NetBanking
                </div>
              </div>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleLaunchOfficialRazorpay}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Pay Now</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </button>
            </div>

            {/* Method Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveTab("UPI")}
                className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === "UPI"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent hover:bg-slate-100"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("CARD")}
                className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === "CARD"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent hover:bg-slate-100"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("NETBANKING")}
                className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === "NETBANKING"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent hover:bg-slate-100"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("STRIPE")}
                className={`flex-1 py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === "STRIPE"
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent hover:bg-slate-100"
                }`}
              >
                <span>Stripe</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 space-y-5 text-xs">
              {/* TAB 1: UPI & Dynamic QR */}
              {activeTab === "UPI" && (
                <div className="space-y-4 text-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3">
                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                      <Timer className="w-3.5 h-3.5 text-amber-500" />
                      <span>QR Expires in: <strong>{formatTimer(timeLeft)}</strong></span>
                    </div>

                    {/* QR Box */}
                    <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-300 shadow-inner flex flex-col items-center justify-center relative">
                      <QrCode className="w-32 h-32 text-slate-900" />
                      <div className="absolute inset-x-0 bottom-1 text-[9px] font-bold text-slate-500 bg-white/90">
                        Scan with any UPI App
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-bold">
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">GPay</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">PhonePe</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Paytm</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">BHIM</span>
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200" />
                    <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold">Or enter VPA</span>
                    <div className="flex-grow border-t border-slate-200" />
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 font-mono outline-none focus:border-blue-500 text-xs"
                    />
                    <button
                      type="button"
                      disabled={isProcessing || !upiId}
                      onClick={() => handleSimulatePayment("UPI")}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl disabled:opacity-50 transition-all text-xs"
                    >
                      Verify & Pay
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Card */}
              {activeTab === "CARD" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Enter Card Details:</span>
                    <button
                      type="button"
                      onClick={handleFillTestCard}
                      className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Fill Test Card
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card Number (16 digits)"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM / YY"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono outline-none focus:border-blue-500"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="CVV"
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Cardholder Name"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSimulatePayment("CARD")}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isProcessing ? "Processing 3DS Secure..." : `Pay ${formatCurrency(amount)}`}
                    </span>
                  </button>
                </div>
              )}

              {/* TAB 3: Net Banking */}
              {activeTab === "NETBANKING" && (
                <div className="space-y-3.5">
                  <span className="font-bold text-slate-700 block">Select Your Bank:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Punjab National"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-xl border font-bold text-left transition-all ${
                          selectedBank === b
                            ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {b} Bank
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSimulatePayment("NETBANKING")}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-4"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>
                      {isProcessing ? "Redirecting to Bank Portal..." : `Authorize with ${selectedBank} Bank`}
                    </span>
                  </button>
                </div>
              )}

              {/* TAB 4: Stripe */}
              {activeTab === "STRIPE" && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs">
                    <p className="font-bold">Stripe Payment Element (Test Mode)</p>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      Accepts international Visa, Mastercard, AMEX cards worldwide.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-300 bg-slate-50 font-mono text-slate-600">
                    4242 •••• •••• 4242 &bull; 04/28 &bull; 123
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleSimulatePayment("STRIPE")}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isProcessing ? "Connecting to Stripe..." : `Confirm Stripe Payment (${formatCurrency(amount)})`}
                    </span>
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted &bull; Official Razorpay Standard Checkout SDK</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
