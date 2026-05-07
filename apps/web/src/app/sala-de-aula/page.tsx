"use client";

import { useEffect, useState, useCallback } from "react";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";
import BotaoConvite from "@/components/ui/BotaoConvite";
import AvatarMenu from "@/components/ui/AvatarMenu";
import { buscarCursos, criarCurso, matricularCurso, ehModerador, removerCursoPorModeracao, type Curso } from "@/lib/queries";
import Avaliacoes from "@/components/ui/Avaliacoes";
import BotaoWishlist from "@/components/ui/BotaoWishlist";
import ConteudoRemovido from "@/components/ui/ConteudoRemovido";
import ModalMotivoRemocao from "@/components/ui/ModalMotivoRemocao";
import { createClient } from "@/lib/supabase";

export default function SalaDeAula() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modal, setModal] = useState(false);
  const [matriculando, setMatriculando] = useState<string | null>(null);
  const [avaliacoesAbertas, setAvaliacoesAbertas] = useState<Set<string>>(new Set());

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nivel, setNivel] = useState("Iniciante");
  const [preco, setPreco] = useState("");

  const [meuId, setMeuId] = useState<string | null>(null);
  const [souFiscal, setSouFiscal] = useState(false);
  const [cursoParaRemover, setCursoParaRemover] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [lista, fiscal, user] = await Promise.all([
      buscarCursos(),
      ehModerador(),
      createClient().auth.getUser(),
    ]);
    setCursos(lista);
    setSouFiscal(fiscal);
    setMeuId(user.data.user?.id ?? null);
    setCarregando(false);
  }, []);

  async function confirmarRemocaoCurso(motivo: string) {
    if (!cursoParaRemover) return;
    try {
      await removerCursoPorModeracao(cursoParaRemover, motivo);
      setCursoParaRemover(null);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  useEffect(() => { carregar(); }, [carregar]);

  async function handleCriar() {
    if (!titulo.trim() || !descricao.trim()) return;
    try {
      await criarCurso(titulo, descricao, nivel, parseFloat(preco) || 0);
      setModal(false);
      setTitulo(""); setDescricao(""); setPreco("");
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  async function handleMatricular(curso: Curso) {
    setMatriculando(curso.id);
    try {
      await matricularCurso(curso.id);
      alert("Matrícula realizada! +5 pontos no seu Urban Score.");
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setMatriculando(null);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Urban Members</span>
            </a>
            <span style={{ fontSize: "13px", color: "#A3A3A3", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Sala de Aula</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BotaoConvite variant="ghost" />
            <button onClick={() => setModal(true)} className="um-btn-accent" style={{ height: "36px", padding: "0 18px", fontSize: "13px" }}>
              + Criar curso
            </button>
            <AvatarMenu size={32} />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 80px" }}>

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Sala de Aula</h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "4px" }}>Aprenda com moradores da cidade. Urban só ganha quando você concluir um curso pago.</p>
        </div>

        {carregando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#A3A3A3" }}>Carregando cursos...</div>
        ) : cursos.length === 0 ? (
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "48px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>A Sala de Aula ainda está vazia</p>
            <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "6px" }}>Crie o primeiro curso da cidade.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {cursos.map((curso) => {
              const foiRemovido = !!curso.apagado_em;
              const ehMeu = meuId === curso.instrutor_id;
              const podeFiscalizar = souFiscal && !ehMeu && !foiRemovido;

              if (foiRemovido) {
                return (
                  <div key={curso.id} className="um-card" style={{ padding: "20px" }}>
                    <ConteudoRemovido motivo={curso.motivo_remocao} removidoPor={curso.removido_por?.nome ?? null} />
                  </div>
                );
              }

              return (
                <div key={curso.id} className="um-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px", position: "relative" }}>
                  {/* Link transparente cobrindo o card inteiro */}
                  <a href={`/curso/${curso.id}`} style={{ position: "absolute", inset: 0, zIndex: 0, borderRadius: "inherit" }} aria-label={curso.titulo} />

                  <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "flex-end", gap: "6px", alignItems: "center" }}>
                    {podeFiscalizar && (
                      <button onClick={() => setCursoParaRemover(curso.id)}
                        title="Remover (moderação)"
                        style={{ width: "28px", height: "28px", borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", fontSize: "13px", color: "#A3A3A3" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#A3A3A3"; }}
                      >
                        ⋯
                      </button>
                    )}
                    <BotaoWishlist tipo="curso" itemId={curso.id} tamanho="sm" />
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#A3A3A3", padding: "2px 10px", borderRadius: "999px", background: "#F5F5F5" }}>
                      {curso.nivel}
                    </span>
                    {curso.preco > 0 && (
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#10B981", background: "#F0FDF4", padding: "2px 10px", borderRadius: "999px" }}>
                        R$ {Number(curso.preco).toFixed(2).replace(".", ",")}
                      </span>
                    )}
                    {curso.preco === 0 && (
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#FF5C2E", background: "#FFF3EF", padding: "2px 10px", borderRadius: "999px" }}>
                        Gratuito
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111111", lineHeight: 1.4 }}>{curso.titulo}</h3>
                  {curso.descricao && <p style={{ fontSize: "13px", color: "#6B6B6B", lineHeight: 1.5 }}>{curso.descricao}</p>}

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Avatar name={curso.instrutor?.nome ?? "Instrutor"} size={28} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#111111" }}>{curso.instrutor?.nome ?? "Instrutor"}</p>
                      <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{curso.instrutor?.cidade ?? ""}</p>
                    </div>
                    <ScoreBadge score={curso.instrutor?.urban_score ?? 10} compact />
                  </div>

                  <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #F5F5F5" }}>
                    <span style={{ fontSize: "12px", color: "#A3A3A3" }}>{curso.total_alunos} alunos</span>
                    {ehMeu ? (
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#FF5C2E" }}>Seu curso →</span>
                    ) : (
                      <button onClick={() => handleMatricular(curso)} disabled={matriculando === curso.id} className="um-btn-accent" style={{ padding: "8px 16px", fontSize: "12px" }}>
                        {matriculando === curso.id ? "..." : Number(curso.preco) === 0 ? "Matricular" : "Comprar"}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setAvaliacoesAbertas((prev) => {
                      const n = new Set(prev);
                      if (n.has(curso.id)) n.delete(curso.id); else n.add(curso.id);
                      return n;
                    })}
                    style={{ position: "relative", zIndex: 1, background: "none", border: "none", padding: 0, color: "#525252", fontSize: "12px", cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left" }}
                  >
                    {avaliacoesAbertas.has(curso.id) ? "Ocultar avaliações ↑" : "Ver avaliações ↓"}
                  </button>
                  {avaliacoesAbertas.has(curso.id) && (
                    <Avaliacoes cursoId={curso.id} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>Criar curso</h2>
            <input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)}
              style={{ width: "100%", height: "48px", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "0 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }} />
            <textarea placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3}
              style={{ width: "100%", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "12px 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif", resize: "none" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <select value={nivel} onChange={(e) => setNivel(e.target.value)}
                style={{ flex: 1, height: "48px", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "0 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }}>
                {["Iniciante", "Intermediário", "Avançado", "Todos"].map((n) => <option key={n}>{n}</option>)}
              </select>
              <input type="number" placeholder="Preço R$ (0 = grátis)" value={preco} onChange={(e) => setPreco(e.target.value)}
                style={{ flex: 1, height: "48px", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "0 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setModal(false)} className="um-btn-secondary" style={{ flex: 1, height: "44px", fontSize: "13px" }}>Cancelar</button>
              <button onClick={handleCriar} className="um-btn-accent" style={{ flex: 1, height: "44px", fontSize: "13px" }}>Criar</button>
            </div>
          </div>
        </div>
      )}

      <ModalMotivoRemocao
        aberto={cursoParaRemover !== null}
        titulo="Remover curso"
        onConfirmar={confirmarRemocaoCurso}
        onCancelar={() => setCursoParaRemover(null)}
      />
    </div>
  );
}
