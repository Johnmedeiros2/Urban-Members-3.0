"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { buscarAvaliacoes, criarAvaliacao, deletarAvaliacao, mediaAvaliacao, ehModerador, removerAvaliacaoPorModeracao, type Avaliacao, type MediaAvaliacao } from "@/lib/queries";
import { createClient } from "@/lib/supabase";
import Avatar from "./Avatar";
import Estrelas from "./Estrelas";
import ConteudoRemovido from "./ConteudoRemovido";
import ModalMotivoRemocao from "./ModalMotivoRemocao";

function tempoRelativo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

interface Props {
  produtoId?: string;
  cursoId?: string;
}

export default function Avaliacoes({ produtoId, cursoId }: Props) {
  const [lista, setLista] = useState<Avaliacao[]>([]);
  const [media, setMedia] = useState<MediaAvaliacao>({ media: 0, total: 0 });
  const [carregando, setCarregando] = useState(true);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [souFiscal, setSouFiscal] = useState(false);
  const [avaliacaoParaRemover, setAvaliacaoParaRemover] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [avals, med, { data: { user } }, fiscal] = await Promise.all([
      buscarAvaliacoes(produtoId, cursoId),
      mediaAvaliacao(produtoId, cursoId),
      createClient().auth.getUser(),
      ehModerador(),
    ]);
    setLista(avals);
    setMedia(med);
    setMeuId(user?.id ?? null);
    setSouFiscal(fiscal);
    setCarregando(false);
  }, [produtoId, cursoId]);

  useEffect(() => { carregar(); }, [carregar]);

  const jaAvaliei = meuId ? lista.some((a) => a.autor_id === meuId) : false;

  async function enviar() {
    if (estrelas < 1 || enviando) return;
    setEnviando(true);
    try {
      await criarAvaliacao({ produto_id: produtoId, curso_id: cursoId, estrelas, comentario, foto, video });
      setEstrelas(0);
      setComentario("");
      setFoto(null); setPreviewFoto(null);
      setVideo(null); setPreviewVideo(null);
      if (fotoRef.current) fotoRef.current.value = "";
      if (videoRef.current) videoRef.current.value = "";
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setEnviando(false);
    }
  }

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { alert("Máx 5MB"); return; }
    setFoto(f); setPreviewFoto(URL.createObjectURL(f));
  }
  function handleVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.files?.[0]; if (!v) return;
    if (v.size > 50 * 1024 * 1024) { alert("Máx 50MB"); return; }
    setVideo(v); setPreviewVideo(URL.createObjectURL(v));
  }

  async function apagar(id: string) {
    if (!confirm("Apagar sua avaliação?")) return;
    try {
      await deletarAvaliacao(id);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  async function confirmarRemocaoMod(motivo: string) {
    if (!avaliacaoParaRemover) return;
    try {
      await removerAvaliacaoPorModeracao(avaliacaoParaRemover, motivo);
      setAvaliacaoParaRemover(null);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Resumo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "#F7F7F8", borderRadius: "12px" }}>
        <Estrelas valor={media.media} tamanho={18} />
        <div>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>
            {media.total > 0 ? media.media.toFixed(1) : "Sem avaliações"}
          </p>
          {media.total > 0 && (
            <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{media.total} {media.total === 1 ? "avaliação" : "avaliações"}</p>
          )}
        </div>
      </div>

      {/* Composer */}
      {meuId && !jaAvaliei && (
        <div style={{ background: "#FFFFFF", borderRadius: "12px", padding: "14px 16px", border: "1px solid #E5E5E5" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#6B6B6B", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "10px" }}>
            Sua avaliação
          </p>
          <div style={{ marginBottom: "10px" }}>
            <Estrelas valor={estrelas} tamanho={24} interativo onChange={setEstrelas} />
          </div>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Conte como foi sua experiência (opcional)"
            rows={2}
            style={{
              width: "100%", padding: "10px 12px",
              border: "1px solid #E5E5E5", borderRadius: "10px",
              fontSize: "13px", outline: "none", resize: "vertical",
              fontFamily: "Inter, sans-serif", color: "#111111",
              boxSizing: "border-box",
            }}
          />

          <input ref={fotoRef} type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
          <input ref={videoRef} type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideo} style={{ display: "none" }} />

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button onClick={() => fotoRef.current?.click()} style={{ height: "32px", padding: "0 12px", background: "#F5F5F5", color: "#111111", border: "none", borderRadius: "999px", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              📷 Foto
            </button>
            <button onClick={() => videoRef.current?.click()} style={{ height: "32px", padding: "0 12px", background: "#F5F5F5", color: "#111111", border: "none", borderRadius: "999px", fontSize: "11px", fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              🎬 Vídeo
            </button>
          </div>

          {previewFoto && (
            <div style={{ position: "relative", marginTop: "8px", borderRadius: "10px", overflow: "hidden", maxHeight: "200px" }}>
              <img src={previewFoto} alt="preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", display: "block" }} />
              <button onClick={() => { setFoto(null); setPreviewFoto(null); if (fotoRef.current) fotoRef.current.value = ""; }}
                style={{ position: "absolute", top: "6px", right: "6px", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "#FFFFFF", border: "none", cursor: "pointer", fontSize: "12px" }}>×</button>
            </div>
          )}

          {previewVideo && (
            <div style={{ position: "relative", marginTop: "8px", borderRadius: "10px", overflow: "hidden", maxHeight: "240px", background: "#000000" }}>
              <video src={previewVideo} controls style={{ width: "100%", maxHeight: "240px", display: "block" }} />
              <button onClick={() => { setVideo(null); setPreviewVideo(null); if (videoRef.current) videoRef.current.value = ""; }}
                style={{ position: "absolute", top: "6px", right: "6px", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,0,0,0.7)", color: "#FFFFFF", border: "none", cursor: "pointer", fontSize: "12px" }}>×</button>
            </div>
          )}

          <button
            onClick={enviar}
            disabled={estrelas < 1 || enviando}
            style={{
              marginTop: "10px", height: "36px", padding: "0 16px",
              background: estrelas >= 1 && !enviando ? "#111111" : "#E5E5E5",
              color: estrelas >= 1 && !enviando ? "#FFFFFF" : "#A3A3A3",
              border: "none", borderRadius: "999px",
              fontSize: "12px", fontWeight: 700,
              cursor: estrelas >= 1 && !enviando ? "pointer" : "not-allowed",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {enviando ? "Enviando..." : "Publicar avaliação"}
          </button>
        </div>
      )}

      {/* Lista */}
      {carregando ? (
        <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", padding: "16px" }}>Carregando...</p>
      ) : lista.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", padding: "16px" }}>
          Seja o primeiro a avaliar.
        </p>
      ) : (
        lista.map((a) => {
          const foiRemovida = !!a.apagado_em;
          const ehMinha = meuId === a.autor_id;
          const podeFiscalizar = souFiscal && !ehMinha && !foiRemovida;
          return (
            <div key={a.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid #F5F5F5" }}>
              <Avatar name={a.autor?.nome ?? "?"} foto={a.autor?.foto_url ?? null} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{a.autor?.nome ?? "Morador"}</span>
                  {!foiRemovida && <Estrelas valor={a.estrelas} tamanho={12} />}
                  <span style={{ fontSize: "11px", color: "#A3A3A3" }}>· {tempoRelativo(a.criado_em)}</span>
                  {ehMinha && !foiRemovida && (
                    <button
                      onClick={() => apagar(a.id)}
                      style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "#A3A3A3", fontFamily: "Inter, sans-serif" }}
                    >
                      apagar
                    </button>
                  )}
                  {podeFiscalizar && (
                    <button
                      onClick={() => setAvaliacaoParaRemover(a.id)}
                      title="Remover (moderação)"
                      style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#A3A3A3", fontFamily: "Inter, sans-serif" }}
                    >
                      ⋯
                    </button>
                  )}
                </div>
                {foiRemovida ? (
                  <ConteudoRemovido motivo={a.motivo_remocao} removidoPor={a.removido_por?.nome ?? null} />
                ) : (
                  <>
                    {a.comentario && (
                      <p style={{ fontSize: "13px", color: "#111111", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{a.comentario}</p>
                    )}
                    {a.foto_url && (
                      <div style={{ marginTop: "8px", borderRadius: "10px", overflow: "hidden", maxHeight: "280px" }}>
                        <img src={a.foto_url} alt="Foto da avaliação" style={{ width: "100%", maxHeight: "280px", objectFit: "cover", display: "block" }} />
                      </div>
                    )}
                    {a.video_url && (
                      <div style={{ marginTop: "8px", borderRadius: "10px", overflow: "hidden", background: "#000000", maxHeight: "320px" }}>
                        <video src={a.video_url} controls playsInline preload="metadata" style={{ width: "100%", maxHeight: "320px", display: "block" }} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })
      )}

      <ModalMotivoRemocao
        aberto={avaliacaoParaRemover !== null}
        titulo="Remover avaliação"
        onConfirmar={confirmarRemocaoMod}
        onCancelar={() => setAvaliacaoParaRemover(null)}
      />
    </div>
  );
}
