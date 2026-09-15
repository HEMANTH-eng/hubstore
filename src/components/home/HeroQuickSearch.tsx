"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, TrendingUp } from "lucide-react";
import { VoiceSearchButton } from "@/components/search/VoiceSearchButton";
import { SearchDropdown } from "@/components/search/SearchDropdown";

export function HeroQuickSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/products");
    }
  };

  const trendingTags = [
    { label: "🎧 ANC Headphones", q: "Headphones" },
    { label: "💻 Ultra Laptops", q: "Laptop" },
    { label: "👕 Oversized Tees", q: "T-Shirt" },
    { label: "☕ Espresso Machines", q: "Espresso" },
    { label: "👟 Running Shoes", q: "Shoes" },
    { label: "🔥 Under ₹999", q: "", href: "/products?maxPrice=999" },
  ];

  return (
    <div ref={containerRef} className="w-full max-w-xl mx-auto lg:mx-0 space-y-3 relative">
      <form
        onSubmit={handleSearch}
        className="relative flex items-center bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-2xl p-1.5 shadow-xl backdrop-blur-md transition-all"
      >
        <div className="pl-3.5 pr-2 text-slate-400">
          <Search className="w-5 h-5 text-blue-400" />
        </div>

        <input
          id="hero-quick-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search 10,000+ gadgets, fashion, home essentials, or SKU..."
          className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none pr-2"
        />

        {/* Voice Search Button */}
        <VoiceSearchButton
          onTranscript={(transcript) => {
            setQuery(transcript);
            saveRecentSearch(transcript);
            setShowDropdown(false);
            router.push(`/search?q=${encodeURIComponent(transcript)}`);
          }}
          className="mr-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800"
        />

        <button
          id="hero-quick-search-submit"
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30 shrink-0 cursor-pointer active:scale-95"
        >
          <span>Search</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Instant Suggestions Dropdown with Typo, SKU, Recent, Trending */}
      <SearchDropdown
        query={query}
        isOpen={showDropdown}
        onClose={() => setShowDropdown(false)}
        onSelectQuery={(q) => {
          setQuery(q);
          saveRecentSearch(q);
        }}
      />

      {/* Trending Search Chips */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
          <TrendingUp className="w-3 h-3 text-amber-400" /> Trending:
        </span>
        {trendingTags.map((tag, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              if (tag.href) {
                router.push(tag.href);
              } else {
                saveRecentSearch(tag.q);
                router.push(`/search?q=${encodeURIComponent(tag.q)}`);
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-blue-600/30 border border-slate-700 hover:border-blue-400/40 text-slate-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer active:scale-95"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}
