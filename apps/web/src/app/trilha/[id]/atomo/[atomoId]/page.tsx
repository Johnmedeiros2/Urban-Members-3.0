"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { buscarAtomo, buscarAtomos, buscarExercicios, registrarTentativa, type Atomo, type Exercicio } from "@/lib/queries";

export default function AtomoPage() {
  const params = useParams();
  const trilhaId = params.id as string;
  const atomoId = params.atomoId as string;

  const [atomo, setAtomo] = useState<Atomo | null>(null);
  const [todosAtomos, setTodosAtomos] = useState<Atomo[]>([]);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [exerIdx, setExerIdx] = useState(0);
  const [resposta, setResposta] = useState<string | null>(null);
  const [respondido, setRespondido] = useState(false);
  const [acertou, setAcertou] = useState(false);

  const carregar = useCallback(async () => {
    if (!atomoId) return;
    setCarregando(true);
    const [a, ex, todos] = await Promise.all([
      buscarAtomo(atomoId),
      buscarExercicios(atomoId),
      buscarAtomos(trilhaId),
    ]);
    setAtomo(a);
    setExercicios(ex);
    setTodosAtomos(todos);
    setExerIdx(0);
    setResposta(null);
    setRespondido(false);
    setCarregando(false);
  }, [atomoId, trilhaId]);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleResponder() {
    if (!resposta || respondido) return;
    const ex = exercicios[exerIdx];
    const correta = ex.alternativas?.find((a) => a.correta);
    const certo = correta?.texto === resposta;
    setAcertou(certo);
    setRespondido(true);
    try {
      await registrarTentativa(ex.id, certo, resposta, atomoId);
    } catch (e) { console.error(e); }
  }

  function proximoExercicio() {
    if (exerIdx + 1 < exercicios.length) {
      setExerIdx(exerIdx + 1);
      setResposta(null);
      setRespondido(false);
    }
  }

  if (carregando) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#A3A3A3" }}>Carregando...</div>;
  if (!atomo) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>Tópico não encontrado</div>;

  const idxAtual = todosAtomos.findIndex((a) => a.id === atomoId);
  const proximoAtomo = idxAtual >= 0 ? todosAtomos[idxAtual + 1] : null;
  const exAtual = exercicios[exerIdx];
  const todosExerciciosFeitos = exerIdx >= exercicios.length - 1 && respondido;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href={`/trilha/${trilhaId}`} style={{ textDecoration: "none" }}>
              <button className="um-icon-btn" aria-label="Voltar">←</button>
            </a>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>{atomo.titulo}</span>
          </div>
          <BotaoConvite variant="ghost" />
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 80px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Vídeo / aula */}
        <div style={{ background: "#000000", borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9" }}>
          {atomo.video_url ? (
            <video src={atomo.video_url} controls playsInline preload="metadata" controlsList="nodownload" onContextMenu={(e) => e.preventDefault()}
              style={{ width: "100%", height: "100%", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", padding: "24px", textAlign: "center", gap: "10px" }}>
              <span style={{ fontSize: "44px" }}>🎬</span>
              <p style={{ fontSize: "14px" }}>Vídeo do avatar IA será publicado em breve</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Equipe pedagógica em produção</p>
            </div>
          )}
        </div>

        {/* Resumo da aula */}
        <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px 28px", border: "1px solid rgba(0,0,0,0.05)" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em", marginBottom: "10px" }}>{atomo.titulo}</h1>
          {atomo.descricao && <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6 }}>{atomo.descricao}</p>}
          {atomo.resumo_md && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #F5F5F5" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Resumo</p>
              <p style={{ fontSize: "13px", color: "#111111", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{atomo.resumo_md}</p>
            </div>
          )}
        </div>

        {/* Exercícios */}
        {exercicios.length > 0 && (
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px 28px", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#111111" }}>Pratique ({exerIdx + 1}/{exercicios.length})</h2>
              <span style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600 }}>Dificuldade: {"●".repeat(exAtual.dificuldade)}{"○".repeat(5 - exAtual.dificuldade)}</span>
            </div>

            <p style={{ fontSize: "15px", color: "#111111", lineHeight: 1.6, marginBottom: "16px" }}>{exAtual.enunciado}</p>

            {exAtual.alternativas && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {exAtual.alternativas.map((alt, i) => {
                  const escolhida = resposta === alt.texto;
                  const mostrarCerta = respondido && alt.correta;
                  const mostrarErrada = respondido && escolhida && !alt.correta;
                  return (
                    <button key={i}
                      onClick={() => !respondido && setResposta(alt.texto)}
                      disabled={respondido}
                      style={{
                        textAlign: "left", padding: "12px 16px",
                        background: mostrarCerta ? "#F0FDF4" : mostrarErrada ? "#FEF2F2" : escolhida ? "#FFF3EF" : "#F7F7F8",
                        border: `1.5px solid ${mostrarCerta ? "#10B981" : mostrarErrada ? "#EF4444" : escolhida ? "#FFD4C4" : "transparent"}`,
                        borderRadius: "12px", cursor: respondido ? "default" : "pointer",
                        fontSize: "14px", color: "#111111", fontFamily: "Inter, sans-serif",
                        transition: "all 0.15s",
                      }}>
                      {alt.texto}
                      {mostrarCerta && <span style={{ marginLeft: "10px", color: "#10B981", fontWeight: 700 }}>✓ Correta</span>}
                      {mostrarErrada && <span style={{ marginLeft: "10px", color: "#EF4444", fontWeight: 700 }}>✕</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {!respondido ? (
              <button onClick={handleResponder} disabled={!resposta}
                className="um-btn-primary"
                style={{ marginTop: "16px", height: "44px", padding: "0 22px", fontSize: "13px" }}>
                Responder
              </button>
            ) : (
              <div style={{ marginTop: "16px" }}>
                {acertou ? (
                  <p style={{ fontSize: "13px", color: "#10B981", fontWeight: 700, marginBottom: "12px" }}>🎉 Correto! +20% de domínio.</p>
                ) : (
                  <div style={{ background: "#FEF2F2", borderRadius: "10px", padding: "12px 14px", marginBottom: "12px" }}>
                    <p style={{ fontSize: "12px", color: "#EF4444", fontWeight: 700, marginBottom: "4px" }}>Não foi dessa vez.</p>
                    {exAtual.feedback_erro && <p style={{ fontSize: "13px", color: "#525252", lineHeight: 1.5 }}>{exAtual.feedback_erro}</p>}
                  </div>
                )}
                {todosExerciciosFeitos ? (
                  proximoAtomo ? (
                    <a href={`/trilha/${trilhaId}/atomo/${proximoAtomo.id}`} style={{ textDecoration: "none" }}>
                      <button className="um-btn-accent" style={{ height: "44px", padding: "0 22px", fontSize: "13px" }}>
                        Próximo tópico: {proximoAtomo.titulo} →
                      </button>
                    </a>
                  ) : (
                    <a href={`/trilha/${trilhaId}`} style={{ textDecoration: "none" }}>
                      <button style={{ height: "44px", padding: "0 22px", background: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                        ✓ Trilha concluída — voltar
                      </button>
                    </a>
                  )
                ) : (
                  <button onClick={proximoExercicio}
                    className="um-btn-primary"
                    style={{ height: "44px", padding: "0 22px", fontSize: "13px" }}>
                    Próximo exercício →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Placeholder Tutor IA */}
        <div style={{ background: "linear-gradient(135deg, #111111, #1F1F1F)", color: "#FFFFFF", borderRadius: "16px", padding: "24px 28px", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,92,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
            🤖
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "12px", color: "#FF5C2E", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tutor IA</p>
            <p style={{ fontSize: "14px", fontWeight: 700, marginTop: "2px" }}>Em construção</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>Em breve, pergunte qualquer coisa sobre este tópico e receba explicação personalizada.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
