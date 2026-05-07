"use client";

import { useState, useEffect, useCallback } from "react";
import BotaoConvite from "@/components/ui/BotaoConvite";
import AvatarMenu from "@/components/ui/AvatarMenu";
import { agendaDoMorador, type EventoAgenda } from "@/lib/queries";

function formatarDia(dataIso: string): string {
  const d = new Date(dataIso);
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1);
  const dataSemHora = new Date(d); dataSemHora.setHours(0, 0, 0, 0);
  if (dataSemHora.getTime() === hoje.getTime()) return "Hoje";
  if (dataSemHora.getTime() === amanha.getTime()) return "Amanhã";
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

function formatarHora(dataIso: string): string {
  return new Date(dataIso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function chaveDia(dataIso: string): string {
  const d = new Date(dataIso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

const TIPO_COR: Record<string, { bg: string; cor: string; icone: string; label: string }> = {
  "live":       { bg: "#FFF3EF", cor: "#FF5C2E", icone: "🔴", label: "Live"      },
  "aula":       { bg: "#E0F2FE", cor: "#0369A1", icone: "📚", label: "Aula ao vivo" },
  "curso-novo": { bg: "#F0FDF4", cor: "#10B981", icone: "✨", label: "Curso novo" },
};

export default function Agenda() {
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [escopo, setEscopo] = useState<"todos" | "meus">("todos");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setEventos(await agendaDoMorador(escopo));
    } catch {
      // falha silenciosa
    } finally {
      setCarregando(false);
    }
  }, [escopo]);

  useEffect(() => {
    carregar();
    const _t = setTimeout(() => setCarregando(false), 8000);
    return () => clearTimeout(_t);
  }, [carregar]);

  // Agrupa por dia
  const grupos = new Map<string, { label: string; eventos: EventoAgenda[] }>();
  eventos.forEach((e) => {
    const k = chaveDia(e.data);
    if (!grupos.has(k)) grupos.set(k, { label: formatarDia(e.data), eventos: [] });
    grupos.get(k)!.eventos.push(e);
  });
  const diasOrdenados = [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Urban Members</span>
            </a>
            <span style={{ fontSize: "13px", color: "#A3A3A3", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Agenda</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BotaoConvite variant="ghost" />
            <AvatarMenu size={32} />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Agenda</h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "4px" }}>Tudo que vai rolar na cidade nos próximos dias.</p>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {([
            { id: "todos" as const, label: "Toda a cidade" },
            { id: "meus"  as const, label: "Só meus"      },
          ]).map((f) => (
            <button key={f.id} onClick={() => setEscopo(f.id)}
              className={`um-chip ${escopo === f.id ? "active" : ""}`}
              style={{ height: "36px", padding: "0 16px", fontSize: "12px" }}>
              {f.label}
            </button>
          ))}
        </div>

        {carregando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#A3A3A3" }}>Carregando agenda...</div>
        ) : eventos.length === 0 ? (
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "48px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#FFF3EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", margin: "0 auto 14px" }}>📅</div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>Agenda vazia</p>
            <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "6px" }}>
              {escopo === "meus" ? "Você não tem nada agendado. Crie uma live ou aula ao vivo." : "Ninguém agendou nada ainda. Seja o primeiro!"}
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "18px" }}>
              <a href="/lives" style={{ textDecoration: "none" }}>
                <button className="um-btn-accent" style={{ height: "40px", padding: "0 18px", fontSize: "13px" }}>
                  Criar live
                </button>
              </a>
              <a href="/sala-de-aula" style={{ textDecoration: "none" }}>
                <button className="um-btn-secondary" style={{ height: "40px", padding: "0 18px", fontSize: "13px" }}>
                  Criar curso
                </button>
              </a>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {diasOrdenados.map(([k, grupo]) => (
              <div key={k}>
                <h2 style={{ fontSize: "13px", fontWeight: 800, color: "#525252", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                  {grupo.label}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {grupo.eventos.map((ev) => {
                    const t = TIPO_COR[ev.tipo];
                    return (
                      <a key={ev.id} href={ev.href} style={{ textDecoration: "none" }}>
                        <div className="um-card um-clickable" style={{ padding: "14px 16px", display: "flex", gap: "12px" }}>
                          <div style={{ width: "48px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111", lineHeight: 1 }}>{formatarHora(ev.data)}</span>
                          </div>
                          <div style={{ width: "1px", background: "#F5F5F5" }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "10px", fontWeight: 700, color: t.cor, background: t.bg, padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                {t.icone} {t.label}
                              </span>
                              {ev.ao_vivo_agora && (
                                <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFFFFF", background: "#FF5C2E", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                  Ao vivo agora
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111", lineHeight: 1.3 }}>{ev.titulo}</p>
                            {ev.autor_nome && (
                              <p style={{ fontSize: "12px", color: "#A3A3A3", marginTop: "2px" }}>por {ev.autor_nome}</p>
                            )}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
