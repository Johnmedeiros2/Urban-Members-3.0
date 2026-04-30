"use client";

import { useState, useEffect, useCallback } from "react";
import { buscarComentarios, criarComentario, deletarComentario, ehModerador, removerComentarioPorModeracao, type Comentario } from "@/lib/queries";
import { createClient } from "@/lib/supabase";
import Avatar from "./Avatar";
import ConteudoFormatado from "./ConteudoFormatado";
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
  postId: string;
  onContagem?: (n: number) => void;
}

export default function Comentarios({ postId, onContagem }: Props) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [souFiscal, setSouFiscal] = useState(false);
  const [comentarioParaRemover, setComentarioParaRemover] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [data, { data: { user } }, fiscal] = await Promise.all([
      buscarComentarios(postId),
      createClient().auth.getUser(),
      ehModerador(),
    ]);
    setComentarios(data);
    setMeuId(user?.id ?? null);
    setSouFiscal(fiscal);
    setCarregando(false);
    onContagem?.(data.length);
  }, [postId, onContagem]);

  useEffect(() => { carregar(); }, [carregar]);

  async function enviar() {
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    try {
      const novo = await criarComentario(postId, texto);
      setTexto("");
      const lista = [...comentarios, novo];
      setComentarios(lista);
      onContagem?.(lista.length);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao comentar");
    } finally {
      setEnviando(false);
    }
  }

  async function deletar(id: string) {
    if (!confirm("Apagar este comentário?")) return;
    try {
      await deletarComentario(id);
      const lista = comentarios.filter((c) => c.id !== id);
      setComentarios(lista);
      onContagem?.(lista.length);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao apagar");
    }
  }

  async function confirmarRemocao(motivo: string) {
    if (!comentarioParaRemover) return;
    try {
      await removerComentarioPorModeracao(comentarioParaRemover, motivo);
      setComentarioParaRemover(null);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao remover");
    }
  }

  return (
    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #F5F5F5" }}>
      {/* Composer */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
          placeholder="Escreva um comentário..."
          style={{
            flex: 1, height: "36px", padding: "0 14px",
            background: "#F5F5F5", border: "1px solid transparent",
            borderRadius: "999px", fontSize: "13px", outline: "none",
            fontFamily: "Inter, sans-serif", color: "#111111",
          }}
        />
        <button
          onClick={enviar}
          disabled={!texto.trim() || enviando}
          style={{
            height: "36px", padding: "0 16px",
            background: texto.trim() && !enviando ? "#111111" : "#E5E5E5",
            color: texto.trim() && !enviando ? "#FFFFFF" : "#A3A3A3",
            border: "none", borderRadius: "999px",
            fontSize: "12px", fontWeight: 700,
            cursor: texto.trim() && !enviando ? "pointer" : "not-allowed",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {enviando ? "..." : "Enviar"}
        </button>
      </div>

      {/* Lista */}
      {carregando ? (
        <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", padding: "12px" }}>Carregando...</p>
      ) : comentarios.length === 0 ? (
        <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", padding: "12px" }}>Seja o primeiro a comentar.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {comentarios.map((c) => {
            const foiRemovido = !!c.apagado_em;
            const ehMeu = meuId === c.autor_id;
            const podeFiscalizar = souFiscal && !ehMeu && !foiRemovido;
            return (
              <div key={c.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <Avatar name={c.autor?.nome ?? "?"} foto={c.autor?.foto_url ?? null} size={32} />
                <div style={{ flex: 1, background: "#F7F7F8", borderRadius: "14px", padding: "8px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#111111" }}>{c.autor?.nome ?? "Morador"}</span>
                    <span style={{ fontSize: "11px", color: "#A3A3A3" }}>· {tempoRelativo(c.criado_em)}</span>
                    {ehMeu && !foiRemovido && (
                      <button
                        onClick={() => deletar(c.id)}
                        style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "#A3A3A3", fontFamily: "Inter, sans-serif" }}
                      >
                        apagar
                      </button>
                    )}
                    {podeFiscalizar && (
                      <button
                        onClick={() => setComentarioParaRemover(c.id)}
                        title="Remover (moderação)"
                        style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#A3A3A3", fontFamily: "Inter, sans-serif" }}
                      >
                        🛡
                      </button>
                    )}
                  </div>
                  {foiRemovido ? (
                    <ConteudoRemovido motivo={c.motivo_remocao} removidoPor={c.removido_por?.nome ?? null} />
                  ) : (
                    <ConteudoFormatado texto={c.conteudo} style={{ fontSize: "13px", color: "#111111", lineHeight: 1.5 }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ModalMotivoRemocao
        aberto={comentarioParaRemover !== null}
        titulo="Remover comentário"
        onConfirmar={confirmarRemocao}
        onCancelar={() => setComentarioParaRemover(null)}
      />
    </div>
  );
}
