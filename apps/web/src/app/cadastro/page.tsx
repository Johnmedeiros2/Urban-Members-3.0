"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { track, EVENTS } from "@/lib/analytics";

const INPUT: React.CSSProperties = {
  width: "100%", height: "52px",
  borderRadius: "14px", padding: "0 16px",
  fontSize: "15px", color: "#111111",
  outline: "none", background: "#FFFFFF",
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box", transition: "border-color 0.2s",
};

const LABEL: React.CSSProperties = {
  fontSize: "11px", fontWeight: 700, color: "#525252",
  textTransform: "uppercase", letterSpacing: "0.06em",
  display: "block", marginBottom: "6px",
};

// Detecta typos comuns em domínios populares e sugere correção
function sugerirEmail(email: string): string | null {
  const partes = email.split("@");
  if (partes.length !== 2 || !partes[1]) return null;
  const dominio = partes[1].toLowerCase().trim();
  const corretos = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com"];
  if (corretos.includes(dominio)) return null;

  // Distância de edição simples — sugere se está a 1-2 caracteres de um domínio popular
  for (const c of corretos) {
    let dist = Math.abs(c.length - dominio.length);
    const min = Math.min(c.length, dominio.length);
    for (let i = 0; i < min; i++) if (c[i] !== dominio[i]) dist++;
    if (dist > 0 && dist <= 2) return `${partes[0]}@${c}`;
  }
  return null;
}

function forca(senha: string): { nivel: number; texto: string; cor: string } {
  if (senha.length === 0) return { nivel: 0, texto: "", cor: "" };
  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (/[A-Z]/.test(senha)) pontos++;
  if (/[0-9]/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;
  if (pontos <= 1) return { nivel: 1, texto: "Fraca",  cor: "#EF4444" };
  if (pontos === 2) return { nivel: 2, texto: "Média",  cor: "#F59E0B" };
  if (pontos === 3) return { nivel: 3, texto: "Boa",    cor: "#10B981" };
  return                  { nivel: 4, texto: "Forte",  cor: "#10B981" };
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#A3A3A3" }}>Carregando...</div>}>
      <Cadastro />
    </Suspense>
  );
}

function Cadastro() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  // Guarda o ref no localStorage para usar após a confirmação do e-mail
  useEffect(() => {
    if (ref && typeof window !== "undefined") {
      localStorage.setItem("urban_ref", ref);
    }
  }, [ref]);

  // Analytics: começou o cadastro
  useEffect(() => {
    track(EVENTS.SIGNUP_STARTED, { has_referral: !!ref });
  }, [ref]);

  const [jaMorador, setJaMorador] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await createClient().auth.getUser();
      if (user) setJaMorador(true);
    })();
  }, []);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  if (jaMorador && ref) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: "24px" }}>
        <div style={{ maxWidth: "420px", width: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#FFF3EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
            🏙️
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Você já é morador</h1>
            <p style={{ fontSize: "14px", color: "#6B6B6B", marginTop: "8px", lineHeight: 1.6 }}>
              Este é um link de convite. Para testar o cadastro como novo usuário, abra em outro navegador ou use navegação anônima.
            </p>
          </div>
          <button onClick={() => router.push("/feed")} className="um-btn-primary" style={{ height: "44px", padding: "0 24px", fontSize: "14px" }}>
            Voltar para o feed
          </button>
          <a href="/convite" style={{ fontSize: "13px", color: "#A3A3A3", textDecoration: "none" }}>
            Compartilhar meu próprio convite →
          </a>
        </div>
      </div>
    );
  }

  const forcaSenha = forca(senha);
  const podeCadastrar = nome.trim() && email && senha.length >= 6;

  async function handleCadastro() {
    if (!podeCadastrar) return;
    if (!supabaseConfigured) {
      setErro("Configure as credenciais do Supabase no .env.local para ativar o cadastro.");
      return;
    }
    setLoading(true);
    setErro("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password: senha,
      options: {
        data: {
          nome_completo: nome,
          indicador_id: ref ?? null,
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) {
      setErro(error.message.includes("already registered")
        ? "Este e-mail já está cadastrado. Tente fazer login."
        : "Erro ao criar conta. Verifique os dados e tente novamente."
      );
      setLoading(false);
      return;
    }
    track(EVENTS.SIGNUP_COMPLETED, { has_referral: !!ref });
    if (ref) track(EVENTS.REFERRAL_SIGNUP, { ref_id: ref });
    setSucesso(true);
    setLoading(false);
  }

  async function handleGoogle() {
    if (!supabaseConfigured) {
      setErro("Configure as credenciais do Supabase no .env.local para ativar o Google.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/onboarding` },
    });
  }

  if (sucesso) {
    return (
      <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", padding: "24px" }}>
        <div style={{ maxWidth: "440px", width: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
            ✉️
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Confirme seu e-mail</h1>
            <p style={{ fontSize: "14px", color: "#6B6B6B", marginTop: "8px", lineHeight: 1.6 }}>
              Enviamos um link de confirmação para <strong style={{ color: "#111111" }}>{email}</strong>.<br />
              Clique no link para ativar sua conta e entrar na cidade.
            </p>
          </div>

          {/* Checklist do que fazer se não recebeu */}
          <div style={{ background: "#F7F7F8", borderRadius: "14px", padding: "16px 20px", width: "100%", textAlign: "left", display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em" }}>Não recebeu?</p>
            <ul style={{ display: "flex", flexDirection: "column", gap: "6px", paddingLeft: 0, listStyle: "none" }}>
              <li style={{ fontSize: "13px", color: "#525252", display: "flex", gap: "8px" }}>
                <span style={{ color: "#10B981" }}>✓</span> Verifique a caixa de <strong style={{ color: "#111111" }}>spam</strong> ou <strong style={{ color: "#111111" }}>promoções</strong>
              </li>
              <li style={{ fontSize: "13px", color: "#525252", display: "flex", gap: "8px" }}>
                <span style={{ color: "#10B981" }}>✓</span> Aguarde até <strong style={{ color: "#111111" }}>1 minuto</strong> — pode demorar
              </li>
              <li style={{ fontSize: "13px", color: "#525252", display: "flex", gap: "8px" }}>
                <span style={{ color: "#10B981" }}>✓</span>{" "}
                <button
                  onClick={handleCadastro}
                  style={{ fontSize: "13px", color: "#FF5C2E", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "Inter, sans-serif", textDecoration: "underline" }}
                >
                  Reenviar e-mail
                </button>
              </li>
            </ul>
          </div>

          {/* Opção de corrigir email errado */}
          <button
            onClick={() => { setSucesso(false); }}
            style={{ fontSize: "13px", color: "#525252", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", textDecoration: "underline" }}
          >
            Errei o e-mail. Voltar e corrigir
          </button>

          <a href="/login" style={{ fontSize: "13px", color: "#A3A3A3", textDecoration: "none" }}>
            Já confirmei. Ir para o login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", fontFamily: "Inter, sans-serif" }}>

      {/* Painel esquerdo */}
      <div style={{ flex: 1, background: "#111111", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px", position: "relative", overflow: "hidden" }} className="hidden md:flex">
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%, rgba(255,92,46,0.15) 0%, transparent 60%)" }} />
        <img src="/logo.svg" alt="Urban Members" width={48} height={48} style={{ position: "relative", filter: "invert(1)" }} />
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "13px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
            Crie seu endereço
          </p>
          <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: "20px" }}>
            Sua cidade<br />começa aqui.
          </h2>
          {[
            "Cadastro gratuito e sem cartão",
            "Urban Score começa em 10 pontos",
            "Acesso a todos os bairros",
            "Compre e venda sem mensalidade",
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF5C2E", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "#A3A3A3" }}>{item}</span>
            </div>
          ))}
        </div>
        <p style={{ position: "relative", fontSize: "12px", color: "#525252" }}>urbanicsa.com</p>
      </div>

      {/* Painel direito */}
      <div style={{ width: "100%", maxWidth: "520px", padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "24px", overflowY: "auto" }}>

        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Criar conta</h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "6px" }}>
            Já tem endereço?{" "}
            <a href="/login" style={{ color: "#FF5C2E", fontWeight: 600, textDecoration: "none" }}>Entrar</a>
          </p>
        </div>

        {/* Benefícios condensados — visíveis também em mobile (painel esquerdo está hidden md:flex) */}
        <div className="md:hidden" style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "12px 14px", background: "#FAFAFA", borderRadius: "12px", border: "1px solid #F5F5F5" }}>
          <span style={{ fontSize: "11px", color: "#525252", fontWeight: 600 }}>🏘️ Cadastro grátis</span>
          <span style={{ fontSize: "11px", color: "#A3A3A3" }}>·</span>
          <span style={{ fontSize: "11px", color: "#525252", fontWeight: 600 }}>⚡ 30 segundos</span>
          <span style={{ fontSize: "11px", color: "#A3A3A3" }}>·</span>
          <span style={{ fontSize: "11px", color: "#525252", fontWeight: 600 }}>🔒 Sem cartão</span>
        </div>

        {/* Âncora de tempo — visível em desktop (em mobile já tem na linha acima) */}
        <p className="hidden md:block" style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", marginTop: "-12px" }}>
          ⚡ Cadastro em 30 segundos · sem cartão
        </p>

        {/* Google */}
        <button onClick={handleGoogle} style={{
          width: "100%", height: "52px",
          background: "#FFFFFF", border: "1.5px solid #E5E5E5",
          borderRadius: "14px", display: "flex", alignItems: "center",
          justifyContent: "center", gap: "12px",
          fontSize: "14px", fontWeight: 600, color: "#111111",
          cursor: "pointer", fontFamily: "Inter, sans-serif",
        }}>
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
          <span style={{ fontSize: "12px", color: "#A3A3A3" }}>ou cadastre com e-mail</span>
          <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
        </div>

        {/* Formulário */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          <div>
            <label style={LABEL}>Nome completo</label>
            <input type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)}
              style={{ ...INPUT, border: `1.5px solid ${nome ? "#111111" : "#E5E5E5"}` }} />
          </div>

          <div>
            <label style={LABEL}>E-mail</label>
            <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
              style={{ ...INPUT, border: `1.5px solid ${email ? "#111111" : "#E5E5E5"}` }} />
            {(() => {
              const sugestao = email.includes("@") ? sugerirEmail(email) : null;
              if (!sugestao) return null;
              return (
                <p style={{ fontSize: "12px", color: "#525252", marginTop: "6px" }}>
                  Você quis dizer{" "}
                  <button
                    type="button"
                    onClick={() => setEmail(sugestao)}
                    style={{ fontSize: "12px", color: "#FF5C2E", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "Inter, sans-serif", textDecoration: "underline" }}
                  >
                    {sugestao}
                  </button>
                  ?
                </p>
              );
            })()}
          </div>

          <div>
            <label style={LABEL}>Senha</label>
            <div style={{ position: "relative" }}>
              <input type={mostrarSenha ? "text" : "password"} placeholder="Mín. 6 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)}
                style={{ ...INPUT, border: `1.5px solid ${senha ? "#111111" : "#E5E5E5"}`, paddingRight: "52px" }} />
              <button onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#A3A3A3", fontFamily: "Inter, sans-serif" }}>
                {mostrarSenha ? "Ocultar" : "Ver"}
              </button>
            </div>
            {/* Força da senha */}
            {senha.length > 0 && (
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} style={{ flex: 1, height: "3px", borderRadius: "999px", background: n <= forcaSenha.nivel ? forcaSenha.cor : "#E5E5E5", transition: "background 0.2s" }} />
                  ))}
                </div>
                <p style={{ fontSize: "11px", color: forcaSenha.cor, fontWeight: 600 }}>{forcaSenha.texto}</p>
              </div>
            )}
          </div>

          {erro && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "10px 14px" }}>
              <p style={{ fontSize: "13px", color: "#DC2626" }}>{erro}</p>
            </div>
          )}

          <button onClick={handleCadastro} disabled={!podeCadastrar || loading}
            className="um-btn-accent"
            style={{ width: "100%", height: "52px", fontSize: "15px" }}>
            {loading ? "Criando conta..." : "Criar conta →"}
          </button>
        </div>

        <p style={{ fontSize: "11px", color: "#A3A3A3", textAlign: "center", lineHeight: 1.6 }}>
          Ao criar sua conta você concorda com os{" "}
          <a href="#" style={{ color: "#525252", textDecoration: "underline" }}>Termos de Uso</a>{" "}
          e a{" "}
          <a href="#" style={{ color: "#525252", textDecoration: "underline" }}>Política de Privacidade</a>{" "}
          (LGPD — Lei nº 13.709/2018).
        </p>
      </div>
    </div>
  );
}
