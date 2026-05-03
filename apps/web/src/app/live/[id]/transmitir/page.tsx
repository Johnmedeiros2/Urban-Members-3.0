"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { atualizarLiveStatus } from "@/lib/queries";
import { createClient } from "@/lib/supabase";

export default function TransmitirLive() {
  const params = useParams();
  const id = params.id as string;

  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tituloLive, setTituloLive] = useState<string>("");
  const [aoVivo, setAoVivo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const supabase = createClient();
      const { data: live } = await supabase
        .from("lives")
        .select("titulo, ao_vivo, tipo, autor_id")
        .eq("id", id)
        .maybeSingle();
      if (!live) throw new Error("Live não encontrada");
      const liveTyped = live as { titulo: string; ao_vivo: boolean; tipo: string; autor_id: string };
      if (liveTyped.tipo !== "nativa") throw new Error("Esta live usa link externo, não é transmissão nativa");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Faça login para transmitir");
      if (user.id !== liveTyped.autor_id) throw new Error("Só o autor pode transmitir");

      setTituloLive(liveTyped.titulo);
      setAoVivo(liveTyped.ao_vivo);

      const r = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ live_id: id, modo: "transmissor" }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Falha ao gerar acesso");
      setToken(j.token);
      setServerUrl(j.url);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro");
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  async function iniciarTransmissao() {
    try {
      await atualizarLiveStatus(id, true);
      setAoVivo(true);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  async function encerrarTransmissao() {
    if (!confirm("Encerrar a transmissão? Quem está assistindo será desconectado.")) return;
    try {
      await atualizarLiveStatus(id, false);
      setAoVivo(false);
      window.location.href = `/live/${id}`;
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  if (carregando) {
    return (
      <div style={{ minHeight: "100vh", background: "#111111", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        Preparando estúdio...
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ minHeight: "100vh", background: "#111111", color: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", gap: "16px", padding: "24px", textAlign: "center" }}>
        <p style={{ fontSize: "16px", fontWeight: 700 }}>{erro}</p>
        <a href={`/live/${id}`} style={{ fontSize: "13px", color: "#FF5C2E" }}>← Voltar</a>
      </div>
    );
  }

  if (!token || !serverUrl) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#111111", color: "#FFFFFF", display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif" }}>
      <header style={{ padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
          <a href={`/live/${id}`} style={{ color: "#A3A3A3", textDecoration: "none", fontSize: "13px" }}>← Sair</a>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>·</span>
          <p style={{ fontSize: "14px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tituloLive}</p>
          {aoVivo && (
            <span style={{ fontSize: "10px", fontWeight: 800, background: "#FF5C2E", padding: "3px 8px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              🔴 No ar
            </span>
          )}
        </div>
        {aoVivo ? (
          <button onClick={encerrarTransmissao} style={{ height: "34px", padding: "0 14px", background: "rgba(255,92,46,0.15)", color: "#FF5C2E", border: "1px solid rgba(255,92,46,0.3)", borderRadius: "999px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            Encerrar
          </button>
        ) : (
          <button onClick={iniciarTransmissao} className="um-btn-accent" style={{ height: "34px", padding: "0 16px", fontSize: "12px" }}>
            🔴 Entrar no ar
          </button>
        )}
      </header>

      <div style={{ flex: 1, position: "relative" }}>
        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={true}
          video={true}
          audio={true}
          data-lk-theme="default"
          style={{ height: "100%" }}
        >
          <VideoConference />
          <RoomAudioRenderer />
          <ControlBar variation="minimal" controls={{ chat: false, screenShare: true, leave: false }} />
        </LiveKitRoom>
      </div>

      {!aoVivo && (
        <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#1F1F1F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px", padding: "10px 18px", fontSize: "12px", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#A3A3A3" }} />
          Você está em modo de teste. Clique em &quot;Entrar no ar&quot; pra começar.
        </div>
      )}
    </div>
  );
}
