"use client";

import { useEffect, useRef, useState, useId } from "react";
import { createClient } from "@/lib/supabase";
import Avatar from "./Avatar";

interface Mensagem {
  id: string;
  texto: string;
  criado_em: string;
  autor_id: string;
  autor: { nome: string; foto_url: string | null } | null;
}

interface Props {
  liveId: string;
  meuId: string | null;
  altura?: string;
}

export default function ChatLive({ liveId, meuId, altura = "420px" }: Props) {
  const channelId = useId();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function carregar() {
      const { data } = await supabase
        .from("live_mensagens")
        .select("id, texto, criado_em, autor_id, autor:perfis!autor_id(nome, foto_url)")
        .eq("live_id", liveId)
        .order("criado_em", { ascending: true })
        .limit(150);
      if (data) setMensagens(data as unknown as Mensagem[]);
    }
    carregar();

    const channel = supabase
      .channel(`live-chat-${liveId}-${channelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_mensagens", filter: `live_id=eq.${liveId}` },
        async (payload) => {
          const { data } = await supabase
            .from("live_mensagens")
            .select("id, texto, criado_em, autor_id, autor:perfis!autor_id(nome, foto_url)")
            .eq("id", payload.new.id)
            .single();
          if (data) setMensagens((prev) => [...prev, data as unknown as Mensagem]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [liveId, channelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar() {
    const t = texto.trim();
    if (!t || !meuId || enviando) return;
    setEnviando(true);
    setTexto("");
    const supabase = createClient();
    await supabase.from("live_mensagens").insert({ live_id: liveId, autor_id: meuId, texto: t });
    setEnviando(false);
    inputRef.current?.focus();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: altura, background: "#FFFFFF", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>

      {/* Cabeçalho */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #F5F5F5", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FF5C2E", animation: "um-pulse 1.6s ease-in-out infinite" }} />
        <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>Chat ao vivo</span>
      </div>

      {/* Mensagens */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {mensagens.length === 0 && (
          <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", marginTop: "24px" }}>
            Seja o primeiro a comentar!
          </p>
        )}
        {mensagens.map((m) => (
          <div key={m.id} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, marginTop: "2px" }}>
              <Avatar name={m.autor?.nome ?? "?"} foto={m.autor?.foto_url ?? null} size={26} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: m.autor_id === meuId ? "#FF5C2E" : "#111111" }}>
                {m.autor?.nome ?? "Morador"}
              </span>
              <p style={{ fontSize: "13px", color: "#525252", lineHeight: 1.4, marginTop: "2px", wordBreak: "break-word" }}>
                {m.texto}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {meuId ? (
        <div style={{ borderTop: "1px solid #F5F5F5", padding: "10px 12px", display: "flex", gap: "8px" }}>
          <input
            ref={inputRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && enviar()}
            placeholder="Digite uma mensagem..."
            maxLength={300}
            style={{ flex: 1, height: "38px", borderRadius: "10px", border: "1.5px solid #E5E5E5", padding: "0 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", transition: "border-color 0.2s", color: "#111111", background: "#FFFFFF" }}
            onFocus={(e) => (e.target.style.borderColor = "#FF5C2E")}
            onBlur={(e) => (e.target.style.borderColor = "#E5E5E5")}
          />
          <button
            onClick={enviar}
            disabled={!texto.trim() || enviando}
            className="um-btn-accent"
            style={{ height: "38px", width: "38px", padding: 0, fontSize: "16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px", opacity: !texto.trim() || enviando ? 0.5 : 1 }}
          >
            →
          </button>
        </div>
      ) : (
        <div style={{ borderTop: "1px solid #F5F5F5", padding: "12px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "#A3A3A3" }}>
            <a href="/login" style={{ color: "#FF5C2E", fontWeight: 600, textDecoration: "none" }}>Entre</a> para participar do chat
          </p>
        </div>
      )}
    </div>
  );
}
