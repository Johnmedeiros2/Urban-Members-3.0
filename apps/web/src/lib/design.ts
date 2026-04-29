// Urban Members — Design tokens
// Use junto das classes utilitárias em globals.css.
// Inline styles continuam permitidos, mas referencie estes tokens.

export const colors = {
  ink: "#111111",
  inkSoft: "#1F1F1F",
  text: "#262626",
  textMuted: "#525252",
  textSubtle: "#A3A3A3",
  textGhost: "#D4D4D4",

  bg: "#FFFFFF",
  bgSoft: "#F7F7F8",
  bgMuted: "#F5F5F5",

  border: "#E5E5E5",
  borderSubtle: "rgba(0,0,0,0.06)",
  borderHover: "#D4D4D4",

  accent: "#FF5C2E",
  accentHover: "#E64A1E",
  accentSoft: "#FFF3EF",
  accentBorder: "#FFD4C4",

  success: "#16A34A",
  warning: "#EAB308",
  danger: "#DC2626",
  dangerSoft: "#FEF2F2",
} as const;

export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  pill: "999px",
} as const;

export const shadow = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.04)",
  base: "0 1px 3px rgba(0,0,0,0.06)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  lg: "0 8px 24px rgba(17,17,17,0.08)",
  hover: "0 6px 18px rgba(17,17,17,0.10)",
  accentGlow: "0 4px 16px rgba(255,92,46,0.25)",
} as const;

export const transition = {
  fast: "150ms cubic-bezier(0.2, 0, 0, 1)",
  base: "200ms cubic-bezier(0.2, 0, 0, 1)",
  slow: "320ms cubic-bezier(0.2, 0, 0, 1)",
} as const;

export const font = {
  family: "Inter, sans-serif",
  letterTight: "-0.02em",
  letterTighter: "-0.03em",
} as const;
