"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase";

const INPUT: React.CSSProperties = {
  width: "100%", height: "52px",
  borderRadius: "14px", padding: "0 16px",
  fontSize: "15px", color: "#111111",
  outline: "none", background: "#FFFFFF",
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box", transition: "border-color 0.2s",
};

export default function NovaSenha() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // sessão de recovery detectada — página já está pronta
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleAtualizarSenha() {
    if (!senha || senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    setErro("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setLoading(false);
    if (error) {
      setErro("Não foi possível atualizar a senha. O link pode ter expirado — solicite um novo.");
      return;
    }
    setSucesso(true);
    setTimeout(() => router.push("/feed"), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", fontFamily: "Inter, sans-serif" }}>

      {/* Painel esquerdo */}
      <div style={{ flex: 1, background: "#111111", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px", position: "relative", overflow: "hidden" }} className="hidden md:flex">
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%, rgba(255,92,46,0.15) 0%, transparent 60%)" }} />
        <img src="/logo.svg" alt="Urban Members" width={48} height={48} style={{ position: "relative", filter: "invert(1)" }} />
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "13px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
            Nova senha
          </p>
          <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: "20px" }}>
            Quase lá.<br />Escolha uma senha nova.
          </h2>
          <p style={{ fontSize: "15px", color: "#A3A3A3", lineHeight: 1.7 }}>
            Use pelo menos 6 caracteres. Depois você entra direto na sua cidade.
          </p>
        </div>
        <p style={{ position: "relative", fontSize: "12px", color: "#525252" }}>urbanicsa.com</p>
      </div>

      {/* Painel direito */}
      <div style={{ width: "100%", maxWidth: "520px", padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "28px" }}>

        {sucesso ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ width: "56px", height: "56px", background: "#F0FDF4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
              ✅
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Senha atualizada!</h1>
              <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "8px", lineHeight: 1.6 }}>
                Entrando na cidade...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Nova senha</h1>
              <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "6px" }}>
                Escolha uma senha segura para continuar.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
                  Nova Senha
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    style={{ ...INPUT, border: `1.5px solid ${senha ? "#111111" : "#E5E5E5"}`, paddingRight: "48px" }}
                  />
                  <button
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#A3A3A3" }}
                  >
                    {mostrarSenha ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAtualizarSenha()}
                  style={{
                    ...INPUT,
                    border: `1.5px solid ${confirmar
                      ? confirmar === senha ? "#16A34A" : "#DC2626"
                      : "#E5E5E5"
                    }`
                  }}
                />
              </div>

              {erro && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "10px 14px" }}>
                  <p style={{ fontSize: "13px", color: "#DC2626" }}>{erro}</p>
                </div>
              )}

              <button
                onClick={handleAtualizarSenha}
                disabled={!senha || !confirmar || loading}
                className="um-btn-accent"
                style={{ width: "100%", height: "52px", fontSize: "15px" }}
              >
                {loading ? "Salvando..." : "Salvar nova senha →"}
              </button>
            </div>

            <a href="/recuperar-senha" style={{ fontSize: "14px", color: "#A3A3A3", textDecoration: "none", textAlign: "center" }}>
              ← Pedir novo link
            </a>
          </>
        )}
      </div>
    </div>
  );
}
