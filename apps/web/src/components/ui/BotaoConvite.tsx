"use client";

import { useState } from "react";

interface BotaoConviteProps {
  variant?: "dark" | "light" | "ghost";
}

export default function BotaoConvite({ variant = "light" }: BotaoConviteProps) {
  const [copiado, setCopiado] = useState(false);

  const estilos = {
    dark: {
      background: "rgba(255,255,255,0.1)",
      color: "#FFFFFF",
      border: "1.5px solid rgba(255,255,255,0.2)",
      hoverBg: "rgba(255,255,255,0.18)",
    },
    light: {
      background: "#F5F5F5",
      color: "#111111",
      border: "1.5px solid #E5E5E5",
      hoverBg: "#EBEBEB",
    },
    ghost: {
      background: "transparent",
      color: "#525252",
      border: "1.5px solid #E5E5E5",
      hoverBg: "#F5F5F5",
    },
  }[variant];

  function copiar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText("https://urbanicsa.com/convite");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
      <a href="/convite" style={{ textDecoration: "none" }}>
        <button style={{
          height: "36px", padding: "0 14px",
          background: estilos.background,
          color: estilos.color,
          border: estilos.border,
          borderRadius: "999px",
          fontSize: "12px", fontWeight: 700,
          cursor: "pointer", fontFamily: "Inter, sans-serif",
          display: "flex", alignItems: "center", gap: "6px",
          transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = estilos.hoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = estilos.background)}
        >
          <span style={{ fontSize: "14px" }}>＋</span>
          Convidar
        </button>
      </a>
      <button
        onClick={copiar}
        title="Copiar link de convite"
        style={{
          width: "36px", height: "36px",
          background: copiado ? "#10B981" : estilos.background,
          color: copiado ? "#FFFFFF" : estilos.color,
          border: copiado ? "1.5px solid #10B981" : estilos.border,
          borderRadius: "999px", fontSize: "14px",
          cursor: "pointer", fontFamily: "Inter, sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          flexShrink: 0,
        }}
      >
        {copiado ? "✓" : "🔗"}
      </button>
    </div>
  );
}
