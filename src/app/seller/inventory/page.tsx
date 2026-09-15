"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Upload,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Truck,
  Save,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Store,
  FileSpreadsheet,
  Check,
  X,
  Plus,
  Minus,
  Percent,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";

interface InventoryProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  taxRate: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  dispatchDays: number;
  deliveryTime: string;
  category: string;
  categorySlug: string;
  brand: string;
  imageUrl: string;
  quantity: number;
  lowStockThreshold: number;
  reservedQuantity: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  updatedAt: string;
}

interface InventoryMetrics {
  totalSkus: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValuation: number;
}

export default function SellerInventoryPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [editedItems, setEditedItems] = useState<Record<string, Partial<InventoryProduct>>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [metrics, setMetrics] = useState<InventoryMetrics>({
    totalSkus: 0,
    totalUnits: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValuation: 0,
  });
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name_asc");

  // CSV Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedCsvRows, setParsedCsvRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Batch Adjustment Modal / Popover States
  const [batchAdjustmentType, setBatchAdjustmentType] = useState<"stock" | "price" | "dispatch" | null>(null);
  const [batchAdjustmentValue, setBatchAdjustmentValue] = useState<string>("");

  // Load Inventory Data
  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      const auth = await res.json();
      if (!auth.authenticated || (auth.user.role !== "SELLER" && auth.user.role !== "ADMIN")) {
        toast("Seller account access required", "error");
        router.push("/login?redirect=/seller/inventory");
        return;
      }

      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.set("q", searchQuery);
      if (stockStatusFilter !== "ALL") queryParams.set("stockStatus", stockStatusFilter);
      if (categoryFilter !== "ALL") queryParams.set("category", categoryFilter);
      if (sortBy) queryParams.set("sort", sortBy);

      const invRes = await fetch(`/api/seller/inventory?${queryParams.toString()}`);
      const invData = await invRes.json();

      if (invData.success) {
        setProducts(invData.products || []);
        if (invData.metrics) setMetrics(invData.metrics);
        if (invData.categories) setCategories(invData.categories);
        // Clear edits after reload
        setEditedItems({});
      } else {
        toast(invData.error || "Failed to load inventory", "error");
      }
    } catch (err: any) {
      console.error(err);
      toast("Error loading inventory", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [stockStatusFilter, categoryFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadInventory();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Handle In-Line Field Edits
  const handleFieldChange = (productId: string, field: keyof InventoryProduct, value: any) => {
    setEditedItems((prev) => {
      const currentEdit = prev[productId] || {};
      return {
        ...prev,
        [productId]: {
          ...currentEdit,
          [field]: value,
        },
      };
    });
  };

  const getEffectiveValue = <K extends keyof InventoryProduct>(
    product: InventoryProduct,
    field: K
  ): InventoryProduct[K] => {
    const edit = editedItems[product.id];
    if (edit && edit[field] !== undefined) {
      return edit[field] as InventoryProduct[K];
    }
    return product[field];
  };

  const isRowDirty = (productId: string) => {
    return !!editedItems[productId] && Object.keys(editedItems[productId]).length > 0;
  };

  // Save Single Row
  const handleSaveSingleRow = async (productId: string) => {
    const edit = editedItems[productId];
    if (!edit) return;

    setIsSaving(true);
    try {
      const payloadItem: any = { id: productId, ...edit };
      const res = await fetch("/api/seller/inventory/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [payloadItem] }),
      });
      const data = await res.json();
      if (data.success) {
        toast("SKU inventory updated successfully!", "success");
        // Remove from edited
        setEditedItems((prev) => {
          const copy = { ...prev };
          delete copy[productId];
          return copy;
        });
        // Optimistically update products state
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, ...edit } : p))
        );
      } else {
        toast(data.error || "Failed to save update", "error");
      }
    } catch (err) {
      toast("Error saving inventory changes", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Save All Dirty Rows
  const handleSaveAllDirty = async () => {
    const dirtyIds = Object.keys(editedItems);
    if (dirtyIds.length === 0) {
      toast("No changes to save", "info");
      return;
    }

    setIsSaving(true);
    try {
      const itemsPayload = dirtyIds.map((id) => ({
        id,
        ...editedItems[id],
      }));

      const res = await fetch("/api/seller/inventory/batch", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsPayload }),
      });
      const data = await res.json();

      if (data.success) {
        toast(`Successfully saved ${dirtyIds.length} modified SKU(s)!`, "success");
        setEditedItems({});
        loadInventory();
      } else {
        toast(data.error || "Failed to save updates", "error");
      }
    } catch (err) {
      toast("Error saving updates", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(products.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Batch Adjustments (Stock / Price / Dispatch)
  const handleApplyBatchAdjustment = () => {
    if (selectedIds.size === 0) return;
    const val = parseFloat(batchAdjustmentValue);

    if (isNaN(val) && batchAdjustmentType !== "dispatch") {
      toast("Please enter a valid numeric value", "error");
      return;
    }

    setEditedItems((prev) => {
      const updated = { ...prev };
      selectedIds.forEach((id) => {
        const prod = products.find((p) => p.id === id);
        if (!prod) return;

        const currentEdit = updated[id] || {};

        if (batchAdjustmentType === "stock") {
          const currentQty = (currentEdit.quantity ?? prod.quantity);
          const newQty = Math.max(0, currentQty + Math.round(val));
          updated[id] = { ...currentEdit, quantity: newQty };
        } else if (batchAdjustmentType === "price") {
          // Percent adjustment e.g. +5% or -10%
          const currentPrice = (currentEdit.price ?? prod.price);
          const multiplier = 1 + val / 100;
          const newPrice = Math.max(1, Math.round(currentPrice * multiplier));
          updated[id] = { ...currentEdit, price: newPrice };
        } else if (batchAdjustmentType === "dispatch") {
          const days = parseInt(batchAdjustmentValue, 10) || 2;
          updated[id] = { ...currentEdit, dispatchDays: days };
        }
      });
      return updated;
    });

    toast(
      `Applied ${batchAdjustmentType} adjustment to ${selectedIds.size} selected SKU(s). Click "Save Changes" to commit.`,
      "info"
    );
    setBatchAdjustmentType(null);
    setBatchAdjustmentValue("");
  };

  // Batch Status Change (Publish / Draft)
  const handleBatchStatusChange = (status: "PUBLISHED" | "DRAFT") => {
    if (selectedIds.size === 0) return;
    setEditedItems((prev) => {
      const updated = { ...prev };
      selectedIds.forEach((id) => {
        const currentEdit = updated[id] || {};
        updated[id] = { ...currentEdit, status };
      });
      return updated;
    });
    toast(`Set ${selectedIds.size} item(s) to ${status}. Remember to save changes!`, "info");
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (products.length === 0) {
      toast("No products to export", "error");
      return;
    }

    const headers = [
      "SKU",
      "Name",
      "Brand",
      "Category",
      "Selling Price",
      "MRP",
      "Stock Quantity",
      "Low Stock Threshold",
      "Dispatch Days",
      "Status",
    ];

    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand}"`,
      `"${p.category}"`,
      getEffectiveValue(p, "price"),
      getEffectiveValue(p, "compareAtPrice") || "",
      getEffectiveValue(p, "quantity"),
      getEffectiveValue(p, "lowStockThreshold"),
      getEffectiveValue(p, "dispatchDays"),
      getEffectiveValue(p, "status"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hubstore_inventory_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast("Inventory CSV exported successfully!", "success");
  };

  // Download Sample CSV Template
  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = [
      "sku",
      "price",
      "compareAtPrice",
      "quantity",
      "lowStockThreshold",
      "dispatchDays",
      "status",
    ];
    const sampleRow1 = ["ZENITH-PRO-16", "79999", "89999", "25", "5", "2", "PUBLISHED"];
    const sampleRow2 = ["NOVA-AUDIO-APX", "14999", "18999", "40", "8", "2", "PUBLISHED"];
    const sampleRow3 = ["ZENITH-BOOK-16", "124999", "139999", "10", "3", "3", "PUBLISHED"];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [sampleHeaders.join(","), sampleRow1.join(","), sampleRow2.join(","), sampleRow3.join(",")].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hubstore_inventory_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV on upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        toast("CSV must contain headers and at least one data row", "error");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
      const parsed = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const rowObj: any = {};
        headers.forEach((h, index) => {
          rowObj[h] = values[index];
        });
        parsed.push(rowObj);
      }

      setParsedCsvRows(parsed);
    };
    reader.readAsText(file);
  };

  // Commit CSV Import
  const handleCommitImport = async () => {
    if (parsedCsvRows.length === 0) {
      toast("No rows found in uploaded CSV", "error");
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch("/api/seller/inventory/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsedCsvRows }),
      });
      const data = await res.json();

      if (data.success) {
        toast(
          `Import Complete: ${data.summary.updatedCount} updated, ${data.summary.skippedCount} skipped.`,
          "success"
        );
        setIsImportModalOpen(false);
        setImportFile(null);
        setParsedCsvRows([]);
        loadInventory();
      } else {
        toast(data.error || "Failed to process CSV import", "error");
      }
    } catch (err) {
      toast("Error importing CSV inventory", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const dirtyCount = Object.keys(editedItems).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb & Quick Portal Nav */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Storefront
            </Link>
            <span>/</span>
            <Link href="/seller" className="hover:text-blue-600 transition-colors">
              Seller Portal
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Bulk Inventory Studio</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/seller/orders"
              className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Orders Dispatch</span>
            </Link>
            <Link
              href="/seller/analytics"
              className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Revenue Studio</span>
            </Link>
          </div>
        </div>

        {/* Hero Command Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-inner">
              <Boxes className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Bulk Inventory & CSV Studio
                </h1>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  Live Multi-SKU Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Real-time warehouse stock balancing, wholesale pricing adjustments, and bidirectional CSV catalog synchronization.
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-blue-300" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Export CSV</span>
            </button>

            {dirtyCount > 0 && (
              <button
                onClick={handleSaveAllDirty}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer animate-pulse"
              >
                <Save className="w-4 h-4" />
                <span>Save All ({dirtyCount})</span>
              </button>
            )}

            <button
              onClick={loadInventory}
              title="Refresh inventory"
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl border border-white/20 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Hero Inventory Health KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Managed SKUs</span>
            <div className="text-2xl font-black text-slate-900">{metrics.totalSkus}</div>
            <p className="text-[11px] text-blue-600 font-semibold">Active Catalog Items</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Total Warehouse Units</span>
            <div className="text-2xl font-black text-slate-900">{metrics.totalUnits.toLocaleString("en-IN")}</div>
            <p className="text-[11px] text-emerald-600 font-semibold">Available for Dispatch</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Low Stock Alerts</span>
            <div className="text-2xl font-black text-amber-600">{metrics.lowStockCount}</div>
            <p className="text-[11px] text-amber-700 font-semibold">$\le$ Threshold Quantity</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Out of Stock SKUs</span>
            <div className="text-2xl font-black text-rose-600">{metrics.outOfStockCount}</div>
            <p className="text-[11px] text-rose-600 font-semibold">Immediate Restock Needed</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-xs">
            <span className="text-xs text-slate-500 font-medium">Total Inventory Value</span>
            <div className="text-2xl font-black text-slate-900">{formatCurrency(metrics.totalValuation)}</div>
            <p className="text-[11px] text-indigo-600 font-semibold">Gross Valuation</p>
          </div>
        </div>

        {/* Search, Filters & Stock Status Chips */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by SKU, product name, brand..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "ALL", label: "All Items" },
              { id: "IN_STOCK", label: "🟢 In Stock" },
              { id: "LOW_STOCK", label: "🟡 Low Stock" },
              { id: "OUT_OF_STOCK", label: "🔴 Out of Stock" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStockStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  stockStatusFilter === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Editable Inventory Data Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedIds.size === products.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 min-w-[260px]">Product / SKU</th>
                  <th className="p-4 min-w-[120px]">Category & Brand</th>
                  <th className="p-4 min-w-[130px]">Selling Price (₹)</th>
                  <th className="p-4 min-w-[120px]">MRP (₹)</th>
                  <th className="p-4 min-w-[140px]">Stock Level (Units)</th>
                  <th className="p-4 min-w-[110px]">Alert Limit</th>
                  <th className="p-4 min-w-[110px]">Dispatch SLA</th>
                  <th className="p-4 min-w-[100px]">Status</th>
                  <th className="p-4 w-20 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-400">
                      Loading inventory catalog...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-slate-400">
                      No products found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const dirty = isRowDirty(product.id);
                    const effectivePrice = getEffectiveValue(product, "price");
                    const effectiveComparePrice = getEffectiveValue(product, "compareAtPrice");
                    const effectiveQuantity = getEffectiveValue(product, "quantity");
                    const effectiveThreshold = getEffectiveValue(product, "lowStockThreshold");
                    const effectiveDispatch = getEffectiveValue(product, "dispatchDays");
                    const effectiveStatus = getEffectiveValue(product, "status");

                    // Calculate live stock health indicator
                    const isOutOfStock = effectiveQuantity <= 0;
                    const isLowStock = effectiveQuantity > 0 && effectiveQuantity <= effectiveThreshold;

                    return (
                      <tr
                        key={product.id}
                        className={`transition-colors hover:bg-slate-50/80 ${
                          dirty ? "bg-amber-50/40" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(product.id)}
                            onChange={() => handleToggleSelect(product.id)}
                            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                          />
                        </td>

                        {/* Product Title & SKU */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-11 h-11 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                            />
                            <div>
                              <Link
                                href={`/products/${product.slug}`}
                                className="font-extrabold text-slate-900 hover:text-blue-600 line-clamp-1 leading-snug"
                              >
                                {product.name}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {product.sku}
                                </span>
                                {dirty && (
                                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                    Unsaved
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & Brand */}
                        <td className="p-4">
                          <span className="font-bold text-slate-800 block">{product.category}</span>
                          <span className="text-slate-500 text-[11px]">{product.brand}</span>
                        </td>

                        {/* In-Line Selling Price */}
                        <td className="p-4">
                          <div className="relative max-w-[110px]">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={effectivePrice}
                              onChange={(e) =>
                                handleFieldChange(product.id, "price", parseFloat(e.target.value) || 0)
                              }
                              className={`w-full pl-6 pr-2 py-1.5 rounded-lg border text-xs font-extrabold outline-none transition-all ${
                                editedItems[product.id]?.price !== undefined
                                  ? "border-amber-400 bg-amber-50/60 text-slate-900 font-black"
                                  : "border-slate-200 bg-white text-slate-800 focus:border-blue-500"
                              }`}
                            />
                          </div>
                        </td>

                        {/* In-Line MRP / Compare Price */}
                        <td className="p-4">
                          <div className="relative max-w-[100px]">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={effectiveComparePrice ?? ""}
                              placeholder="MRP"
                              onChange={(e) =>
                                handleFieldChange(
                                  product.id,
                                  "compareAtPrice",
                                  e.target.value ? parseFloat(e.target.value) : null
                                )
                              }
                              className={`w-full pl-6 pr-2 py-1.5 rounded-lg border text-xs font-semibold outline-none transition-all ${
                                editedItems[product.id]?.compareAtPrice !== undefined
                                  ? "border-amber-400 bg-amber-50/60 text-slate-900"
                                  : "border-slate-200 bg-white text-slate-600 focus:border-blue-500"
                              }`}
                            />
                          </div>
                        </td>

                        {/* In-Line Stock Quantity & Dynamic Health Badge */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={effectiveQuantity}
                              onChange={(e) =>
                                handleFieldChange(
                                  product.id,
                                  "quantity",
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className={`w-16 px-2 py-1.5 rounded-lg border text-xs font-extrabold text-center outline-none transition-all ${
                                editedItems[product.id]?.quantity !== undefined
                                  ? "border-amber-400 bg-amber-50/60 text-slate-900"
                                  : "border-slate-200 bg-white text-slate-900 focus:border-blue-500"
                              }`}
                            />

                            {isOutOfStock ? (
                              <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 whitespace-nowrap">
                                Out
                              </span>
                            ) : isLowStock ? (
                              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 whitespace-nowrap">
                                Low
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 whitespace-nowrap">
                                Good
                              </span>
                            )}
                          </div>
                        </td>

                        {/* In-Line Low Stock Threshold */}
                        <td className="p-4">
                          <input
                            type="number"
                            min="1"
                            value={effectiveThreshold}
                            onChange={(e) =>
                              handleFieldChange(
                                product.id,
                                "lowStockThreshold",
                                parseInt(e.target.value, 10) || 5
                              )
                            }
                            className={`w-14 px-2 py-1.5 rounded-lg border text-xs font-semibold text-center outline-none transition-all ${
                              editedItems[product.id]?.lowStockThreshold !== undefined
                                ? "border-amber-400 bg-amber-50/60"
                                : "border-slate-200 bg-white text-slate-700 focus:border-blue-500"
                            }`}
                          />
                        </td>

                        {/* Dispatch SLA */}
                        <td className="p-4">
                          <select
                            value={effectiveDispatch}
                            onChange={(e) =>
                              handleFieldChange(
                                product.id,
                                "dispatchDays",
                                parseInt(e.target.value, 10) || 2
                              )
                            }
                            className={`px-2 py-1.5 rounded-lg border text-xs font-bold outline-none cursor-pointer ${
                              editedItems[product.id]?.dispatchDays !== undefined
                                ? "border-amber-400 bg-amber-50/60"
                                : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            <option value={1}>1 Day (Express)</option>
                            <option value={2}>2 Days (Std)</option>
                            <option value={3}>3 Days</option>
                            <option value={5}>5 Days</option>
                          </select>
                        </td>

                        {/* Status Toggle */}
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleFieldChange(
                                product.id,
                                "status",
                                effectiveStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED"
                              )
                            }
                            className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              effectiveStatus === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {effectiveStatus === "PUBLISHED" ? "Published" : "Draft"}
                          </button>
                        </td>

                        {/* Row Action Save Button */}
                        <td className="p-4 text-center">
                          {dirty ? (
                            <button
                              onClick={() => handleSaveSingleRow(product.id)}
                              disabled={isSaving}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                              title="Save SKU changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Floating Batch Multi-Select Action Bar */}
        {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl px-5 py-3 shadow-2xl flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <span className="text-xs font-black text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-800/80">
              {selectedIds.size} Selected
            </span>

            {/* Quick Adjustment Buttons */}
            <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
              {/* Adjust Stock Button */}
              <button
                onClick={() => {
                  setBatchAdjustmentType("stock");
                  setBatchAdjustmentValue("10");
                }}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Boxes className="w-3.5 h-3.5 text-blue-400" />
                <span>Adjust Stock</span>
              </button>

              {/* Adjust Price Button */}
              <button
                onClick={() => {
                  setBatchAdjustmentType("price");
                  setBatchAdjustmentValue("-5");
                }}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>Adjust Price %</span>
              </button>

              {/* Status Toggles */}
              <button
                onClick={() => handleBatchStatusChange("PUBLISHED")}
                className="bg-white/10 hover:bg-emerald-600/40 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Publish All
              </button>
              <button
                onClick={() => handleBatchStatusChange("DRAFT")}
                className="bg-white/10 hover:bg-rose-600/40 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Set to Draft
              </button>
            </div>

            {/* Commit All Selected */}
            {dirtyCount > 0 && (
              <button
                onClick={handleSaveAllDirty}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-md transition-all cursor-pointer"
              >
                Save Selected
              </button>
            )}

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-slate-400 hover:text-white text-xs font-semibold pl-2 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* Batch Adjustment Sub-Modal / Popover */}
        {batchAdjustmentType && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  {batchAdjustmentType === "stock" && "Bulk Adjust Stock Units"}
                  {batchAdjustmentType === "price" && "Bulk Adjust Price (%)"}
                  {batchAdjustmentType === "dispatch" && "Set Dispatch SLA"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applies change across {selectedIds.size} selected SKU(s).
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {batchAdjustmentType === "stock" && "Adjustment Units (e.g. +10 or -5):"}
                  {batchAdjustmentType === "price" && "Percentage Change (e.g. -10 for 10% discount, +5 for 5% markup):"}
                  {batchAdjustmentType === "dispatch" && "Dispatch SLA (Days):"}
                </label>
                <input
                  type="number"
                  value={batchAdjustmentValue}
                  onChange={(e) => setBatchAdjustmentValue(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-blue-600"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setBatchAdjustmentType(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBatchAdjustment}
                  className="px-4 py-1.5 rounded-lg text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                >
                  Apply to {selectedIds.size} Items
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Import Inventory via CSV
                    </h3>
                    <p className="text-xs text-slate-500">
                      Upload a CSV file to update prices, stock quantities, and dispatch SLAs in bulk
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Download Sample Template Banner */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-slate-900 block">
                      Need a sample CSV format?
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Download pre-formatted template with standard headers:{" "}
                      <code className="font-mono text-blue-600">sku, price, compareAtPrice, quantity, lowStockThreshold, dispatchDays, status</code>
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadSampleTemplate}
                    className="bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-300 shrink-0 transition-colors cursor-pointer"
                  >
                    Download Template
                  </button>
                </div>

                {/* File Drop Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-2 group"
                >
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mx-auto transition-colors" />
                  <div>
                    <span className="text-xs sm:text-sm font-black text-slate-800 block">
                      {importFile ? importFile.name : "Click to select or drop CSV file here"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Supported format: .csv up to 10MB
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Pre-Validation Preview */}
                {parsedCsvRows.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        CSV Preview ({parsedCsvRows.length} Rows Detected)
                      </span>
                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Ready to Commit
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-bold">
                          <tr>
                            <th className="p-2">SKU</th>
                            <th className="p-2">Price</th>
                            <th className="p-2">MRP</th>
                            <th className="p-2">Stock</th>
                            <th className="p-2">Alert</th>
                            <th className="p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {parsedCsvRows.slice(0, 10).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 font-mono font-bold text-slate-900">{row.sku}</td>
                              <td className="p-2">{row.price ? `₹${row.price}` : "—"}</td>
                              <td className="p-2">{row.compareatprice || row.compareAtPrice ? `₹${row.compareatprice || row.compareAtPrice}` : "—"}</td>
                              <td className="p-2 font-bold">{row.quantity ?? "—"}</td>
                              <td className="p-2">{(row.lowstockthreshold || row.lowStockThreshold) ?? "—"}</td>
                              <td className="p-2">{row.status ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsedCsvRows.length > 10 && (
                        <div className="p-2 bg-slate-50 text-center text-[10px] text-slate-500 font-semibold border-t">
                          + {parsedCsvRows.length - 10} more rows will be processed in bulk
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedCsvRows.length === 0 || isImporting}
                  onClick={handleCommitImport}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing Bulk Import...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Commit {parsedCsvRows.length} Updates</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
