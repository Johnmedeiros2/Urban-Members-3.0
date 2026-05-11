"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "urban_cookie_consent";

export type ConsentStatus = "granted" | "denied" | null;

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CONSENT_KEY);
  if (v === "granted" || v === "denied") return v;
  return null;
}

export default function CookieBanner() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (getConsentStatus() === null) setVisivel(true);
  }, []);

  function aceitar() {
    localStorage.setItem(CONSENT_KEY, "granted");
    setVisivel(false);
    window.dispatchEvent(new Event("urban_consent_granted"));
  }

  function recusar() {
    localStorage.setItem(CONSENT_KEY, "denied");
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#111111",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        flexWrap: "wrap",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, flex: 1, minWidth: "240px", margin: 0 }}>
        Usamos cookies e tecnologias similares para melhorar sua experiência e analisar o uso da plataforma.
        Veja nossa{" "}
        <a href="/privacidade" style={{ color: "#FF5C2E", textDecoration: "underline" }}>
          Política de Privacidade
        </a>{" "}
        (LGPD — Lei nº 13.709/2018).
      </p>
      <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
        <button
          onClick={recusar}
          style={{
            height: "40px",
            padding: "0 18px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "rgba(255,255,255,0.6)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Recusar
        </button>
        <button
          onClick={aceitar}
          style={{
            height: "40px",
            padding: "0 20px",
            borderRadius: "10px",
            border: "none",
            background: "#FF5C2E",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
