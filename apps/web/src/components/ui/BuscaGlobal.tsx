"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { buscarGlobal, type ResultadosBusca } from "@/lib/queries";
import Avatar from "./Avatar";

type Aba = "moradores" | "produtos" | "cursos" | "aulas";

export default function BuscaGlobal() {
  const router = useRouter();
  const [termo, setTermo] = useState("");
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [aba, setAba] = useState<Aba>("moradores");
  const [resultados, setResultados] = useState<ResultadosBusca>({ moradores: [], produtos: [], cursos: [], aulas: [] });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (termo.trim().length < 2) {
      setResultados({ moradores: [], produtos: [], cursos: [], aulas: [] });
      return;
    }
    setCarregando(true);
    const timer = setTimeout(async () => {
      const r = await buscarGlobal(termo);
      setResultados(r);
      setCarregando(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [termo]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function navegar(href: string) {
    setAberto(false);
    setTermo("");
    router.push(href);
  }

  const total = resultados.moradores.length + resultados.produtos.length + resultados.cursos.length + resultados.aulas.length;
  const mostraDropdown = aberto && termo.trim().length >= 2;

  return (
    <div ref={ref} style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
      <div style={{ position: "relative" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onFocus={() => setAberto(true)}
          placeholder="Buscar moradores, produtos, cursos..."
          style={{
            width: "100%", height: "36px",
            paddingLeft: "38px", paddingRight: "14px",
            background: "#F5F5F5", border: "1px solid transparent",
            borderRadius: "999px", fontSize: "13px",
            fontFamily: "Inter, sans-serif", color: "#111111",
            outline: "none", transition: "all 0.15s",
          }}
          onFocusCapture={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.borderColor = "#E5E5E5"; }}
          onBlur={(e) => { e.currentTarget.style.background = "#F5F5F5"; e.currentTarget.style.borderColor = "transparent"; }}
        />
      </div>

      {mostraDropdown && (
        <div style={{
          position: "absolute", top: "44px", left: 0, right: 0,
          background: "#FFFFFF", borderRadius: "14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          border: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden", zIndex: 100,
        }}>
          {/* Abas */}
          <div style={{ display: "flex", borderBottom: "1px solid #F5F5F5" }}>
            {([
              { id: "moradores" as const, label: "Moradores", count: resultados.moradores.length },
              { id: "produtos"  as const, label: "Produtos",  count: resultados.produtos.length  },
              { id: "cursos"    as const, label: "Cursos",    count: resultados.cursos.length    },
              { id: "aulas"     as const, label: "Aulas",     count: resultados.aulas.length     },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setAba(t.id)}
                style={{
                  flex: 1, padding: "10px 12px", background: "none", border: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: 700, fontFamily: "Inter, sans-serif",
                  color: aba === t.id ? "#111111" : "#A3A3A3",
                  borderBottom: aba === t.id ? "2px solid #FF5C2E" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {t.label} {t.count > 0 && <span style={{ color: "#FF5C2E" }}>{t.count}</span>}
              </button>
            ))}
          </div>

          {/* Resultados */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {carregando ? (
              <div style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "#A3A3A3" }}>Buscando...</div>
            ) : total === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "#A3A3A3" }}>
                Nenhum resultado para “{termo}”.
              </div>
            ) : aba === "moradores" ? (
              resultados.moradores.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "#A3A3A3" }}>Sem moradores</div>
              ) : resultados.moradores.map((m) => (
                <div key={m.id} onClick={() => navegar(`/morador/${m.id}`)}
                  style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7F8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Avatar name={m.nome} foto={m.foto_url} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.nome}</p>
                    {m.cidade && <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{m.cidade}</p>}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#525252", background: "#F5F5F5", padding: "2px 8px", borderRadius: "999px" }}>{m.urban_score}</span>
                </div>
              ))
            ) : aba === "produtos" ? (
              resultados.produtos.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "#A3A3A3" }}>Sem produtos</div>
              ) : resultados.produtos.map((p) => (
                <div key={p.id} onClick={() => navegar(`/mercado`)}
                  style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7F8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FFF3EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🛒</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nome}</p>
                    <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{p.categoria}</p>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#111111" }}>R$ {p.preco.toFixed(2)}</span>
                </div>
              ))
            ) : aba === "cursos" ? (
              resultados.cursos.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "#A3A3A3" }}>Sem cursos</div>
              ) : resultados.cursos.map((c) => (
                <div key={c.id} onClick={() => navegar(`/curso/${c.id}`)}
                  style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7F8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>📚</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.titulo}</p>
                    <p style={{ fontSize: "11px", color: "#A3A3A3" }}>{c.nivel}</p>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#111111" }}>{c.preco === 0 ? "Grátis" : `R$ ${c.preco.toFixed(2)}`}</span>
                </div>
              ))
            ) : (
              resultados.aulas.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", fontSize: "12px", color: "#A3A3A3" }}>Sem aulas</div>
              ) : resultados.aulas.map((au) => (
                <div key={au.id} onClick={() => navegar(`/curso/${au.curso_id}?aula=${au.id}`)}
                  style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F7F8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>▶</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{au.titulo}</p>
                    <p style={{ fontSize: "11px", color: "#A3A3A3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{au.curso_titulo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
