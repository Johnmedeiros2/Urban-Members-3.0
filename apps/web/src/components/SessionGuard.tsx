"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase";

const ROTAS_AUTENTICADAS = [
  "/feed", "/perfil", "/mercado", "/lives", "/live", "/trilhas", "/trilha",
  "/curso", "/sala-de-aula", "/agenda", "/compras", "/wishlist", "/pulse",
  "/buscar", "/moradores", "/morador", "/empresa", "/admin", "/urban-pay", "/bairros",
];

const LOCAL_TOKEN_KEY = "urban_session_token";

export function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();
    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    function inscreverMudancas(userId: string) {
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
      realtimeChannel = supabase
        .channel(`sessao-${userId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "perfis", filter: `id=eq.${userId}` },
          (payload) => {
            const tokenDoBanco = (payload.new as { session_token?: string }).session_token;
            const meuToken = localStorage.getItem(LOCAL_TOKEN_KEY);
            if (tokenDoBanco && meuToken && tokenDoBanco !== meuToken) {
              // Outro aparelho assumiu a sessão → sair imediatamente
              localStorage.removeItem(LOCAL_TOKEN_KEY);
              supabase.auth.signOut();
            }
          }
        )
        .subscribe();
    }

    async function reivindicarSessao(userId: string) {
      const token = crypto.randomUUID();
      localStorage.setItem(LOCAL_TOKEN_KEY, token);
      try {
        await supabase.from("perfis").update({ session_token: token }).eq("id", userId);
      } catch {
        // falha silenciosa — sessão continua ativa localmente
      }
      inscreverMudancas(userId);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Login ativo → reivindica sessão (expulsa outros aparelhos via DB)
        await reivindicarSessao(session.user.id);
      }

      if (event === "INITIAL_SESSION" && session?.user) {
        const meuToken = localStorage.getItem(LOCAL_TOKEN_KEY);

        if (!meuToken) {
          // Primeiro acesso neste navegador → reivindica (expulsa computador anterior)
          await reivindicarSessao(session.user.id);
          return;
        }

        // Verifica se a sessão ainda pertence a este aparelho
        try {
          const { data: perfil } = await supabase
            .from("perfis")
            .select("session_token")
            .eq("id", session.user.id)
            .single();

          if (perfil?.session_token && perfil.session_token !== meuToken) {
            localStorage.removeItem(LOCAL_TOKEN_KEY);
            await supabase.auth.signOut();
            return;
          }
        } catch {
          // falha silenciosa — mantém sessão atual
        }

        inscreverMudancas(session.user.id);
      }

      if (event === "SIGNED_OUT") {
        localStorage.removeItem(LOCAL_TOKEN_KEY);
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
          realtimeChannel = null;
        }
        const naRotaAutenticada = ROTAS_AUTENTICADAS.some((r) => pathname.startsWith(r));
        if (naRotaAutenticada) {
          router.push("/login?motivo=sessao");
          router.refresh();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    };
  }, [pathname, router]);

  return null;
}
