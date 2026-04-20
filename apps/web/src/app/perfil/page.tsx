"use client";

import { useEffect, useState } from "react";
import ScoreBadge from "@/components/ui/ScoreBadge";
import Avatar from "@/components/ui/Avatar";

interface UserData {
  name: string;
  interest: string;
  location: {
    city: string;
    state: string;
    country: string;
    countryCode: string;
  };
  visitCity?: string | null;
}

const MOCK: UserData = {
  name: "João Medeiros",
  interest: "Negócios",
  location: { city: "São Paulo", state: "São Paulo", country: "Brasil", countryCode: "BR" },
  visitCity: "Lisboa · Portugal",
};

const stats = [
  { label: "Posts",      value: "24"  },
  { label: "Conexões",   value: "138" },
  { label: "Bairros",    value: "3"   },
];

const recentPosts = [
  { id: 1, content: "Acabei de fechar meu primeiro negócio pelo Mercado Urbano. Esse lugar funciona de verdade.", time: "2h", likes: 18 },
  { id: 2, content: "Quem mais está no bairro Negócios e quer conectar? Vamos trocar ideia sobre vendas digitais.", time: "1d", likes: 31 },
];

export default function Perfil() {
  const [user, setUser] = useState<UserData>(MOCK);

  useEffect(() => {
    const stored = localStorage.getItem("urban_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}>
        <div style={{
          maxWidth: "720px", margin: "0 auto",
          padding: "0 24px", height: "60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
            <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111" }}>
              Urban Members
            </span>
          </div>
          <ScoreBadge score={320} compact />
        </div>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Cartão de perfil */}
        <div style={{
          background: "#FFFFFF", borderRadius: "20px",
          overflow: "hidden", marginTop: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}>
          {/* Capa */}
          <div style={{ height: "120px", background: "#111111", position: "relative" }}>
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "radial-gradient(circle at 20% 60%, rgba(255,92,46,0.25) 0%, transparent 60%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.04) 0%, transparent 50%)",
            }} />
          </div>

          <div style={{ padding: "0 24px 24px" }}>
            {/* Avatar + ações */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "-36px", marginBottom: "16px" }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "linear-gradient(135deg, #FF5C2E, #FF8C5A)",
                border: "3px solid #FFFFFF",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}>
                <span style={{ color: "#FFFFFF", fontSize: "26px", fontWeight: 800 }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <button style={{
                height: "36px", padding: "0 20px",
                background: "#111111", color: "#FFFFFF",
                border: "none", borderRadius: "999px",
                fontSize: "13px", fontWeight: 700,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}>
                Editar perfil
              </button>
            </div>

            {/* Nome e endereço */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>
                {user.name}
              </h1>

              {/* Localização atual */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#F5F5F5", borderRadius: "999px",
                padding: "5px 12px", alignSelf: "flex-start",
              }}>
                <span style={{ fontSize: "12px" }}>📍</span>
                <span style={{ fontSize: "13px", color: "#525252", fontWeight: 500 }}>
                  {user.location.city}
                  {user.location.state && user.location.state !== user.location.city
                    ? `, ${user.location.state}` : ""}
                  {` · ${user.location.country}`}
                </span>
              </div>

              {/* Cidade visitando */}
              {user.visitCity && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  background: "#FFF3EF", borderRadius: "999px",
                  padding: "5px 12px", alignSelf: "flex-start",
                }}>
                  <span style={{ fontSize: "12px" }}>🗺️</span>
                  <span style={{ fontSize: "13px", color: "#FF5C2E", fontWeight: 600 }}>
                    Visitando: {user.visitCity.split(" · ")[0]}
                  </span>
                  {user.visitCity.split(" · ")[1] && (
                    <span style={{ fontSize: "12px", color: "#FFB39A" }}>
                      · {user.visitCity.split(" · ")[1]}
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                <span style={{
                  fontSize: "12px", fontWeight: 600, color: "#FF5C2E",
                  background: "#FFF3EF", padding: "3px 12px", borderRadius: "999px",
                }}>
                  {user.interest}
                </span>
                <span style={{
                  fontSize: "12px", fontWeight: 600, color: "#525252",
                  background: "#F5F5F5", padding: "3px 12px", borderRadius: "999px",
                }}>
                  Bairro Negócios
                </span>
                <span style={{
                  fontSize: "12px", fontWeight: 600, color: "#525252",
                  background: "#F5F5F5", padding: "3px 12px", borderRadius: "999px",
                }}>
                  Morador desde 2026
                </span>
              </div>
            </div>

            {/* Stats */}
            <div style={{
              display: "flex", gap: "0",
              marginTop: "20px", borderTop: "1px solid #F5F5F5", paddingTop: "20px",
            }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{
                  flex: 1, textAlign: "center",
                  borderRight: i < stats.length - 1 ? "1px solid #F5F5F5" : "none",
                  padding: "0 8px",
                }}>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>
                    {s.value}
                  </p>
                  <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "2px" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Urban Score detalhado */}
        <div style={{
          background: "#FFFFFF", borderRadius: "20px",
          padding: "20px 24px", marginTop: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.05)",
          display: "flex", flexDirection: "column", gap: "14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Urban Score</h3>
            <ScoreBadge score={320} />
          </div>

          {/* Barra de progresso */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "12px", color: "#A3A3A3" }}>Rising → Urban</span>
              <span style={{ fontSize: "12px", color: "#525252", fontWeight: 600 }}>320 / 300 pts</span>
            </div>
            <div style={{ background: "#F5F5F5", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
              <div style={{
                width: "100%", height: "100%",
                background: "linear-gradient(90deg, #FF5C2E, #FF8C5A)",
                borderRadius: "999px",
              }} />
            </div>
            <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "6px" }}>
              Você atingiu o nível Urban. Próximo: Elite (600 pts)
            </p>
          </div>

          {/* Tiers */}
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { label: "Starter", pts: "0",   active: false },
              { label: "Rising",  pts: "100",  active: false },
              { label: "Urban",   pts: "300",  active: true  },
              { label: "Elite",   pts: "600",  active: false },
              { label: "Legend",  pts: "900",  active: false },
            ].map((tier) => (
              <div key={tier.label} style={{
                flex: 1, textAlign: "center", padding: "8px 4px",
                borderRadius: "10px",
                background: tier.active ? "#111111" : "#F5F5F5",
              }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: tier.active ? "#FFFFFF" : "#A3A3A3" }}>
                  {tier.label}
                </p>
                <p style={{ fontSize: "10px", color: tier.active ? "rgba(255,255,255,0.6)" : "#C4C4C4" }}>
                  {tier.pts}pts
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Posts recentes */}
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>Posts recentes</h3>
          {recentPosts.map((post) => (
            <div key={post.id} style={{
              background: "#FFFFFF", borderRadius: "16px",
              padding: "16px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.05)",
              display: "flex", flexDirection: "column", gap: "10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Avatar name={user.name} size={36} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{user.name}</p>
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
