import Svg, { Circle, Rect } from "react-native-svg";

type Variant = "dark" | "light" | "accent";

interface LogoProps {
  size?: number;
  variant?: Variant;
}

// Mesma logo do site (apps/web/src/components/Logo.tsx): castelo/portão da cidade.
export default function Logo({ size = 56, variant = "dark" }: LogoProps) {
  const bg = variant === "accent" ? "#FF5C2E" : variant === "light" ? "#FFFFFF" : "#111111";
  const fg = variant === "dark" ? "#FFFFFF" : "#111111";

  return (
    <Svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Fundo circular preenchido */}
      <Circle cx="28" cy="28" r="28" fill={bg} />

      {/* Ameias — topo do castelo */}
      <Rect x="14" y="16" width="5" height="7" rx="1" fill={fg} />
      <Rect x="21" y="16" width="5" height="7" rx="1" fill={fg} />
      <Rect x="28" y="16" width="5" height="7" rx="1" fill={fg} />
      <Rect x="35" y="16" width="5" height="7" rx="1" fill={fg} />

      {/* Corpo do castelo */}
      <Rect x="14" y="21" width="26" height="16" rx="1" fill={fg} />

      {/* Porta central arredondada — entrada da cidade */}
      <Rect x="23" y="27" width="8" height="10" rx="4" fill={bg} />

      {/* Círculo externo (anel de conexão) */}
      <Circle cx="28" cy="28" r="25" stroke={fg} strokeWidth="1.5" strokeOpacity="0.25" />
    </Svg>
  );
}
