"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { buscarStoriesAtivos, criarStory, deletarStory, type StoriesPorAutor, type Story } from "@/lib/queries";
import { createClient } from "@/lib/supabase";
import Avatar from "./Avatar";

export default function Stories() {
  const [grupos, setGrupos] = useState<StoriesPorAutor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [duracao, setDuracao] = useState<12 | 24>(24);
  const [modalTipo, setModalTipo] = useState<null | "escolher" | "duracao">(null);
  const [tipoEscolhido, setTipoEscolhido] = useState<"foto" | "video">("foto");
  const inputFoto = useRef<HTMLInputElement>(null);
  const inputVideo = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [s, { data: { user } }] = await Promise.all([
      buscarStoriesAtivos(),
      createClient().auth.getUser(),
    ]);
    setGrupos(s);
    setMeuId(user?.id ?? null);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function enviar(foto?: File | null, video?: File | null) {
    setEnviando(true);
    try {
      await criarStory(foto, video, duracao);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setEnviando(false);
      setModalTipo(null);
      if (inputFoto.current) inputFoto.current.value = "";
      if (inputVideo.current) inputVideo.current.value = "";
    }
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { alert("Máx 5MB"); return; }
    enviar(f, null);
  }
  function handleVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.files?.[0]; if (!v) return;
    if (v.size > 50 * 1024 * 1024) { alert("Máx 50MB"); return; }
    enviar(null, v);
  }

  function iniciarCriacao() {
    setModalTipo("escolher");
  }
  function confirmarCriacao() {
    if (tipoEscolhido === "foto") inputFoto.current?.click();
    else inputVideo.current?.click();
  }

  const meuGrupo = meuId ? grupos.find((g) => g.autor_id === meuId) : null;
  const outrosGrupos = meuId ? grupos.filter((g) => g.autor_id !== meuId) : grupos;
  const gruposOrdenados = meuGrupo ? [meuGrupo, ...outrosGrupos] : outrosGrupos;

  if (carregando) return null;

  return (
    <>
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", padding: "4px 4px 12px", scrollbarWidth: "none" }}>
        <input ref={inputFoto} type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
        <input ref={inputVideo} type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideo} style={{ display: "none" }} />

        {/* Botão criar pulse (sempre primeiro) */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0, cursor: "pointer" }}>
          <div
            onClick={iniciarCriacao}
            style={{
              width: "62px", height: "62px", borderRadius: "50%",
              background: "#F5F5F5", border: "2px dashed #A3A3A3",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px", color: "#525252",
              opacity: enviando ? 0.5 : 1,
            }}
          >
            {enviando ? "..." : "+"}
          </div>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#525252" }}>Seu pulse</span>
        </div>

        {gruposOrdenados.map((g, i) => (
          <div key={g.autor_id}
            onClick={() => setViewerIdx(i)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0, cursor: "pointer" }}
          >
            <div style={{
              width: "62px", height: "62px", borderRadius: "50%",
              padding: "2px",
              background: "linear-gradient(135deg, #FF5C2E, #FF8C5A)",
            }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "2px solid #FFFFFF", overflow: "hidden", filter: "blur(6px)" }}>
                <Avatar name={g.autor.nome} foto={g.autor.foto_url} size={54} />
              </div>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#111111", maxWidth: "70px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {g.autor_id === meuId ? "Você" : g.autor.nome.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Modal: escolher foto/video + duração */}
      {modalTipo === "escolher" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "24px", maxWidth: "380px", width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111111" }}>Novo pulse</h2>

            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Tipo</p>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["foto", "video"] as const).map((t) => (
                  <button key={t} onClick={() => setTipoEscolhido(t)} style={{
                    flex: 1, height: "44px", borderRadius: "12px",
                    background: tipoEscolhido === t ? "#111111" : "#F5F5F5",
                    color: tipoEscolhido === t ? "#FFFFFF" : "#111111",
                    border: "none", cursor: "pointer",
                    fontSize: "13px", fontWeight: 700, fontFamily: "Inter, sans-serif",
                    textTransform: "capitalize",
                  }}>
                    {t === "foto" ? "📷 Foto" : "🎬 Vídeo"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Duração</p>
              <div style={{ display: "flex", gap: "8px" }}>
                {([12, 24] as const).map((h) => (
                  <button key={h} onClick={() => setDuracao(h)} style={{
                    flex: 1, height: "44px", borderRadius: "12px",
                    background: duracao === h ? "#FF5C2E" : "#F5F5F5",
                    color: duracao === h ? "#FFFFFF" : "#111111",
                    border: "none", cursor: "pointer",
                    fontSize: "13px", fontWeight: 700, fontFamily: "Inter, sans-serif",
                  }}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
              <button onClick={() => setModalTipo(null)} style={{ flex: 1, height: "44px", background: "#F5F5F5", color: "#525252", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                Cancelar
              </button>
              <button onClick={confirmarCriacao} style={{ flex: 1, height: "44px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                Escolher arquivo
              </button>
            </div>
          </div>
        </div>
      )}

      {viewerIdx !== null && gruposOrdenados[viewerIdx] && (
        <StoryViewer
          grupo={gruposOrdenados[viewerIdx]}
          meuId={meuId}
          onClose={() => setViewerIdx(null)}
          onDeletar={async (id) => {
            await deletarStory(id);
            await carregar();
            setViewerIdx(null);
          }}
          onProximo={() => {
            if (viewerIdx + 1 < gruposOrdenados.length) setViewerIdx(viewerIdx + 1);
            else setViewerIdx(null);
          }}
          onAnterior={() => {
            if (viewerIdx > 0) setViewerIdx(viewerIdx - 1);
          }}
        />
      )}
    </>
  );
}

function StoryViewer({ grupo, meuId, onClose, onDeletar, onProximo, onAnterior }: {
  grupo: StoriesPorAutor;
  meuId: string | null;
  onClose: () => void;
  onDeletar: (id: string) => void;
  onProximo: () => void;
  onAnterior: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const storyAtual: Story = grupo.stories[idx];
  const ehMeu = meuId === grupo.autor_id;

  useEffect(() => {
    setProgresso(0);
    const duracao = storyAtual.video_url ? 15000 : 5000;
    const inicio = Date.now();
    const timer = setInterval(() => {
      const pct = Math.min(((Date.now() - inicio) / duracao) * 100, 100);
      setProgresso(pct);
      if (pct >= 100) {
        clearInterval(timer);
        if (idx + 1 < grupo.stories.length) setIdx(idx + 1);
        else onProximo();
      }
    }, 50);
    return () => clearInterval(timer);
  }, [idx, storyAtual, grupo.stories.length, onProximo]);

  function clicarLado(e: React.MouseEvent) {
    const x = e.clientX;
    const largura = window.innerWidth;
    if (x < largura / 2) {
      if (idx > 0) setIdx(idx - 1);
      else onAnterior();
    } else {
      if (idx + 1 < grupo.stories.length) setIdx(idx + 1);
      else onProximo();
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      {/* Barras de progresso */}
      <div style={{ position: "absolute", top: "10px", left: "12px", right: "12px", display: "flex", gap: "4px", zIndex: 10 }}>
        {grupo.stories.map((_, i) => (
          <div key={i} style={{ flex: 1, height: "3px", background: "rgba(255,255,255,0.3)", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{
              width: i < idx ? "100%" : i === idx ? `${progresso}%` : "0%",
              height: "100%", background: "#FFFFFF",
              transition: "width 0.1s linear",
            }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ position: "absolute", top: "24px", left: "16px", right: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF" }}>
          <Avatar name={grupo.autor.nome} foto={grupo.autor.foto_url} size={36} />
          <span style={{ fontSize: "14px", fontWeight: 700 }}>{grupo.autor.nome}</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {ehMeu && (
            <button onClick={() => { if (confirm("Apagar este pulse?")) onDeletar(storyAtual.id); }}
              style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF", border: "none", borderRadius: "999px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Apagar
            </button>
          )}
          <button onClick={onClose}
            style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", color: "#FFFFFF", border: "none", cursor: "pointer", fontSize: "16px" }}>
            ✕
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div onClick={clicarLado} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        {storyAtual.foto_url && (
          <img src={storyAtual.foto_url} alt="story" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        )}
        {storyAtual.video_url && (
          <video src={storyAtual.video_url} autoPlay playsInline muted style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        )}
      </div>
    </div>
  );
}
