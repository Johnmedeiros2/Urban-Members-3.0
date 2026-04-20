"use client";

type Tier = "starter" | "rising" | "urban" | "elite" | "legend";

interface TierConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  glow: string;
}

const tiers: Record<Tier, TierConfig> = {
  starter: { label: "Starter",  bg: "#F5F5F5",  text: "#A3A3A3", border: "#E5E5E5", glow: "none" },
  rising:  { label: "Rising",   bg: "#FFF3EF",  text: "#FF5C2E", border: "#FFD5C8", glow: "0 0 8px rgba(255,92,46,0.2)" },
  urban:   { label: "Urban",    bg: "#FF5C2E",  text: "#FFFFFF", border: "#FF5C2E", glow: "0 0 12px rgba(255,92,46,0.35)" },
  elite:   { label: "Elite",    bg: "#111111",  text: "#F59E0B", border: "#333333", glow: "0 0 12px rgba(245,158,11,0.3)" },
  legend:  { label: "Legend",   bg: "#0F172A",  text: "#A78BFA", border: "#2D1B69", glow: "0 0 16px rgba(167,139,250,0.4)" },
};

function getTier(score: number): Tier {
  if (score >= 900) return "legend";
  if (score >= 600) return "elite";
  if (score >= 300) return "urban";
  if (score >= 100) return "rising";
  return "starter";
}

export default function ScoreBadge({ score, compact = false }: { score: number; compact?: boolean }) {
  const tier = getTier(score);
  const t = tiers[tier];

  if (compact) {
    return (
      <span
        style={{
          background: t.bg,
          color: t.text,
          border: `1px solid ${t.border}`,
          boxShadow: t.glow,
          padding: "2px 8px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
        }}
      >
        ⬡ {score}
      </span>
    );
  }

  return (
    <div
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        boxShadow: t.glow,
        borderRadius: "12px",
        padding: "6px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1px",
      }}
    >
      <span style={{ fontSize: "16px", fontWeight: 800, color: t.text, lineHeight: 1 }}>
        {score}
      </span>
      <span style={{ fontSize: "9px", fontWeight: 700, color: t.text, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {t.label}
      </span>
    </div>
  );
}
