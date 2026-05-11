"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

type Fase = "loading" | "inativo" | "enrolling" | "verificando" | "ativo";

const INPUT: React.CSSProperties = {
  width: "100%",
  height: "52px",
  borderRadius: "12px",
  padding: "0 16px",
  fontSize: "20px",
  fontWeight: 700,
  letterSpacing: "0.3em",
  textAlign: "center",
  border: "1.5px solid #E5E5E5",
  outline: "none",
  fontFamily: "Inter, monospace",
  color: "#111111",
  background: "#FFFFFF",
  boxSizing: "border-box",
};

export default function MFASetup() {
  const [fase, setFase] = useState<Fase>("loading");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    verificarEstado();
  }, []);

  async function verificarEstado() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error || !data) { setFase("inativo"); return; }

    const fatorAtivo = data.totp.find((f) => f.status === "verified");
    const fatorPendente = data.totp.find((f) => f.status !== "verified");

    if (fatorAtivo) {
      setFactorId(fatorAtivo.id);
      setFase("ativo");
    } else if (fatorPendente) {
      // Limpa enrollment pendente e começa do zero
      await supabase.auth.mfa.unenroll({ factorId: fatorPendente.id });
      setFase("inativo");
    } else {
      setFase("inativo");
    }
  }

  async function iniciarEnrollment() {
    setLoading(true);
    setErro("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Urban Members Authenticator",
    });
    if (error || !data) {
      setErro("Erro ao iniciar configuração. Tente novamente.");
      setLoading(false);
      return;
    }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setFase("enrolling");
    setLoading(false);
  }

  async function verificarCodigo() {
    if (codigo.replace(/\s/g, "").length !== 6) {
      setErro("Digite os 6 dígitos do código.");
      return;
    }
    setLoading(true);
    setErro("");
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: codigo.replace(/\s/g, ""),
    });
    if (error) {
      setErro("Código inválido. Abra o app e tente novamente.");
      setCodigo("");
      setLoading(false);
      return;
    }
    setFase("ativo");
    setLoading(false);
  }

  async function desativarMFA() {
    if (!confirm("Desativar a autenticação de dois fatores? Sua conta ficará menos protegida.")) return;
    setLoading(true);
    setErro("");
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) {
      setErro("Erro ao desativar. Tente novamente.");
      setLoading(false);
      return;
    }
    setFactorId("");
    setFase("inativo");
    setLoading(false);
  }

  function copiarSecret() {
    navigator.clipboard.writeText(secret);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (fase === "loading") {
    return (
      <div style={{ padding: "20px", color: "#A3A3A3", fontSize: "14px" }}>
        Verificando status do 2FA...
      </div>
    );
  }

  if (fase === "ativo") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: "12px" }}>
          <span style={{ fontSize: "20px" }}>🔐</span>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#15803D" }}>2FA Ativo</p>
            <p style={{ fontSize: "12px", color: "#16A34A" }}>Sua conta está protegida com autenticação de dois fatores.</p>
          </div>
        </div>

        {erro && (
          <p style={{ fontSize: "13px", color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", padding: "10px 14px", borderRadius: "10px" }}>
            {erro}
          </p>
        )}

        <button
          onClick={desativarMFA}
          disabled={loading}
          style={{ height: "44px", borderRadius: "12px", border: "1.5px solid #FECACA", background: "#FFF5F5", color: "#DC2626", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
        >
          {loading ? "Aguarde..." : "Desativar 2FA"}
        </button>
      </div>
    );
  }

  if (fase === "enrolling") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6, marginBottom: "16px" }}>
            <strong style={{ color: "#111111" }}>Passo 1:</strong> Abra o{" "}
            <strong>Google Authenticator</strong>, <strong>Authy</strong> ou qualquer app TOTP e escaneie o QR code:
          </p>

          {qrCode && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <div style={{ padding: "12px", background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "12px", display: "inline-block" }}>
                {/* Supabase retorna QR code como data URI */}
                <img src={qrCode} alt="QR Code para Google Authenticator" width={180} height={180} style={{ display: "block" }} />
              </div>
            </div>
          )}

          <div style={{ background: "#F5F5F5", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#A3A3A3", marginBottom: "4px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Código manual</p>
              <code style={{ fontSize: "13px", color: "#111111", fontFamily: "monospace", letterSpacing: "0.1em", wordBreak: "break-all" }}>
                {secret}
              </code>
            </div>
            <button
              onClick={copiarSecret}
              style={{ flexShrink: 0, height: "32px", padding: "0 12px", borderRadius: "8px", border: "1px solid #E5E5E5", background: "#FFFFFF", fontSize: "12px", fontWeight: 600, color: copiado ? "#16A34A" : "#525252", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
            >
              {copiado ? "Copiado ✓" : "Copiar"}
            </button>
          </div>
        </div>

        <div>
          <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6, marginBottom: "12px" }}>
            <strong style={{ color: "#111111" }}>Passo 2:</strong> Digite o código de 6 dígitos gerado pelo app para confirmar:
          </p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={codigo}
            onChange={(e) => { setCodigo(e.target.value.replace(/\D/g, "")); setErro(""); }}
            onKeyDown={(e) => e.key === "Enter" && verificarCodigo()}
            style={{ ...INPUT, borderColor: erro ? "#FECACA" : codigo.length === 6 ? "#111111" : "#E5E5E5" }}
          />
        </div>

        {erro && (
          <p style={{ fontSize: "13px", color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", padding: "10px 14px", borderRadius: "10px" }}>
            {erro}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => { setFase("inativo"); setQrCode(""); setSecret(""); setCodigo(""); }}
            style={{ flex: 1, height: "48px", borderRadius: "12px", border: "1.5px solid #E5E5E5", background: "#FFFFFF", color: "#525252", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
          >
            Cancelar
          </button>
          <button
            onClick={verificarCodigo}
            disabled={codigo.length !== 6 || loading}
            style={{ flex: 2, height: "48px", borderRadius: "12px", border: "none", background: codigo.length === 6 ? "#FF5C2E" : "#F5F5F5", color: codigo.length === 6 ? "#FFFFFF" : "#A3A3A3", fontSize: "14px", fontWeight: 700, cursor: codigo.length === 6 ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif", transition: "background 0.15s" }}
          >
            {loading ? "Verificando..." : "Ativar 2FA →"}
          </button>
        </div>
      </div>
    );
  }

  // fase === "inativo"
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: "12px" }}>
        <span style={{ fontSize: "20px" }}>🔓</span>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>2FA Inativo</p>
          <p style={{ fontSize: "12px", color: "#A3A3A3" }}>Ative para proteger sua conta com um segundo fator além da senha.</p>
        </div>
      </div>

      {erro && (
        <p style={{ fontSize: "13px", color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", padding: "10px 14px", borderRadius: "10px" }}>
          {erro}
        </p>
      )}

      <button
        onClick={iniciarEnrollment}
        disabled={loading}
        style={{ height: "48px", borderRadius: "12px", border: "1.5px solid #FF5C2E", background: "#FFF3EF", color: "#FF5C2E", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "background 0.15s" }}
      >
        {loading ? "Aguarde..." : "🔐 Ativar autenticação de dois fatores"}
      </button>
    </div>
  );
}
