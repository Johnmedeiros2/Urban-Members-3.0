"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  texto: string;
  autor?: string;
  url?: string;
}

export default function BotaoCompartilhar({ texto, autor, url }: Props) {
  const [aberto, setAberto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const linkFinal = url ?? (typeof window !== "undefined" ? `${window.location.origin}/feed` : "https://urbanicsa.com/feed");
  const mensagem = `${autor ? `"${texto}" — por ${autor} no Urban Members` : texto}\n\n${linkFinal}`;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function compartilhar() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ text: mensagem, url: linkFinal });
        return;
      } catch {
        // cancelou ou falhou, cai pro dropdown
      }
    }
    setAberto(!aberto);
  }

  function whatsapp() {
    const encoded = encodeURIComponent(mensagem);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
    setAberto(false);
  }

  function twitter() {
    const encoded = encodeURIComponent(mensagem);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");
    setAberto(false);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado(true);
      setTimeout(() => { setCopiado(false); setAberto(false); }, 1500);
    } catch {
      alert("Não consegui copiar. Tente novamente.");
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={compartilhar}
        style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "7px 12px", borderRadius: "999px", border: "none", cursor: "pointer",
          fontSize: "13px", fontWeight: 600, background: "transparent",
          color: "#A3A3A3", fontFamily: "Inter, sans-serif",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#111111")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#A3A3A3")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Compartilhar
      </button>

      {aberto && (
        <div style={{
          position: "absolute", top: "36px", right: 0,
          background: "#FFFFFF", borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden", zIndex: 50, minWidth: "180px",
        }}>
          <button onClick={whatsapp} style={opcaoStyle}>
            <span style={{ fontSize: "16px" }}>🟢</span> WhatsApp
          </button>
          <button onClick={twitter} style={opcaoStyle}>
            <span style={{ fontSize: "16px" }}>𝕏</span> X (Twitter)
          </button>
          <button onClick={copiar} style={opcaoStyle}>
            <span style={{ fontSize: "16px" }}>{copiado ? "✓" : "🔗"}</span> {copiado ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      )}
    </div>
  );
}

const opcaoStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "10px",
  width: "100%", padding: "10px 14px",
  background: "transparent", border: "none", cursor: "pointer",
  fontSize: "13px", fontWeight: 500, color: "#111111",
  fontFamily: "Inter, sans-serif", textAlign: "left",
};
