import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  ChevronLeft,
  ShieldCheck,
  Building,
  CheckCircle2,
  Download,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/currency";
import { numberToWordsRupees } from "@/lib/numberToWords";
import { PrintButton } from "./PrintButton";

export default async function OrderInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
              brand: true,
            },
          },
          variant: true,
        },
      },
      payment: true,
      shipment: true,
      address: true,
      user: true,
    },
  });

  if (!order) {
    notFound();
  }

  const invoiceNumber = `INV-${order.orderNumber}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Seller Details
  const seller = {
    name: "Apex Electronics & Retail Pvt Ltd",
    address: "Plot 42, Tech Corridor Phase 2, Electronic City",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560100",
    stateCode: "29",
    gstin: "29AAAAA0000A1Z5",
    pan: "AAAAA0000A",
  };

  // Determine if intra-state or inter-state GST
  const buyerState = order.address?.state?.toLowerCase() || "karnataka";
  const isIntraState = buyerState.includes("karnataka") || !order.address?.state;

  // Calculate taxes: Assume 18% standard GST included in selling price
  // Taxable Value = Total / 1.18
  const taxableSubtotal = Math.round((order.subtotal / 1.18) * 100) / 100;
  const totalTaxAmount = Math.round((order.subtotal - taxableSubtotal) * 100) / 100;
  const cgstAmount = isIntraState ? Math.round((totalTaxAmount / 2) * 100) / 100 : 0;
  const sgstAmount = isIntraState ? Math.round((totalTaxAmount / 2) * 100) / 100 : 0;
  const igstAmount = !isIntraState ? totalTaxAmount : 0;

  const grandTotalWords = numberToWordsRupees(order.totalAmount);

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-4 print:bg-white print:p-0 print:m-0">
      {/* Action Bar (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <Link
          href={`/orders/${order.id}`}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Order Details</span>
        </Link>

        <div className="flex items-center gap-3">
          <PrintButton />
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-md print:shadow-none print:border-none print:p-0 print:rounded-none text-slate-800 text-xs">
        {/* Header Title Bar */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white font-black text-xs tracking-wider flex items-center justify-center shadow-xs">
                HS
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">HypperStore</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">India&apos;s Next-Gen Marketplace</p>
          </div>

          <div className="text-right">
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Tax Invoice</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Original for Recipient
            </p>
            <div className="mt-2 text-xs space-y-0.5">
              <p>
                <span className="text-slate-500">Invoice No:</span>{" "}
                <strong className="font-mono text-slate-900">{invoiceNumber}</strong>
              </p>
              <p>
                <span className="text-slate-500">Invoice Date:</span>{" "}
                <strong className="text-slate-900">{invoiceDate}</strong>
              </p>
              <p>
                <span className="text-slate-500">Order No:</span>{" "}
                <strong className="font-mono text-slate-900">#{order.orderNumber}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Seller and Buyer Details Grid */}
        <div className="grid grid-cols-2 gap-8 border-b border-slate-200 pb-6 mb-6">
          {/* Seller / Sold By */}
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
              Sold By (Seller):
            </h3>
            <p className="font-bold text-slate-900 text-sm">{seller.name}</p>
            <p>{seller.address}</p>
            <p>
              {seller.city}, {seller.state} - {seller.pincode}
            </p>
            <p>
              <span className="text-slate-500">GSTIN:</span>{" "}
              <strong className="font-mono text-slate-900">{seller.gstin}</strong>
            </p>
            <p>
              <span className="text-slate-500">PAN:</span>{" "}
              <strong className="font-mono text-slate-900">{seller.pan}</strong>
            </p>
            <p>
              <span className="text-slate-500">State / State Code:</span>{" "}
              <strong>
                {seller.state} ({seller.stateCode})
              </strong>
            </p>
          </div>

          {/* Billing & Shipping Address */}
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2">
              Billed & Shipped To (Buyer):
            </h3>
            <p className="font-bold text-slate-900 text-sm">
              {order.address?.name || order.user?.name || "Valued Customer"}
            </p>
            <p>{order.address?.street || "Customer Address"}</p>
            {order.address?.apartment && <p>{order.address.apartment}</p>}
            <p>
              {order.address?.city || "Bengaluru"},{" "}
              {order.address?.state || "Karnataka"} -{" "}
              <strong>{order.address?.pincode || "560038"}</strong>
            </p>
            <p>
              <span className="text-slate-500">Mobile Phone:</span>{" "}
              <strong>{order.address?.phone || "N/A"}</strong>
            </p>
            <p>
              <span className="text-slate-500">Place of Supply:</span>{" "}
              <strong>
                {order.address?.state || "Karnataka"} (Code: {isIntraState ? "29" : "Other"})
              </strong>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y-2 border-slate-900 bg-slate-50 text-[11px] text-slate-900 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-2">#</th>
                <th className="py-2.5 px-2">Description of Goods</th>
                <th className="py-2.5 px-2">HSN / SAC</th>
                <th className="py-2.5 px-2 text-center">Qty</th>
                <th className="py-2.5 px-2 text-right">Gross (₹)</th>
                <th className="py-2.5 px-2 text-right">Taxable (₹)</th>
                {isIntraState ? (
                  <>
                    <th className="py-2.5 px-2 text-right">CGST (9%)</th>
                    <th className="py-2.5 px-2 text-right">SGST (9%)</th>
                  </>
                ) : (
                  <th className="py-2.5 px-2 text-right">IGST (18%)</th>
                )}
                <th className="py-2.5 px-2 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items.map((item, index) => {
                const itemGross = item.total;
                const itemTaxable = Math.round((itemGross / 1.18) * 100) / 100;
                const itemTax = Math.round((itemGross - itemTaxable) * 100) / 100;
                const itemCgst = isIntraState ? Math.round((itemTax / 2) * 100) / 100 : 0;
                const itemSgst = isIntraState ? Math.round((itemTax / 2) * 100) / 100 : 0;
                const itemIgst = !isIntraState ? itemTax : 0;
                const hsnCode = item.product?.category?.slug === "fashion" ? "6109" : "8518";

                return (
                  <tr key={item.id} className="text-[11.5px]">
                    <td className="py-3 px-2 text-slate-500">{index + 1}</td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-slate-900">{item.product?.name}</p>
                      {item.variant && (
                        <p className="text-[10px] text-slate-500">Variant: {item.variant.title}</p>
                      )}
                      <p className="text-[10px] font-mono text-slate-400">
                        SKU: {item.variant?.sku || item.product?.sku || "N/A"}
                      </p>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-600">{hsnCode}</td>
                    <td className="py-3 px-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(itemGross)}</td>
                    <td className="py-3 px-2 text-right">{formatCurrency(itemTaxable)}</td>
                    {isIntraState ? (
                      <>
                        <td className="py-3 px-2 text-right text-slate-600">{formatCurrency(itemCgst)}</td>
                        <td className="py-3 px-2 text-right text-slate-600">{formatCurrency(itemSgst)}</td>
                      </>
                    ) : (
                      <td className="py-3 px-2 text-right text-slate-600">{formatCurrency(itemIgst)}</td>
                    )}
                    <td className="py-3 px-2 text-right font-bold text-slate-900">
                      {formatCurrency(itemGross)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculations and Summary Grid */}
        <div className="grid grid-cols-2 gap-8 border-t-2 border-slate-900 pt-4 mb-6">
          {/* Payment & Amount in Words */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Invoice Total in Words:
              </span>
              <p className="font-bold text-slate-900 text-xs mt-0.5">{grandTotalWords}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment Information</span>
              </div>
              <p>
                <span className="text-slate-500">Method:</span>{" "}
                <strong className="uppercase">{order.payment?.provider || "ONLINE"}</strong>
              </p>
              <p>
                <span className="text-slate-500">Payment Status:</span>{" "}
                <strong className="text-emerald-600">{order.payment?.status || "SUCCESS"}</strong>
              </p>
              {order.payment?.transactionId && (
                <p>
                  <span className="text-slate-500">Transaction Ref:</span>{" "}
                  <strong className="font-mono">{order.payment.transactionId}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Financial Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Value:</span>
              <span className="font-medium text-slate-900">{formatCurrency(taxableSubtotal)}</span>
            </div>

            {isIntraState ? (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Central GST (CGST 9%):</span>
                  <span className="font-medium text-slate-900">{formatCurrency(cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>State GST (SGST 9%):</span>
                  <span className="font-medium text-slate-900">{formatCurrency(sgstAmount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-600">
                <span>Integrated GST (IGST 18%):</span>
                <span className="font-medium text-slate-900">{formatCurrency(igstAmount)}</span>
              </div>
            )}

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Promotional Discount ({order.couponCode || "Coupon"}):</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Shipping & Handling Charges:</span>
              <span className="font-medium text-slate-900">
                {order.shippingAmount === 0 ? "FREE" : formatCurrency(order.shippingAmount)}
              </span>
            </div>

            <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-center text-sm font-black text-slate-950">
              <span>Grand Total:</span>
              <span className="text-base text-blue-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer: Terms & Signatory */}
        <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-[10px] text-slate-500">
          <div className="max-w-md space-y-1">
            <p className="font-bold text-slate-700">Declaration & Terms:</p>
            <p>
              1. We declare that this invoice shows the actual price of the goods described and that
              all particulars are true and correct.
            </p>
            <p>2. Subject to Bengaluru jurisdiction only. Returns accepted as per HypperStore 7-Day Policy.</p>
            <p className="text-slate-400 mt-2">
              This is a computer-generated tax invoice and does not require a physical signature.
            </p>
          </div>

          <div className="text-center space-y-1 border-t border-slate-300 pt-2 w-48">
            <div className="flex items-center justify-center gap-1 text-slate-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Digitally</span>
            </div>
            <p className="font-bold text-slate-800 text-[11px]">{seller.name}</p>
            <p className="text-[9px] text-slate-400">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
