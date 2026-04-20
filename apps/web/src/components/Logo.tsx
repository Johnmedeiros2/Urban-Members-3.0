interface LogoProps {
  size?: number;
  variant?: "dark" | "light" | "accent";
  className?: string;
}

export default function Logo({ size = 56, variant = "dark", className = "" }: LogoProps) {
  const bg = variant === "accent" ? "#FF5C2E" : variant === "light" ? "#FFFFFF" : "#111111";
  const fg = variant === "dark" ? "#FFFFFF" : "#111111";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Urban Members"
      style={{ display: "block" }}
    >
      {/* Fundo circular preenchido */}
      <circle cx="28" cy="28" r="28" fill={bg} />

      {/* Ameias — topo do castelo */}
      <rect x="14" y="16" width="5" height="7" rx="1" fill={fg} />
      <rect x="21" y="16" width="5" height="7" rx="1" fill={fg} />
      <rect x="28" y="16" width="5" height="7" rx="1" fill={fg} />
      <rect x="35" y="16" width="5" height="7" rx="1" fill={fg} />

      {/* Corpo do castelo */}
      <rect x="14" y="21" width="26" height="16" rx="1" fill={fg} />

      {/* Porta central arredondada — entrada da cidade */}
      <rect x="23" y="27" width="8" height="10" rx="4" fill={bg} />

      {/* Círculo externo (anel de conexão) */}
      <circle cx="28" cy="28" r="25" stroke={fg} strokeWidth="1.5" strokeOpacity="0.25" />
    </svg>
  );
}
