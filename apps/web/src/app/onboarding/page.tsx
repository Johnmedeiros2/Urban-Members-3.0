"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track, EVENTS } from "@/lib/analytics";

const suggestedCities = [
  "São Paulo, SP · Brasil", "Rio de Janeiro, RJ · Brasil",
  "Belo Horizonte, MG · Brasil", "Salvador, BA · Brasil",
  "Fortaleza, CE · Brasil", "Curitiba, PR · Brasil",
  "Recife, PE · Brasil", "Manaus, AM · Brasil",
  "Lisboa · Portugal", "Porto · Portugal",
  "Buenos Aires · Argentina", "Nova York · Estados Unidos",
  "Londres · Reino Unido", "Paris · França",
  "Tóquio · Japão", "Dubai · Emirados Árabes",
];

const ocupacoes = [
  "Empreendedor(a)", "Estudante", "Profissional CLT",
  "Freelancer", "Criador(a) de conteúdo", "Buscando oportunidade",
];

const objetivos = [
  "Aprender algo novo", "Vender ou divulgar meu negócio",
  "Fazer conexões", "Explorar e descobrir",
];

const momentos = [
  "Estou começando do zero", "Estou crescendo algo que já existe",
  "Estou em transição", "Estou estável e quero expandir",
];

const estilos = [
  "Prefiro consumir conteúdo", "Prefiro criar e publicar",
  "Prefiro conversar diretamente", "Quero fazer negócios",
];

interface LocationData {
  city: string; state: string; country: string; countryCode: string;
}

interface Biografia {
  ocupacao: string;
  objetivo: string;
  momento: string;
  estilo: string;
  area: string;
}

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

function SelectGrid({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            width: "100%", padding: "13px 16px", textAlign: "left",
            borderRadius: "12px", border: `1.5px solid ${selected ? "#111111" : "#E5E5E5"}`,
            background: selected ? "#111111" : "#FFFFFF",
            color: selected ? "#FFFFFF" : "#525252",
            fontSize: "14px", fontWeight: selected ? 600 : 400,
            cursor: "pointer", fontFamily: "Inter, sans-serif",
            transition: "all 0.15s",
          }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Passo 1
  const [name, setName] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locStatus, setLocStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [locError, setLocError] = useState("");
  const [visitSearch, setVisitSearch] = useState("");
  const [visitCity, setVisitCity] = useState("");
  const [showVisitSearch, setShowVisitSearch] = useState(false);

  // Passo 2 — Biografia
  const [bio, setBio] = useState<Biografia>({
    ocupacao: "", objetivo: "", momento: "", estilo: "", area: "",
  });
  const [bioStep, setBioStep] = useState<1 | 2 | 3 | 4>(1);

  // Passo 3 — LGPD
  const [lgpd, setLgpd] = useState(false);
  const [lgpdExpanded, setLgpdExpanded] = useState(false);

  const filteredCities = suggestedCities.filter((c) =>
    c.toLowerCase().includes(visitSearch.toLowerCase())
  );

  const bioCompleta = bio.ocupacao && bio.objetivo && bio.momento && bio.estilo;

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

  function saveAndEnter() {
    if (typeof window !== "undefined" && location) {
      localStorage.setItem("urban_user", JSON.stringify({
        name, location, visitCity: visitCity || null, biografia: bio, lgpd_aceito: true,
        lgpd_data: new Date().toISOString(),
      }));
    }
    track(EVENTS.ONBOARDING_COMPLETED, {
      cidade: location?.city,
      pais: location?.country,
      tem_visita: !!visitCity,
      tem_area: !!bio.area,
      ocupacao: bio.ocupacao,
      objetivo: bio.objetivo,
    });
    router.push("/feed");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", display: "flex", fontFamily: "Inter, sans-serif" }}>

      {/* Painel esquerdo */}
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
              {step === 1 ? "Seu endereço" : step === 2 ? "Biografia" : "Confirmação"}
            </span>
            <span style={{ fontSize: "12px", color: "#A3A3A3" }}>{Math.round((step / 3) * 100)}%</span>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ height: "3px", flex: 1, borderRadius: "999px", background: s <= step ? "#111111" : "#E5E5E5", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>

        {/* ── PASSO 1 — Nome + Localização ── */}
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
              <label style={LABEL}>Onde você está agora</label>
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

            {locStatus === "success" && (
              <div>
                <label style={LABEL}>Cidade que deseja visitar <span style={{ color: "#FF5C2E" }}>opcional</span></label>
                {!showVisitSearch && !visitCity && (
                  <button onClick={() => setShowVisitSearch(true)} style={{ width: "100%", height: "52px", border: "1.5px dashed #E5E5E5", borderRadius: "14px", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "14px", color: "#A3A3A3", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    <span>🗺️</span> Explorar uma cidade
                  </button>
                )}
                {visitCity && !showVisitSearch && (
                  <div style={{ width: "100%", border: "1.5px solid #E5E5E5", borderRadius: "14px", background: "#FFFFFF", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", boxSizing: "border-box" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FFF3EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🗺️</div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#525252" }}>Visitando</p>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#111111" }}>{visitCity}</p>
                      </div>
                    </div>
                    <button onClick={() => { setVisitCity(""); setShowVisitSearch(false); }} style={{ fontSize: "12px", color: "#A3A3A3", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Remover</button>
                  </div>
                )}
                {showVisitSearch && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input type="text" placeholder="Buscar cidade..." value={visitSearch} onChange={(e) => setVisitSearch(e.target.value)} autoFocus
                      style={{ ...INPUT, height: "52px", borderColor: "#111111" }} />
                    <div style={{ border: "1px solid #E5E5E5", borderRadius: "14px", overflow: "hidden", maxHeight: "200px", overflowY: "auto" }}>
                      {filteredCities.map((city) => (
                        <button key={city} onClick={() => { setVisitCity(city); setShowVisitSearch(false); setVisitSearch(""); }} style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", background: "none", border: "none", borderBottom: "1px solid #F5F5F5", cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left" }}>
                          <span>🏙️</span>
                          <span style={{ fontSize: "14px", color: "#111111" }}>{city}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => { setShowVisitSearch(false); setVisitSearch(""); }} style={{ fontSize: "13px", color: "#A3A3A3", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Cancelar</button>
                  </div>
                )}
              </div>
            )}

            <button onClick={() => name.trim() && locStatus === "success" && setStep(2)} disabled={!name.trim() || locStatus !== "success"}
              className="um-btn-accent"
              style={{ width: "100%", height: "52px", fontSize: "15px" }}>
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASSO 2 — BIOGRAFIA ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF5C2E", letterSpacing: "0.1em", textTransform: "uppercase" }}>Biografia</span>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", lineHeight: 1.2, marginTop: "4px" }}>
                {bioStep === 1 && "O que você faz?"}
                {bioStep === 2 && "Por que entrou na cidade?"}
                {bioStep === 3 && "Onde você está na vida?"}
                {bioStep === 4 && "Como prefere se conectar?"}
              </h1>
              <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "6px" }}>
                {bioStep === 1 && "Nos conte sobre sua ocupação atual."}
                {bioStep === 2 && "O que te trouxe até aqui?"}
                {bioStep === 3 && "Contexto que nos ajuda a personalizar sua experiência."}
                {bioStep === 4 && "Como você quer se relacionar na plataforma?"}
              </p>
            </div>

            {/* Progresso interno da bio */}
            <div style={{ display: "flex", gap: "4px" }}>
              {[1, 2, 3, 4].map((s) => (
                <div key={s} style={{ height: "2px", flex: 1, borderRadius: "999px", background: s <= bioStep ? "#FF5C2E" : "#E5E5E5", transition: "background 0.2s" }} />
              ))}
            </div>

            {bioStep === 1 && <SelectGrid options={ocupacoes} value={bio.ocupacao} onChange={(v) => setBio({ ...bio, ocupacao: v })} />}
            {bioStep === 2 && <SelectGrid options={objetivos} value={bio.objetivo} onChange={(v) => setBio({ ...bio, objetivo: v })} />}
            {bioStep === 3 && <SelectGrid options={momentos} value={bio.momento} onChange={(v) => setBio({ ...bio, momento: v })} />}
            {bioStep === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <SelectGrid options={estilos} value={bio.estilo} onChange={(v) => setBio({ ...bio, estilo: v })} />
                <div>
                  <label style={{ ...LABEL, marginTop: "8px" }}>Área de atuação <span style={{ color: "#A3A3A3", fontWeight: 400, textTransform: "none" as const }}>opcional</span></label>
                  <input type="text" placeholder="Ex: arquitetura, culinária, tecnologia..." value={bio.area} onChange={(e) => setBio({ ...bio, area: e.target.value })}
                    style={{ ...INPUT, height: "52px", borderColor: bio.area ? "#111111" : "#E5E5E5" }} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => bioStep > 1 ? setBioStep((bioStep - 1) as 1 | 2 | 3 | 4) : setStep(1)}
                className="um-btn-secondary"
                style={{ height: "52px", padding: "0 24px", fontSize: "15px" }}>
                ←
              </button>
              <button
                onClick={() => {
                  const currentValue = bioStep === 1 ? bio.ocupacao : bioStep === 2 ? bio.objetivo : bioStep === 3 ? bio.momento : bio.estilo;
                  if (!currentValue) return;
                  if (bioStep < 4) { setBioStep((bioStep + 1) as 1 | 2 | 3 | 4); }
                  else { setStep(3); }
                }}
                disabled={!(bioStep === 1 ? bio.ocupacao : bioStep === 2 ? bio.objetivo : bioStep === 3 ? bio.momento : bio.estilo)}
                className="um-btn-accent"
                style={{ flex: 1, height: "52px", fontSize: "15px" }}>
                {bioStep < 4 ? "Próximo →" : "Continuar →"}
              </button>
            </div>
          </div>
        )}

        {/* ── PASSO 3 — LGPD + PERFIL ── */}
        {step === 3 && location && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em", lineHeight: 1.2 }}>Quase lá,<br />{name}.</h1>
              <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "8px" }}>Leia e aceite os termos antes de entrar.</p>
            </div>

            {/* Preview perfil */}
            <div style={{ border: "1.5px solid #E5E5E5", borderRadius: "20px", overflow: "hidden" }}>
              <div style={{ height: "64px", background: "#111111", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,92,46,0.3) 0%, transparent 70%)" }} />
              </div>
              <div style={{ padding: "0 16px 16px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #FF5C2E, #FF8C5A)", border: "3px solid #FFFFFF", marginTop: "-28px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                  <span style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: 800 }}>{name.charAt(0).toUpperCase()}</span>
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#111111", marginTop: "10px" }}>{name}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <span style={{ fontSize: "12px" }}>📍</span>
                  <span style={{ fontSize: "12px", color: "#525252" }}>{location.city}{location.state ? `, ${location.state}` : ""} · {location.country}</span>
                </div>
                {visitCity && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#FFF3EF", borderRadius: "999px", padding: "3px 10px", marginTop: "6px" }}>
                    <span style={{ fontSize: "11px" }}>🗺️</span>
                    <span style={{ fontSize: "12px", color: "#FF5C2E", fontWeight: 600 }}>Visitando: {visitCity.split(" · ")[0]}</span>
                  </div>
                )}
                {bio.ocupacao && (
                  <span style={{ display: "inline-block", fontSize: "12px", color: "#525252", background: "#F5F5F5", padding: "3px 10px", borderRadius: "999px", marginTop: "6px" }}>
                    {bio.ocupacao}
                  </span>
                )}
              </div>
            </div>

            {/* Declaração LGPD */}
            <div style={{ border: "1.5px solid #E5E5E5", borderRadius: "16px", overflow: "hidden" }}>
              <button onClick={() => setLgpdExpanded(!lgpdExpanded)}
                style={{ width: "100%", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFAFA", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>Termos de Uso e Privacidade (LGPD)</span>
                <span style={{ fontSize: "12px", color: "#A3A3A3", transform: lgpdExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
              </button>

              {lgpdExpanded && (
                <div style={{ padding: "16px", background: "#FFFFFF", borderTop: "1px solid #E5E5E5", maxHeight: "280px", overflowY: "auto" }}>
                  <div style={{ fontSize: "12px", color: "#525252", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "12px" }}>

                    <p><strong style={{ color: "#111111" }}>1. Controlador dos dados</strong><br />
                    Urban Members (urbanicsa.com), doravante denominada "Plataforma", é a controladora dos dados pessoais coletados, nos termos da Lei Federal nº 13.709/2018 — Lei Geral de Proteção de Dados (LGPD).</p>

                    <p><strong style={{ color: "#111111" }}>2. Dados coletados</strong><br />
                    A Plataforma coleta: nome, localização geográfica (cidade, estado, país), endereço IP, ocupação, objetivos declarados, momento de vida, preferências de interação, área de atuação, comportamento de navegação, conteúdos publicados, interações (curtidas, comentários, conexões), dados de transações comerciais e histórico de acesso.</p>

                    <p><strong style={{ color: "#111111" }}>3. Finalidade do tratamento</strong><br />
                    Os dados são utilizados para: personalização da experiência na plataforma; funcionamento do algoritmo de relevância e sugestão de conteúdo; exibição de publicidade segmentada; comunicação sobre oportunidades, cursos e produtos; análise de desempenho e melhoria contínua; prevenção de fraudes e segurança; e cumprimento de obrigações legais.</p>

                    <p><strong style={{ color: "#111111" }}>4. Base legal (Art. 7º e 11º LGPD)</strong><br />
                    O tratamento dos dados ocorre com base no consentimento livre, informado e inequívoco do titular (Art. 7º, I); na execução do contrato de uso da plataforma (Art. 7º, V); no legítimo interesse da Plataforma (Art. 7º, IX); e no cumprimento de obrigações legais (Art. 7º, II).</p>

                    <p><strong style={{ color: "#111111" }}>5. Uso comercial e compartilhamento</strong><br />
                    Os dados poderão ser utilizados para exibição de anúncios e ofertas comerciais personalizadas dentro da Plataforma. Os dados não serão vendidos a terceiros. Poderão ser compartilhados com parceiros de infraestrutura tecnológica (servidores, analytics) sob acordos de confidencialidade e conforme exigido por lei.</p>

                    <p><strong style={{ color: "#111111" }}>6. Retenção de dados</strong><br />
                    Os dados serão retidos enquanto a conta estiver ativa. Após exclusão da conta, os dados serão removidos em até 30 dias, exceto quando a retenção for obrigatória por lei.</p>

                    <p><strong style={{ color: "#111111" }}>7. Direitos do titular (Art. 18º LGPD)</strong><br />
                    O usuário tem direito a: confirmação da existência de tratamento; acesso aos dados; correção de dados incompletos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários; portabilidade; informação sobre compartilhamento; revogação do consentimento; e revisão de decisões automatizadas. Solicitações podem ser feitas em: privacidade@urbanicsa.com</p>

                    <p><strong style={{ color: "#111111" }}>8. Segurança</strong><br />
                    A Plataforma adota medidas técnicas e organizacionais adequadas para proteção dos dados contra acesso não autorizado, destruição, perda, alteração ou divulgação indevida, em conformidade com o Art. 46º da LGPD.</p>

                    <p><strong style={{ color: "#111111" }}>9. Cookies e rastreamento</strong><br />
                    A Plataforma utiliza cookies e tecnologias semelhantes para funcionamento, autenticação, análise de comportamento e personalização. O uso continuado da Plataforma implica concordância com o uso de cookies essenciais.</p>

                    <p><strong style={{ color: "#111111" }}>10. Alterações nesta política</strong><br />
                    Esta política pode ser atualizada a qualquer momento. O usuário será notificado por e-mail ou notificação na Plataforma. O uso continuado após as alterações implica concordância com os novos termos.</p>

                    <p style={{ color: "#A3A3A3", fontSize: "11px" }}>
                      Última atualização: abril de 2026 · Urban Members / urbanicsa.com · privacidade@urbanicsa.com
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox LGPD */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
              <div onClick={() => setLgpd(!lgpd)} style={{
                width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0, marginTop: "1px",
                border: `2px solid ${lgpd ? "#111111" : "#E5E5E5"}`,
                background: lgpd ? "#111111" : "#FFFFFF",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", cursor: "pointer",
              }}>
                {lgpd && <span style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 800, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: "13px", color: "#525252", lineHeight: 1.5 }}>
                Li e concordo com os <strong style={{ color: "#111111" }}>Termos de Uso e Política de Privacidade</strong> do Urban Members, incluindo o uso dos meus dados para personalização e fins comerciais dentro da plataforma, em conformidade com a LGPD (Lei nº 13.709/2018).
              </span>
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStep(2)} className="um-btn-secondary" style={{ height: "56px", padding: "0 24px", fontSize: "15px" }}>←</button>
              <button onClick={saveAndEnter} disabled={!lgpd}
                className="um-btn-accent"
                style={{ flex: 1, height: "56px", fontSize: "15px" }}>
                Entrar na cidade →
              </button>
            </div>

            <p style={{ fontSize: "11px", color: "#A3A3A3", textAlign: "center", lineHeight: 1.5 }}>
              Ao entrar, você confirma ter 16 anos ou mais. Dúvidas: privacidade@urbanicsa.com
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
