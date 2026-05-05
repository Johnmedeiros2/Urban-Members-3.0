"use client";

import { useState, useEffect, useCallback } from "react";
import Avatar from "@/components/ui/Avatar";
import ScoreBadge from "@/components/ui/ScoreBadge";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { estatisticasCompletas, buscarMoradores, minhasTransacoes, ehAdmin, listarModeradores, adicionarModerador, removerModerador, type ModeradorInfo } from "@/lib/queries";
import { createClient } from "@/lib/supabase";

interface Morador {
  id: string;
  nome: string;
  cidade: string | null;
  estado: string | null;
  pais: string | null;
  urban_score: number;
  criado_em: string;
}

interface Stats {
  moradores: number; lojistas: number; posts: number; cursos: number;
  transacoes: number; produtos: number; conexoes: number; notif: number; receita: number;
}

interface PHMetrics {
  cadastros_7d: number;
  posts_7d: number;
  compras_7d: number;
  lives_assistidas_7d: number;
  taxa_conversao_cadastro: number;
  eventos_24h: number;
}

const ABAS = ["Visão Geral", "Comportamento", "Moradores", "Moderação", "Transações", "Configurações"];

const PH_PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
const PH_DASHBOARD_BASE = `https://us.posthog.com/project/${PH_PROJECT_ID}`;

function Badge({ children, cor }: { children: React.ReactNode; cor: string }) {
  const bg = cor === "#16A34A" ? "#F0FDF4" : cor === "#EA580C" ? "#FFF7ED" : "#F5F5F5";
  return <span style={{ fontSize: "11px", fontWeight: 700, background: bg, color: cor, padding: "3px 10px", borderRadius: "999px" }}>{children}</span>;
}

function tempoRelativo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

export default function Admin() {
  const [aba, setAba] = useState("Visão Geral");
  const [stats, setStats] = useState<Stats | null>(null);
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [transacoes, setTransacoes] = useState<{ id: string; descricao: string | null; valor: number; taxa_urban: number; status: string; comprador_id: string; vendedor_id: string; comprador?: { nome: string } | null; vendedor?: { nome: string } | null }[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [souAdmin, setSouAdmin] = useState(false);
  const [moderadores, setModeradores] = useState<ModeradorInfo[]>([]);
  const [buscaMod, setBuscaMod] = useState("");
  const [adicionando, setAdicionando] = useState<string | null>(null);
  const [removendo, setRemovendo] = useState<string | null>(null);

  const [phMetrics, setPhMetrics] = useState<PHMetrics | null>(null);
  const [phErro, setPhErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const supabase = createClient();
    const [s, m, t, admin, mods] = await Promise.all([
      estatisticasCompletas(),
      buscarMoradores(),
      supabase.from("transacoes").select("*").eq("status", "concluida").order("criado_em", { ascending: false }).limit(20),
      ehAdmin(),
      listarModeradores(),
    ]);
    setStats(s);
    setMoradores(m as Morador[]);
    setSouAdmin(admin);
    setModeradores(mods);

    // enriquece transações com nomes
    if (t.data && t.data.length > 0) {
      const ids = [...new Set(t.data.flatMap((x: { comprador_id: string; vendedor_id: string }) => [x.comprador_id, x.vendedor_id]))];
      const { data: perfis } = await supabase.from("perfis").select("id, nome").in("id", ids);
      const map = new Map((perfis ?? []).map((p: { id: string; nome: string }) => [p.id, p]));
      setTransacoes(t.data.map((x: { comprador_id: string; vendedor_id: string } & Record<string, unknown>) => ({
        ...x,
        comprador: map.get(x.comprador_id) ?? null,
        vendedor: map.get(x.vendedor_id) ?? null,
      })) as typeof transacoes);
    } else {
      setTransacoes([]);
    }
    setCarregando(false);

    // PostHog metrics — falha silenciosa (não trava /admin se a chave não estiver setada)
    try {
      const r = await fetch("/api/admin/metrics", { cache: "no-store" });
      if (r.ok) {
        setPhMetrics(await r.json());
        setPhErro(null);
      } else {
        const j = await r.json().catch(() => ({}));
        setPhErro(j.error ?? `Erro ${r.status}`);
        setPhMetrics(null);
      }
    } catch (e) {
      setPhErro(e instanceof Error ? e.message : "Erro");
      setPhMetrics(null);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const moradoresFiltrados = moradores.filter((u) =>
    u.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (u.cidade ?? "").toLowerCase().includes(busca.toLowerCase())
  );

  const idsModeradores = new Set(moderadores.map((m) => m.morador_id));

  const candidatosModeracao = moradores
    .filter((u) => !idsModeradores.has(u.id))
    .filter((u) => {
      if (!buscaMod.trim()) return false;
      const q = buscaMod.toLowerCase();
      return u.nome.toLowerCase().includes(q) || (u.cidade ?? "").toLowerCase().includes(q);
    })
    .slice(0, 8);

  async function handleAdicionarMod(morador_id: string) {
    setAdicionando(morador_id);
    try {
      await adicionarModerador(morador_id);
      setBuscaMod("");
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao adicionar moderador");
    } finally {
      setAdicionando(null);
    }
  }

  async function handleRemoverMod(morador_id: string, nome: string) {
    if (!confirm(`Remover ${nome} da equipe de moderação?`)) return;
    setRemovendo(morador_id);
    try {
      await removerModerador(morador_id);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao remover moderador");
    } finally {
      setRemovendo(null);
    }
  }

  const STATS_CARDS = stats ? [
    { label: "Moradores",        value: stats.moradores.toString(), cor: "#111111" },
    { label: "Lojistas",         value: stats.lojistas.toString(),  cor: "#FF5C2E" },
    { label: "Posts",            value: stats.posts.toString(),     cor: "#111111" },
    { label: "Cursos",           value: stats.cursos.toString(),    cor: "#111111" },
    { label: "Transações",       value: stats.transacoes.toString(),cor: "#10B981" },
    { label: "Receita Urban",    value: `R$ ${stats.receita.toFixed(2).replace(".", ",")}`, cor: "#10B981" },
  ] : [];

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      <header style={{ background: "#111111", padding: "0 32px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <img src="/logo.svg" alt="Urban Members" width={32} height={32} style={{ filter: "invert(1)" }} />
            <span style={{ fontSize: "15px", fontWeight: 800, color: "#FFFFFF" }}>Urban Members</span>
          </a>
          <span style={{ fontSize: "12px", color: "#525252", margin: "0 4px" }}>/</span>
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#FF5C2E", background: "rgba(255,92,46,0.15)", padding: "2px 10px", borderRadius: "999px" }}>Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <BotaoConvite variant="dark" />
          <button onClick={carregar} style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "999px", padding: "6px 12px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            Atualizar
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Painel de Controle</h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "4px" }}>Dados em tempo real do Supabase</p>
        </div>

        <div style={{ display: "flex", gap: "4px", marginBottom: "28px", borderBottom: "1px solid #E5E5E5" }}>
          {ABAS.map((a) => (
            <button key={a} onClick={() => setAba(a)} style={{
              padding: "10px 18px", border: "none", background: "transparent",
              fontSize: "13px", fontWeight: aba === a ? 700 : 400,
              color: aba === a ? "#111111" : "#A3A3A3",
              cursor: "pointer", fontFamily: "Inter, sans-serif",
              borderBottom: aba === a ? "2px solid #111111" : "2px solid transparent",
              marginBottom: "-1px",
            }}>{a}</button>
          ))}
        </div>

        {carregando && <div style={{ textAlign: "center", padding: "40px", color: "#A3A3A3" }}>Carregando dados...</div>}

        {!carregando && aba === "Visão Geral" && stats && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Totais (Supabase)</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {STATS_CARDS.map((s) => (
                  <div key={s.label} style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <p style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                    <p style={{ fontSize: "28px", fontWeight: 800, color: s.cor, letterSpacing: "-0.04em" }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.06em" }}>Comportamento últimos 7 dias (PostHog)</p>
                <button onClick={() => setAba("Comportamento")} style={{ fontSize: "11px", color: "#FF5C2E", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Ver tudo →</button>
              </div>
              {phErro ? (
                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", padding: "12px 16px" }}>
                  <p style={{ fontSize: "12px", color: "#92400E" }}>Métricas de comportamento indisponíveis: {phErro}</p>
                </div>
              ) : phMetrics ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                  <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Cadastros</p>
                    <p style={{ fontSize: "24px", fontWeight: 800, color: "#111111", letterSpacing: "-0.04em" }}>{phMetrics.cadastros_7d}</p>
                  </div>
                  <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Conversão cadastro</p>
                    <p style={{ fontSize: "24px", fontWeight: 800, color: "#FF5C2E", letterSpacing: "-0.04em" }}>{phMetrics.taxa_conversao_cadastro}%</p>
                  </div>
                  <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Posts criados</p>
                    <p style={{ fontSize: "24px", fontWeight: 800, color: "#111111", letterSpacing: "-0.04em" }}>{phMetrics.posts_7d}</p>
                  </div>
                  <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Compras</p>
                    <p style={{ fontSize: "24px", fontWeight: 800, color: "#10B981", letterSpacing: "-0.04em" }}>{phMetrics.compras_7d}</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ background: "#FAFAFA", borderRadius: "16px", padding: "16px 20px", height: "76px" }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111", marginBottom: "16px" }}>Últimas transações</h3>
              {transacoes.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#A3A3A3", textAlign: "center", padding: "20px" }}>Nenhuma transação ainda.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #F5F5F5" }}>
                      {["Produto", "Comprador", "Vendedor", "Valor", "Taxa Urban"].map((h) => (
                        <th key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#A3A3A3", textAlign: "left", padding: "8px 12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transacoes.map((t) => (
                      <tr key={t.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                        <td style={{ padding: "12px", fontSize: "13px", fontWeight: 600, color: "#111111" }}>{t.descricao ?? "Pagamento"}</td>
                        <td style={{ padding: "12px", fontSize: "13px", color: "#525252" }}>{t.comprador?.nome ?? "—"}</td>
                        <td style={{ padding: "12px", fontSize: "13px", color: "#525252" }}>{t.vendedor?.nome ?? "—"}</td>
                        <td style={{ padding: "12px", fontSize: "13px", fontWeight: 700, color: "#111111" }}>R$ {Number(t.valor).toFixed(2)}</td>
                        <td style={{ padding: "12px", fontSize: "13px", fontWeight: 700, color: "#10B981" }}>R$ {Number(t.taxa_urban).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {!carregando && aba === "Comportamento" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Comportamento dos moradores</h3>
              <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "4px", lineHeight: 1.5 }}>
                Métricas de produto vindas do PostHog. Diferente das métricas do Supabase (que mostram totais), aqui você vê <strong style={{ color: "#525252" }}>o que aconteceu nos últimos 7 dias</strong>.
              </p>
            </div>

            {phErro && (
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "12px", padding: "16px 20px" }}>
                <p style={{ fontSize: "13px", color: "#92400E", fontWeight: 600 }}>Métricas indisponíveis</p>
                <p style={{ fontSize: "12px", color: "#92400E", marginTop: "4px" }}>{phErro}</p>
                <p style={{ fontSize: "11px", color: "#92400E", marginTop: "8px" }}>
                  Confira se as variáveis <code>POSTHOG_PERSONAL_API_KEY</code> e <code>NEXT_PUBLIC_POSTHOG_PROJECT_ID</code> estão setadas na Vercel.
                </p>
              </div>
            )}

            {phMetrics && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  {[
                    { label: "Cadastros completos", value: phMetrics.cadastros_7d.toString(), cor: "#111111", evento: "signup_completed" },
                    { label: "Taxa de conversão (cadastro)", value: `${phMetrics.taxa_conversao_cadastro}%`, cor: "#FF5C2E", evento: "signup_completed" },
                    { label: "Posts criados", value: phMetrics.posts_7d.toString(), cor: "#111111", evento: "post_created" },
                    { label: "Compras concluídas", value: phMetrics.compras_7d.toString(), cor: "#10B981", evento: "purchase_completed" },
                    { label: "Lives assistidas", value: phMetrics.lives_assistidas_7d.toString(), cor: "#111111", evento: "live_joined" },
                    { label: "Eventos últimas 24h", value: phMetrics.eventos_24h.toString(), cor: "#525252", evento: "" },
                  ].map((m) => (
                    <div key={m.label} style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <p style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</p>
                      <p style={{ fontSize: "32px", fontWeight: 800, color: m.cor, letterSpacing: "-0.04em" }}>{m.value}</p>
                      {m.evento && (
                        <a href={`${PH_DASHBOARD_BASE}/events?eventFilter=${m.evento}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: "11px", color: "#A3A3A3", textDecoration: "none" }}>
                          Ver eventos no PostHog →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Análises avançadas</h3>
              <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "4px", lineHeight: 1.5 }}>
                Pra funis customizados, retenção D1/D7/D30, session replay e cohorts, abre o PostHog direto:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginTop: "14px" }}>
                {[
                  { label: "📊 Dashboards", url: `${PH_DASHBOARD_BASE}/dashboard` },
                  { label: "🎯 Funis", url: `${PH_DASHBOARD_BASE}/insights?insight=FUNNELS` },
                  { label: "📈 Retenção", url: `${PH_DASHBOARD_BASE}/insights?insight=RETENTION` },
                  { label: "🎬 Session Replay", url: `${PH_DASHBOARD_BASE}/replay/recent` },
                  { label: "🌐 Web Analytics", url: `${PH_DASHBOARD_BASE}/web` },
                  { label: "👥 Pessoas (moradores)", url: `${PH_DASHBOARD_BASE}/persons` },
                ].map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#FAFAFA", borderRadius: "10px", textDecoration: "none", color: "#111111", fontSize: "13px", fontWeight: 600 }}>
                    <span>{link.label}</span>
                    <span style={{ fontSize: "11px", color: "#A3A3A3" }}>↗</span>
                  </a>
                ))}
              </div>
            </div>

            <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: "12px", padding: "14px 18px" }}>
              <p style={{ fontSize: "12px", color: "#075985", fontWeight: 600 }}>💡 Próximo passo: dashboards customizados</p>
              <p style={{ fontSize: "11px", color: "#075985", marginTop: "4px", lineHeight: 1.5 }}>
                Quando você criar dashboards no PostHog (Dashboards → New), me avisa que eu embedo eles aqui dentro do /admin via iframe.
              </p>
            </div>
          </div>
        )}

        {!carregando && aba === "Moradores" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input placeholder="Buscar por nome ou cidade..." value={busca} onChange={(e) => setBusca(e.target.value)}
              style={{ height: "44px", border: "1px solid #E5E5E5", borderRadius: "999px", padding: "0 18px", fontSize: "14px", color: "#111111", outline: "none", fontFamily: "Inter, sans-serif", background: "#FFFFFF" }} />

            <div style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FAFAFA", borderBottom: "1px solid #F5F5F5" }}>
                    {["Morador", "Cidade", "Urban Score", "Cadastro"].map((h) => (
                      <th key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#A3A3A3", textAlign: "left", padding: "12px 16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {moradoresFiltrados.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Avatar name={u.nome} size={32} />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{u.nome}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#525252" }}>
                        {u.cidade ?? "—"} {u.pais ? `· ${u.pais}` : ""}
                      </td>
                      <td style={{ padding: "12px 16px" }}><ScoreBadge score={u.urban_score} compact /></td>
                      <td style={{ padding: "12px 16px", fontSize: "12px", color: "#A3A3A3" }}>{tempoRelativo(u.criado_em)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!carregando && aba === "Moderação" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Equipe de moderação</h3>
              <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "4px" }}>
                Moradores autorizados a remover conteúdo indevido. Você (admin) é moderador automaticamente.
              </p>
            </div>

            {!souAdmin && (
              <div style={{ background: "#FEF2F2", borderRadius: "12px", padding: "14px 18px", border: "1px solid #FECACA" }}>
                <p style={{ fontSize: "13px", color: "#991B1B", fontWeight: 600 }}>
                  Apenas o admin pode adicionar ou remover moderadores.
                </p>
              </div>
            )}

            {souAdmin && (
              <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>Adicionar moderador</p>
                  <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "2px" }}>
                    Busque por nome ou cidade. Clique em &quot;Promover&quot; pra adicionar à equipe.
                  </p>
                </div>
                <input
                  placeholder="Buscar morador..."
                  value={buscaMod}
                  onChange={(e) => setBuscaMod(e.target.value)}
                  style={{ height: "40px", border: "1px solid #E5E5E5", borderRadius: "999px", padding: "0 16px", fontSize: "13px", color: "#111111", outline: "none", fontFamily: "Inter, sans-serif", background: "#FAFAFA" }}
                />
                {buscaMod.trim() && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {candidatosModeracao.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "#A3A3A3", padding: "8px 0" }}>Nenhum morador encontrado.</p>
                    ) : candidatosModeracao.map((u) => (
                      <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "#FAFAFA", borderRadius: "10px" }}>
                        <Avatar name={u.nome} size={32} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{u.nome}</p>
                          <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{u.cidade ?? "—"}</p>
                        </div>
                        <button
                          onClick={() => handleAdicionarMod(u.id)}
                          disabled={adicionando === u.id}
                          className="um-btn-primary"
                          style={{ height: "32px", padding: "0 14px", fontSize: "12px" }}
                        >
                          {adicionando === u.id ? "..." : "Promover"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #F5F5F5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>
                  {moderadores.length} {moderadores.length === 1 ? "moderador ativo" : "moderadores ativos"}
                </p>
              </div>
              {moderadores.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#A3A3A3", textAlign: "center", padding: "32px" }}>
                  Nenhum moderador ainda. {souAdmin ? "Use a busca acima pra promover um morador." : ""}
                </p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#FAFAFA", borderBottom: "1px solid #F5F5F5" }}>
                      {["Moderador", "Cidade", "Promovido", souAdmin ? "Ação" : ""].filter(Boolean).map((h) => (
                        <th key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#A3A3A3", textAlign: "left", padding: "12px 16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {moderadores.map((m) => (
                      <tr key={m.morador_id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Avatar name={m.morador?.nome ?? "?"} foto={m.morador?.foto_url ?? null} size={32} />
                            <div>
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>{m.morador?.nome ?? "—"}</p>
                              <ScoreBadge score={m.morador?.urban_score ?? 10} compact />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "#525252" }}>{m.morador?.cidade ?? "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#A3A3A3" }}>{tempoRelativo(m.criado_em)}</td>
                        {souAdmin && (
                          <td style={{ padding: "12px 16px" }}>
                            <button
                              onClick={() => handleRemoverMod(m.morador_id, m.morador?.nome ?? "moderador")}
                              disabled={removendo === m.morador_id}
                              className="um-btn-ghost"
                              style={{ height: "30px", padding: "0 12px", fontSize: "12px", color: "#DC2626" }}
                            >
                              {removendo === m.morador_id ? "..." : "Remover"}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {!carregando && aba === "Transações" && (
          <div style={{ background: "#FFFFFF", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #F5F5F5", display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700 }}>Todas as Transações</h3>
              {stats && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "#10B981" }}>R$ {stats.receita.toFixed(2).replace(".", ",")}</p>
                  <p style={{ fontSize: "11px", color: "#A3A3A3" }}>Total arrecadado</p>
                </div>
              )}
            </div>
            {transacoes.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#A3A3A3", textAlign: "center", padding: "40px" }}>Nenhuma transação registrada ainda.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FAFAFA" }}>
                    {["Descrição", "Comprador", "Vendedor", "Valor", "Taxa Urban", "Status"].map((h) => (
                      <th key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#A3A3A3", textAlign: "left", padding: "12px 16px", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transacoes.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600 }}>{t.descricao ?? "—"}</td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#525252" }}>{t.comprador?.nome ?? "—"}</td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#525252" }}>{t.vendedor?.nome ?? "—"}</td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 700 }}>R$ {Number(t.valor).toFixed(2)}</td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 800, color: "#10B981" }}>R$ {Number(t.taxa_urban).toFixed(2)}</td>
                      <td style={{ padding: "14px 16px" }}><Badge cor="#16A34A">Concluída</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!carregando && aba === "Configurações" && (
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px", border: "1px solid rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "16px" }}>Informações do sistema</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {stats && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
                    <span style={{ fontSize: "13px", color: "#525252" }}>Total de moradores</span>
                    <strong>{stats.moradores}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
                    <span style={{ fontSize: "13px", color: "#525252" }}>Total de posts</span>
                    <strong>{stats.posts}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
                    <span style={{ fontSize: "13px", color: "#525252" }}>Total de produtos</span>
                    <strong>{stats.produtos}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
                    <span style={{ fontSize: "13px", color: "#525252" }}>Total de cursos</span>
                    <strong>{stats.cursos}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
                    <span style={{ fontSize: "13px", color: "#525252" }}>Receita total Urban</span>
                    <strong style={{ color: "#10B981" }}>R$ {stats.receita.toFixed(2).replace(".", ",")}</strong>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
