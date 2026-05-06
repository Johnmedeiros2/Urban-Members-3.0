"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { vincularIndicador } from "@/lib/queries";
import ContadorMoradores from "./ContadorMoradores";

const INPUT: React.CSSProperties = {
  width: "100%", height: "52px",
  borderRadius: "14px", padding: "0 16px",
  fontSize: "15px", color: "#111111",
  outline: "none", background: "#FFFFFF",
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box", transition: "border-color 0.2s",
};

export default function LandingCTA() {
  const router = useRouter();
  const [modo, setModo] = useState<"landing" | "login">("landing");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/feed` },
    });
  }

  async function handleLogin() {
    if (!email || !senha) return;
    setLoading(true);
    setErro("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro("E-mail ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }
    const ref = typeof window !== "undefined" ? localStorage.getItem("urban_ref") : null;
    if (ref) {
      try { await vincularIndicador(ref); localStorage.removeItem("urban_ref"); } catch {}
    }
    router.push("/feed");
    router.refresh();
  }

  /* ── MODO LOGIN ── */
  if (modo === "login") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        <div>
          <button
            onClick={() => { setModo("landing"); setErro(""); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#A3A3A3", padding: 0, display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}
          >
            ← Voltar
          </button>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FF5C2E", marginBottom: "8px" }}>Bem-vindo de volta</p>
          <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#111111", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            Entrar na cidade.
          </h2>
        </div>

        {/* Google */}
        <button onClick={handleGoogle} style={{ height: "52px", background: "#FFFFFF", border: "1.5px solid #E5E5E5", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "14px", fontWeight: 600, color: "#111111", cursor: "pointer", fontFamily: "Inter, sans-serif" }} className="lp-google-btn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
          <span style={{ fontSize: "12px", color: "#A3A3A3" }}>ou entre com e-mail</span>
          <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ ...INPUT, border: `1.5px solid ${email ? "#111111" : "#E5E5E5"}` }}
          />
          <div style={{ position: "relative" }}>
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ ...INPUT, border: `1.5px solid ${senha ? "#111111" : "#E5E5E5"}`, paddingRight: "52px" }}
            />
            <button
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#A3A3A3" }}
            >
              {mostrarSenha ? "Ocultar" : "Ver"}
            </button>
          </div>

          {erro && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "10px 14px" }}>
              <p style={{ fontSize: "13px", color: "#DC2626" }}>{erro}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={!email || !senha || loading}
            className="um-btn-accent lp-cta"
            style={{ width: "100%", height: "52px", fontSize: "15px", borderRadius: "14px", border: "none", cursor: "pointer" }}
          >
            {loading ? "Entrando..." : "Entrar na cidade →"}
          </button>
        </div>

        <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center" }}>
          <a href="/recuperar-senha" style={{ color: "#A3A3A3", textDecoration: "underline" }}>Esqueceu a senha?</a>
          {" · "}
          Novo por aqui?{" "}
          <a href="/cadastro" style={{ color: "#FF5C2E", fontWeight: 600, textDecoration: "none" }}>Crie seu endereço</a>
        </p>
      </div>
    );
  }

  /* ── MODO LANDING ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      <div>
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FF5C2E", marginBottom: "10px" }}>Bem-vindo</p>
        <h1 style={{ fontSize: "44px", fontWeight: 800, color: "#111111", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "14px" }}>
          Reserve seu<br />endereço.
        </h1>
        <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.65 }}>
          A primeira cidade digital brasileira.<br />Junte-se aos primeiros moradores.
        </p>
      </div>

      <div className="lp-counter" style={{ display: "inline-block" }}>
        <ContadorMoradores />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button onClick={handleGoogle} className="lp-google-btn" style={{ height: "52px", background: "#FFFFFF", border: "1.5px solid #E5E5E5", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "14px", fontWeight: 600, color: "#111111", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
          <span style={{ fontSize: "12px", color: "#A3A3A3" }}>ou</span>
          <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
        </div>

        <a href="/cadastro" className="um-btn-accent lp-cta" style={{ height: "52px", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", borderRadius: "14px" }}>
          Criar meu endereço →
        </a>
      </div>

      <button onClick={() => setModo("login")} className="lp-login-btn" style={{ height: "52px", borderRadius: "14px", border: "1.5px solid #111111", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", fontWeight: 700, color: "#111111", cursor: "pointer", background: "none", fontFamily: "Inter, sans-serif" }}>
        Já tenho conta — Entrar na cidade
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      <p style={{ fontSize: "12px", color: "#C0C0C0", textAlign: "center" }}>Cadastro gratuito · 30 segundos · sem cartão</p>
    </div>
  );
}
