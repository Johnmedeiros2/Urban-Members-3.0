"use client";

import { useState, useEffect, useRef } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";

const INPUT: React.CSSProperties = {
  width: "100%", height: "52px",
  borderRadius: "14px", padding: "0 16px",
  fontSize: "15px", color: "#111111",
  outline: "none", background: "#FFFFFF",
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box", transition: "border-color 0.2s",
};

const COOLDOWN_SEGUNDOS = 60;

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function iniciarCooldown() {
    setCooldown(COOLDOWN_SEGUNDOS);
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  async function handleRecuperar() {
    if (!email || cooldown > 0) return;
    if (!supabaseConfigured) {
      setErro("Configure as credenciais do Supabase.");
      return;
    }
    setLoading(true);
    setErro("");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    });
    setLoading(false);
    if (error) {
      const isRateLimit =
        error.message?.toLowerCase().includes("rate") ||
        error.message?.toLowerCase().includes("security") ||
        error.status === 429;
      if (isRateLimit) {
        setErro("Aguarde 60 segundos antes de solicitar outro link.");
        iniciarCooldown();
      } else {
        setErro("Não foi possível enviar o e-mail. Verifique se o endereço está correto.");
      }
      return;
    }
    setEnviado(true);
    iniciarCooldown();
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", fontFamily: "Inter, sans-serif" }}>

      {/* Painel esquerdo */}
      <div style={{ flex: 1, background: "#111111", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px", position: "relative", overflow: "hidden" }} className="hidden md:flex">
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%, rgba(255,92,46,0.15) 0%, transparent 60%)" }} />
        <img src="/logo.svg" alt="Urban Members" width={48} height={48} style={{ position: "relative", filter: "invert(1)" }} />
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "13px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
            Recuperar acesso
          </p>
          <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: "20px" }}>
            Sua cidade<br />ainda está aqui.
          </h2>
          <p style={{ fontSize: "15px", color: "#A3A3A3", lineHeight: 1.7 }}>
            Enviaremos um link para o seu e-mail. Clique nele e crie uma nova senha em segundos.
          </p>
        </div>
        <p style={{ position: "relative", fontSize: "12px", color: "#525252" }}>urbanicsa.com</p>
      </div>

      {/* Painel direito */}
      <div style={{ width: "100%", maxWidth: "520px", padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "28px" }}>

        {enviado ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ width: "56px", height: "56px", background: "#F0FDF4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
              ✉️
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>E-mail enviado</h1>
              <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "8px", lineHeight: 1.7 }}>
                Enviamos um link para <strong style={{ color: "#111111" }}>{email}</strong>.
                <br />Verifique sua caixa de entrada e a pasta de spam.
              </p>
            </div>

            {cooldown > 0 && (
              <p style={{ fontSize: "13px", color: "#A3A3A3" }}>
                Não recebeu? Aguarde <strong style={{ color: "#111111" }}>{cooldown}s</strong> para reenviar.
              </p>
            )}

            {cooldown === 0 && (
              <button
                onClick={() => { setEnviado(false); setErro(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#FF5C2E", fontWeight: 600, textAlign: "left", padding: 0 }}
              >
                Reenviar link →
              </button>
            )}

            <a href="/login" style={{ fontSize: "14px", color: "#A3A3A3", textDecoration: "none" }}>
              ← Voltar para o login
            </a>
          </div>
        ) : (
          <>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Esqueceu a senha?</h1>
              <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "6px" }}>
                Digite seu e-mail e enviaremos um link para redefinir.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRecuperar()}
                  style={{ ...INPUT, border: `1.5px solid ${email ? "#111111" : "#E5E5E5"}` }}
                />
              </div>

              {erro && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "10px 14px" }}>
                  <p style={{ fontSize: "13px", color: "#DC2626" }}>{erro}</p>
                </div>
              )}

              <button
                onClick={handleRecuperar}
                disabled={!email || loading || cooldown > 0}
                className="um-btn-accent"
                style={{ width: "100%", height: "52px", fontSize: "15px", opacity: cooldown > 0 ? 0.6 : 1 }}
              >
                {loading ? "Enviando..." : cooldown > 0 ? `Aguarde ${cooldown}s` : "Enviar link →"}
              </button>
            </div>

            <a href="/login" style={{ fontSize: "14px", color: "#A3A3A3", textDecoration: "none", textAlign: "center" }}>
              ← Voltar para o login
            </a>
          </>
        )}
      </div>
    </div>
  );
}
