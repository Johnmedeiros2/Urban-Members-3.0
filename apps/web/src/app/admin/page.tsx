"use client";

import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";

// ─── Dados mock — substituir por queries Supabase ───────────────────────────

const STATS = [
  { label: "Moradores",        value: "1.284",  delta: "+47 hoje",   cor: "#111111" },
  { label: "Lojistas ativos",  value: "312",    delta: "+8 hoje",    cor: "#FF5C2E" },
  { label: "Posts publicados", value: "8.941",  delta: "+203 hoje",  cor: "#111111" },
  { label: "Cursos ativos",    value: "94",     delta: "+3 hoje",    cor: "#111111" },
  { label: "Transações",       value: "2.107",  delta: "+31 hoje",   cor: "#10B981" },
  { label: "Receita Urban",    value: "R$ 4.2k",delta: "+R$ 312 hoje",cor: "#10B981" },
];

const SCORE_DIST = [
  { tier: "Starter",  count: 610,  cor: "#A3A3A3", pct: 47 },
  { tier: "Rising",   count: 389,  cor: "#FF8C5A", pct: 30 },
  { tier: "Urban",    count: 198,  cor: "#FF5C2E", pct: 15 },
  { tier: "Elite",    count: 71,   cor: "#F59E0B", pct: 6  },
  { tier: "Legend",   count: 16,   cor: "#A78BFA", pct: 2  },
];

const BAIRROS = [
  { nome: "Negócios",   membros: 487, posts: 2341, ativos: 89 },
  { nome: "Educação",   membros: 312, posts: 1204, ativos: 61 },
  { nome: "Arte",       membros: 298, posts: 987,  ativos: 54 },
  { nome: "Mercado",    membros: 271, posts: 743,  ativos: 48 },
  { nome: "Tecnologia", membros: 189, posts: 612,  ativos: 37 },
  { nome: "Sala de Aula",membros: 167,posts: 421,  ativos: 29 },
];

const USUARIOS_RECENTES = [
  { nome: "Ana Lima",      cidade: "São Paulo",  score: 120, status: "Ativo",    tipo: "Lojista",  cadastro: "há 2h"   },
  { nome: "Carlos Melo",   cidade: "Fortaleza",  score: 450, status: "Ativo",    tipo: "Professor", cadastro: "há 5h"  },
  { nome: "Juliana Ramos", cidade: "BH",         score: 850, status: "Ativo",    tipo: "Morador",  cadastro: "há 1d"  },
  { nome: "Pedro Santos",  cidade: "Recife",     score: 430, status: "Ativo",    tipo: "Lojista",  cadastro: "há 1d"  },
  { nome: "Mariana Costa", cidade: "Curitiba",   score: 210, status: "Inativo",  tipo: "Morador",  cadastro: "há 2d"  },
  { nome: "Rafael Torres", cidade: "Goiânia",    score: 175, status: "Ativo",    tipo: "Morador",  cadastro: "há 3d"  },
  { nome: "Beatriz Nunes", cidade: "Salvador",   score: 90,  status: "Pendente", tipo: "Morador",  cadastro: "há 4d"  },
  { nome: "Lucas Ferreira",cidade: "Manaus",     score: 30,  status: "Ativo",    tipo: "Morador",  cadastro: "há 5d"  },
];

const TRANSACOES = [
  { produto: "Pack de Templates",    vendedor: "Juliana Ramos", valor: 47,  taxa: 4.7,  status: "Concluída" },
  { produto: "Mentoria 1h",          vendedor: "Carlos Melo",   valor: 120, taxa: 12,   status: "Concluída" },
  { produto: "Identidade Visual",    vendedor: "Ana Lima",      valor: 380, taxa: 38,   status: "Pendente"  },
  { produto: "Planilha Financeira",  vendedor: "Pedro Santos",  valor: 29,  taxa: 2.9,  status: "Concluída" },
  { produto: "E-book WhatsApp",      vendedor: "Rafael Torres", valor: 19,  taxa: 1.9,  status: "Concluída" },
];

const ABAS = ["Visão Geral", "Moradores", "Bairros", "Transações", "Configurações"];

// ─── Componentes internos ────────────────────────────────────────────────────

function StatCard({ label, value, delta, cor }: typeof STATS[0]) {
  return (
    <div style={{
      background: "#FFFFFF", borderRadius: "16px",
      padding: "20px 24px",
      border: "1px solid rgba(0,0,0,0.06)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      display: "flex", flexDirection: "column", gap: "8px",
    }}>
      <p style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ fontSize: "28px", fontWeight: 800, color: cor, letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: "12px", color: "#10B981", fontWeight: 600 }}>{delta}</p>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "Ativo":    { bg: "#F0FDF4", color: "#16A34A" },
    "Inativo":  { bg: "#F5F5F5", color: "#A3A3A3" },
    "Pendente": { bg: "#FFF7ED", color: "#EA580C" },
    "Concluída":{ bg: "#F0FDF4", color: "#16A34A" },
  };
  const s = map[status] ?? { bg: "#F5F5F5", color: "#525252" };
  return (
    <span style={{
      fontSize: "11px", fontWeight: 700,
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: "999px",
    }}>{status}</span>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────

export default function Admin() {
  const [aba, setAba] = useState("Visão Geral");
  const [busca, setBusca] = useState("");

  const usuariosFiltrados = USUARIOS_RECENTES.filter((u) =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    u.cidade.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <header style={{
        background: "#111111", padding: "0 32px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.svg" alt="Urban Members" width={32} height={32} style={{ filter: "invert(1)" }} />
          <span style={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em" }}>
            Urban Members
          </span>
          <span style={{ fontSize: "12px", color: "#525252", margin: "0 4px" }}>/</span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#FF5C2E", background: "rgba(255,92,46,0.15)", padding: "2px 10px", borderRadius: "999px" }}>
            Admin
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: "#A3A3A3" }}>johnmedeiros30@gmail.com</span>
          <Avatar name="John Medeiros" size={32} />
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Título */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>
            Painel de Controle
          </h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "4px" }}>
            Visão completa da cidade — dados em tempo real
          </p>
        </div>

        {/* Abas */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "28px", borderBottom: "1px solid #E5E5E5", paddingBottom: "0" }}>
          {ABAS.map((a) => (
            <button key={a} onClick={() => setAba(a)} style={{
              padding: "10px 18px", border: "none", background: "transparent",
              fontSize: "13px", fontWeight: aba === a ? 700 : 400,
              color: aba === a ? "#111111" : "#A3A3A3",
              cursor: "pointer", fontFamily: "Inter, sans-serif",
              borderBottom: aba === a ? "2px solid #111111" : "2px solid transparent",
              marginBottom: "-1px", transition: "all 0.15s",
            }}>{a}</button>
          ))}
        </div>

        {/* ── ABA: VISÃO GERAL ── */}
        {aba === "Visão Geral" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {STATS.map((s) => <StatCard key={s.label} {...s} />)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

              {/* Distribuição Urban Score */}
              <div style={{
                background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>
                  Distribuição Urban Score
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {SCORE_DIST.map((s) => (
                    <div key={s.tier}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: s.cor }}>{s.tier}</span>
                        <span style={{ fontSize: "12px", color: "#A3A3A3" }}>{s.count} moradores ({s.pct}%)</span>
                      </div>
                      <div style={{ background: "#F5F5F5", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
                        <div style={{ width: `${s.pct}%`, height: "100%", background: s.cor, borderRadius: "999px", transition: "width 0.6s" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bairros */}
              <div style={{
                background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>
                  Atividade por Bairro
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {BAIRROS.map((b, i) => (
                    <div key={b.nome} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 700, width: "16px" }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{b.nome}</span>
                          <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 600 }}>{b.ativos} ativos</span>
                        </div>
                        <div style={{ display: "flex", gap: "12px", marginTop: "2px" }}>
                          <span style={{ fontSize: "11px", color: "#A3A3A3" }}>{b.membros} membros</span>
                          <span style={{ fontSize: "11px", color: "#A3A3A3" }}>{b.posts} posts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Últimas transações */}
            <div style={{
              background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>
                Últimas Transações
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F5F5F5" }}>
                    {["Produto", "Vendedor", "Valor", "Taxa Urban (10%)", "Status"].map((h) => (
                      <th key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#A3A3A3", textAlign: "left", padding: "8px 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TRANSACOES.map((t) => (
                    <tr key={t.produto} style={{ borderBottom: "1px solid #F5F5F5" }}>
                      <td style={{ padding: "12px", fontSize: "13px", fontWeight: 600, color: "#111111" }}>{t.produto}</td>
                      <td style={{ padding: "12px", fontSize: "13px", color: "#525252" }}>{t.vendedor}</td>
                      <td style={{ padding: "12px", fontSize: "13px", fontWeight: 700, color: "#111111" }}>R$ {t.valor}</td>
                      <td style={{ padding: "12px", fontSize: "13px", fontWeight: 700, color: "#10B981" }}>R$ {t.taxa.toFixed(2)}</td>
                      <td style={{ padding: "12px" }}><Badge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ABA: MORADORES ── */}
        {aba === "Moradores" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Busca + filtros */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Buscar por nome ou cidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{
                  flex: 1, height: "44px", border: "1px solid #E5E5E5",
                  borderRadius: "999px", padding: "0 18px",
                  fontSize: "14px", color: "#111111", outline: "none",
                  fontFamily: "Inter, sans-serif", background: "#FFFFFF",
                }}
              />
              <button style={{
                height: "44px", padding: "0 20px",
                background: "#111111", color: "#FFFFFF",
                border: "none", borderRadius: "999px",
                fontSize: "13px", fontWeight: 700,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}>
                Exportar CSV
              </button>
            </div>

            {/* Tabela */}
            <div style={{
              background: "#FFFFFF", borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #F5F5F5", background: "#FAFAFA" }}>
                    {["Morador", "Cidade", "Tipo", "Urban Score", "Status", "Cadastro"].map((h) => (
                      <th key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#A3A3A3", textAlign: "left", padding: "12px 16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.nome} style={{ borderBottom: "1px solid #F5F5F5", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Avatar name={u.nome} size={32} />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{u.nome}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#525252" }}>{u.cidade}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          fontSize: "11px", fontWeight: 600,
                          color: u.tipo === "Lojista" ? "#FF5C2E" : u.tipo === "Professor" ? "#6366F1" : "#525252",
                          background: u.tipo === "Lojista" ? "#FFF3EF" : u.tipo === "Professor" ? "#EEF2FF" : "#F5F5F5",
                          padding: "3px 10px", borderRadius: "999px",
                        }}>{u.tipo}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}><ScoreBadge score={u.score} compact /></td>
                      <td style={{ padding: "12px 16px" }}><Badge status={u.status} /></td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "#A3A3A3" }}>{u.cadastro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ABA: BAIRROS ── */}
        {aba === "Bairros" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {BAIRROS.map((b) => (
              <div key={b.nome} style={{
                background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex", flexDirection: "column", gap: "16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#111111" }}>{b.nome}</h3>
                  <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 700, background: "#F0FDF4", padding: "3px 10px", borderRadius: "999px" }}>
                    {b.ativos} ativos
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    { label: "Membros",  value: b.membros },
                    { label: "Posts",    value: b.posts   },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: "#F7F7F8", borderRadius: "10px", padding: "12px" }}>
                      <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>{stat.value}</p>
                      <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "2px" }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#F5F5F5", borderRadius: "999px", height: "4px", overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.round((b.membros / 487) * 100)}%`,
                    height: "100%", background: "#FF5C2E", borderRadius: "999px",
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ABA: TRANSAÇÕES ── */}
        {aba === "Transações" && (
          <div style={{
            background: "#FFFFFF", borderRadius: "16px",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F5F5F5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Todas as Transações</h3>
                <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "2px" }}>Taxa Urban: 10% por transação concluída</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#10B981", letterSpacing: "-0.03em" }}>R$ 59,50</p>
                <p style={{ fontSize: "11px", color: "#A3A3A3" }}>Total arrecadado (amostra)</p>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAFAFA" }}>
                  {["Produto", "Vendedor", "Valor total", "Taxa Urban (10%)", "Status"].map((h) => (
                    <th key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#A3A3A3", textAlign: "left", padding: "12px 16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRANSACOES.map((t) => (
                  <tr key={t.produto} style={{ borderBottom: "1px solid #F5F5F5" }}>
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600, color: "#111111" }}>{t.produto}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#525252" }}>{t.vendedor}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 700, color: "#111111" }}>R$ {t.valor}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 800, color: "#10B981" }}>R$ {t.taxa.toFixed(2)}</td>
                    <td style={{ padding: "14px 16px" }}><Badge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ABA: CONFIGURAÇÕES ── */}
        {aba === "Configurações" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px" }}>
            {[
              { titulo: "Manutenção", desc: "Colocar a plataforma em modo manutenção", ativo: false },
              { titulo: "Novos cadastros", desc: "Permitir novos moradores na cidade", ativo: true },
              { titulo: "Mercado Urbano", desc: "Habilitar compra e venda na plataforma", ativo: true },
              { titulo: "Sala de Aula", desc: "Habilitar cursos e aulas ao vivo", ativo: true },
              { titulo: "Urban Pay", desc: "Habilitar pagamentos entre moradores", ativo: false },
            ].map((cfg) => (
              <div key={cfg.titulo} style={{
                background: "#FFFFFF", borderRadius: "14px", padding: "16px 20px",
                border: "1px solid rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{cfg.titulo}</p>
                  <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "2px" }}>{cfg.desc}</p>
                </div>
                <div style={{
                  width: "44px", height: "24px", borderRadius: "999px",
                  background: cfg.ativo ? "#111111" : "#E5E5E5",
                  position: "relative", cursor: "pointer", transition: "background 0.2s",
                }}>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: "#FFFFFF", position: "absolute",
                    top: "3px", left: cfg.ativo ? "23px" : "3px",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
