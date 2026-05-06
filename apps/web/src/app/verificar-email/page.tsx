"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase";

const HIGHLIGHTS = [
  {
    emoji: "🏘️",
    titulo: "Você é morador, não usuário.",
    texto: "Endereço próprio na primeira cidade digital brasileira. Sem algoritmo bloqueando seu alcance.",
  },
  {
    emoji: "🛒",
    titulo: "Mercado com 1/3 da comissão.",
    texto: "Lojista pequeno tratado igual ao grande. Comissão Urban é 10% — o iFood cobra 30%.",
  },
  {
    emoji: "📚",
    titulo: "Aulas reais, sem IA genérica.",
    texto: "Professores independentes ensinando o que sabem. Inclusive o preparatório militar do Adonai.",
  },
];

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#A8A29E" }}>Carregando...</div>}>
      <VerificarEmail />
    </Suspense>
  );
}

function VerificarEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const ref = searchParams.get("ref");

  const [reenviando, setReenviando] = useState(false);
  const [reenviadoEm, setReenviadoEm] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [highlightAtual, setHighlightAtual] = useState(0);

  // Carousel automático
  useEffect(() => {
    const id = setInterval(() => {
      setHighlightAtual((i) => (i + 1) % HIGHLIGHTS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Cooldown de 60s pra reenviar
  const cooldownAtivo = reenviadoEm !== null && Date.now() - reenviadoEm < 60000;
  const segundosRestantes = reenviadoEm
    ? Math.max(0, Math.ceil((60000 - (Date.now() - reenviadoEm)) / 1000))
    : 0;

  async function reenviar() {
    if (!email || reenviando || cooldownAtivo) return;
    if (!supabaseConfigured) {
      setErro("Configuração ausente.");
      return;
    }
    setReenviando(true);
    setErro(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: ref ? { indicador_id: ref } : undefined,
        },
      });
      if (error) {
        setErro(error.message.toLowerCase().includes("rate") ? "Aguarde alguns segundos e tente de novo." : "Não conseguimos reenviar agora.");
      } else {
        setReenviadoEm(Date.now());
      }
    } catch {
      setErro("Erro inesperado. Tente novamente.");
    } finally {
      setReenviando(false);
    }
  }

  const highlight = HIGHLIGHTS[highlightAtual];

  return (
    <main
      className="min-h-screen w-full flex flex-col"
      style={{ fontFamily: "Inter, sans-serif", background: "#FFFCF9" }}
    >
      {/* Header simples */}
      <header className="border-b border-[#F0EDE9] bg-white/90 backdrop-blur-md w-full flex justify-center">
        <div className="w-full max-w-6xl px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline">
            <img src="/logo.svg" alt="Urban Members" width={28} height={28} style={{ display: "block" }} />
            <span className="text-[13px] font-bold tracking-widest text-[#1A1A1A] uppercase">Urban Members</span>
          </a>
          <a href="/" className="text-[13px] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            ← Voltar
          </a>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="flex-1 flex justify-center w-full px-6 py-12 md:py-16">
        <div className="w-full max-w-2xl flex flex-col gap-10 items-center text-center">

          {/* Ícone + headline + email */}
          <div className="flex flex-col gap-5 items-center">
            <div
              className="w-20 h-20 rounded-3xl bg-[#FFF3EF] border-2 border-[#FED7C3] flex items-center justify-center"
              aria-hidden="true"
            >
              <span style={{ fontSize: "36px" }}>📨</span>
            </div>

            <div className="flex flex-col gap-3 items-center">
              <h1 className="text-[28px] md:text-[36px] font-bold text-[#1A1A1A] leading-[1.1] tracking-tight">
                Seu link está a caminho.
              </h1>
              <p className="text-[15px] md:text-[17px] text-[#6B6B6B] leading-relaxed max-w-[44ch]">
                Enviamos um link mágico para{" "}
                <strong className="text-[#1A1A1A]">{email || "seu e-mail"}</strong>. Clique nele pra entrar na cidade.
              </p>
            </div>
          </div>

          {/* Carousel de highlights — transforma espera em educação */}
          <div className="w-full max-w-md">
            <p className="text-[10px] font-bold tracking-[0.12em] text-[#FF5C2E] uppercase mb-3">
              Enquanto isso, conheça sua nova cidade
            </p>
            <div
              className="bg-white rounded-3xl p-7 border border-[#F0EDE9] shadow-sm flex flex-col gap-4 items-center text-center min-h-[180px]"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FFF3EF] flex items-center justify-center" aria-hidden="true">
                <span style={{ fontSize: "28px" }}>{highlight.emoji}</span>
              </div>
              <h2 className="text-[18px] font-bold text-[#1A1A1A] leading-tight">{highlight.titulo}</h2>
              <p className="text-[14px] text-[#6B6B6B] leading-relaxed">{highlight.texto}</p>
            </div>
            {/* Indicadores do carousel */}
            <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Highlights">
              {HIGHLIGHTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHighlightAtual(i)}
                  role="tab"
                  aria-selected={i === highlightAtual}
                  aria-label={`Mostrar highlight ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === highlightAtual ? "w-6 bg-[#FF5C2E]" : "w-1.5 bg-[#E5E5E5]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Checklist do que fazer */}
          <div className="w-full max-w-md bg-[#FAFAF9] rounded-2xl p-5 text-left flex flex-col gap-3 border border-[#F0EDE9]">
            <p className="text-[11px] font-bold tracking-[0.1em] text-[#6B6B6B] uppercase">Não recebeu?</p>
            <ul className="flex flex-col gap-2.5">
              <li className="flex gap-2.5 text-[13px] text-[#4B4B4B] leading-relaxed">
                <span className="text-[#10B981] shrink-0">✓</span>
                <span>Verifique a caixa de <strong className="text-[#1A1A1A]">spam</strong> ou <strong className="text-[#1A1A1A]">promoções</strong></span>
              </li>
              <li className="flex gap-2.5 text-[13px] text-[#4B4B4B] leading-relaxed">
                <span className="text-[#10B981] shrink-0">✓</span>
                <span>Aguarde até <strong className="text-[#1A1A1A]">1 minuto</strong> — pode demorar</span>
              </li>
              <li className="flex gap-2.5 text-[13px] text-[#4B4B4B] leading-relaxed items-center">
                <span className="text-[#10B981] shrink-0">✓</span>
                <button
                  onClick={reenviar}
                  disabled={reenviando || cooldownAtivo || !email}
                  className="text-[#FF5C2E] font-semibold underline hover:text-[#E04E20] disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {reenviando ? "Reenviando..." : cooldownAtivo ? `Reenviar em ${segundosRestantes}s` : "Reenviar e-mail"}
                </button>
              </li>
            </ul>
            {erro && <p className="text-[12px] text-[#DC2626] mt-1" role="alert">{erro}</p>}
            {reenviadoEm && !erro && (
              <p className="text-[12px] text-[#10B981] mt-1" role="status">
                ✓ Reenviamos pra {email}.
              </p>
            )}
          </div>

          {/* Voltar e corrigir */}
          <a
            href="/"
            className="text-[13px] text-[#6B6B6B] underline hover:text-[#1A1A1A] transition-colors"
          >
            Errei o e-mail. Voltar e corrigir
          </a>
        </div>
      </div>
    </main>
  );
}
