"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  Package,
  Layers,
  Search,
  RefreshCw,
  Plus,
  CheckCircle2,
  ExternalLink,
  Truck,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  Sliders,
  Sparkles,
  Zap,
  Clock,
  AlertCircle,
  Eye,
  Check,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/components/ui/Toast";

export default function WholesaleHubPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"catalog" | "suppliers" | "dispatch">("catalog");

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalSuppliers: 0,
    totalWholesaleProducts: 0,
    totalImportedToStore: 0,
    pendingDispatches: 0,
  });

  // Catalog State
  const [catalog, setCatalog] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [importFilter, setImportFilter] = useState<string>("all");
  const [importingId, setImportingId] = useState<string | null>(null);
  const [syncingSupplierId, setSyncingSupplierId] = useState<string | null>(null);

  // Dispatch State
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  // Supplier Edit Modal
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>({
    name: "",
    provider: "DEMO_WHOLESALE",
    apiKey: "",
    apiSecret: "",
    endpointUrl: "",
    markupType: "PERCENTAGE",
    markupValue: 35,
    autoFulfill: false,
    isActive: true,
  });
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch initial data
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/wholesale/suppliers");
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.suppliers || []);
        setStats(data.stats || {});
      }
      await loadCatalog();
      await loadDispatches();
    } catch (err) {
      console.error(err);
      toast("Error loading wholesale data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCatalog = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSupplier) params.set("supplierId", selectedSupplier);
      if (selectedCategory) params.set("category", selectedCategory);
      if (searchQuery) params.set("q", searchQuery);
      if (importFilter === "imported") params.set("imported", "true");
      if (importFilter === "not_imported") params.set("imported", "false");

      const res = await fetch(`/api/admin/wholesale/catalog?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCatalog(data.products || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDispatches = async () => {
    try {
      const res = await fetch("/api/admin/wholesale/dispatch");
      if (res.ok) {
        const data = await res.json();
        setDispatches(data.dispatches || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [selectedCategory, selectedSupplier, importFilter]);

  // Handle 1-Click Import
  const handleImport = async (productId: string, title: string) => {
    setImportingId(productId);
    try {
      const res = await fetch("/api/admin/wholesale/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wholesaleProductId: productId }),
      });

      if (res.ok) {
        toast(`Imported "${title.substring(0, 25)}..." to live store!`, "success");
        await loadCatalog();
        // Update summary stats
        setStats((prev: any) => ({ ...prev, totalImportedToStore: prev.totalImportedToStore + 1 }));
      } else {
        toast("Failed to import product", "error");
      }
    } catch (err) {
      toast("Import error", "error");
    } finally {
      setImportingId(null);
    }
  };

  // Handle Sync Supplier Catalog
  const handleSyncSupplier = async (supplierId: string) => {
    setSyncingSupplierId(supplierId);
    try {
      const res = await fetch("/api/admin/wholesale/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId }),
      });

      if (res.ok) {
        const data = await res.json();
        toast(data.message || "Supplier catalog synchronized!", "success");
        await loadCatalog();
      } else {
        toast("Failed to sync supplier catalog", "error");
      }
    } catch (err) {
      toast("Sync error", "error");
    } finally {
      setSyncingSupplierId(null);
    }
  };

  // Test Supplier Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      const res = await fetch("/api/admin/wholesale/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editingSupplier, testOnly: true }),
      });
      const data = await res.json();
      if (data.testResult) {
        setConnectionStatus(data.testResult);
        if (data.testResult.success) {
          toast("Connection test successful!", "success");
        } else {
          toast(data.testResult.message || "Connection failed", "error");
        }
      }
    } catch (err: any) {
      setConnectionStatus({ success: false, message: err.message });
      toast("Error testing connection", "error");
    } finally {
      setTestingConnection(false);
    }
  };

  // Save Supplier Connection
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/wholesale/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSupplier),
      });

      if (res.ok) {
        toast("Supplier configuration saved!", "success");
        setShowSupplierModal(false);
        await loadInitialData();
      } else {
        toast("Failed to save supplier", "error");
      }
    } catch (err) {
      toast("Error saving supplier", "error");
    }
  };

  // Dispatch Order to Supplier
  const handleDispatchOrder = async (dispatchId: string) => {
    setDispatchingId(dispatchId);
    try {
      const res = await fetch("/api/admin/wholesale/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dispatchId }),
      });

      if (res.ok) {
        const data = await res.json();
        toast(data.message || "Order dispatched to supplier!", "success");
        await loadDispatches();
        setStats((prev: any) => ({ ...prev, pendingDispatches: Math.max(0, prev.pendingDispatches - 1) }));
      } else {
        toast("Failed to dispatch order", "error");
      }
    } catch (err) {
      toast("Dispatch error", "error");
    } finally {
      setDispatchingId(null);
    }
  };

  // Create Demo Test Order Dispatch
  const handleCreateTestDispatch = async () => {
    try {
      const res = await fetch("/api/admin/wholesale/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ createDemoDispatch: true }),
      });

      if (res.ok) {
        toast("Created test wholesale order dispatch!", "success");
        await loadDispatches();
        setStats((prev: any) => ({ ...prev, pendingDispatches: prev.pendingDispatches + 1 }));
      }
    } catch (err) {
      toast("Error creating test order", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            <span>Universal B2B Wholesale & Dropship Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Wholesale Sourcing & Supplier Automation
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Source high-margin products directly from verified manufacturers, CJ Dropshipping, Baapstore India, or custom vendor feeds with automated markup pricing and 1-click catalog importing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setEditingSupplier({
                name: "",
                provider: "DEMO_WHOLESALE",
                apiKey: "",
                apiSecret: "",
                endpointUrl: "",
                markupType: "PERCENTAGE",
                markupValue: 35,
                autoFulfill: false,
                isActive: true,
              });
              setConnectionStatus(null);
              setShowSupplierModal(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect New Supplier</span>
          </button>

          <Link
            href="/admin"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border border-white/10"
          >
            Back to Admin Portal
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Connected Suppliers</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalSuppliers}</div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active & Automated
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Wholesale Sourced Items</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalWholesaleProducts}</div>
          <p className="text-[11px] text-slate-500">Ready in supplier catalog</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Imported to HypperStore</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalImportedToStore}</div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Live on your store
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Supplier Dispatches</span>
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.pendingDispatches}</div>
          <p className="text-[11px] text-amber-600 font-semibold">Orders awaiting supplier packing</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "catalog"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Wholesale Sourcing Catalog ({catalog.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("suppliers")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "suppliers"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Supplier Connections & Profit Markup ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("dispatch")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "dispatch"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Fulfillment & Order Dispatches ({dispatches.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: WHOLESALE CATALOG ================= */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search wholesale products, SKUs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadCatalog()}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Supplier Filter */}
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Import Filter */}
              <select
                value={importFilter}
                onChange={(e) => setImportFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Items</option>
                <option value="not_imported">Not Imported Yet</option>
                <option value="imported">Already in HypperStore</option>
              </select>

              <button
                onClick={() => loadCatalog()}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                title="Refresh Catalog"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Wholesale Product Cards Grid */}
          {catalog.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500 space-y-3">
              <Package className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">No wholesale products found</p>
              <p className="text-xs text-slate-400">
                Click &quot;Connect New Supplier&quot; or select &quot;Sync Products&quot; to fetch the latest wholesale batches.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalog.map((item) => {
                const images: string[] = JSON.parse(item.images || "[]");
                const primaryImage = images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
                const profitPercent = Math.round((item.profitMargin / item.costPrice) * 100);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={primaryImage}
                          alt={item.title}
                          className="w-full h-full object-cover object-center"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                            {item.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
                            SKU: {item.supplierSku}
                          </span>
                        </div>

                        {item.importedToStore && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                              <CheckCircle2 className="w-3 h-3" /> Live in Store
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Content */}
                      <div className="p-4 space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        {item.shortDescription && (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {item.shortDescription}
                          </p>
                        )}

                        {/* Wholesale Pricing Breakdown Card */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Wholesale Unit Cost:</span>
                            <span className="font-bold text-slate-900">{formatCurrency(item.costPrice)}</span>
                          </div>

                          <div className="flex items-center justify-between text-slate-600">
                            <span>Selling Price:</span>
                            <span className="font-extrabold text-blue-600">
                              {formatCurrency(item.suggestedRetailPrice)}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                            <span className="font-bold text-emerald-900 flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                              Your Profit Margin:
                            </span>
                            <span className="font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                              +{formatCurrency(item.profitMargin)} (+{profitPercent}%)
                            </span>
                          </div>
                        </div>

                        {/* Supplier and Stock Info */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>
                            Supplier: <strong>{item.supplier?.name || "Direct Factory"}</strong>
                          </span>
                          <span className="font-semibold text-slate-700">
                            {item.stock} in warehouse stock
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-4 pt-0">
                      {item.importedToStore ? (
                        <div className="flex items-center gap-2">
                          <button
                            disabled
                            className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 flex items-center justify-center gap-1.5 opacity-90"
                          >
                            <Check className="w-4 h-4" />
                            <span>Imported & Selling Live</span>
                          </button>
                          <Link
                            href="/products"
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                            title="View on store"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleImport(item.id, item.title)}
                          disabled={importingId === item.id}
                          className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {importingId === item.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Importing to HypperStore...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>1-Click Import to HypperStore</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: SUPPLIERS & PROFIT MARGINS ================= */}
      {activeTab === "suppliers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold text-[10px] uppercase tracking-wider">
                        {supplier.provider.replace("_", " ")}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1">
                        {supplier.name}
                      </h3>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        supplier.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          supplier.isActive ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {supplier.isActive ? "Active" : "Paused"}
                    </span>
                  </div>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <p className="text-slate-500">Profit Markup Rule</p>
                      <p className="font-extrabold text-indigo-700 mt-0.5">
                        +{supplier.markupValue}
                        {supplier.markupType === "PERCENTAGE" ? "% Profit" : " ₹ Flat"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Auto-Fulfill Orders</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {supplier.autoFulfill ? "Enabled" : "Manual 1-Click"}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Products in Catalog</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {supplier._count?.products || 0} items
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Last Synced</p>
                      <p className="font-medium text-slate-600 mt-0.5">
                        {supplier.lastSyncAt ? new Date(supplier.lastSyncAt).toLocaleTimeString() : "Never"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleSyncSupplier(supplier.id)}
                    disabled={syncingSupplierId === supplier.id}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${syncingSupplierId === supplier.id ? "animate-spin" : ""}`}
                    />
                    <span>{syncingSupplierId === supplier.id ? "Syncing..." : "Sync Catalog"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingSupplier(supplier);
                      setConnectionStatus(null);
                      setShowSupplierModal(true);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: ORDER DISPATCH & FULFILLMENT ================= */}
      {activeTab === "dispatch" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Supplier Fulfillment Tracker
              </h3>
              <p className="text-xs text-slate-500">
                Route paid customer orders to wholesale suppliers for domestic & international parcel dispatch.
              </p>
            </div>

            <button
              onClick={handleCreateTestDispatch}
              className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Customer Order</span>
            </button>
          </div>

          {dispatches.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500 space-y-3">
              <Truck className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">No wholesale orders awaiting fulfillment</p>
              <p className="text-xs text-slate-400">
                When customers purchase imported wholesale items, orders appear here for 1-click dispatch.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {dispatches.map((dispatch) => {
                const items = JSON.parse(dispatch.items || "[]");
                const address = JSON.parse(dispatch.shippingAddress || "{}");

                return (
                  <div
                    key={dispatch.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-xs text-slate-900">
                          {dispatch.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            dispatch.status === "DISPATCHED"
                              ? "bg-blue-100 text-blue-800"
                              : dispatch.status === "SHIPPED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {dispatch.status}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Supplier: <strong>{dispatch.supplier?.name}</strong>
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 space-y-0.5">
                        <p className="font-bold">
                          Customer: {dispatch.customerName} {dispatch.customerPhone && `(${dispatch.customerPhone})`}
                        </p>
                        <p className="text-slate-500">
                          Ship to: {address.street}, {address.city}, {address.state} - {address.postalCode}
                        </p>
                        <p className="text-indigo-600 font-medium">
                          Items: {items.map((i: any) => `${i.quantity}x ${i.title}`).join(", ")}
                        </p>
                      </div>

                      {dispatch.trackingNumber && (
                        <div className="flex items-center gap-2 pt-1 text-xs">
                          <span className="text-slate-500">Courier: <strong>{dispatch.carrier}</strong></span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-800">
                            AWB: {dispatch.trackingNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500">Wholesale Cost:</span>
                        <p className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(dispatch.totalWholesaleCost)}
                        </p>
                      </div>

                      {dispatch.status === "PENDING" ? (
                        <button
                          onClick={() => handleDispatchOrder(dispatch.id)}
                          disabled={dispatchingId === dispatch.id}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {dispatchingId === dispatch.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Dispatching...</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch to Supplier</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Dispatched to Supplier
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= SUPPLIER MODAL ================= */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingSupplier.id ? "Edit Supplier Connection" : "Connect Wholesale Supplier"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure API keys and profit margin markup rules.
                </p>
              </div>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supplier Platform / Provider
                </label>
                <select
                  value={editingSupplier.provider}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, provider: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                >
                  <option value="DEMO_WHOLESALE">Verified Direct Wholesale Network (Default Factory)</option>
                  <option value="CJ_DROPSHIPPING">CJ Dropshipping (Global Sourcing REST API)</option>
                  <option value="BAAPSTORE">Baapstore India (Domestic Wholesale & Courier)</option>
                  <option value="CUSTOM_FEED">Custom Vendor REST API / JSON Feed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supplier Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Tech Wholesale Mumbai"
                  value={editingSupplier.name}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {editingSupplier.provider !== "DEMO_WHOLESALE" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      API Key / Access Token
                    </label>
                    <input
                      type="password"
                      placeholder="Paste supplier API key or token"
                      value={editingSupplier.apiKey || ""}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, apiKey: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  {editingSupplier.provider === "CUSTOM_FEED" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://api.supplier.com/v1/products"
                        value={editingSupplier.endpointUrl || ""}
                        onChange={(e) => setEditingSupplier({ ...editingSupplier, endpointUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Profit Markup Calculation Settings */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <Percent className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Profit Margin & Pricing Rule</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Markup Mode</label>
                    <select
                      value={editingSupplier.markupType}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, markupType: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Flat Rupee (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Markup Value ({editingSupplier.markupType === "PERCENTAGE" ? "%" : "₹"})
                    </label>
                    <input
                      type="number"
                      value={editingSupplier.markupValue}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, markupValue: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {connectionStatus && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    connectionStatus.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {connectionStatus.message}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {testingConnection ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                  <span>Test Connection</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(false)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
