"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { vincularIndicador } from "@/lib/queries";

const INPUT: React.CSSProperties = {
  width: "100%", height: "52px",
  borderRadius: "14px", padding: "0 16px",
  fontSize: "15px", color: "#111111",
  outline: "none", background: "#FFFFFF",
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box", transition: "border-color 0.2s",
};

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin() {
    if (!email || !senha) return;
    if (!supabaseConfigured) {
      setErro("Configure as credenciais do Supabase no arquivo .env.local para ativar o login.");
      return;
    }
    setLoading(true);
    setErro("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro("E-mail ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }
    // Se o usuário veio por link de indicação, vincula agora
    const ref = typeof window !== "undefined" ? localStorage.getItem("urban_ref") : null;
    if (ref) {
      try {
        await vincularIndicador(ref);
        localStorage.removeItem("urban_ref");
      } catch {}
    }

    router.push("/feed");
    router.refresh();
  }

  async function handleGoogle() {
    if (!supabaseConfigured) {
      setErro("Configure as credenciais do Supabase no .env.local para ativar o login com Google.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/feed` },
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", fontFamily: "Inter, sans-serif" }}>

      {/* Painel esquerdo */}
      <div style={{ flex: 1, background: "#111111", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px", position: "relative", overflow: "hidden" }} className="hidden md:flex">
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%, rgba(255,92,46,0.15) 0%, transparent 60%)" }} />
        <img src="/logo.svg" alt="Urban Members" width={48} height={48} style={{ position: "relative", filter: "invert(1)" }} />
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "13px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
            Bem-vindo de volta
          </p>
          <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: "20px" }}>
            Sua cidade<br />está esperando.
          </h2>
          <p style={{ fontSize: "15px", color: "#A3A3A3", lineHeight: 1.7 }}>
            Entre e continue de onde parou. Conexões, aprendizado e oportunidades — tudo no seu endereço digital.
          </p>
        </div>
        <p style={{ position: "relative", fontSize: "12px", color: "#525252" }}>urbanicsa.com</p>
      </div>

      {/* Painel direito */}
      <div style={{ width: "100%", maxWidth: "520px", padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "28px" }}>

        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Entrar na cidade</h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "6px" }}>
            Novo por aqui?{" "}
            <a href="/cadastro" style={{ color: "#FF5C2E", fontWeight: 600, textDecoration: "none" }}>Crie seu endereço</a>
          </p>
        </div>

        {/* Google */}
        <button onClick={handleGoogle} style={{
          width: "100%", height: "52px",
          background: "#FFFFFF", border: "1.5px solid #E5E5E5",
          borderRadius: "14px", display: "flex", alignItems: "center",
          justifyContent: "center", gap: "12px",
          fontSize: "14px", fontWeight: 600, color: "#111111",
          cursor: "pointer", fontFamily: "Inter, sans-serif",
          transition: "border-color 0.2s",
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>

        {/* Divisor */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
          <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 500 }}>ou entre com e-mail</span>
          <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
        </div>

        {/* Formulário */}
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
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{ ...INPUT, border: `1.5px solid ${email ? "#111111" : "#E5E5E5"}` }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Senha
              </label>
              <a href="/recuperar-senha" style={{ fontSize: "12px", color: "#A3A3A3", textDecoration: "none" }}>
                Esqueceu a senha?
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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

          {erro && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "10px 14px" }}>
              <p style={{ fontSize: "13px", color: "#DC2626" }}>{erro}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={!email || !senha || loading}
            style={{
              width: "100%", height: "52px",
              background: email && senha && !loading ? "#111111" : "#E5E5E5",
              color: email && senha && !loading ? "#FFFFFF" : "#A3A3A3",
              border: "none", borderRadius: "999px",
              fontSize: "15px", fontWeight: 700,
              cursor: email && senha && !loading ? "pointer" : "not-allowed",
              transition: "all 0.2s", fontFamily: "Inter, sans-serif",
            }}
          >
            {loading ? "Entrando..." : "Entrar →"}
          </button>
        </div>

        <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", lineHeight: 1.6 }}>
          Ao entrar você confirma que leu e aceita os{" "}
          <a href="#" style={{ color: "#525252", textDecoration: "underline" }}>Termos de Uso</a>{" "}
          e a{" "}
          <a href="#" style={{ color: "#525252", textDecoration: "underline" }}>Política de Privacidade</a>.
        </p>
      </div>
    </div>
  );
}
