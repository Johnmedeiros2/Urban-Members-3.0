import { createBrowserClient } from "@supabase/ssr";

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return url.startsWith("http") && key.length > 10;
}

export const supabaseConfigured = true;

function fetchComTimeout(ms: number): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      return response;
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
    { global: { fetch: fetchComTimeout(10000) } }
  );
}
