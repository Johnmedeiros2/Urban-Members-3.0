"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { buscarCurso, buscarAulas, criarAula, marcarAulaConcluida, deletarAula, matricularCurso, type Aula } from "@/lib/queries";
import { createClient } from "@/lib/supabase";

interface CursoInfo {
  id: string;
  instrutor_id: string;
  titulo: string;
  descricao: string | null;
  nivel: string;
  preco: number;
  total_alunos: number;
  instrutor: { id: string; nome: string; cidade: string | null; urban_score: number; foto_url: string | null } | null;
}

export default function CursoPage() {
  const params = useParams();
  const id = params.id as string;

  const [curso, setCurso] = useState<CursoInfo | null>(null);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [aulaAtual, setAulaAtual] = useState<Aula | null>(null);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [matriculado, setMatriculado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const [modal, setModal] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricaoAula, setDescricaoAula] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [aoVivo, setAoVivo] = useState(false);
  const [agendado, setAgendado] = useState("");
  const [linkAoVivo, setLinkAoVivo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    const supabase = createClient();
    const [c, a, userData] = await Promise.all([
      buscarCurso(id),
      buscarAulas(id),
      supabase.auth.getUser(),
    ]);
    setCurso(c as CursoInfo | null);
    setAulas(a);
    // Se tem ?aula=X no URL, abre aquela aula
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const aulaQuery = params?.get("aula");
    const aulaDoQuery = aulaQuery ? a.find((x) => x.id === aulaQuery) : null;
    setAulaAtual(aulaDoQuery ?? a[0] ?? null);
    setMeuId(userData.data.user?.id ?? null);
    if (userData.data.user) {
      const { data: matricula } = await supabase
        .from("curso_alunos")
        .select("curso_id")
        .eq("curso_id", id)
        .eq("morador_id", userData.data.user.id)
        .maybeSingle();
      setMatriculado(!!matricula);
    }
    setCarregando(false);
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  async function salvarAula() {
    if (!titulo.trim()) return;
    setSalvando(true);
    try {
      await criarAula(id, titulo, {
        descricao: descricaoAula,
        video: videoFile,
        ao_vivo: aoVivo,
        agendado_para: aoVivo && agendado ? new Date(agendado).toISOString() : null,
        link_ao_vivo: aoVivo ? linkAoVivo : "",
      });
      setTitulo(""); setDescricaoAula(""); setVideoFile(null);
      setAoVivo(false); setAgendado(""); setLinkAoVivo("");
      setModal(false);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setSalvando(false);
    }
  }

  async function handleMatricular() {
    try {
      await matricularCurso(id);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  async function handleConcluida(aula: Aula) {
    try {
      await marcarAulaConcluida(aula.id);
      setAulas((prev) => prev.map((a) => a.id === aula.id ? { ...a, concluida: true } : a));
    } catch { /* silencioso */ }
  }

  async function handleDeletarAula(aula: Aula) {
    if (!confirm("Apagar esta aula?")) return;
    await deletarAula(aula.id);
    await carregar();
  }

  if (carregando) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#A3A3A3" }}>Carregando curso...</div>;
  if (!curso) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>Curso não encontrado</div>;

  const ehInstrutor = meuId === curso.instrutor_id;
  const concluidas = aulas.filter((a) => a.concluida).length;
  const percentual = aulas.length > 0 ? Math.round((concluidas / aulas.length) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/sala-de-aula" style={{ textDecoration: "none" }}>
              <button style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#F5F5F5", border: "none", cursor: "pointer", fontSize: "14px" }}>←</button>
            </a>
            <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Urban Members</span>
            </a>
            <span style={{ fontSize: "13px", color: "#A3A3A3", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Curso</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {ehInstrutor && (
              <button onClick={() => setModal(true)} style={{ height: "36px", padding: "0 16px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                + Nova aula
              </button>
            )}
            <BotaoConvite variant="ghost" />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 80px", display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>

        {/* Player + Info */}
        <div>
          <div style={{ background: "#000000", borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9", marginBottom: "20px" }}>
            {aulaAtual?.video_url ? (
              <video
                key={aulaAtual.id}
                src={aulaAtual.video_url}
                controls playsInline preload="metadata"
                onEnded={() => handleConcluida(aulaAtual)}
                style={{ width: "100%", height: "100%", display: "block" }}
              />
            ) : aulaAtual?.ao_vivo ? (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FFFFFF", textAlign: "center", padding: "24px", gap: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF5C2E", background: "rgba(255,92,46,0.15)", padding: "4px 10px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Ao vivo</span>
                <h2 style={{ fontSize: "22px", fontWeight: 800 }}>{aulaAtual.titulo}</h2>
                {aulaAtual.agendado_para && (
                  <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                    {new Date(aulaAtual.agendado_para).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}
                  </p>
                )}
                {aulaAtual.link_ao_vivo && (
                  <a href={aulaAtual.link_ao_vivo} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <button style={{ height: "42px", padding: "0 24px", background: "#FF5C2E", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                      Entrar na live →
                    </button>
                  </a>
                )}
              </div>
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                {aulas.length === 0 ? "Nenhuma aula ainda" : "Selecione uma aula"}
              </div>
            )}
          </div>

          {aulaAtual && (
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>{aulaAtual.titulo}</h1>
              {aulaAtual.descricao && (
                <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6, marginTop: "10px", whiteSpace: "pre-wrap" }}>{aulaAtual.descricao}</p>
              )}
              {!aulaAtual.concluida && matriculado && aulaAtual.video_url && (
                <button onClick={() => handleConcluida(aulaAtual)}
                  style={{ marginTop: "14px", height: "36px", padding: "0 16px", background: "#F5F5F5", color: "#111111", border: "1px solid #E5E5E5", borderRadius: "999px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  ✓ Marcar como concluída
                </button>
              )}
            </div>
          )}

          <div style={{ marginTop: "20px", background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>{curso.titulo}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
              <Avatar name={curso.instrutor?.nome ?? "?"} foto={curso.instrutor?.foto_url ?? null} size={36} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{curso.instrutor?.nome ?? "Instrutor"}</p>
                <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{curso.instrutor?.cidade ?? ""}</p>
              </div>
              <ScoreBadge score={curso.instrutor?.urban_score ?? 10} compact />
            </div>
            {curso.descricao && <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6, marginTop: "14px" }}>{curso.descricao}</p>}
            {!matriculado && !ehInstrutor && (
              <button onClick={handleMatricular} style={{ marginTop: "16px", height: "44px", padding: "0 24px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                {Number(curso.preco) === 0 ? "Matricular grátis" : `Matricular por R$ ${Number(curso.preco).toFixed(2)}`}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar: lista de aulas */}
        <aside>
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", position: "sticky", top: "84px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{aulas.length} {aulas.length === 1 ? "aula" : "aulas"}</h3>
              {aulas.length > 0 && (
                <>
                  <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "4px" }}>{concluidas}/{aulas.length} concluídas</p>
                  <div style={{ background: "#E5E5E5", borderRadius: "999px", height: "4px", overflow: "hidden", marginTop: "6px" }}>
                    <div style={{ width: `${percentual}%`, height: "100%", background: "#FF5C2E", transition: "width 0.4s" }} />
                  </div>
                </>
              )}
            </div>

            {aulas.length > 0 && (
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar aula..."
                style={{ width: "100%", height: "32px", padding: "0 10px", background: "#F5F5F5", border: "1px solid transparent", borderRadius: "8px", fontSize: "12px", outline: "none", fontFamily: "Inter, sans-serif", color: "#111111", boxSizing: "border-box" }}
              />
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "60vh", overflowY: "auto" }}>
              {(() => {
                const filtradas = busca.trim()
                  ? aulas.filter((a) => a.titulo.toLowerCase().includes(busca.toLowerCase()) || (a.descricao ?? "").toLowerCase().includes(busca.toLowerCase()))
                  : aulas;
                return filtradas.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", padding: "20px 0" }}>
                    {aulas.length === 0 ? "Nenhuma aula ainda" : "Nada encontrado"}
                  </p>
                ) : filtradas.map((a, i) => {
                const ativa = aulaAtual?.id === a.id;
                return (
                  <div key={a.id}
                    onClick={() => setAulaAtual(a)}
                    style={{
                      padding: "10px 12px", borderRadius: "10px",
                      background: ativa ? "#FFF3EF" : "#F7F7F8",
                      border: `1px solid ${ativa ? "#FFD4C4" : "transparent"}`,
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "10px",
                    }}
                  >
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      background: a.concluida ? "#10B981" : ativa ? "#FF5C2E" : "#E5E5E5",
                      color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: 800, flexShrink: 0,
                    }}>
                      {a.concluida ? "✓" : i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.titulo}</p>
                      <p style={{ fontSize: "10px", color: "#A3A3A3" }}>
                        {a.ao_vivo ? "🔴 Ao vivo" : a.video_url ? "▶ Vídeo" : "Sem mídia"}
                      </p>
                    </div>
                    {ehInstrutor && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeletarAula(a); }}
                        style={{ background: "none", border: "none", color: "#A3A3A3", fontSize: "12px", cursor: "pointer" }}
                      >✕</button>
                    )}
                  </div>
                );
              });
              })()}
            </div>
          </div>
        </aside>
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "24px", maxWidth: "460px", width: "100%", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111111" }}>Nova aula</h2>
            <input placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)}
              style={{ width: "100%", height: "44px", border: "1.5px solid #E5E5E5", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }} />
            <textarea placeholder="Descrição (opcional)" value={descricaoAula} onChange={(e) => setDescricaoAula(e.target.value)} rows={3}
              style={{ width: "100%", border: "1.5px solid #E5E5E5", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", resize: "none" }} />

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#111111" }}>
              <input type="checkbox" checked={aoVivo} onChange={(e) => setAoVivo(e.target.checked)} />
              Aula ao vivo
            </label>

            {aoVivo ? (
              <>
                <input type="datetime-local" value={agendado} onChange={(e) => setAgendado(e.target.value)}
                  style={{ width: "100%", height: "44px", border: "1.5px solid #E5E5E5", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }} />
                <input placeholder="Link da live (Zoom, Meet, YouTube...)" value={linkAoVivo} onChange={(e) => setLinkAoVivo(e.target.value)}
                  style={{ width: "100%", height: "44px", border: "1.5px solid #E5E5E5", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }} />
              </>
            ) : (
              <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                style={{ fontSize: "12px", fontFamily: "Inter, sans-serif" }} />
            )}

            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
              <button onClick={() => setModal(false)} style={{ flex: 1, height: "42px", background: "#F5F5F5", color: "#525252", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Cancelar</button>
              <button onClick={salvarAula} disabled={!titulo.trim() || salvando}
                style={{ flex: 1, height: "42px", background: titulo.trim() && !salvando ? "#111111" : "#E5E5E5", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: titulo.trim() && !salvando ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif" }}>
                {salvando ? "Salvando..." : "Criar aula"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
