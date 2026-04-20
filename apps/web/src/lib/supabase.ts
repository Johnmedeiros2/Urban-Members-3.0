import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured =
  SUPABASE_URL.startsWith("http") && SUPABASE_KEY.length > 10;

export function createClient() {
  if (!supabaseConfigured) {
    throw new Error("Supabase não configurado. Adicione as credenciais no .env.local");
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
