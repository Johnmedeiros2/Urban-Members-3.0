"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import BotaoConvite from "@/components/ui/BotaoConvite";
import BotaoCompartilhar from "@/components/ui/BotaoCompartilhar";
import { buscarEmpresa, seguirEmpresa, meusSeguindoEmpresas, deletarEmpresa, type Empresa } from "@/lib/queries";
import { createClient } from "@/lib/supabase";

export default function EmpresaPage() {
  const params = useParams();
  const id = params.id as string;

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [seguindo, setSeguindo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [acao, setAcao] = useState(false);

  const carregar = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    const supabase = createClient();
    const [e, seguindoSet, userData] = await Promise.all([
      buscarEmpresa(id),
      meusSeguindoEmpresas(),
      supabase.auth.getUser(),
    ]);
    setEmpresa(e);
    setSeguindo(seguindoSet.has(id));
    setMeuId(userData.data.user?.id ?? null);
    setCarregando(false);
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  async function toggleSeguir() {
    setAcao(true);
    try {
      const novo = await seguirEmpresa(id);
      setSeguindo(novo);
      setEmpresa((prev) => prev ? { ...prev, total_seguidores: prev.total_seguidores + (novo ? 1 : -1) } : prev);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    } finally {
      setAcao(false);
    }
  }

  async function apagar() {
    if (!confirm("Apagar essa empresa? Essa ação não pode ser desfeita.")) return;
    try {
      await deletarEmpresa(id);
      window.location.href = "/perfil";
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro");
    }
  }

  if (carregando) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", color: "#A3A3A3" }}>Carregando empresa...</div>;
  if (!empresa) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>Empresa não encontrada</div>;

  const ehDono = meuId === empresa.dono_id;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", fontFamily: "Inter, sans-serif" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <a href="/buscar" style={{ textDecoration: "none" }}>
              <button style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#F5F5F5", border: "none", cursor: "pointer", fontSize: "14px" }}>←</button>
            </a>
            <a href="/feed" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <img src="/logo.svg" alt="Urban" width={32} height={32} />
              <span style={{ fontSize: "15px", fontWeight: 800, color: "#111111" }}>{empresa.nome_fantasia}</span>
            </a>
          </div>
          <BotaoConvite variant="ghost" />
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Card principal */}
        <div style={{ background: "#FFFFFF", borderRadius: "20px", marginTop: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)", overflow: "hidden" }}>

          {/* Capa */}
          <div style={{ height: "120px", background: empresa.capa_url ? `url(${empresa.capa_url}) center/cover` : "linear-gradient(135deg, #111111, #1F1F1F)", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,92,46,0.25) 0%, transparent 60%)" }} />
          </div>

          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginTop: "-48px", marginBottom: "20px", position: "relative", zIndex: 1 }}>
              {empresa.foto_url ? (
                <img src={empresa.foto_url} alt={empresa.nome_fantasia}
                  style={{ width: "96px", height: "96px", borderRadius: "20px", border: "4px solid #FFFFFF", objectFit: "cover", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "block" }} />
              ) : (
                <div style={{ width: "96px", height: "96px", borderRadius: "20px", background: "linear-gradient(135deg, #FF5C2E, #FF8C5A)", border: "4px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                  <span style={{ color: "#FFFFFF", fontSize: "36px", fontWeight: 800 }}>{empresa.nome_fantasia.charAt(0).toUpperCase()}</span>
                </div>
              )}

              <div style={{ display: "flex", gap: "8px", marginTop: "56px" }}>
                <BotaoCompartilhar texto={`${empresa.nome_fantasia} no Urban Members`} autor={empresa.dono?.nome} />
                {!ehDono && (
                  <button onClick={toggleSeguir} disabled={acao} style={{
                    height: "38px", padding: "0 20px",
                    background: seguindo ? "#F5F5F5" : "#111111",
                    color: seguindo ? "#111111" : "#FFFFFF",
                    border: seguindo ? "1.5px solid #E5E5E5" : "none",
                    borderRadius: "999px", fontSize: "13px", fontWeight: 700,
                    cursor: "pointer", fontFamily: "Inter, sans-serif",
                  }}>
                    {acao ? "..." : seguindo ? "✓ Seguindo" : "Seguir"}
                  </button>
                )}
                {ehDono && (
                  <>
                    <a href={`/empresa/${id}/editar`} style={{ textDecoration: "none" }}>
                      <button style={{ height: "38px", padding: "0 20px", background: "#111111", color: "#FFFFFF", border: "none", borderRadius: "999px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                        Editar
                      </button>
                    </a>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#FF5C2E", background: "#FFF3EF", padding: "3px 10px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Empresa
              </span>
              {empresa.segmento && (
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#525252", background: "#F5F5F5", padding: "3px 10px", borderRadius: "999px" }}>
                  {empresa.segmento}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>{empresa.nome_fantasia}</h1>
            {empresa.razao_social && empresa.razao_social !== empresa.nome_fantasia && (
              <p style={{ fontSize: "13px", color: "#A3A3A3", marginTop: "2px" }}>{empresa.razao_social}</p>
            )}

            {empresa.descricao && (
              <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6, marginTop: "14px", whiteSpace: "pre-wrap" }}>{empresa.descricao}</p>
            )}

            {/* Info bar */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
              {empresa.cidade && (
                <span style={{ fontSize: "12px", color: "#525252", background: "#F5F5F5", padding: "5px 12px", borderRadius: "999px", fontWeight: 500 }}>
                  📍 {empresa.cidade}{empresa.estado ? ` · ${empresa.estado}` : ""}
                </span>
              )}
              {empresa.site && (
                <a href={empresa.site.startsWith("http") ? empresa.site : `https://${empresa.site}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  <span style={{ fontSize: "12px", color: "#FF5C2E", background: "#FFF3EF", padding: "5px 12px", borderRadius: "999px", fontWeight: 600 }}>
                    🌐 {empresa.site}
                  </span>
                </a>
              )}
              {empresa.email_contato && (
                <a href={`mailto:${empresa.email_contato}`} style={{ textDecoration: "none" }}>
                  <span style={{ fontSize: "12px", color: "#525252", background: "#F5F5F5", padding: "5px 12px", borderRadius: "999px", fontWeight: 500 }}>
                    ✉️ {empresa.email_contato}
                  </span>
                </a>
              )}
              {empresa.telefone && (
                <span style={{ fontSize: "12px", color: "#525252", background: "#F5F5F5", padding: "5px 12px", borderRadius: "999px", fontWeight: 500 }}>
                  📞 {empresa.telefone}
                </span>
              )}
              {empresa.cnpj && (
                <span style={{ fontSize: "11px", color: "#A3A3A3", background: "#F5F5F5", padding: "5px 12px", borderRadius: "999px" }}>
                  CNPJ: {empresa.cnpj}
                </span>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #F5F5F5" }}>
              <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #F5F5F5" }}>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>{empresa.total_seguidores}</p>
                <p style={{ fontSize: "11px", color: "#A3A3A3" }}>Seguidores</p>
              </div>
              <div style={{ flex: 1, textAlign: "center", borderRight: "1px solid #F5F5F5" }}>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>{empresa.total_produtos}</p>
                <p style={{ fontSize: "11px", color: "#A3A3A3" }}>Produtos</p>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "#111111" }}>{empresa.total_cursos}</p>
                <p style={{ fontSize: "11px", color: "#A3A3A3" }}>Cursos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dono */}
        {empresa.dono && (
          <div style={{ marginTop: "16px", background: "#FFFFFF", borderRadius: "16px", padding: "16px 20px", border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "12px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.06em" }}>Administrada por</p>
            <a href={`/morador/${empresa.dono.id}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginLeft: "auto" }}>
              <Avatar name={empresa.dono.nome} foto={empresa.dono.foto_url} size={32} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{empresa.dono.nome}</span>
              <span style={{ fontSize: "13px", color: "#A3A3A3" }}>→</span>
            </a>
          </div>
        )}

        {ehDono && (
          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <button onClick={apagar} style={{ background: "none", border: "none", color: "#EF4444", fontSize: "12px", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Apagar empresa
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
