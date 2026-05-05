"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { track, EVENTS } from "@/lib/analytics";

interface Props {
  liveId: string;
}

export default function ViewerLiveNativa({ liveId }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const r = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ live_id: liveId, modo: "espectador" }),
        });
        const j = await r.json();
        if (cancelado) return;
        if (!r.ok) throw new Error(j.error ?? "Falha ao entrar na live");
        setToken(j.token);
        setServerUrl(j.url);
        track(EVENTS.LIVE_JOINED, { live_id: liveId });
      } catch (e: unknown) {
        if (!cancelado) setErro(e instanceof Error ? e.message : "Erro");
      }
    })();
    return () => { cancelado = true; };
  }, [liveId]);

  if (erro) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FFFFFF", textAlign: "center", padding: "24px", gap: "10px" }}>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{erro}</p>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
        Entrando na live...
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={false}
      audio={false}
      data-lk-theme="default"
      style={{ width: "100%", height: "100%" }}
    >
      <PalcoTransmissor />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function PalcoTransmissor() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: true },
  );

  if (tracks.length === 0) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "24px", gap: "10px" }}>
        <span style={{ fontSize: "32px" }}>🎬</span>
        <p style={{ fontSize: "14px", fontWeight: 600 }}>Aguardando o transmissor entrar no ar</p>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Você já está conectado. O vídeo aparece quando começar.</p>
      </div>
    );
  }

  return (
    <GridLayout tracks={tracks} style={{ width: "100%", height: "100%" }}>
      <ParticipantTile />
    </GridLayout>
  );
}
