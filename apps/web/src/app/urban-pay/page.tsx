"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";

const HISTORICO = [
  { id: 1, tipo: "recebido",  nome: "Juliana Ramos", desc: "Pack de Templates",    valor: 42.30,  data: "Hoje, 14h32",      status: "concluído" },
  { id: 2, tipo: "enviado",   nome: "Carlos Melo",   desc: "Mentoria 1h",          valor: 120.00, data: "Hoje, 10h15",      status: "concluído" },
  { id: 3, tipo: "recebido",  nome: "Pedro Santos",  desc: "Planilha Financeira",  valor: 26.10,  data: "Ontem, 18h44",     status: "concluído" },
  { id: 4, tipo: "enviado",   nome: "Ana Lima",      desc: "Identidade Visual",    valor: 342.00, data: "Ontem, 09h20",     status: "pendente"  },
  { id: 5, tipo: "recebido",  nome: "Rafael Torres", desc: "E-book WhatsApp",      valor: 17.10,  data: "22 abr, 15h00",    status: "concluído" },
];

const CONTATOS = [
  { nome: "Juliana Ramos", cidade: "BH",        score: 850 },
  { nome: "Carlos Melo",   cidade: "Fortaleza", score: 450 },
  { nome: "Pedro Santos",  cidade: "Recife",    score: 430 },
  { nome: "Ana Lima",      cidade: "São Paulo", score: 120 },
];

export default function UrbanPay() {
  const [tela, setTela] = useState<"home" | "enviar" | "confirmar" | "sucesso">("home");
  const [destinatario, setDestinatario] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [contatoSelecionado, setContatoSelecionado] = useState<typeof CONTATOS[0] | null>(null);

  const taxaUrban = contatoSelecionado ? ((parseFloat(valor) || 0) * 0.1).toFixed(2) : "0.00";
  const valorLiquido = contatoSelecionado ? ((parseFloat(valor) || 0) * 0.9).toFixed(2) : "0.00";
  const saldo = 284.50;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
            <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111" }}>Urban Pay</span>
          </div>
          <ScoreBadge score={320} compact />
        </div>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 24px 80px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ── TELA HOME ── */}
        {tela === "home" && (
          <>
            {/* Card de saldo */}
            <div style={{
              background: "#111111", borderRadius: "24px", padding: "32px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 30%, rgba(255,92,46,0.2) 0%, transparent 55%)" }} />
              <div style={{ position: "relative" }}>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Saldo disponível
                </p>
                <p style={{ fontSize: "40px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.04em", marginTop: "8px" }}>
                  R$ {saldo.toFixed(2).replace(".", ",")}
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                  Urban Pay · urbanicsa.com
                </p>

                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                  <button onClick={() => setTela("enviar")} style={{
                    flex: 1, height: "44px", background: "#FF5C2E", color: "#FFFFFF",
                    border: "none", borderRadius: "999px", fontSize: "14px", fontWeight: 700,
                    cursor: "pointer", fontFamily: "Inter, sans-serif",
                  }}>
                    Enviar
                  </button>
                  <button style={{
                    flex: 1, height: "44px", background: "rgba(255,255,255,0.1)", color: "#FFFFFF",
                    border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: "999px",
                    fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif",
                  }}>
                    Receber
                  </button>
                </div>
              </div>
            </div>

            {/* Aviso de modelo de receita */}
            <div style={{
              background: "#FFF3EF", borderRadius: "14px", padding: "14px 18px",
              display: "flex", alignItems: "center", gap: "10px",
              border: "1px solid rgba(255,92,46,0.15)",
            }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF5C2E", flexShrink: 0 }} />
              <p style={{ fontSize: "13px", color: "#525252", lineHeight: 1.5 }}>
                <strong style={{ color: "#111111" }}>Urban ganha apenas quando você ganha.</strong>{" "}
                Taxa de 10% somente em transações concluídas.
              </p>
            </div>

            {/* Histórico */}
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>
                Histórico
              </h3>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {HISTORICO.map((t) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #F5F5F5" }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: t.tipo === "recebido" ? "#F0FDF4" : "#FFF3EF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px", flexShrink: 0,
                    }}>
                      {t.tipo === "recebido" ? "↓" : "↑"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{t.desc}</p>
                      <p style={{ fontSize: "12px", color: "#A3A3A3" }}>{t.nome} · {t.data}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{
                        fontSize: "14px", fontWeight: 800, letterSpacing: "-0.02em",
                        color: t.tipo === "recebido" ? "#10B981" : "#111111",
                      }}>
                        {t.tipo === "recebido" ? "+" : "-"}R$ {t.valor.toFixed(2).replace(".", ",")}
                      </p>
                      <p style={{ fontSize: "11px", color: t.status === "pendente" ? "#F59E0B" : "#A3A3A3", fontWeight: 600 }}>
                        {t.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── TELA ENVIAR ── */}
        {tela === "enviar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => setTela("home")} style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#F5F5F5", border: "none", cursor: "pointer", fontSize: "16px" }}>←</button>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em" }}>Enviar pagamento</h2>
            </div>

            {/* Selecionar contato */}
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                Para quem?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {CONTATOS.map((c) => (
                  <button key={c.nome} onClick={() => setContatoSelecionado(c)} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px", borderRadius: "12px",
                    border: `1.5px solid ${contatoSelecionado?.nome === c.nome ? "#111111" : "#F5F5F5"}`,
                    background: contatoSelecionado?.nome === c.nome ? "#F7F7F8" : "#FFFFFF",
                    cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left",
                  }}>
                    <Avatar name={c.nome} size={40} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111" }}>{c.nome}</p>
                      <p style={{ fontSize: "12px", color: "#A3A3A3" }}>{c.cidade}</p>
                    </div>
                    <ScoreBadge score={c.score} compact />
                  </button>
                ))}
              </div>
            </div>

            {/* Valor e descrição */}
            {contatoSelecionado && (
              <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>Valor (R$)</label>
                  <input type="number" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)}
                    style={{ width: "100%", height: "52px", border: `1.5px solid ${valor ? "#111111" : "#E5E5E5"}`, borderRadius: "14px", padding: "0 16px", fontSize: "24px", fontWeight: 800, color: "#111111", outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>Descrição</label>
                  <input type="text" placeholder="Ex: Mentoria, produto, serviço..." value={descricao} onChange={(e) => setDescricao(e.target.value)}
                    style={{ width: "100%", height: "52px", border: `1.5px solid ${descricao ? "#111111" : "#E5E5E5"}`, borderRadius: "14px", padding: "0 16px", fontSize: "15px", color: "#111111", outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box" }} />
                </div>

                {/* Simulação da taxa */}
                {valor && parseFloat(valor) > 0 && (
                  <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: "#525252" }}>Valor enviado</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>R$ {parseFloat(valor).toFixed(2)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: "#A3A3A3" }}>Taxa Urban (10%)</span>
                      <span style={{ fontSize: "13px", color: "#FF5C2E" }}>− R$ {taxaUrban}</span>
                    </div>
                    <div style={{ borderTop: "1px solid #E5E5E5", paddingTop: "6px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{contatoSelecionado.nome} recebe</span>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#10B981" }}>R$ {valorLiquido}</span>
                    </div>
                  </div>
                )}

                <button onClick={() => valor && descricao && setTela("confirmar")} disabled={!valor || !descricao}
                  style={{ width: "100%", height: "52px", background: valor && descricao ? "#111111" : "#E5E5E5", color: valor && descricao ? "#FFFFFF" : "#A3A3A3", border: "none", borderRadius: "999px", fontSize: "15px", fontWeight: 700, cursor: valor && descricao ? "pointer" : "not-allowed", fontFamily: "Inter, sans-serif" }}>
                  Revisar pagamento →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TELA CONFIRMAR ── */}
        {tela === "confirmar" && contatoSelecionado && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={() => setTela("enviar")} style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#F5F5F5", border: "none", cursor: "pointer", fontSize: "16px" }}>←</button>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>Confirmar pagamento</h2>
            </div>

            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ textAlign: "center" }}>
                <Avatar name={contatoSelecionado.nome} size={64} />
                <p style={{ fontSize: "18px", fontWeight: 800, color: "#111111", marginTop: "12px" }}>{contatoSelecionado.nome}</p>
                <p style={{ fontSize: "13px", color: "#A3A3A3" }}>{contatoSelecionado.cidade}</p>
              </div>
              <div style={{ background: "#F7F7F8", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "#525252" }}>Descrição</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{descricao}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "#525252" }}>Valor total</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>R$ {parseFloat(valor).toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "#A3A3A3" }}>Taxa Urban (10%)</span>
                  <span style={{ fontSize: "13px", color: "#FF5C2E" }}>− R$ {taxaUrban}</span>
                </div>
                <div style={{ borderTop: "1px solid #E5E5E5", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{contatoSelecionado.nome} recebe</span>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "#10B981" }}>R$ {valorLiquido}</span>
                </div>
              </div>
              <button onClick={() => setTela("sucesso")} style={{ width: "100%", height: "52px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                Confirmar e pagar →
              </button>
            </div>
          </div>
        )}

        {/* ── TELA SUCESSO ── */}
        {tela === "sucesso" && contatoSelecionado && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", paddingTop: "48px" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>
              ✓
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Pagamento enviado!</h2>
              <p style={{ fontSize: "14px", color: "#6B6B6B", marginTop: "8px", lineHeight: 1.6 }}>
                <strong style={{ color: "#111111" }}>R$ {valorLiquido}</strong> chegou para {contatoSelecionado.nome}.<br />
                Urban recebeu R$ {taxaUrban} de taxa.
              </p>
            </div>
            <button onClick={() => { setTela("home"); setValor(""); setDescricao(""); setContatoSelecionado(null); }}
              style={{ height: "52px", padding: "0 32px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Voltar para Urban Pay
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
