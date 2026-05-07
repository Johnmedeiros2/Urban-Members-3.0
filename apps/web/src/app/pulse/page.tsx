"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Avatar from "@/components/ui/Avatar";
import BotaoCompartilhar from "@/components/ui/BotaoCompartilhar";
import { buscarPulses, curtirPost, descurtirPost, minhasCurtidas, type PostReal } from "@/lib/queries";

export default function UrbanPulse() {
  const [pulses, setPulses] = useState<PostReal[]>([]);
  const [curtidas, setCurtidas] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [mudo, setMudo] = useState(true);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const carregar = useCallback(async () => {
    setCarregando(true);
    const lista = await buscarPulses(30);
    setPulses(lista);
    if (lista.length > 0) {
      const ids = await minhasCurtidas(lista.map((p) => p.id));
      setCurtidas(ids);
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
    const _t = setTimeout(() => setCarregando(false), 8000);
    return () => clearTimeout(_t);
  }, [carregar]);

  // Autoplay: vídeo visível toca, os outros pausam
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0.6] }
    );
    videoRefs.current.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, [pulses]);

  async function toggleCurtir(postId: string) {
    const jaCurtiu = curtidas.has(postId);
    setCurtidas((prev) => {
      const nova = new Set(prev);
      if (jaCurtiu) nova.delete(postId); else nova.add(postId);
      return nova;
    });
    setPulses((prev) => prev.map((p) =>
      p.id === postId ? { ...p, total_curtidas: p.total_curtidas + (jaCurtiu ? -1 : 1) } : p
    ));
    try {
      if (jaCurtiu) await descurtirPost(postId);
      else await curtirPost(postId);
    } catch { /* ignora */ }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000000", fontFamily: "Inter, sans-serif", color: "#FFFFFF" }}>

      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)" }}>
        <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "#FFFFFF" }}>
          <button style={{ width: "36px", height: "36px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#FFFFFF", fontSize: "14px" }}>←</button>
          <span style={{ fontSize: "16px", fontWeight: 800 }}>Urban Pulse</span>
        </a>
        <button
          onClick={() => setMudo(!mudo)}
          style={{ width: "36px", height: "36px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#FFFFFF", fontSize: "14px" }}
        >
          {mudo ? "🔇" : "🔊"}
        </button>
      </header>

      {carregando ? (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#A3A3A3" }}>Carregando...</div>
      ) : pulses.length === 0 ? (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", textAlign: "center", padding: "0 24px" }}>
          <p style={{ fontSize: "18px", fontWeight: 700 }}>Nenhum vídeo ainda</p>
          <p style={{ fontSize: "13px", color: "#A3A3A3" }}>Seja o primeiro morador a publicar um vídeo curto na cidade.</p>
          <a href="/feed" style={{ textDecoration: "none", marginTop: "12px" }}>
            <button className="um-btn-accent" style={{ height: "42px", padding: "0 22px", fontSize: "13px" }}>
              Voltar ao feed
            </button>
          </a>
        </div>
      ) : (
        <div style={{ scrollSnapType: "y mandatory", overflowY: "scroll", height: "100vh" }}>
          {pulses.map((pulse) => {
            const curtido = curtidas.has(pulse.id);
            return (
              <section key={pulse.id} style={{
                scrollSnapAlign: "start",
                height: "100vh", width: "100%",
                position: "relative", display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "#000000",
              }}>
                {pulse.video_url && (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current.set(pulse.id, el);
                      else videoRefs.current.delete(pulse.id);
                    }}
                    src={pulse.video_url}
                    muted={mudo}
                    playsInline
                    loop
                    preload="metadata"
                    style={{
                      maxWidth: "100%", maxHeight: "100%",
                      width: "auto", height: "100%",
                      objectFit: "contain",
                    }}
                    onClick={(e) => {
                      const v = e.currentTarget;
                      if (v.paused) v.play(); else v.pause();
                    }}
                  />
                )}

                {/* Overlay info + ações */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 16px", background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)", display: "flex", alignItems: "flex-end", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a href={`/morador/${pulse.autor_id}`} style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "10px" }}>
                      <Avatar name={pulse.autor?.nome ?? "?"} foto={pulse.autor?.foto_url ?? null} size={36} />
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{pulse.autor?.nome ?? "Morador"}</p>
                        {pulse.autor?.cidade && <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{pulse.autor.cidade}</p>}
                      </div>
                    </a>
                    {pulse.conteudo && (
                      <p style={{ fontSize: "13px", color: "#FFFFFF", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{pulse.conteudo}</p>
                    )}
                  </div>

                  {/* Ações verticais */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                    <button
                      onClick={() => toggleCurtir(pulse.id)}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", background: "none", border: "none", cursor: "pointer", color: "#FFFFFF", fontFamily: "Inter, sans-serif" }}
                    >
                      <span style={{ fontSize: "26px", color: curtido ? "#FF5C2E" : "#FFFFFF" }}>{curtido ? "♥" : "♡"}</span>
                      <span style={{ fontSize: "11px", fontWeight: 600 }}>{pulse.total_curtidas}</span>
                    </button>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: "#FFFFFF" }}>
                      <span style={{ fontSize: "22px" }}>💬</span>
                      <span style={{ fontSize: "11px", fontWeight: 600 }}>{pulse.total_comentarios}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: "#FFFFFF" }}>
                      <BotaoCompartilhar texto={pulse.conteudo || "Veja esse Pulse"} autor={pulse.autor?.nome} />
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
