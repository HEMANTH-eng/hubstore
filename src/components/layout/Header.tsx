"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  MapPin,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Package,
  LogOut,
  SlidersHorizontal,
  Store,
  Scale,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { APP_CONFIG } from "@/lib/constants";
import { SessionUser } from "@/types";
import { VoiceSearchButton } from "@/components/search/VoiceSearchButton";
import { SearchDropdown } from "@/components/search/SearchDropdown";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pincode, setPincode] = useState("560038");
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [newPincode, setNewPincode] = useState(pincode);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);
  const wishlistItemsCount = useWishlistStore((state) => state.items.length);

  // Fetch session user on mount and route changes
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        // ignore
      }
    }
    checkAuth();
  }, [pathname]);

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `/api/products?q=${encodeURIComponent(searchQuery)}&limit=5${
          selectedCategory !== "all" ? `&category=${selectedCategory}` : ""
        }`;
        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Click outside to close suggestions & account menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const raw = localStorage.getItem("hubstore_recent_searches");
      let arr: string[] = raw ? JSON.parse(raw) : [];
      arr = [term.trim(), ...arr.filter((s) => s.toLowerCase() !== term.trim().toLowerCase())].slice(0, 8);
      localStorage.setItem("hubstore_recent_searches", JSON.stringify(arr));
    } catch (e) {
      // ignore
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    saveRecentSearch(searchQuery.trim());
    setShowSuggestions(false);
    const categoryParam = selectedCategory !== "all" ? `&category=${selectedCategory}` : "";
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}${categoryParam}`);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error(err);
    }
    setCurrentUser(null);
    setAccountMenuOpen(false);
    router.push("/login");
    router.refresh();
  };

  const handleQuickLogin = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setAccountMenuOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950 text-white shadow-md">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-xs py-1.5 px-4 text-center font-medium text-blue-50 flex items-center justify-center gap-2">
        <span className="bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
          Special Offer
        </span>
        <span>Get Flat 50% OFF on your first purchase with code:</span>
        <strong className="tracking-wide text-white underline underline-offset-2">WELCOME50</strong>
        <span className="hidden md:inline">• Free Express Shipping over ₹999</span>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Delivery Location */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md group-hover:bg-blue-500 transition-colors">
                H
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center">
                  Hub<span className="text-blue-400">Store</span>
                </span>
                <span className="text-[10px] text-slate-400 -mt-1 tracking-wider uppercase font-semibold">
                  Marketplace
                </span>
              </div>
            </Link>

            {/* Pincode / Location Selector */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 border-l border-slate-800 pl-4">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              {isEditingPincode ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    maxLength={6}
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="w-20 bg-slate-800 text-white px-2 py-1 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="PIN Code"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (newPincode.length === 6) setPincode(newPincode);
                      setIsEditingPincode(false);
                    }}
                    className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-white font-medium"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingPincode(true)}
                  className="text-left group cursor-pointer hover:text-white"
                >
                  <p className="text-[10px] text-slate-400">Deliver to</p>
                  <p className="font-semibold text-white flex items-center gap-1">
                    PIN {pincode}
                    <span className="text-[10px] text-blue-400 font-normal group-hover:underline">
                      Change
                    </span>
                  </p>
                </button>
              )}
            </div>
          </div>

          {/* Central Search Bar */}
          <div ref={searchContainerRef} className="flex-1 max-w-2xl relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="flex rounded-lg overflow-hidden bg-white text-slate-900 shadow-sm border border-transparent focus-within:ring-2 focus-within:ring-blue-500">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-100 text-slate-700 text-xs px-3 py-2.5 border-r border-slate-200 outline-none hover:bg-slate-200 cursor-pointer transition-colors"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
                <option value="home-kitchen">Home & Kitchen</option>
                <option value="fitness-wellness">Fitness & Wellness</option>
              </select>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search smartphones, headphones, fashion, appliances..."
                className="w-full px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />

              <VoiceSearchButton
                onTranscript={(transcript) => {
                  setSearchQuery(transcript);
                  saveRecentSearch(transcript);
                  setShowSuggestions(false);
                  const categoryParam = selectedCategory !== "all" ? `&category=${selectedCategory}` : "";
                  router.push(`/search?q=${encodeURIComponent(transcript)}${categoryParam}`);
                }}
                className="mr-1 text-slate-500 hover:text-blue-600"
              />

              <button
                type="submit"
                id="header-search-submit-btn"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Instant Suggestions Dropdown with Typo Correction, SKU, Recent & Trending */}
            <SearchDropdown
              query={searchQuery}
              isOpen={showSuggestions}
              onClose={() => setShowSuggestions(false)}
              onSelectQuery={(q) => {
                setSearchQuery(q);
                saveRecentSearch(q);
              }}
              selectedCategory={selectedCategory}
            />
          </div>

          {/* Right Action Icons: Account, Wishlist, Cart */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Account / Auth */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                id="header-account-trigger"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-colors text-xs cursor-pointer text-left"
              >
                {currentUser ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden ring-2 ring-blue-500/50">
                      {currentUser.image ? (
                        <img
                          src={currentUser.image}
                          alt={currentUser.name || "User"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        currentUser.name?.[0] || "U"
                      )}
                    </div>
                    <div className="hidden lg:block text-xs">
                      <p className="text-slate-400 text-[10px]">Hello,</p>
                      <p className="font-semibold text-white max-w-[100px] truncate">
                        {currentUser.name || currentUser.email.split("@")[0]}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </>
                ) : (
                  <>
                    <UserIcon className="w-4 h-4 text-slate-300" />
                    <div className="hidden sm:block text-left">
                      <p className="text-[10px] text-slate-400">Sign In</p>
                      <p className="font-bold text-white">Account</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </>
                )}
              </button>

              {/* Account Dropdown */}
              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 text-slate-800 text-sm animate-in fade-in zoom-in-95 duration-150">
                  {currentUser ? (
                    <>
                      {/* Authenticated User Header */}
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 -mt-2.5 rounded-t-2xl mb-1">
                        <div className="flex items-center justify-between">
                          <p className="font-black text-slate-900 truncate">
                            {currentUser.name}
                          </p>
                          <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {currentUser.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                      </div>

                      <Link
                        href="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        href="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        <span>Account Settings</span>
                      </Link>

                      {/* Admin Links */}
                      {currentUser.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-purple-50 text-purple-700 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      {/* Seller Links */}
                      {(currentUser.role === "SELLER" || currentUser.role === "ADMIN") && (
                        <Link
                          href="/seller"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-emerald-50 text-emerald-700 font-medium"
                        >
                          <Store className="w-4 h-4 text-emerald-600" />
                          <span>Seller Portal</span>
                        </Link>
                      )}

                      <Link
                        href="/compare"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <Scale className="w-4 h-4 text-slate-500" />
                        <span>Comparison Studio</span>
                      </Link>

                      <div className="border-t border-slate-100 my-1.5"></div>

                      {/* Prominent Sign Out Button */}
                      <button
                        onClick={handleLogout}
                        id="header-signout-btn"
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-rose-50 text-rose-600 font-bold text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Unauthenticated / Guest View */}
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 -mt-2.5 rounded-t-2xl mb-2">
                        <p className="font-black text-slate-900 text-sm">Welcome to HubStore</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Sign in to access your orders, profile, and seller studio
                        </p>
                      </div>

                      <div className="px-3 space-y-2 mb-2">
                        <Link
                          href="/login"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-xs text-center py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                        >
                          Sign In
                        </Link>

                        <Link
                          href="/register"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs text-center py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          Create New Account
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 my-2"></div>

                      <div className="px-3 pb-1">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                          Quick Demo Sign-In
                        </p>
                        <div className="grid grid-cols-3 gap-1 text-[11px]">
                          <button
                            onClick={() => handleQuickLogin("customer@hubstore.com", "Customer@12345")}
                            className="p-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-center font-bold text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                          >
                            Buyer
                          </button>
                          <button
                            onClick={() => handleQuickLogin("seller@hubstore.com", "Seller@12345")}
                            className="p-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-center font-bold text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                          >
                            Seller
                          </button>
                          <button
                            onClick={() => handleQuickLogin("admin@hubstore.com", "Admin@12345")}
                            className="p-1.5 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-center font-bold text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                          >
                            Admin
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 my-2"></div>

                      <button
                        onClick={handleLogout}
                        id="header-signout-guest-btn"
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold text-xs text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out / Clear Active Session</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-lg hover:bg-slate-900 transition-colors text-slate-300 hover:text-white"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItemsCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={toggleCart}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-amber-400 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {totalCartItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">Cart</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-900 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="flex rounded-lg overflow-hidden bg-white text-slate-900">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="bg-blue-600 px-4 text-white">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Category Rail Navigation Bar */}
      <div className="bg-slate-900 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6 overflow-x-auto py-2.5 text-xs font-medium text-slate-300 no-scrollbar">
            <Link
              href="/products"
              className="flex items-center gap-1.5 hover:text-white shrink-0 font-semibold text-blue-400"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              All Products
            </Link>
            <Link
              href="/category/electronics"
              className="hover:text-white shrink-0 transition-colors"
            >
              Electronics & Gadgets
            </Link>
            <Link
              href="/category/fashion"
              className="hover:text-white shrink-0 transition-colors"
            >
              Fashion & Apparel
            </Link>
            <Link
              href="/category/home-kitchen"
              className="hover:text-white shrink-0 transition-colors"
            >
              Home & Kitchen
            </Link>
            <Link
              href="/category/fitness-wellness"
              className="hover:text-white shrink-0 transition-colors"
            >
              Fitness & Wellness
            </Link>
            <Link
              href="/products?sort=rating"
              className="hover:text-amber-400 shrink-0 transition-colors text-amber-300/90 font-medium"
            >
              ★ Top Rated
            </Link>
            <Link
              href="/products?discount=true"
              className="hover:text-emerald-400 shrink-0 transition-colors text-emerald-400/90 font-medium"
            >
              Special Offers & Deals
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 px-4 py-4 space-y-3">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/category/electronics"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200"
            >
              Electronics
            </Link>
            <Link
              href="/category/fashion"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200"
            >
              Fashion
            </Link>
            <Link
              href="/category/home-kitchen"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200"
            >
              Home & Kitchen
            </Link>
            <Link
              href="/category/fitness-wellness"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200"
            >
              Fitness & Wellness
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2 text-sm">
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-slate-300"
            >
              <Package className="w-4 h-4" /> My Orders
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-slate-300"
            >
              <Heart className="w-4 h-4 text-rose-500" /> My Wishlist
            </Link>
            {currentUser?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-purple-400 font-medium"
              >
                <ShieldCheck className="w-4 h-4" /> Admin Dashboard
              </Link>
            )}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 text-rose-400 text-left"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-blue-600 text-white text-center py-2.5 rounded-lg font-bold mt-2"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
