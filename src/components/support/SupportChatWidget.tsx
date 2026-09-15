"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";

interface MessageAction {
  label: string;
  url: string;
  type: "link" | "external" | "button";
}

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  actions?: MessageAction[];
  suggestions?: string[];
}

export function SupportChatWidget() {
  const pathname = usePathname();
  const isCartOpen = useCartStore((s) => s.isOpen);
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-detect if user is on an order details page
  const orderIdMatch = pathname?.match(/\/orders\/([^/]+)/);
  const detectedOrderId = orderIdMatch ? orderIdMatch[1] : null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text:
        "Namaste! 🙏 Welcome to **HubStore Priority Support**.\n\n" +
        "I'm your 24/7 Order & Wholesale Sourcing Assistant. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestions: [
        "Where is my order?",
        "Wholesale delivery SLA",
        "Return & Refund Policy",
        "WhatsApp Live Support",
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          orderNumber: detectedOrderId || "",
        }),
      });

      if (!res.ok) throw new Error("Support network error");
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || "Thank you for reaching out. How else may I assist you?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actions: data.actions,
        suggestions: data.suggestions,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text:
            "I couldn't reach the support server. Please chat with our team directly on WhatsApp (+91 1800-202-6682).",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actions: [
            {
              label: "Chat on WhatsApp",
              url: "https://wa.me/9118002026682",
              type: "external",
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text:
          "Chat session refreshed. Ask me about your order status, wholesale delivery SLA, or return policies!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestions: [
          "Where is my order?",
          "Wholesale delivery SLA",
          "Return & Refund Policy",
          "WhatsApp Live Support",
        ],
      },
    ]);
  };

  // Helper to format text with bold and newlines
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // replace **bold**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className={line === "" ? "h-2" : "min-h-[1.25rem] leading-relaxed"}>
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-semibold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  if (isCartOpen) return null;

  return (
    <>
      {/* Floating Toggle Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-lg border border-slate-200/80 text-xs font-medium text-slate-700 cursor-pointer hover:shadow-xl transition-all group animate-bounce-slow"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Need Help? Chat with Us</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          id="nova-support-chat-toggle"
          aria-label="Toggle HubStore Support Assistant"
          className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
            isOpen
              ? "bg-slate-900 text-white rotate-90"
              : "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white hover:shadow-blue-500/30 hover:scale-105"
          }`}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <>
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {/* Online Green Pill Indicator */}
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </>
          )}
        </button>
      </div>

      {/* Support Chat Modal Drawer */}
      {isOpen && (
        <div
          id="nova-support-chat-drawer"
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-inner border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">HubStore Assistant</h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Online • Sourcing & Order AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                title="Restart conversation"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Context Banner if order detected */}
          {detectedOrderId && (
            <div className="bg-indigo-50 border-b border-indigo-100 px-3.5 py-2 flex items-center justify-between text-xs text-indigo-900 shrink-0">
              <div className="flex items-center gap-1.5 font-medium truncate">
                <span>📦</span>
                <span>Active Order page detected</span>
              </div>
              <button
                onClick={() => handleSendMessage("Where is my order?")}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shrink-0"
              >
                Track Now →
              </button>
            </div>
          )}

          {/* Quick FAQ Starter Pills (Header) */}
          <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
            <button
              onClick={() => handleSendMessage("Where is my order?")}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium rounded-full border border-slate-200 transition-colors shrink-0 shadow-2xs"
            >
              📦 Track Order
            </button>
            <button
              onClick={() => handleSendMessage("Wholesale delivery SLA")}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium rounded-full border border-slate-200 transition-colors shrink-0 shadow-2xs"
            >
              ⏱️ Delivery SLA (5–8d)
            </button>
            <button
              onClick={() => handleSendMessage("Download GST Invoice")}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium rounded-full border border-slate-200 transition-colors shrink-0 shadow-2xs"
            >
              🧾 GST Invoice
            </button>
            <button
              onClick={() => handleSendMessage("Return & Refund Policy")}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium rounded-full border border-slate-200 transition-colors shrink-0 shadow-2xs"
            >
              🔄 7-Day Returns
            </button>
            <a
              href="https://wa.me/9118002026682?text=Hello%20HubStore%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium rounded-full border border-emerald-200 transition-colors shrink-0 shadow-2xs"
            >
              💬 WhatsApp
            </a>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                  }`}
                >
                  {renderFormattedText(msg.text)}

                  {/* Action Buttons inside Bot Message */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, aIdx) => {
                        if (act.type === "external") {
                          return (
                            <a
                              key={aIdx}
                              href={act.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                            >
                              <span>💬</span> {act.label}
                            </a>
                          );
                        }
                        return (
                          <Link
                            key={aIdx}
                            href={act.url}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                          >
                            <span>↗</span> {act.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>

                {/* Suggestions Pills if available */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-[11px] font-medium bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-2.5 py-1 rounded-full border border-slate-200 transition-colors shadow-2xs text-left"
                      >
                        {sug} →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl rounded-tl-xs w-fit shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                <span className="text-[11px] text-slate-400 ml-1 font-medium">Checking live records...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Action Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about orders, wholesale timeline, refunds..."
                id="nova-support-chat-input"
                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                id="nova-support-chat-send"
                className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
              >
                <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>HubStore AI Assistant • 24/7 Verified</span>
              <a
                href="https://wa.me/9118002026682"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                WhatsApp: 1800-202-6682
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
