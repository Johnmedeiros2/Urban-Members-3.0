"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { track, EVENTS } from "@/lib/analytics";

// Detecta typos comuns em domínios populares e sugere correção
function sugerirEmail(email: string): string | null {
  const partes = email.split("@");
  if (partes.length !== 2 || !partes[1]) return null;
  const dominio = partes[1].toLowerCase().trim();
  const corretos = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com"];
  if (corretos.includes(dominio)) return null;
  for (const c of corretos) {
    let dist = Math.abs(c.length - dominio.length);
    const min = Math.min(c.length, dominio.length);
    for (let i = 0; i < min; i++) if (c[i] !== dominio[i]) dist++;
    if (dist > 0 && dist <= 2) return `${partes[0]}@${c}`;
  }
  return null;
}

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function HeroEmailForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [tocou, setTocou] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const trackeouInicio = useRef(false);

  const sugestao = email.includes("@") ? sugerirEmail(email) : null;
  const valido = emailValido(email);
  const mostrarErro = tocou && email.length > 0 && !valido;

  function onChange(v: string) {
    setEmail(v);
    if (!trackeouInicio.current && v.length > 0) {
      trackeouInicio.current = true;
      track(EVENTS.EMAIL_CAPTURE_STARTED);
    }
    if (erro) setErro(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setTocou(true);
    if (!valido) {
      inputRef.current?.focus();
      return;
    }
    if (!supabaseConfigured) {
      setErro("Configuração ausente. Tente novamente em instantes.");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      const supabase = createClient();
      const ref = typeof window !== "undefined" ? localStorage.getItem("urban_ref") : null;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: ref ? { indicador_id: ref } : undefined,
        },
      });
      if (error) {
        if (error.message.toLowerCase().includes("rate")) {
          setErro("Calma — aguarde 1 minuto e tente de novo.");
        } else {
          setErro("Não conseguimos enviar agora. Tente novamente.");
        }
        setEnviando(false);
        return;
      }
      track(EVENTS.EMAIL_CAPTURED, { has_referral: !!ref });
      const params = new URLSearchParams({ email: email.trim().toLowerCase() });
      if (ref) params.set("ref", ref);
      router.push(`/verificar-email?${params.toString()}`);
    } catch {
      setErro("Algo deu errado. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-2" noValidate>
      <label htmlFor="hero-email" className="sr-only">
        Seu e-mail
      </label>

      {/* Container input + botão — premium editorial style */}
      <div
        className={`relative flex flex-col sm:flex-row gap-2.5 sm:gap-0 sm:rounded-2xl sm:border sm:p-1.5 sm:bg-white transition-all ${
          mostrarErro
            ? "sm:border-[#DC2626] sm:shadow-[0_0_0_4px_rgba(220,38,38,0.08)]"
            : valido
            ? "sm:border-[#0F0F0E] sm:shadow-[0_2px_8px_rgba(15,15,14,0.08)]"
            : "sm:border-[#EDEAE5] sm:shadow-[0_1px_2px_rgba(15,15,14,0.04)] sm:hover:border-[#C2C2BB] sm:focus-within:border-[#0F0F0E] sm:focus-within:shadow-[0_2px_8px_rgba(15,15,14,0.08)]"
        }`}
      >
        <input
          ref={inputRef}
          id="hero-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTocou(true)}
          disabled={enviando}
          aria-invalid={mostrarErro || !!erro}
          aria-describedby={mostrarErro ? "hero-email-error" : erro ? "hero-email-erro-server" : undefined}
          className="flex-1 h-13 sm:h-12 px-5 sm:px-5 text-[15px] text-[#0F0F0E] placeholder:text-[#A8A29E] bg-white border border-[#EDEAE5] sm:border-0 rounded-2xl sm:rounded-none outline-none focus:border-[#0F0F0E] sm:focus:border-0 transition-colors"
          style={{ minWidth: 0, height: "52px" }}
        />
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 text-[14px] font-semibold text-white whitespace-nowrap rounded-xl sm:rounded-[10px] disabled:opacity-60 disabled:cursor-wait transition-all hover:translate-y-[-1px] active:translate-y-0"
          style={{
            height: "52px",
            background: "linear-gradient(180deg, #FF5C2E 0%, #E64A1E 100%)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.15) inset, 0 1px 2px rgba(15,15,14,0.10), 0 4px 12px rgba(255,92,46,0.30)",
          }}
        >
          {enviando ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando
            </>
          ) : (
            <>
              <span>Quero meu endereço</span>
              <span aria-hidden="true" className="text-base leading-none">→</span>
            </>
          )}
        </button>
      </div>

      {/* Sugestão de typo */}
      {sugestao && !erro && !mostrarErro && (
        <p className="text-[12px] text-[#6B6B6B] px-2">
          Você quis dizer{" "}
          <button
            type="button"
            onClick={() => { setEmail(sugestao); inputRef.current?.focus(); }}
            className="text-[#FF5C2E] font-semibold underline hover:text-[#E04E20]"
          >
            {sugestao}
          </button>
          ?
        </p>
      )}

      {/* Erro inline (formato do email) */}
      {mostrarErro && (
        <p id="hero-email-error" className="text-[12px] text-[#DC2626] px-2" role="alert">
          Verifique seu e-mail.
        </p>
      )}

      {/* Erro do servidor */}
      {erro && (
        <p id="hero-email-erro-server" className="text-[12px] text-[#DC2626] px-2" role="alert" aria-live="polite">
          {erro}
        </p>
      )}
    </form>
  );
}
