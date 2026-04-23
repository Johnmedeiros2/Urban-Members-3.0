"use client";

import { useState, useEffect, useCallback } from "react";
import { buscarAvaliacoes, criarAvaliacao, deletarAvaliacao, mediaAvaliacao, type Avaliacao, type MediaAvaliacao } from "@/lib/queries";
import { createClient } from "@/lib/supabase";
import Avatar from "./Avatar";
import Estrelas from "./Estrelas";

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

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [avals, med, { data: { user } }] = await Promise.all([
      buscarAvaliacoes(produtoId, cursoId),
      mediaAvaliacao(produtoId, cursoId),
      createClient().auth.getUser(),
    ]);
    setLista(avals);
    setMedia(med);
    setMeuId(user?.id ?? null);
    setCarregando(false);
  }, [produtoId, cursoId]);

  useEffect(() => { carregar(); }, [carregar]);

  const jaAvaliei = meuId ? lista.some((a) => a.autor_id === meuId) : false;

  async function enviar() {
    if (estrelas < 1 || enviando) return;
    setEnviando(true);
    try {
      await criarAvaliacao({ produto_id: produtoId, curso_id: cursoId, estrelas, comentario });
      setEstrelas(0);
      setComentario("");
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setEnviando(false);
    }
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
        lista.map((a) => (
          <div key={a.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "12px 0", borderBottom: "1px solid #F5F5F5" }}>
            <Avatar name={a.autor?.nome ?? "?"} foto={a.autor?.foto_url ?? null} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{a.autor?.nome ?? "Morador"}</span>
                <Estrelas valor={a.estrelas} tamanho={12} />
                <span style={{ fontSize: "11px", color: "#A3A3A3" }}>· {tempoRelativo(a.criado_em)}</span>
                {meuId === a.autor_id && (
                  <button
                    onClick={() => apagar(a.id)}
                    style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "#A3A3A3", fontFamily: "Inter, sans-serif" }}
                  >
                    apagar
                  </button>
                )}
              </div>
              {a.comentario && (
                <p style={{ fontSize: "13px", color: "#111111", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{a.comentario}</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
