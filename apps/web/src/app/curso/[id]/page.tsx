"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { buscarCurso, buscarAulas, criarAula, marcarAulaConcluida, deletarAula, matricularCurso, buscarMateriais, adicionarMaterial, deletarMaterial, atualizarCurso, deletarCurso, ehModerador, removerCursoPorModeracao, type Aula, type Material } from "@/lib/queries";
import { createClient } from "@/lib/supabase";
import ConteudoRemovido from "@/components/ui/ConteudoRemovido";
import ModalMotivoRemocao from "@/components/ui/ModalMotivoRemocao";

interface CursoInfo {
  id: string;
  instrutor_id: string;
  titulo: string;
  descricao: string | null;
  nivel: string;
  preco: number;
  total_alunos: number;
  apagado_em: string | null;
  apagado_por: string | null;
  motivo_remocao: string | null;
  instrutor: { id: string; nome: string; cidade: string | null; urban_score: number; foto_url: string | null } | null;
  removido_por?: { nome: string } | null;
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
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [modalMaterial, setModalMaterial] = useState(false);
  const [mTitulo, setMTitulo] = useState("");
  const [mDescricao, setMDescricao] = useState("");
  const [mAulaId, setMAulaId] = useState<string | null>(null);
  const [mArquivo, setMArquivo] = useState<File | null>(null);
  const [mSalvando, setMSalvando] = useState(false);

  const [modal, setModal] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricaoAula, setDescricaoAula] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [aoVivo, setAoVivo] = useState(false);
  const [agendado, setAgendado] = useState("");
  const [linkAoVivo, setLinkAoVivo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [modalEditar, setModalEditar] = useState(false);
  const [eTitulo, setETitulo] = useState("");
  const [eDescricao, setEDescricao] = useState("");
  const [eNivel, setENivel] = useState("Iniciante");
  const [ePreco, setEPreco] = useState("");
  const [eSalvando, setESalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const [souFiscal, setSouFiscal] = useState(false);
  const [modalRemocaoMod, setModalRemocaoMod] = useState(false);

  const carregar = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    const supabase = createClient();
    const [c, a, m, userData, fiscal] = await Promise.all([
      buscarCurso(id),
      buscarAulas(id),
      buscarMateriais(id),
      supabase.auth.getUser(),
      ehModerador(),
    ]);
    setSouFiscal(fiscal);
    setMateriais(m);
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

  async function handleSalvarMaterial() {
    if (!mTitulo.trim() || !mArquivo) return;
    setMSalvando(true);
    try {
      await adicionarMaterial({
        curso_id: id,
        aula_id: mAulaId ?? null,
        titulo: mTitulo,
        descricao: mDescricao,
        arquivo: mArquivo,
      });
      setMTitulo(""); setMDescricao(""); setMAulaId(null); setMArquivo(null);
      setModalMaterial(false);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setMSalvando(false);
    }
  }

  async function handleDeletarMaterial(mat: Material) {
    if (!confirm(`Apagar o material "${mat.titulo}"?`)) return;
    try {
      await deletarMaterial(mat.id);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  function abrirEdicao() {
    if (!curso) return;
    setETitulo(curso.titulo);
    setEDescricao(curso.descricao ?? "");
    setENivel(curso.nivel);
    setEPreco(String(curso.preco ?? ""));
    setModalEditar(true);
  }

  async function handleSalvarEdicao() {
    if (!eTitulo.trim()) return;
    setESalvando(true);
    try {
      await atualizarCurso(id, {
        titulo: eTitulo.trim(),
        descricao: eDescricao.trim(),
        nivel: eNivel,
        preco: parseFloat(ePreco) || 0,
      });
      setModalEditar(false);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setESalvando(false);
    }
  }

  async function handleExcluirCurso() {
    if (!curso) return;
    const ok = confirm(
      `Excluir o curso "${curso.titulo}"?\n\nIsso apaga também todas as aulas, materiais, avaliações e matrículas. Essa ação não pode ser desfeita.`,
    );
    if (!ok) return;
    setExcluindo(true);
    try {
      await deletarCurso(id);
      window.location.href = "/sala-de-aula";
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao excluir");
      setExcluindo(false);
    }
  }

  async function confirmarRemocaoModeracao(motivo: string) {
    try {
      await removerCursoPorModeracao(id, motivo);
      setModalRemocaoMod(false);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao remover");
    }
  }

  function formatarTamanho(bytes: number | null): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  if (carregando) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#A3A3A3" }}>Carregando curso...</div>;
  if (!curso) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>Curso não encontrado</div>;

  const ehInstrutor = meuId === curso.instrutor_id;
  const foiRemovido = !!curso.apagado_em;
  const podeFiscalizar = souFiscal && !ehInstrutor && !foiRemovido;
  const cursoGratis = Number(curso.preco) === 0;
  const temAcesso = ehInstrutor || matriculado || cursoGratis;
  const concluidas = aulas.filter((a) => a.concluida).length;
  const percentual = aulas.length > 0 ? Math.round((concluidas / aulas.length) * 100) : 0;

  if (foiRemovido) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif", padding: "60px 24px", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        <div style={{ maxWidth: "560px", width: "100%" }}>
          <a href="/sala-de-aula" style={{ fontSize: "13px", color: "#A3A3A3", textDecoration: "none", display: "inline-block", marginBottom: "16px" }}>← Voltar para Sala de Aula</a>
          <ConteudoRemovido motivo={curso.motivo_remocao} removidoPor={curso.removido_por?.nome ?? null} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/sala-de-aula" style={{ textDecoration: "none" }}>
              <button className="um-icon-btn" aria-label="Voltar">←</button>
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
              <>
                <button onClick={() => setModal(true)} className="um-btn-accent" style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}>
                  + Nova aula
                </button>
                <button onClick={() => setModalMaterial(true)} className="um-btn-secondary" style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}>
                  + Material
                </button>
                <button onClick={abrirEdicao} className="um-btn-ghost" style={{ height: "36px", padding: "0 14px", fontSize: "13px" }}>
                  Editar
                </button>
                <button
                  onClick={handleExcluirCurso}
                  disabled={excluindo}
                  className="um-btn-ghost"
                  style={{ height: "36px", padding: "0 14px", fontSize: "13px", color: "#DC2626" }}
                >
                  {excluindo ? "Excluindo..." : "Excluir"}
                </button>
              </>
            )}
            {podeFiscalizar && (
              <button
                onClick={() => setModalRemocaoMod(true)}
                className="um-btn-ghost"
                title="Remover (moderação)"
                style={{ height: "36px", padding: "0 12px", fontSize: "16px", color: "#525252" }}
              >
                🛡
              </button>
            )}
            <BotaoConvite variant="ghost" />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 80px", display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>

        {/* Player + Info */}
        <div>
          <div style={{ background: "#000000", borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9", marginBottom: "20px", position: "relative" }}>
            {!temAcesso ? (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#FFFFFF", textAlign: "center", padding: "32px", gap: "14px", background: "linear-gradient(135deg, #111111, #1F1F1F)" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(255,92,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF5C2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#FF5C2E", letterSpacing: "0.1em", textTransform: "uppercase" }}>Conteúdo exclusivo</p>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, marginTop: "8px", letterSpacing: "-0.02em" }}>Matricule-se para assistir</h2>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "6px", lineHeight: 1.5, maxWidth: "360px" }}>
                    Este curso tem {aulas.length} {aulas.length === 1 ? "aula disponível" : "aulas disponíveis"} para alunos matriculados.
                  </p>
                </div>
                <button onClick={handleMatricular}
                  className="um-btn-accent"
                  style={{ marginTop: "8px", height: "46px", padding: "0 28px", fontSize: "14px" }}>
                  {cursoGratis ? "Matricular grátis" : `Matricular por R$ ${Number(curso.preco).toFixed(2).replace(".", ",")}`}
                </button>
              </div>
            ) : aulaAtual?.video_url ? (
              <video
                key={aulaAtual.id}
                src={aulaAtual.video_url}
                controls playsInline preload="metadata"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
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
                    <button className="um-btn-accent" style={{ height: "42px", padding: "0 24px", fontSize: "13px" }}>
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

          {aulaAtual && temAcesso && (
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>{aulaAtual.titulo}</h1>
              {aulaAtual.descricao && (
                <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6, marginTop: "10px", whiteSpace: "pre-wrap" }}>{aulaAtual.descricao}</p>
              )}
              {!aulaAtual.concluida && matriculado && aulaAtual.video_url && (
                <button onClick={() => handleConcluida(aulaAtual)}
                  className="um-btn-secondary"
                  style={{ marginTop: "14px", height: "36px", padding: "0 16px", fontSize: "12px" }}>
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
              <button onClick={handleMatricular} className="um-btn-primary" style={{ marginTop: "16px", height: "44px", padding: "0 24px", fontSize: "13px" }}>
                {Number(curso.preco) === 0 ? "Matricular grátis" : `Matricular por R$ ${Number(curso.preco).toFixed(2)}`}
              </button>
            )}
          </div>

          {/* Materiais de apoio */}
          <div style={{ marginTop: "20px", background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#111111" }}>📎 Materiais de apoio</h3>
              {ehInstrutor && (
                <button onClick={() => setModalMaterial(true)}
                  className="um-btn-primary"
                  style={{ height: "30px", padding: "0 12px", fontSize: "11px" }}>
                  + Adicionar
                </button>
              )}
            </div>

            {materiais.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#A3A3A3", textAlign: "center", padding: "16px 0" }}>
                {ehInstrutor ? "Nenhum material ainda. Adicione PDFs, planilhas ou slides." : "O professor ainda não adicionou materiais."}
              </p>
            ) : !temAcesso ? (
              <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "22px" }}>🔒</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{materiais.length} {materiais.length === 1 ? "material disponível" : "materiais disponíveis"}</p>
                  <p style={{ fontSize: "11px", color: "#525252", marginTop: "2px" }}>Matricule-se para baixar os arquivos do curso.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {materiais.map((m) => {
                  const aulaVinculada = m.aula_id ? aulas.find((a) => a.id === m.aula_id) : null;
                  return (
                    <div key={m.id} style={{ background: "#F7F7F8", borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#FFF3EF", color: "#FF5C2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, flexShrink: 0 }}>
                        {m.tipo ?? "FILE"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.titulo}</p>
                        {m.descricao && <p style={{ fontSize: "12px", color: "#525252", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.descricao}</p>}
                        <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "3px" }}>
                          {aulaVinculada ? `Aula: ${aulaVinculada.titulo} · ` : ""}
                          {m.nome_arquivo}
                          {m.tamanho_bytes ? ` · ${formatarTamanho(m.tamanho_bytes)}` : ""}
                        </p>
                      </div>
                      <a href={m.arquivo_url} download={m.nome_arquivo} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                        <button className="um-btn-primary" style={{ height: "34px", padding: "0 14px", fontSize: "12px" }}>
                          Baixar
                        </button>
                      </a>
                      {ehInstrutor && (
                        <button onClick={() => handleDeletarMaterial(m)}
                          className="um-icon-btn"
                          aria-label="Apagar material">
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
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
                const bloqueada = !temAcesso;
                return (
                  <div key={a.id}
                    onClick={() => { if (bloqueada) { handleMatricular(); return; } setAulaAtual(a); }}
                    style={{
                      padding: "10px 12px", borderRadius: "10px",
                      background: ativa ? "#FFF3EF" : "#F7F7F8",
                      border: `1px solid ${ativa ? "#FFD4C4" : "transparent"}`,
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "10px",
                      opacity: bloqueada ? 0.7 : 1,
                    }}
                  >
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      background: bloqueada ? "#A3A3A3" : a.concluida ? "#10B981" : ativa ? "#FF5C2E" : "#E5E5E5",
                      color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: 800, flexShrink: 0,
                    }}>
                      {bloqueada ? "🔒" : a.concluida ? "✓" : i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.titulo}</p>
                      <p style={{ fontSize: "10px", color: "#A3A3A3" }}>
                        {bloqueada ? "Exclusivo para matriculados" : a.ao_vivo ? "🔴 Ao vivo" : a.video_url ? "▶ Vídeo" : "Sem mídia"}
                      </p>
                    </div>
                    {ehInstrutor && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeletarAula(a); }}
                        className="um-icon-btn"
                        aria-label="Apagar aula"
                        style={{ width: "28px", height: "28px", fontSize: "12px" }}
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
              <button onClick={() => setModal(false)} className="um-btn-secondary" style={{ flex: 1, height: "42px", fontSize: "13px" }}>Cancelar</button>
              <button onClick={salvarAula} disabled={!titulo.trim() || salvando}
                className="um-btn-primary"
                style={{ flex: 1, height: "42px", fontSize: "13px" }}>
                {salvando ? "Salvando..." : "Criar aula"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMaterial && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "24px", maxWidth: "460px", width: "100%", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111111" }}>Adicionar material</h2>
            <p style={{ fontSize: "12px", color: "#A3A3A3" }}>PDF, Word, Excel, PowerPoint ou texto. Máximo 50 MB.</p>

            <input placeholder="Título do material" value={mTitulo} onChange={(e) => setMTitulo(e.target.value)}
              style={{ width: "100%", height: "44px", border: "1.5px solid #E5E5E5", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }} />

            <textarea placeholder="Descrição (opcional)" value={mDescricao} onChange={(e) => setMDescricao(e.target.value)} rows={2}
              style={{ width: "100%", border: "1.5px solid #E5E5E5", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", resize: "none" }} />

            <select value={mAulaId ?? ""} onChange={(e) => setMAulaId(e.target.value || null)}
              style={{ width: "100%", height: "44px", border: "1.5px solid #E5E5E5", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", background: "#FFFFFF" }}>
              <option value="">Material geral do curso</option>
              {aulas.map((a, i) => (
                <option key={a.id} value={a.id}>Vincular à aula #{i + 1} — {a.titulo}</option>
              ))}
            </select>

            <input type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/csv,text/plain"
              onChange={(e) => setMArquivo(e.target.files?.[0] ?? null)}
              style={{ fontSize: "12px", fontFamily: "Inter, sans-serif" }} />
            {mArquivo && (
              <p style={{ fontSize: "11px", color: "#525252" }}>
                {mArquivo.name} · {formatarTamanho(mArquivo.size)}
              </p>
            )}

            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
              <button onClick={() => { setModalMaterial(false); setMTitulo(""); setMDescricao(""); setMAulaId(null); setMArquivo(null); }}
                className="um-btn-secondary"
                style={{ flex: 1, height: "42px", fontSize: "13px" }}>
                Cancelar
              </button>
              <button onClick={handleSalvarMaterial} disabled={!mTitulo.trim() || !mArquivo || mSalvando}
                className="um-btn-primary"
                style={{ flex: 1, height: "42px", fontSize: "13px" }}>
                {mSalvando ? "Enviando..." : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEditar && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "100%", display: "flex", flexDirection: "column", gap: "14px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>Editar curso</h2>
            <input placeholder="Título" value={eTitulo} onChange={(e) => setETitulo(e.target.value)}
              style={{ width: "100%", height: "48px", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "0 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }} />
            <textarea placeholder="Descrição" value={eDescricao} onChange={(e) => setEDescricao(e.target.value)} rows={3}
              style={{ width: "100%", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "12px 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif", resize: "none" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <select value={eNivel} onChange={(e) => setENivel(e.target.value)}
                style={{ flex: 1, height: "48px", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "0 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }}>
                {["Iniciante", "Intermediário", "Avançado", "Todos"].map((n) => <option key={n}>{n}</option>)}
              </select>
              <input type="number" placeholder="Preço R$ (0 = grátis)" value={ePreco} onChange={(e) => setEPreco(e.target.value)}
                style={{ flex: 1, height: "48px", border: "1.5px solid #E5E5E5", borderRadius: "12px", padding: "0 14px", fontSize: "14px", outline: "none", fontFamily: "Inter, sans-serif" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setModalEditar(false)} className="um-btn-secondary" style={{ flex: 1, height: "44px", fontSize: "13px" }}>
                Cancelar
              </button>
              <button onClick={handleSalvarEdicao} disabled={!eTitulo.trim() || eSalvando} className="um-btn-primary" style={{ flex: 1, height: "44px", fontSize: "13px" }}>
                {eSalvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalMotivoRemocao
        aberto={modalRemocaoMod}
        titulo="Remover curso"
        onConfirmar={confirmarRemocaoModeracao}
        onCancelar={() => setModalRemocaoMod(false)}
      />
    </div>
  );
}
