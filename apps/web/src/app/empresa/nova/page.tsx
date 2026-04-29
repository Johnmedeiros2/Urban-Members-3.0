"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BotaoConvite from "@/components/ui/BotaoConvite";
import { criarEmpresa, SEGMENTOS_EMPRESA } from "@/lib/queries";

const INPUT: React.CSSProperties = {
  width: "100%", height: "48px",
  borderRadius: "12px", padding: "0 14px",
  fontSize: "14px", color: "#111111",
  outline: "none", background: "#FFFFFF",
  fontFamily: "Inter, sans-serif",
  border: "1.5px solid #E5E5E5",
  boxSizing: "border-box",
};

const LABEL: React.CSSProperties = {
  fontSize: "11px", fontWeight: 700, color: "#525252",
  textTransform: "uppercase", letterSpacing: "0.06em",
  display: "block", marginBottom: "6px",
};

export default function NovaEmpresa() {
  const router = useRouter();
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [segmento, setSegmento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [site, setSite] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { alert("Máx 5MB"); return; }
    setFoto(f);
    setPreviewFoto(URL.createObjectURL(f));
  }

  async function salvar() {
    if (!nomeFantasia.trim()) { setErro("Nome fantasia é obrigatório"); return; }
    setSalvando(true);
    setErro("");
    try {
      const empresa = await criarEmpresa({
        nome_fantasia: nomeFantasia,
        razao_social: razaoSocial,
        cnpj,
        segmento,
        descricao,
        cidade,
        estado,
        site,
        email_contato: email,
        telefone,
        foto,
      });
      router.push(`/empresa/${empresa.id}`);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro ao criar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/perfil" style={{ textDecoration: "none" }}>
              <button className="um-icon-btn" aria-label="Voltar">←</button>
            </a>
            <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>Nova empresa</span>
          </div>
          <BotaoConvite variant="ghost" />
        </div>
      </header>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 24px 80px" }}>

        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>Cadastrar empresa</h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3", marginTop: "4px" }}>Crie um perfil de empresa separado do seu pessoal. Vincule produtos, cursos e seguidores.</p>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "28px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Logo */}
          <div>
            <label style={LABEL}>Logo (opcional)</label>
            <input ref={fotoInputRef} type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div onClick={() => fotoInputRef.current?.click()}
                style={{ width: "76px", height: "76px", borderRadius: "16px", background: previewFoto ? `url(${previewFoto}) center/cover` : "#F5F5F5", border: "2px dashed #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "20px", color: "#A3A3A3" }}>
                {!previewFoto && "+"}
              </div>
              {previewFoto && (
                <button onClick={() => { setFoto(null); setPreviewFoto(null); if (fotoInputRef.current) fotoInputRef.current.value = ""; }}
                  style={{ background: "none", border: "none", color: "#A3A3A3", fontSize: "12px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  Remover
                </button>
              )}
            </div>
          </div>

          {/* Nome fantasia */}
          <div>
            <label style={LABEL}>Nome fantasia *</label>
            <input value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} placeholder="Ex: Padaria Pão Quente" style={INPUT} />
          </div>

          {/* Razão social + CNPJ */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={LABEL}>Razão social</label>
              <input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Ex: Pão Quente LTDA" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>CNPJ</label>
              <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" style={INPUT} />
            </div>
          </div>

          {/* Segmento */}
          <div>
            <label style={LABEL}>Segmento</label>
            <select value={segmento} onChange={(e) => setSegmento(e.target.value)} style={INPUT}>
              <option value="">Selecione...</option>
              {SEGMENTOS_EMPRESA.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label style={LABEL}>Descrição</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Conte o que sua empresa faz..." rows={4}
              style={{ ...INPUT, height: "auto", padding: "12px 14px", resize: "vertical" }} />
          </div>

          {/* Cidade + Estado */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
            <div>
              <label style={LABEL}>Cidade</label>
              <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: Curitiba" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Estado</label>
              <input value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Ex: PR" maxLength={2} style={INPUT} />
            </div>
          </div>

          {/* Site */}
          <div>
            <label style={LABEL}>Site</label>
            <input value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://exemplo.com.br" style={INPUT} />
          </div>

          {/* Email + Telefone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={LABEL}>E-mail de contato</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@exemplo.com" style={INPUT} />
            </div>
            <div>
              <label style={LABEL}>Telefone</label>
              <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(41) 99999-9999" style={INPUT} />
            </div>
          </div>

          {erro && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "10px 14px" }}>
              <p style={{ fontSize: "13px", color: "#DC2626" }}>{erro}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <a href="/perfil" style={{ textDecoration: "none", flex: 1 }}>
              <button className="um-btn-secondary" style={{ width: "100%", height: "48px", fontSize: "14px" }}>
                Cancelar
              </button>
            </a>
            <button onClick={salvar} disabled={!nomeFantasia.trim() || salvando}
              className="um-btn-accent"
              style={{ flex: 1, height: "48px", fontSize: "14px" }}>
              {salvando ? "Criando..." : "Criar empresa"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
