"use client";

import { useState, useEffect, useCallback } from "react";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { minhasTransacoes, saldoAtual, criarTransacao, type Transacao } from "@/lib/queries";
import { createClient } from "@/lib/supabase";

interface Morador {
  id: string;
  nome: string;
  cidade: string | null;
  urban_score: number;
}

export default function UrbanPay() {
  const [tela, setTela] = useState<"home" | "enviar" | "confirmar" | "sucesso">("home");
  const [historico, setHistorico] = useState<Transacao[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [contatoSelecionado, setContatoSelecionado] = useState<Morador | null>(null);
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [processando, setProcessando] = useState(false);
  const [meuId, setMeuId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setMeuId(user.id);
    const [h, s, m] = await Promise.all([
      minhasTransacoes(),
      saldoAtual(),
      supabase.from("perfis").select("id, nome, cidade, urban_score").neq("id", user.id).limit(30),
    ]);
    setHistorico(h);
    setSaldo(s);
    setMoradores((m.data as Morador[]) ?? []);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const taxaUrban = contatoSelecionado && valor ? (parseFloat(valor) * 0.1).toFixed(2) : "0.00";
  const valorLiquido = contatoSelecionado && valor ? (parseFloat(valor) * 0.9).toFixed(2) : "0.00";

  async function handleConfirmar() {
    if (!contatoSelecionado || !valor || !descricao) return;
    setProcessando(true);
    try {
      await criarTransacao(contatoSelecionado.id, parseFloat(valor), descricao);
      await carregar();
      setTela("sucesso");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
            <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Urban Pay</span>
          </a>
          <BotaoConvite variant="ghost" />
        </div>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 24px 80px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {tela === "home" && (
          <>
            <div style={{ background: "#111111", borderRadius: "24px", padding: "32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 30%, rgba(255,92,46,0.2) 0%, transparent 55%)" }} />
              <div style={{ position: "relative" }}>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Saldo disponível</p>
                <p style={{ fontSize: "40px", fontWeight: 800, color: "#FFFFFF", marginTop: "8px" }}>
                  R$ {saldo.toFixed(2).replace(".", ",")}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>Urban Pay · urbanicsa.com</p>
                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                  <button onClick={() => setTela("enviar")} className="um-btn-accent" style={{ flex: 1, height: "44px", fontSize: "14px" }}>
                    Enviar pagamento
                  </button>
                </div>
              </div>
            </div>

            <div style={{ background: "#FFF3EF", borderRadius: "14px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid rgba(255,92,46,0.15)" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF5C2E" }} />
              <p style={{ fontSize: "13px", color: "#525252", lineHeight: 1.5 }}>
                <strong style={{ color: "#111111" }}>Urban ganha apenas quando você ganha.</strong> Taxa de 10% em transações concluídas.
              </p>
            </div>

            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Histórico</h3>
              {historico.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#A3A3A3", textAlign: "center", padding: "20px" }}>
                  Nenhuma transação ainda. Faça seu primeiro pagamento!
                </p>
              ) : historico.map((t) => {
                const recebida = t.vendedor_id === meuId;
                const contraparte = recebida ? t.comprador?.nome : t.vendedor?.nome;
                return (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #F5F5F5" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: recebida ? "#F0FDF4" : "#FFF3EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                      {recebida ? "↓" : "↑"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{t.descricao ?? "Pagamento"}</p>
                      <p style={{ fontSize: "12px", color: "#A3A3A3" }}>{contraparte ?? "Morador"} · {new Date(t.criado_em).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "14px", fontWeight: 800, color: recebida ? "#10B981" : "#111111" }}>
                        {recebida ? "+" : "-"}R$ {recebida ? Number(t.valor_liquido).toFixed(2) : Number(t.valor).toFixed(2)}
                      </p>
                      {recebida && (
                        <p style={{ fontSize: "10px", color: "#A3A3A3" }}>taxa: R$ {Number(t.taxa_urban).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tela === "enviar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => setTela("home")} className="um-icon-btn" aria-label="Voltar">←</button>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>Enviar pagamento</h2>
            </div>

            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Para quem?</p>
              {moradores.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#A3A3A3", textAlign: "center", padding: "20px" }}>
                  Ainda não há outros moradores. Convide alguém para a cidade!
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {moradores.map((c) => (
                    <button key={c.id} onClick={() => setContatoSelecionado(c)} style={{
                      display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px",
                      border: `1.5px solid ${contatoSelecionado?.id === c.id ? "#111111" : "#F5F5F5"}`,
                      background: contatoSelecionado?.id === c.id ? "#F7F7F8" : "#FFFFFF",
                      cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left",
                    }}>
                      <Avatar name={c.nome} size={40} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{c.nome}</p>
                        <p style={{ fontSize: "12px", color: "#A3A3A3" }}>{c.cidade ?? ""}</p>
                      </div>
                      <ScoreBadge score={c.urban_score} compact />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {contatoSelecionado && (
              <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <input type="number" placeholder="Valor (R$)" value={valor} onChange={(e) => setValor(e.target.value)}
                  style={{ width: "100%", height: "52px", border: `1.5px solid ${valor ? "#111111" : "#E5E5E5"}`, borderRadius: "14px", padding: "0 16px", fontSize: "24px", fontWeight: 800, color: "#111111", outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
                <input type="text" placeholder="Descrição: Ex: produto, serviço..." value={descricao} onChange={(e) => setDescricao(e.target.value)}
                  style={{ width: "100%", height: "52px", border: `1.5px solid ${descricao ? "#111111" : "#E5E5E5"}`, borderRadius: "14px", padding: "0 16px", fontSize: "15px", color: "#111111", outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />

                {valor && parseFloat(valor) > 0 && (
                  <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: "#525252" }}>Valor</span>
                      <span style={{ fontSize: "13px", fontWeight: 700 }}>R$ {parseFloat(valor).toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: "#A3A3A3" }}>Taxa Urban (10%)</span>
                      <span style={{ fontSize: "13px", color: "#FF5C2E" }}>− R$ {taxaUrban}</span>
                    </div>
                    <div style={{ borderTop: "1px solid #E5E5E5", paddingTop: "6px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700 }}>{contatoSelecionado.nome} recebe</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#10B981" }}>R$ {valorLiquido}</span>
                    </div>
                  </div>
                )}

                <button onClick={handleConfirmar} disabled={!valor || !descricao || processando}
                  className="um-btn-accent"
                  style={{ width: "100%", height: "52px", fontSize: "15px" }}>
                  {processando ? "Processando..." : "Confirmar pagamento →"}
                </button>
              </div>
            )}
          </div>
        )}

        {tela === "sucesso" && contatoSelecionado && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", paddingTop: "48px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>✓</div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#111111" }}>Pagamento enviado!</h2>
              <p style={{ fontSize: "14px", color: "#6B6B6B", marginTop: "8px" }}>
                <strong>R$ {valorLiquido}</strong> chegou para {contatoSelecionado.nome}.<br />
                Urban recebeu R$ {taxaUrban} de taxa.
              </p>
            </div>
            <button onClick={() => { setTela("home"); setValor(""); setDescricao(""); setContatoSelecionado(null); }}
              className="um-btn-primary"
              style={{ height: "52px", padding: "0 32px", fontSize: "15px" }}>
              Voltar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
