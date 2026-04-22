"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { buscarNotificacoes, marcarTodasLidas } from "@/lib/queries";
import Avatar from "./Avatar";

interface Notificacao {
  id: string;
  tipo: "curtida" | "comentario" | "conexao" | "venda" | "score";
  mensagem: string;
  lida: boolean;
  criado_em: string;
  originador?: { nome: string } | null;
}

function icone(tipo: Notificacao["tipo"]) {
  return { curtida: "♥", comentario: "💬", conexao: "👤", venda: "💰", score: "⬡" }[tipo];
}

function tempoRelativo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)  return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function Notificacoes() {
  const [aberto, setAberto] = useState(false);
  const [notifs, setNotifs] = useState<Notificacao[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const naoLidas = notifs.filter((n) => !n.lida).length;

  const carregar = useCallback(async () => {
    const data = await buscarNotificacoes();
    setNotifs(data as Notificacao[]);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("notificacoes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notificacoes" }, () => carregar())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [carregar]);

  async function handleMarcarLidas() {
    await marcarTodasLidas();
    setNotifs((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Botão sino */}
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          width: "36px", height: "36px", borderRadius: "999px",
          background: aberto ? "#111111" : "#F5F5F5",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", position: "relative", transition: "background 0.15s",
        }}
      >
        🔔
        {naoLidas > 0 && (
          <span style={{
            position: "absolute", top: "2px", right: "2px",
            width: "16px", height: "16px", borderRadius: "50%",
            background: "#FF5C2E", color: "#FFFFFF",
            fontSize: "9px", fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #FFFFFF",
          }}>
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {aberto && (
        <div style={{
          position: "absolute", top: "44px", right: 0,
          width: "360px", background: "#FFFFFF",
          borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden",
          zIndex: 100,
        }}>
          {/* Header do dropdown */}
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F5F5F5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Notificações</span>
              {naoLidas > 0 && (
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF5C2E", background: "#FFF3EF", padding: "2px 8px", borderRadius: "999px" }}>
                  {naoLidas} novas
                </span>
              )}
            </div>
            {naoLidas > 0 && (
              <button onClick={handleMarcarLidas} style={{ fontSize: "12px", color: "#A3A3A3", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#A3A3A3" }}>Nenhuma notificação</p>
              </div>
            ) : notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, lida: true } : x))}
                style={{
                  padding: "12px 20px", display: "flex", alignItems: "flex-start", gap: "12px",
                  background: n.lida ? "#FFFFFF" : "#FAFAFA",
                  borderBottom: "1px solid #F5F5F5", cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7F8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = n.lida ? "#FFFFFF" : "#FAFAFA")}
              >
                {n.originador?.nome ? (
                  <Avatar name={n.originador.nome} size={36} />
                ) : (
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#FFF3EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                    {icone(n.tipo)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", color: "#111111", lineHeight: 1.4, fontWeight: n.lida ? 400 : 600 }}>
                    {n.mensagem}
                  </p>
                  <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "3px" }}>
                    {tempoRelativo(n.criado_em)}
                  </p>
                </div>
                {!n.lida && (
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF5C2E", flexShrink: 0, marginTop: "4px" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
