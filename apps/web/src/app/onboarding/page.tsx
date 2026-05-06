"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { track, EVENTS } from "@/lib/analytics";

interface LocationData {
  city: string; state: string; country: string; countryCode: string;
}

const INTERESSES = [
  { id: "aprender", label: "Aprender", desc: "Cursos, professores, conteúdo educacional", emoji: "📚" },
  { id: "vender", label: "Vender", desc: "Abrir loja ou ensinar pra ganhar dinheiro", emoji: "🛒" },
  { id: "conectar", label: "Conectar", desc: "Vizinhos, comunidade, conversa real", emoji: "🤝" },
  { id: "explorar", label: "Explorar", desc: "Quero ver o que rola na cidade", emoji: "🗺️" },
];

const INPUT = {
  width: "100%", border: "1.5px solid #E5E5E5", borderRadius: "14px",
  padding: "0 16px", fontSize: "14px", color: "#111111", outline: "none",
  background: "#FFFFFF", fontFamily: "Inter, sans-serif", boxSizing: "border-box" as const,
  transition: "border-color 0.2s",
};

const LABEL = {
  fontSize: "11px", fontWeight: 700 as const, color: "#525252",
  textTransform: "uppercase" as const, letterSpacing: "0.06em",
  display: "block", marginBottom: "8px",
};

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Identidade
  const [name, setName] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [locError, setLocError] = useState("");

  // Aha — contadores
  const [totalMoradores, setTotalMoradores] = useState<number | null>(null);
  const [moradoresCidade, setMoradoresCidade] = useState<number | null>(null);
  const [carregandoStats, setCarregandoStats] = useState(false);

  // Personalização
  const [interesse, setInteresse] = useState("");
  const [lgpd, setLgpd] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Busca contadores quando entra na tela 2
  useEffect(() => {
    if (step !== 2 || !location) return;
    setCarregandoStats(true);
    (async () => {
      const supabase = createClient();
      const [total, cidade] = await Promise.all([
        supabase.from("perfis").select("id", { count: "exact", head: true }),
        supabase.from("perfis").select("id", { count: "exact", head: true }).eq("cidade", location.city),
      ]);
      setTotalMoradores(total.count ?? 0);
      setMoradoresCidade(cidade.count ?? 0);
      setCarregandoStats(false);
    })();
  }, [step, location]);

  async function requestLocation() {
    setLocStatus("loading");
    setLocError("");
    if (!navigator.geolocation) {
      setLocStatus("error");
      setLocError("Seu dispositivo não suporta geolocalização.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`,
            { headers: { "User-Agent": "UrbanMembers/3.0" } }
          );
          const data = await res.json();
          const addr = data.address;
          setLocation({
            city: addr.city || addr.town || addr.village || addr.municipality || "Cidade",
            state: addr.state || "",
            country: addr.country || "",
            countryCode: (addr.country_code || "br").toUpperCase(),
          });
          setLocStatus("success");
        } catch {
          setLocStatus("error");
          setLocError("Não foi possível identificar sua localização.");
        }
      },
      () => { setLocStatus("error"); setLocError("Permissão negada. Tente novamente."); },
      { timeout: 10000 }
    );
  }

  async function finalizar() {
    if (!lgpd || salvando) return;
    setSalvando(true);

    if (typeof window !== "undefined" && location) {
      localStorage.setItem("urban_user", JSON.stringify({
        name,
        location,
        biografia: { objetivo: interesse },
        lgpd_aceito: true,
        lgpd_data: new Date().toISOString(),
      }));
    }

    track(EVENTS.ONBOARDING_COMPLETED, {
      cidade: location?.city,
      pais: location?.country,
      interesse: interesse || "nao_informado",
    });

    router.push("/feed");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", fontFamily: "Inter, sans-serif" }}>

      {/* Painel esquerdo (escondido em mobile) */}
      <div style={{ flex: 1, background: "#111111", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px", position: "relative", overflow: "hidden" }} className="hidden md:flex">
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 70%, rgba(255,92,46,0.15) 0%, transparent 60%)" }} />
        <img src="/logo.svg" alt="Urban Members" width={48} height={48} style={{ position: "relative", filter: "invert(1)" }} />
        <div style={{ position: "relative" }}>
          <p style={{ fontSize: "13px", color: "#FF5C2E", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>A primeira cidade digital brasileira</p>
          <h2 style={{ fontSize: "36px", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: "24px" }}>Sua cidade.<br />Sem sair<br />de casa.</h2>
          {["Conecte com pessoas da sua região", "Explore cidades do mundo inteiro", "Faça negócios sem fronteiras"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FF5C2E", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", color: "#A3A3A3" }}>{item}</span>
            </div>
          ))}
        </div>
        <p style={{ position: "relative", fontSize: "12px", color: "#525252" }}>urbanicsa.com</p>
      </div>

      {/* Painel direito */}
      <div style={{ width: "100%", maxWidth: "520px", padding: "48px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "32px" }}>

        {/* Progress */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 600 }}>
              {step === 1 && "Seu endereço"}
              {step === 2 && "Sua cidade"}
              {step === 3 && "Quase lá"}
            </span>
            <span style={{ fontSize: "12px", color: "#A3A3A3" }}>{Math.round((step / 3) * 100)}%</span>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ height: "3px", flex: 1, borderRadius: "999px", background: s <= step ? "#111111" : "#E5E5E5", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>

        {/* ── PASSO 1 — Identidade ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", lineHeight: 1.2 }}>Quem é você<br />na cidade?</h1>
              <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "8px" }}>Todo morador tem nome e endereço.</p>
            </div>

            <div>
              <label style={LABEL}>Nome</label>
              <input type="text" placeholder="Como quer ser chamado?" value={name} onChange={(e) => setName(e.target.value)}
                style={{ ...INPUT, height: "52px", borderColor: name ? "#111111" : "#E5E5E5" }} />
            </div>

            <div>
              <label style={LABEL}>Onde você está</label>
              {locStatus === "idle" && (
                <button onClick={requestLocation} style={{ width: "100%", height: "52px", border: "1.5px dashed #E5E5E5", borderRadius: "14px", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "14px", color: "#525252", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  <span>📍</span> Usar minha localização atual
                </button>
              )}
              {locStatus === "loading" && (
                <div style={{ width: "100%", height: "52px", border: "1.5px solid #E5E5E5", borderRadius: "14px", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "#A3A3A3" }}>
                  Identificando localização...
                </div>
              )}
              {locStatus === "success" && location && (
                <div style={{ width: "100%", border: "1.5px solid #111111", borderRadius: "14px", background: "#FFFFFF", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📍</div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{location.city}</p>
                      <p style={{ fontSize: "12px", color: "#A3A3A3" }}>{location.state && `${location.state} · `}{location.country}</p>
                    </div>
                  </div>
                  <button onClick={() => { setLocStatus("idle"); setLocation(null); }} style={{ fontSize: "12px", color: "#A3A3A3", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Trocar</button>
                </div>
              )}
              {locStatus === "error" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p style={{ fontSize: "12px", color: "#EF4444" }}>{locError}</p>
                  <button onClick={requestLocation} style={{ width: "100%", height: "52px", border: "1.5px dashed #E5E5E5", borderRadius: "14px", background: "#FAFAFA", fontSize: "14px", color: "#525252", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Tentar novamente</button>
                </div>
              )}
            </div>

            <button onClick={() => name.trim() && locStatus === "success" && setStep(2)} disabled={!name.trim() || locStatus !== "success"}
              className="um-btn-accent"
              style={{ width: "100%", height: "52px", fontSize: "15px" }}>
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASSO 2 — Aha (NOVO) ── */}
        {step === 2 && location && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF5C2E", letterSpacing: "0.1em", textTransform: "uppercase" }}>Bem-vindo</span>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", lineHeight: 1.2, marginTop: "4px" }}>
                Olá, {name.split(" ")[0]}.<br />Você chegou na cidade.
              </h1>
            </div>

            {/* Cards com contadores */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: "#111111", borderRadius: "16px", padding: "20px 24px", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,92,46,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🏘️</div>
                <div>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>Você é o morador</p>
                  <p style={{ fontSize: "24px", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
                    {carregandoStats ? "..." : `#${(totalMoradores ?? 0) + 1}`}
                  </p>
                </div>
              </div>

              <div style={{ background: "#FFF3EF", borderRadius: "16px", padding: "20px 24px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📍</div>
                <div>
                  <p style={{ fontSize: "12px", color: "#525252", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>Em {location.city}</p>
                  <p style={{ fontSize: "24px", fontWeight: 800, color: "#111111", marginTop: "2px" }}>
                    {carregandoStats ? "..." : `${moradoresCidade ?? 0} ${moradoresCidade === 1 ? "vizinho" : "vizinhos"}`}
                  </p>
                </div>
              </div>

              {(moradoresCidade ?? 0) === 0 && !carregandoStats && (
                <div style={{ background: "#F0F9FF", border: "1.5px solid #BAE6FD", borderRadius: "12px", padding: "12px 16px" }}>
                  <p style={{ fontSize: "12px", color: "#075985", lineHeight: 1.5 }}>
                    💡 Você é o <strong>primeiro morador</strong> de {location.city}. Convide vizinhos depois e ganhe Urban Score.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button onClick={() => setStep(1)} className="um-btn-secondary" style={{ height: "52px", padding: "0 24px", fontSize: "15px" }}>
                ←
              </button>
              <button onClick={() => setStep(3)} className="um-btn-accent" style={{ flex: 1, height: "52px", fontSize: "15px" }}>
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* ── PASSO 3 — Personalização opcional + LGPD ── */}
        {step === 3 && location && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", lineHeight: 1.2 }}>O que mais<br />te interessa?</h1>
              <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "8px" }}>Pra gente personalizar sua experiência. Você pode pular.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {INTERESSES.map((opt) => {
                const selected = interesse === opt.id;
                return (
                  <button key={opt.id} onClick={() => setInteresse(opt.id)} style={{
                    width: "100%", padding: "14px 16px", textAlign: "left",
                    borderRadius: "12px", border: `1.5px solid ${selected ? "#111111" : "#E5E5E5"}`,
                    background: selected ? "#111111" : "#FFFFFF",
                    color: selected ? "#FFFFFF" : "#525252",
                    fontSize: "14px", cursor: "pointer", fontFamily: "Inter, sans-serif",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: "12px",
                  }}>
                    <span style={{ fontSize: "20px" }}>{opt.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: selected ? 700 : 600, color: selected ? "#FFFFFF" : "#111111" }}>{opt.label}</p>
                      <p style={{ fontSize: "12px", color: selected ? "rgba(255,255,255,0.7)" : "#A3A3A3", marginTop: "2px" }}>{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Checkbox LGPD */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", marginTop: "8px" }}>
              <div onClick={() => setLgpd(!lgpd)} style={{
                width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0, marginTop: "1px",
                border: `2px solid ${lgpd ? "#111111" : "#E5E5E5"}`,
                background: lgpd ? "#111111" : "#FFFFFF",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", cursor: "pointer",
              }}>
                {lgpd && <span style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 800, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: "12px", color: "#525252", lineHeight: 1.5 }}>
                Li e concordo com os <a href="/termos" style={{ color: "#111111", fontWeight: 600 }}>Termos de Uso</a> e <a href="/privacidade" style={{ color: "#111111", fontWeight: 600 }}>Política de Privacidade</a> (LGPD).
              </span>
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStep(2)} className="um-btn-secondary" style={{ height: "52px", padding: "0 24px", fontSize: "15px" }}>
                ←
              </button>
              <button onClick={finalizar} disabled={!lgpd || salvando}
                className="um-btn-accent"
                style={{ flex: 1, height: "52px", fontSize: "15px" }}>
                {salvando ? "Entrando..." : "Entrar na cidade →"}
              </button>
            </div>

            <p style={{ fontSize: "11px", color: "#A3A3A3", textAlign: "center", lineHeight: 1.5 }}>
              16 anos ou mais. Dúvidas: privacidade@urbanicsa.com
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
