"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { createClient } from "@/lib/supabase";
import { reset as resetAnalytics } from "@/lib/analytics";

interface Props {
  nome?: string;
  foto?: string | null;
  size?: number;
}

export default function AvatarMenu({ nome: nomeProp, foto: fotoProp, size = 36 }: Props) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [nome, setNome] = useState<string>(nomeProp ?? "");
  const [foto, setFoto] = useState<string | null>(fotoProp ?? null);
  const [logado, setLogado] = useState<boolean>(!!nomeProp);
  const ref = useRef<HTMLDivElement>(null);

  // Busca dados do morador logado se nao foram passados via props
  useEffect(() => {
    if (nomeProp) return;
    let cancelado = false;
    (async () => {
      const supabase = createClient();
      const user = (await supabase.auth.getSession()).data.session?.user;
      if (cancelado) return;
      if (!user) {
        setLogado(false);
        return;
      }
      const { data: perfil } = await supabase
        .from("perfis")
        .select("nome, foto_url")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelado) return;
      const p = perfil as { nome?: string; foto_url?: string | null } | null;
      setNome(p?.nome ?? user.user_metadata?.nome_completo ?? user.email?.split("@")[0] ?? "Morador");
      setFoto(p?.foto_url ?? null);
      setLogado(true);
    })();
    return () => { cancelado = true; };
  }, [nomeProp]);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    if (aberto) document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, [aberto]);

  async function sair() {
    if (saindo) return;
    setSaindo(true);
    try {
      await createClient().auth.signOut();
      resetAnalytics();
      router.push("/login");
    } catch {
      setSaindo(false);
    }
  }

  // Se o usuario nao esta logado, nao renderiza nada
  if (!logado) return null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setAberto(!aberto)}
        aria-label="Abrir menu da conta"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block" }}
      >
        <Avatar name={nome} foto={foto ?? null} size={size} />
      </button>

      {aberto && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 100,
          background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: "14px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          minWidth: "220px", padding: "6px", fontFamily: "Inter, sans-serif",
        }}>
          <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #F5F5F5", marginBottom: "4px" }}>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</p>
            <p style={{ fontSize: "11px", color: "#A3A3A3", marginTop: "2px" }}>Sua conta</p>
          </div>

          <a href="/perfil" style={{ textDecoration: "none" }}>
            <button onClick={() => setAberto(false)} style={{
              width: "100%", padding: "10px 14px", textAlign: "left",
              background: "none", border: "none", cursor: "pointer",
              fontSize: "13px", color: "#111111", fontFamily: "Inter, sans-serif",
              borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7F8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: "15px" }}>👤</span> Meu perfil
            </button>
          </a>

          <a href="/perfil" style={{ textDecoration: "none" }}>
            <button onClick={() => setAberto(false)} style={{
              width: "100%", padding: "10px 14px", textAlign: "left",
              background: "none", border: "none", cursor: "pointer",
              fontSize: "13px", color: "#111111", fontFamily: "Inter, sans-serif",
              borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7F8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: "15px" }}>⚙️</span> Configurações
            </button>
          </a>

          <div style={{ height: "1px", background: "#F5F5F5", margin: "4px 0" }} />

          <button onClick={sair} disabled={saindo} style={{
            width: "100%", padding: "10px 14px", textAlign: "left",
            background: "none", border: "none", cursor: saindo ? "wait" : "pointer",
            fontSize: "13px", color: "#DC2626", fontFamily: "Inter, sans-serif",
            borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px",
            fontWeight: 600,
          }}
            onMouseEnter={(e) => !saindo && (e.currentTarget.style.background = "#FEF2F2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ fontSize: "15px" }}>🚪</span> {saindo ? "Saindo..." : "Sair"}
          </button>
        </div>
      )}
    </div>
  );
}
