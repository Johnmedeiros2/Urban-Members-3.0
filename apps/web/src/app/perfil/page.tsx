"use client";

import { useEffect, useState } from "react";
import ScoreBadge from "@/components/ui/ScoreBadge";
import Avatar from "@/components/ui/Avatar";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { createClient, supabaseConfigured } from "@/lib/supabase";

interface Perfil {
  nome: string;
  cidade: string;
  estado: string;
  pais: string;
  cidade_visita?: string | null;
  ocupacao?: string;
  urban_score: number;
  criado_em?: string;
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
  const [perfil, setPerfil] = useState<Perfil>(MOCK);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [nomeEdit, setNomeEdit] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregar() {
      // 1. Tenta Supabase
      if (supabaseConfigured) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
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
  }, []);

  async function salvarNome() {
    if (!nomeEdit.trim()) return;
    setSalvando(true);
    if (supabaseConfigured) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
            <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111" }}>Urban Members</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BotaoConvite variant="ghost" />
            <ScoreBadge score={perfil.urban_score} compact />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Cartão de perfil */}
        <div style={{ background: "#FFFFFF", borderRadius: "20px", overflow: "hidden", marginTop: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }}>
          <div style={{ height: "120px", background: "#111111", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 60%, rgba(255,92,46,0.25) 0%, transparent 60%)" }} />
          </div>
          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "-36px", marginBottom: "16px" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #FF5C2E, #FF8C5A)", border: "3px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <span style={{ color: "#FFFFFF", fontSize: "26px", fontWeight: 800 }}>{perfil.nome.charAt(0).toUpperCase()}</span>
              </div>
              <button onClick={() => { setEditando(!editando); setNomeEdit(perfil.nome); }} style={{ height: "36px", padding: "0 20px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                {editando ? "Cancelar" : "Editar perfil"}
              </button>
            </div>

            {/* Nome editável */}
            {editando ? (
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                <input value={nomeEdit} onChange={(e) => setNomeEdit(e.target.value)}
                  style={{ flex: 1, height: "40px", border: "1.5px solid #111111", borderRadius: "10px", padding: "0 12px", fontSize: "16px", fontWeight: 700, color: "#111111", outline: "none", fontFamily: "Inter, sans-serif" }} />
                <button onClick={salvarNome} disabled={salvando} style={{ height: "40px", padding: "0 18px", background: "#FF5C2E", color: "#FFFFFF", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
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

        {/* Posts recentes */}
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Posts recentes</h3>
          {recentPosts.map((post) => (
            <div key={post.id} style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
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
