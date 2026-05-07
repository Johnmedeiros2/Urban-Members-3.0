"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { buscarStoriesAtivos, criarStory, deletarStory, registrarVisualizacaoStory, type StoriesPorAutor, type Story } from "@/lib/queries";
import { createClient } from "@/lib/supabase";
import Avatar from "./Avatar";

interface Props {
  layout?: "lateral" | "horizontal";
}

export default function Stories({ layout = "lateral" }: Props) {
  const [grupos, setGrupos] = useState<StoriesPorAutor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [viewerIdx, setViewerIdx] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [duracao, setDuracao] = useState<12 | 24>(24);
  const [visUnica, setVisUnica] = useState(false);
  const [modalTipo, setModalTipo] = useState<null | "escolher">(null);
  const [tipoEscolhido, setTipoEscolhido] = useState<"foto" | "video">("foto");
  const inputFoto = useRef<HTMLInputElement>(null);
  const inputVideo = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [s, { data: { session } }] = await Promise.all([
      buscarStoriesAtivos(),
      createClient().auth.getSession(),
    ]);
    setGrupos(s);
    setMeuId(session?.user?.id ?? null);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function enviar(foto?: File | null, video?: File | null) {
    setEnviando(true);
    try {
      await criarStory(foto, video, duracao, visUnica);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setEnviando(false);
      setModalTipo(null);
      setVisUnica(false);
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

  // Layout lateral: coluna vertical
  const isLateral = layout === "lateral";

  return (
    <>
      <div style={{
        display: "flex",
        flexDirection: isLateral ? "column" : "row",
        gap: isLateral ? "14px" : "12px",
        overflowX: isLateral ? "visible" : "auto",
        padding: isLateral ? "0" : "4px 4px 12px",
        scrollbarWidth: "none",
      }}>
        <input ref={inputFoto} type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
        <input ref={inputVideo} type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideo} style={{ display: "none" }} />

        {/* Header da coluna (só no layout lateral) */}
        {isLateral && (
          <div style={{ marginBottom: "-4px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.08em" }}>Now</p>
            <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "2px" }}>Momentos efêmeros da cidade</p>
          </div>
        )}

        {/* Botão criar now */}
        <div
          onClick={iniciarCriacao}
          style={{
            display: "flex",
            flexDirection: isLateral ? "row" : "column",
            alignItems: "center",
            gap: isLateral ? "10px" : "6px",
            flexShrink: 0,
            cursor: "pointer",
            padding: isLateral ? "6px 4px" : "0",
            borderRadius: isLateral ? "10px" : "0",
          }}
        >
          <div style={{
            width: isLateral ? "44px" : "62px",
            height: isLateral ? "44px" : "62px",
            borderRadius: "50%",
            background: "#F5F5F5", border: "2px dashed #A3A3A3",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isLateral ? "18px" : "24px", color: "#525252",
            opacity: enviando ? 0.5 : 1, flexShrink: 0,
          }}>
            {enviando ? "..." : "+"}
          </div>
          <span style={{ fontSize: isLateral ? "12px" : "11px", fontWeight: 600, color: "#525252" }}>
            {isLateral ? "Publicar agora" : "Seu now"}
          </span>
        </div>

        {gruposOrdenados.map((g, i) => (
          <div key={g.autor_id}
            onClick={() => setViewerIdx(i)}
            style={{
              display: "flex",
              flexDirection: isLateral ? "row" : "column",
              alignItems: "center",
              gap: isLateral ? "10px" : "6px",
              flexShrink: 0, cursor: "pointer",
              padding: isLateral ? "6px 4px" : "0",
              borderRadius: isLateral ? "10px" : "0",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (isLateral) e.currentTarget.style.background = "#F7F7F8"; }}
            onMouseLeave={(e) => { if (isLateral) e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{
              width: isLateral ? "44px" : "62px",
              height: isLateral ? "44px" : "62px",
              borderRadius: "50%",
              padding: "2px",
              background: "linear-gradient(135deg, #FF5C2E, #FF8C5A)",
              flexShrink: 0,
              position: "relative",
            }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%",
                border: "2px solid #FFFFFF", overflow: "hidden",
                filter: "blur(6px)",
              }}>
                <Avatar name={g.autor.nome} foto={g.autor.foto_url} size={isLateral ? 38 : 54} />
              </div>
              {/* Ícone de visualização única */}
              {g.stories.some((s) => s.visualizacao_unica) && (
                <div style={{
                  position: "absolute", top: "-2px", right: "-2px",
                  width: "16px", height: "16px", borderRadius: "50%",
                  background: "#111111", border: "2px solid #FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "8px", color: "#FFFFFF", fontWeight: 800,
                }} title="Visualização única">
                  1
                </div>
              )}
            </div>
            {isLateral ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {g.autor_id === meuId ? "Você" : g.autor.nome}
                </p>
                <p style={{ fontSize: "10px", color: "#A3A3A3", marginTop: "1px" }}>
                  {g.stories.length} {g.stories.length === 1 ? "publicação" : "publicações"}
                </p>
              </div>
            ) : (
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#111111", maxWidth: "70px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {g.autor_id === meuId ? "Você" : g.autor.nome.split(" ")[0]}
              </span>
            )}
          </div>
        ))}

        {gruposOrdenados.length === 0 && isLateral && (
          <p style={{ fontSize: "11px", color: "#A3A3A3", padding: "8px 0", textAlign: "center" }}>
            Nada agora. Seja o primeiro.
          </p>
        )}
      </div>

      {/* Modal: criar now */}
      {modalTipo === "escolher" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "24px", maxWidth: "400px", width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111111" }}>Novo now</h2>

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

            <label style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "12px 14px", background: visUnica ? "#FFF3EF" : "#F5F5F5",
              borderRadius: "12px", cursor: "pointer",
              border: `1px solid ${visUnica ? "#FFD4C4" : "transparent"}`,
              transition: "all 0.15s",
            }}>
              <input
                type="checkbox"
                checked={visUnica}
                onChange={(e) => setVisUnica(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#FF5C2E", cursor: "pointer" }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>Visualização única</p>
                <p style={{ fontSize: "11px", color: "#525252", marginTop: "2px" }}>Cada morador vê apenas uma vez. Depois some.</p>
              </div>
            </label>

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

  // Registra visualização ao abrir (se não for o autor)
  useEffect(() => {
    if (!ehMeu && storyAtual) {
      registrarVisualizacaoStory(storyAtual.id);
    }
  }, [storyAtual, ehMeu]);

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
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700 }}>{grupo.autor.nome}</p>
            {storyAtual.visualizacao_unica && (
              <p style={{ fontSize: "10px", color: "#FF5C2E", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                · Visualização única
              </p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {ehMeu && (
            <button onClick={() => { if (confirm("Apagar este now?")) onDeletar(storyAtual.id); }}
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
          <img src={storyAtual.foto_url} alt="now" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        )}
        {storyAtual.video_url && (
          <video src={storyAtual.video_url} autoPlay playsInline muted style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        )}
      </div>
    </div>
  );
}
