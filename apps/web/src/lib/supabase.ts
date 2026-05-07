import { createBrowserClient } from "@supabase/ssr";

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return url.startsWith("http") && key.length > 10;
}

export const supabaseConfigured = true;

// Garante que nenhuma requisição ao Supabase trava para sempre.
// Após 12s retorna 504 silenciosamente em vez de pender indefinidamente.
function fetchComTimeout(ms: number): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } catch {
      return new Response('{"message":"timeout","code":"timeout"}', {
        status: 504,
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      clearTimeout(timer);
    }
  };
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: fetchComTimeout(12000) } }
  );
}
