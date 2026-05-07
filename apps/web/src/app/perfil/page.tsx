"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ScoreBadge from "@/components/ui/ScoreBadge";
import Avatar from "@/components/ui/Avatar";
import BotaoConvite from "@/components/ui/BotaoConvite";
import MeusCupons from "@/components/ui/MeusCupons";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { meusProdutos, meusCursos, minhasVendasResumo, uploadFotoPerfil, minhasIndicacoes, type Indicacao } from "@/lib/queries";
import { reset as resetAnalytics } from "@/lib/analytics";

interface ProdutoMeu {
  id: string; nome: string; preco: number; categoria: string; total_vendas: number;
}

interface CursoMeu {
  id: string; titulo: string; preco: number; nivel: string; total_alunos: number;
}

interface LojaMinha {
  id: string; nome: string; total_vendas: number;
}

interface Resumo {
  total_recebido: number; total_vendas: number; ticket_medio: number; taxa_paga: number;
}

interface Perfil {
  nome: string;
  cidade: string;
  estado: string;
  pais: string;
  cidade_visita?: string | null;
  ocupacao?: string;
  urban_score: number;
  criado_em?: string;
  foto_url?: string | null;
}

const MOCK: Perfil = {
  nome: "João Medeiros",
  cidade: "São Paulo", estado: "São Paulo", pais: "Brasil",
  cidade_visita: "Lisboa · Portugal",
  ocupacao: "Empreendedor(a)",
  urban_score: 320,
  criado_em: "2026-01-01",
};

const stats = [
  { label: "Posts",    value: "24"  },
  { label: "Conexões", value: "138" },
  { label: "Bairros",  value: "3"   },
];

const recentPosts = [
  { id: 1, content: "Acabei de fechar meu primeiro negócio pelo Mercado Urbano. Esse lugar funciona de verdade.", time: "2h",  likes: 18 },
  { id: 2, content: "Quem mais está no bairro Negócios e quer conectar? Vamos trocar ideia sobre vendas digitais.", time: "1d", likes: 31 },
];

export default function Perfil() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil>(MOCK);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [nomeEdit, setNomeEdit] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [saindo, setSaindo] = useState(false);

  async function handleSair() {
    if (!confirm("Sair da sua conta agora?")) return;
    setSaindo(true);
    try {
      await createClient().auth.signOut();
      resetAnalytics();
      router.push("/login");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao sair");
      setSaindo(false);
    }
  }

  // Meu comércio
  const [minhaLoja, setMinhaLoja] = useState<LojaMinha | null>(null);
  const [produtos, setProdutos] = useState<ProdutoMeu[]>([]);
  const [cursos, setCursos] = useState<CursoMeu[]>([]);
  const [resumo, setResumo] = useState<Resumo>({ total_recebido: 0, total_vendas: 0, ticket_medio: 0, taxa_paga: 0 });

  // Upload foto
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const [subindoFoto, setSubindoFoto] = useState(false);

  // Indicações
  const [indicacoes, setIndicacoes] = useState<{
    pessoas: Indicacao[];
    total_comissao: number;
    total_pessoas: number;
    pessoas_compraram: number;
  }>({ pessoas: [], total_comissao: 0, total_pessoas: 0, pessoas_compraram: 0 });
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  async function handleUploadFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (arquivo.size > 5 * 1024 * 1024) { alert("Arquivo muito grande (máx 5MB)"); return; }
    setSubindoFoto(true);
    try {
      const url = await uploadFotoPerfil(arquivo);
      setPerfil((p) => ({ ...p, foto_url: url }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao enviar foto");
    } finally {
      setSubindoFoto(false);
    }
  }

  useEffect(() => {
    async function carregar() {
      // 1. Tenta Supabase
      if (supabaseConfigured) {
        try {
          const supabase = createClient();
          const user = (await supabase.auth.getSession()).data.session?.user;
          if (user) {
            const { data } = await supabase
              .from("perfis")
              .select("*")
              .eq("id", user.id)
              .single();
            if (data) {
              setPerfil(data as Perfil);
              setCarregando(false);
              return;
            }
          }
        } catch {}
      }
      // 2. Fallback: localStorage
      const stored = localStorage.getItem("urban_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPerfil({
            nome: parsed.name ?? MOCK.nome,
            cidade: parsed.location?.city ?? MOCK.cidade,
            estado: parsed.location?.state ?? MOCK.estado,
            pais: parsed.location?.country ?? MOCK.pais,
            cidade_visita: parsed.visitCity ?? null,
            ocupacao: parsed.biografia?.ocupacao ?? MOCK.ocupacao,
            urban_score: 10,
          });
        } catch {}
      }
      setCarregando(false);
    }
    carregar();

    // Carrega dados de comércio e indicações em paralelo
    (async () => {
      const [mp, mc, r, ind, { data: { session } }] = await Promise.all([
        meusProdutos(),
        meusCursos(),
        minhasVendasResumo(),
        minhasIndicacoes(),
        createClient().auth.getSession(),
      ]);
      setMinhaLoja(mp.loja as LojaMinha | null);
      setProdutos(mp.produtos as ProdutoMeu[]);
      setCursos(mc as CursoMeu[]);
      setResumo(r);
      setIndicacoes(ind);
      setUserId(session?.user?.id ?? null);
    })();
  }, []);

  function copiarLinkConvite() {
    if (!userId) return;
    navigator.clipboard.writeText(`https://urbanicsa.com/cadastro?ref=${userId}`);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  }

  async function salvarNome() {
    if (!nomeEdit.trim()) return;
    setSalvando(true);
    if (supabaseConfigured) {
      try {
        const supabase = createClient();
        const user = (await supabase.auth.getSession()).data.session?.user;
        if (user) {
          await supabase.from("perfis").update({ nome: nomeEdit }).eq("id", user.id);
          setPerfil((p) => ({ ...p, nome: nomeEdit }));
        }
      } catch {}
    } else {
      setPerfil((p) => ({ ...p, nome: nomeEdit }));
    }
    setSalvando(false);
    setEditando(false);
  }

  if (carregando) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
        <p style={{ fontSize: "14px", color: "#A3A3A3" }}>Carregando perfil...</p>
      </div>
    );
  }

  const anoEntrada = perfil.criado_em ? new Date(perfil.criado_em).getFullYear() : 2026;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
            <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111" }}>Urban Members</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BotaoConvite variant="ghost" />
            <ScoreBadge score={perfil.urban_score} compact />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Cartão de perfil */}
        <div style={{ background: "#FFFFFF", borderRadius: "20px", marginTop: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", position: "relative" }}>
          {/* Capa com cantos arredondados só no topo */}
          <div style={{ height: "100px", background: "#111111", position: "relative", borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 60%, rgba(255,92,46,0.3) 0%, transparent 60%)" }} />
          </div>

          {/* Conteúdo */}
          <div style={{ padding: "0 24px 24px" }}>
            {/* Avatar posicionado sobre a capa + botões */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginTop: "-48px", marginBottom: "20px" }}>
              <div style={{ position: "relative", width: "96px", height: "96px" }}>
                {perfil.foto_url ? (
                  <img src={perfil.foto_url} alt={perfil.nome}
                    style={{ width: "96px", height: "96px", borderRadius: "50%", border: "4px solid #FFFFFF", objectFit: "cover", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "block" }} />
                ) : (
                  <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "linear-gradient(135deg, #FF5C2E, #FF8C5A)", border: "4px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                    <span style={{ color: "#FFFFFF", fontSize: "34px", fontWeight: 800 }}>{perfil.nome.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                {/* Botão de câmera para upload */}
                <button onClick={() => inputFotoRef.current?.click()} disabled={subindoFoto}
                  title="Trocar foto"
                  style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: "#111111", border: "3px solid #FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: "14px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}>
                  {subindoFoto ? "..." : "📷"}
                </button>
                <input ref={inputFotoRef} type="file" accept="image/*" onChange={handleUploadFoto} style={{ display: "none" }} />
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "56px" }}>
                <a href="/compras" style={{ textDecoration: "none" }}>
                  <button className="um-btn-secondary" style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}>
                    Minhas compras
                  </button>
                </a>
                <a href="/wishlist" style={{ textDecoration: "none" }}>
                  <button className="um-btn-secondary" style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}>
                    Salvos
                  </button>
                </a>
                <a href="/empresa/nova" style={{ textDecoration: "none" }}>
                  <button className="um-btn-secondary" style={{ height: "36px", padding: "0 16px", fontSize: "13px" }}>
                    + Empresa
                  </button>
                </a>
                <BotaoConvite variant="ghost" />
                <button onClick={() => { setEditando(!editando); setNomeEdit(perfil.nome); }} className="um-btn-primary" style={{ height: "36px", padding: "0 20px", fontSize: "13px" }}>
                  {editando ? "Cancelar" : "Editar perfil"}
                </button>
              </div>
            </div>

            {/* Nome editável */}
            {editando ? (
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <input value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)}
                  style={{ flex: 1, height: "40px", border: "1.5px solid #111111", borderRadius: "10px", padding: "0 12px", fontSize: "16px", fontWeight: 700, color: "#111111", outline: "none", fontFamily: "Inter, sans-serif" }} />
                <button onClick={salvarNome} disabled={salvando} className="um-btn-accent" style={{ height: "40px", padding: "0 18px", fontSize: "13px", borderRadius: "10px" }}>
                  {salvando ? "..." : "Salvar"}
                </button>
              </div>
            ) : (
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>{perfil.nome}</h1>
            )}

            {/* Localização atual */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#F5F5F5", borderRadius: "999px", padding: "5px 12px", marginTop: "6px" }}>
              <span style={{ fontSize: "12px" }}>📍</span>
              <span style={{ fontSize: "13px", color: "#525252", fontWeight: 500 }}>
                {perfil.cidade}{perfil.estado && perfil.estado !== perfil.cidade ? `, ${perfil.estado}` : ""} · {perfil.pais}
              </span>
            </div>

            {/* Cidade visitando */}
            {perfil.cidade_visita && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#FFF3EF", borderRadius: "999px", padding: "5px 12px", marginTop: "6px", marginLeft: "6px" }}>
                <span style={{ fontSize: "12px" }}>🗺️</span>
                <span style={{ fontSize: "13px", color: "#FF5C2E", fontWeight: 600 }}>
                  Visitando: {perfil.cidade_visita.split(" · ")[0]}
                </span>
              </div>
            )}

            {/* Tags */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
              {perfil.ocupacao && (
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#FF5C2E", background: "#FFF3EF", padding: "3px 12px", borderRadius: "999px" }}>
                  {perfil.ocupacao}
                </span>
              )}
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#525252", background: "#F5F5F5", padding: "3px 12px", borderRadius: "999px" }}>
                Morador desde {anoEntrada}
              </span>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", marginTop: "20px", borderTop: "1px solid #F5F5F5", paddingTop: "20px" }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i < stats.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>{s.value}</p>
                  <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "2px" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Urban Score */}
        <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "20px 24px", marginTop: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Urban Score</h3>
            <ScoreBadge score={perfil.urban_score} />
          </div>
          <div style={{ background: "#F5F5F5", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
            <div style={{ width: `${Math.min((perfil.urban_score / 900) * 100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #FF5C2E, #FF8C5A)", borderRadius: "999px" }} />
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[{ label: "Starter", pts: "0" }, { label: "Rising", pts: "100" }, { label: "Urban", pts: "300" }, { label: "Elite", pts: "600" }, { label: "Legend", pts: "900" }].map((tier) => {
              const ativo = (perfil.urban_score >= parseInt(tier.pts)) && (tier.label === "Legend" || perfil.urban_score < (["0","100","300","600","900"].map(Number)[["Starter","Rising","Urban","Elite","Legend"].indexOf(tier.label) + 1] ?? 9999));
              return (
                <div key={tier.label} style={{ flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: "10px", background: ativo ? "#111111" : "#F5F5F5" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: ativo ? "#FFFFFF" : "#A3A3A3" }}>{tier.label}</p>
                  <p style={{ fontSize: "10px", color: ativo ? "rgba(255,255,255,0.6)" : "#C4C4C4" }}>{tier.pts}pts</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meu comércio — aparece apenas se tem loja ou cursos */}
        {(minhaLoja || cursos.length > 0) && (
          <div style={{ marginTop: "16px", background: "#FFFFFF", borderRadius: "20px", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Meu comércio</h3>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#FF5C2E", background: "#FFF3EF", padding: "3px 10px", borderRadius: "999px" }}>
                {resumo.total_vendas} vendas
              </span>
            </div>

            {/* Resumo financeiro */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Recebido</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#10B981", letterSpacing: "-0.03em", marginTop: "4px" }}>
                  R$ {resumo.total_recebido.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Ticket médio</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", marginTop: "4px" }}>
                  R$ {resumo.ticket_medio.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px" }}>
                <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Taxa Urban</p>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#FF5C2E", letterSpacing: "-0.03em", marginTop: "4px" }}>
                  R$ {resumo.taxa_paga.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>

            {/* Loja e produtos */}
            {minhaLoja && produtos.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#525252" }}>{minhaLoja.nome} · Produtos</p>
                  <a href="/mercado" style={{ fontSize: "11px", color: "#A3A3A3", textDecoration: "none" }}>Gerenciar →</a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {produtos.map((p, i) => {
                    const receita = p.total_vendas * Number(p.preco) * 0.9;
                    const maisVendido = i === 0 && p.total_vendas > 0;
                    return (
                      <div key={p.id} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 14px", borderRadius: "12px",
                        background: maisVendido ? "#FFF3EF" : "#F7F7F8",
                        border: maisVendido ? "1px solid rgba(255,92,46,0.2)" : "1px solid transparent",
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{p.nome}</p>
                            {maisVendido && (
                              <span style={{ fontSize: "9px", fontWeight: 700, color: "#FF5C2E", background: "#FFFFFF", padding: "2px 6px", borderRadius: "999px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                Mais vendido
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "2px" }}>
                            {p.categoria} · R$ {Number(p.preco).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "13px", fontWeight: 800, color: "#10B981" }}>R$ {receita.toFixed(2).replace(".", ",")}</p>
                          <p style={{ fontSize: "10px", color: "#A3A3A3" }}>{p.total_vendas} vendas</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cursos */}
            {cursos.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", marginTop: minhaLoja ? "8px" : "0", paddingTop: minhaLoja ? "16px" : "0", borderTop: minhaLoja ? "1px solid #F5F5F5" : "none" }}>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#525252" }}>Meus cursos</p>
                  <a href="/sala-de-aula" style={{ fontSize: "11px", color: "#A3A3A3", textDecoration: "none" }}>Gerenciar →</a>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {cursos.map((c, i) => {
                    const maisPopular = i === 0 && c.total_alunos > 0;
                    return (
                      <div key={c.id} style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 14px", borderRadius: "12px",
                        background: maisPopular ? "#F0FDF4" : "#F7F7F8",
                        border: maisPopular ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{c.titulo}</p>
                            {maisPopular && (
                              <span style={{ fontSize: "9px", fontWeight: 700, color: "#10B981", background: "#FFFFFF", padding: "2px 6px", borderRadius: "999px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                                Mais procurado
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "2px" }}>
                            {c.nivel} · {c.preco > 0 ? `R$ ${Number(c.preco).toFixed(2)}` : "Gratuito"}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "14px", fontWeight: 800, color: "#111111" }}>{c.total_alunos}</p>
                          <p style={{ fontSize: "10px", color: "#A3A3A3" }}>alunos</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Indicações — sistema de afiliados */}
        <div style={{ marginTop: "16px", background: "#FFFFFF", borderRadius: "20px", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Indicações</h3>
              <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "2px" }}>Ganhe 3% quando quem você convida compra algo</p>
            </div>
          </div>

          {/* Stats de indicação */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px" }}>
              <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Convidados</p>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", marginTop: "4px" }}>
                {indicacoes.total_pessoas}
              </p>
            </div>
            <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px" }}>
              <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Compraram</p>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "#FF5C2E", letterSpacing: "-0.03em", marginTop: "4px" }}>
                {indicacoes.pessoas_compraram}
              </p>
            </div>
            <div style={{ background: "#F7F7F8", borderRadius: "12px", padding: "14px" }}>
              <p style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Comissão</p>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "#10B981", letterSpacing: "-0.03em", marginTop: "4px" }}>
                R$ {indicacoes.total_comissao.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          {/* Link de convite */}
          <div style={{ background: "#111111", borderRadius: "14px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
                Seu link
              </p>
              <p style={{ fontSize: "12px", color: "#FFFFFF", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                urbanicsa.com/cadastro?ref={userId?.slice(0, 8)}...
              </p>
            </div>
            <button onClick={copiarLinkConvite}
              className={linkCopiado ? undefined : "um-btn-accent"}
              style={{
                background: linkCopiado ? "#10B981" : undefined,
                color: "#FFFFFF",
                padding: "8px 16px", fontSize: "12px", fontWeight: 700,
                whiteSpace: "nowrap",
                ...(linkCopiado ? { border: "none", borderRadius: "999px", cursor: "pointer", fontFamily: "Inter, sans-serif" } : {}),
              }}>
              {linkCopiado ? "✓ Copiado" : "Copiar"}
            </button>
          </div>

          {/* Lista de indicados */}
          {indicacoes.pessoas.length > 0 && (
            <div style={{ marginTop: "4px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#525252", marginBottom: "10px" }}>Pessoas que você trouxe</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {indicacoes.pessoas.map((p) => {
                  const jaGerou = p.total_gerado > 0;
                  return (
                    <div key={p.id} style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 12px", borderRadius: "12px",
                      background: jaGerou ? "#F0FDF4" : "#F7F7F8",
                      border: jaGerou ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                    }}>
                      <Avatar name={p.nome} foto={p.foto_url} size={36} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{p.nome}</p>
                        <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{p.cidade ?? "—"}</p>
                      </div>
                      {jaGerou ? (
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: "13px", fontWeight: 800, color: "#10B981" }}>
                            R$ {p.total_gerado.toFixed(2).replace(".", ",")}
                          </p>
                          <p style={{ fontSize: "10px", color: "#A3A3A3" }}>gerado</p>
                        </div>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#A3A3A3", fontWeight: 600, background: "#FFFFFF", padding: "3px 10px", borderRadius: "999px" }}>
                          Ainda não consumiu
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {indicacoes.pessoas.length === 0 && (
            <p style={{ fontSize: "12px", color: "#A3A3A3", textAlign: "center", padding: "12px" }}>
              Nenhum morador convidado ainda. Compartilhe seu link.
            </p>
          )}
        </div>

        <div style={{ marginTop: "16px" }}>
          <MeusCupons />
        </div>

        {/* CTA para abrir comércio caso não tenha nada */}
        {!minhaLoja && cursos.length === 0 && (
          <div style={{ marginTop: "16px", background: "#111111", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 30%, rgba(255,92,46,0.15) 0%, transparent 60%)" }} />
            <div style={{ position: "relative" }}>
              <p style={{ fontSize: "11px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Comece a vender
              </p>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#FFFFFF", marginTop: "4px" }}>
                Transforme seu conhecimento em renda.
              </h3>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginTop: "6px", marginBottom: "14px" }}>
                Abra sua loja ou crie um curso. Urban só ganha quando você ganhar.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <a href="/mercado" style={{ textDecoration: "none", flex: 1 }}>
                  <button className="um-btn-accent" style={{ width: "100%", height: "40px", fontSize: "13px" }}>
                    Abrir loja
                  </button>
                </a>
                <a href="/sala-de-aula" style={{ textDecoration: "none", flex: 1 }}>
                  <button style={{ width: "100%", height: "40px", background: "rgba(255,255,255,0.1)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "background 150ms cubic-bezier(0.2, 0, 0, 1)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}>
                    Criar curso
                  </button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Conta */}
        <div style={{ marginTop: "32px", background: "#FFFFFF", borderRadius: "16px", border: "1px solid rgba(0,0,0,0.05)", padding: "20px 24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Conta</h3>
          <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "4px", lineHeight: 1.5 }}>
            Você pode sair a qualquer momento. Todos seus dados ficam salvos pra quando voltar.
          </p>
          <button onClick={handleSair} disabled={saindo} style={{
            marginTop: "14px", height: "44px", padding: "0 20px",
            background: "transparent", color: "#DC2626",
            border: "1.5px solid #FECACA", borderRadius: "999px",
            fontSize: "13px", fontWeight: 700, cursor: saindo ? "wait" : "pointer",
            fontFamily: "Inter, sans-serif",
            display: "inline-flex", alignItems: "center", gap: "8px",
          }}>
            <span>🚪</span> {saindo ? "Saindo..." : "Sair da conta"}
          </button>
        </div>

        {/* Posts recentes */}
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Posts recentes</h3>
          {recentPosts.map((post) => (
            <div key={post.id} className="um-card um-clickable" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Avatar name={perfil.nome} size={36} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{perfil.nome}</p>
                  <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{post.time}</p>
                </div>
              </div>
              <p style={{ fontSize: "14px", color: "#111111", lineHeight: 1.6 }}>{post.content}</p>
              <div style={{ display: "flex", gap: "16px", paddingTop: "8px", borderTop: "1px solid #F5F5F5" }}>
                <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 600 }}>♡ {post.likes}</span>
                <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 600 }}>Responder</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
