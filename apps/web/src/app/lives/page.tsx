"use client";

import { useState, useEffect, useCallback } from "react";
import Avatar from "@/components/ui/Avatar";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { buscarLives, criarLive, atualizarLiveStatus, deletarLive, type Live } from "@/lib/queries";
import { createClient } from "@/lib/supabase";

export default function Lives() {
  const [lives, setLives] = useState<Live[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [agendado, setAgendado] = useState("");
  const [link, setLink] = useState("");
  const [tipo, setTipo] = useState<"nativa" | "externa">("nativa");
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [l, { data: { user } }] = await Promise.all([
      buscarLives(),
      createClient().auth.getUser(),
    ]);
    setLives(l);
    setMeuId(user?.id ?? null);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function salvar() {
    if (!titulo.trim()) return;
    if (tipo === "externa" && !link.trim()) {
      alert("Cole o link da transmissão (Zoom, Meet, YouTube, IG Live).");
      return;
    }
    setSalvando(true);
    try {
      await criarLive({
        titulo,
        descricao,
        agendado_para: agendado ? new Date(agendado).toISOString() : null,
        link,
        tipo,
      });
      setTitulo(""); setDescricao(""); setAgendado(""); setLink(""); setTipo("nativa");
      setModal(false);
      await carregar();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setSalvando(false);
    }
  }

  async function toggleAoVivo(live: Live) {
    await atualizarLiveStatus(live.id, !live.ao_vivo);
    await carregar();
  }

  async function apagar(id: string) {
    if (!confirm("Apagar esta live?")) return;
    await deletarLive(id);
    await carregar();
  }

  const aoVivo = lives.filter((l) => l.ao_vivo);
  const agendadas = lives.filter((l) => !l.ao_vivo && l.agendado_para && new Date(l.agendado_para) > new Date());
  const passadas = lives.filter((l) => !l.ao_vivo && l.agendado_para && new Date(l.agendado_para) <= new Date());

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Urban Members</span>
            </a>
            <span style={{ fontSize: "13px", color: "#A3A3A3", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Lives</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <BotaoConvite variant="ghost" />
            <button onClick={() => setModal(true)} className="um-btn-accent" style={{ height: "36px", padding: "0 18px", fontSize: "13px" }}>
              + Nova live
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Lives da cidade</h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "4px" }}>Transmissões ao vivo dos moradores. Agende ou entre na hora.</p>
        </div>

        {carregando ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#A3A3A3" }}>Carregando...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {aoVivo.length > 0 && (
              <Secao titulo="🔴 Ao vivo agora" lives={aoVivo} meuId={meuId} onToggle={toggleAoVivo} onApagar={apagar} destaque />
            )}
            {agendadas.length > 0 && (
              <Secao titulo="📅 Agendadas" lives={agendadas} meuId={meuId} onToggle={toggleAoVivo} onApagar={apagar} />
            )}
            {passadas.length > 0 && (
              <Secao titulo="Passadas" lives={passadas} meuId={meuId} onToggle={toggleAoVivo} onApagar={apagar} atenuado />
            )}
            {lives.length === 0 && (
              <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "48px 24px", textAlign: "center", border: "1px solid rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#111111" }}>Ninguém transmitindo ainda</p>
                <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "6px" }}>Seja o primeiro — agende uma live pra cidade.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "24px", maxWidth: "460px", width: "100%", display: "flex", flexDirection: "column", gap: "12px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#111111" }}>Nova live</h2>

            <label style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.04em" }}>Onde vai transmitir</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setTipo("nativa")}
                style={{
                  padding: "12px", borderRadius: "12px", cursor: "pointer", textAlign: "left",
                  border: tipo === "nativa" ? "2px solid #FF5C2E" : "1.5px solid #E5E5E5",
                  background: tipo === "nativa" ? "#FFF3EF" : "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>🎥 Aqui mesmo</p>
                <p style={{ fontSize: "11px", color: "#525252", marginTop: "4px" }}>Câmera direto na página, sem precisar sair.</p>
              </button>
              <button
                type="button"
                onClick={() => setTipo("externa")}
                style={{
                  padding: "12px", borderRadius: "12px", cursor: "pointer", textAlign: "left",
                  border: tipo === "externa" ? "2px solid #FF5C2E" : "1.5px solid #E5E5E5",
                  background: tipo === "externa" ? "#FFF3EF" : "#FFFFFF",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>🔗 Link externo</p>
                <p style={{ fontSize: "11px", color: "#525252", marginTop: "4px" }}>Vou usar Zoom, YouTube, IG Live etc.</p>
              </button>
            </div>

            <input placeholder="Título da live" value={titulo} onChange={(e) => setTitulo(e.target.value)}
              style={{ height: "44px", border: "1.5px solid #E5E5E5", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }} />
            <textarea placeholder="Sobre o que vai falar" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3}
              style={{ border: "1.5px solid #E5E5E5", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif", resize: "none" }} />
            <label style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.04em" }}>Quando (opcional)</label>
            <input type="datetime-local" value={agendado} onChange={(e) => setAgendado(e.target.value)}
              style={{ height: "44px", border: "1.5px solid #E5E5E5", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }} />

            {tipo === "externa" && (
              <>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#525252", textTransform: "uppercase", letterSpacing: "0.04em" }}>Link da transmissão (obrigatório)</label>
                <input placeholder="https://zoom.us/... ou https://youtube.com/..." value={link} onChange={(e) => setLink(e.target.value)}
                  style={{ height: "44px", border: "1.5px solid #E5E5E5", borderRadius: "10px", padding: "0 12px", fontSize: "13px", outline: "none", fontFamily: "Inter, sans-serif" }} />
              </>
            )}

            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
              <button onClick={() => setModal(false)} className="um-btn-secondary" style={{ flex: 1, height: "42px", fontSize: "13px" }}>Cancelar</button>
              <button onClick={salvar} disabled={!titulo.trim() || salvando} className="um-btn-accent" style={{ flex: 1, height: "42px", fontSize: "13px" }}>
                {salvando ? "Salvando..." : "Criar live"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Secao({ titulo, lives, meuId, onToggle, onApagar, destaque, atenuado }: {
  titulo: string; lives: Live[]; meuId: string | null;
  onToggle: (l: Live) => void; onApagar: (id: string) => void;
  destaque?: boolean; atenuado?: boolean;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "16px", fontWeight: 800, color: "#111111", marginBottom: "12px" }}>{titulo}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
        {lives.map((l) => (
          <div key={l.id} className={destaque ? "um-clickable" : "um-card um-clickable"} style={{
            background: destaque ? "linear-gradient(135deg, #111111, #1F1F1F)" : undefined,
            color: destaque ? "#FFFFFF" : "#111111",
            borderRadius: destaque ? "16px" : undefined,
            padding: "16px",
            opacity: atenuado ? 0.6 : 1,
            display: "flex", flexDirection: "column", gap: "10px",
          }}
            onClick={(e) => {
              if ((e.target as HTMLElement).tagName === "BUTTON" || (e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return;
              window.location.href = `/live/${l.id}`;
            }}
          >
            {destaque && (
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#FFFFFF", background: "#FF5C2E", padding: "3px 10px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.08em", alignSelf: "flex-start" }}>
                🔴 Ao vivo
              </span>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Avatar name={l.autor?.nome ?? "?"} foto={l.autor?.foto_url ?? null} size={28} />
              <p style={{ fontSize: "12px", fontWeight: 600 }}>{l.autor?.nome ?? "Morador"}</p>
            </div>
            <h3 style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1.4 }}>{l.titulo}</h3>
            {l.descricao && <p style={{ fontSize: "12px", opacity: 0.7, lineHeight: 1.5 }}>{l.descricao}</p>}
            {l.agendado_para && (
              <p style={{ fontSize: "11px", opacity: 0.7 }}>
                📅 {new Date(l.agendado_para).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            )}
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              {l.link && l.ao_vivo && (
                <a href={l.link} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: "none" }}>
                  <button className="um-btn-accent" style={{ width: "100%", height: "36px", fontSize: "12px" }}>
                    Entrar →
                  </button>
                </a>
              )}
              {meuId === l.autor_id && (
                <>
                  {l.tipo === "nativa" ? (
                    <a href={`/live/${l.id}/transmitir`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: "none" }}>
                      <button style={{ width: "100%", height: "36px", background: destaque ? "rgba(255,255,255,0.15)" : "#FF5C2E", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                        {l.ao_vivo ? "Voltar pro estúdio" : "Abrir estúdio"}
                      </button>
                    </a>
                  ) : (
                    <button onClick={() => onToggle(l)} style={{ flex: 1, height: "36px", background: destaque ? "rgba(255,255,255,0.15)" : "#F5F5F5", color: destaque ? "#FFFFFF" : "#111111", border: "none", borderRadius: "999px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                      {l.ao_vivo ? "Encerrar" : "Iniciar"}
                    </button>
                  )}
                  <button onClick={() => onApagar(l.id)} style={{ width: "36px", height: "36px", background: "transparent", color: destaque ? "#FFFFFF" : "#A3A3A3", border: "none", borderRadius: "50%", fontSize: "14px", cursor: "pointer" }}>✕</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
