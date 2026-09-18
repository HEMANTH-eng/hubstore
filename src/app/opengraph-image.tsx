import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "HypperStore — India's Next-Gen Premium E-Commerce Marketplace";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#090d16",
          backgroundImage: "radial-gradient(circle at 50% 20%, #1e1b4b 0%, #090d16 70%)",
          padding: "60px 80px",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Top Bar / Domain Tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: "900",
                color: "#ffffff",
                boxShadow: "0 0 20px rgba(37,99,235,0.4)",
              }}
            >
              HS
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: "900",
                letterSpacing: "-0.5px",
                color: "#ffffff",
              }}
            >
              HypperStore
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 18px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "14px",
              fontWeight: "700",
              color: "#38bdf8",
              letterSpacing: "0.5px",
            }}
          >
            hypperstore.tech
          </div>
        </div>

        {/* Center Main Hero Block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "900px",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "6px 18px",
              borderRadius: "999px",
              background: "linear-gradient(90deg, rgba(37,99,235,0.2), rgba(6,182,212,0.2))",
              border: "1px solid rgba(56,189,248,0.3)",
              fontSize: "13px",
              fontWeight: "800",
              color: "#67e8f9",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: "18px",
            }}
          >
            India&apos;s Next-Gen Marketplace
          </div>

          <h1
            style={{
              fontSize: "58px",
              fontWeight: "900",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              margin: "0 0 16px 0",
              background: "linear-gradient(180deg, #ffffff 40%, #cbd5e1 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Premium Shopping, Elevated.
          </h1>

          <p
            style={{
              fontSize: "22px",
              color: "#94a3b8",
              lineHeight: 1.4,
              margin: 0,
              maxWidth: "780px",
            }}
          >
            Curated electronics, noise-cancelling audio, designer fashion, kitchenware &amp; fitness tech with 100% genuine guarantee.
          </p>
        </div>

        {/* Bottom Feature Pill Grid */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 22px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "15px",
              fontWeight: "700",
              color: "#f1f5f9",
            }}
          >
            <span>🚚 Free Express Shipping Over ₹999</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 22px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "15px",
              fontWeight: "700",
              color: "#f1f5f9",
            }}
          >
            <span>🛡️ 100% Genuine Verified Brands</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 22px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "15px",
              fontWeight: "700",
              color: "#f1f5f9",
            }}
          >
            <span>⚡ Instant UPI &amp; 7-Day Easy Returns</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
