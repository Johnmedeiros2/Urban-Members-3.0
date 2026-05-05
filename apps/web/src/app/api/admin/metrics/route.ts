import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const POSTHOG_API_HOST = "https://us.posthog.com";
const POSTHOG_PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const ADMIN_EMAIL = "johnmedeiros30@gmail.com";

async function hogql(query: string): Promise<unknown[][]> {
  const r = await fetch(
    `${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
      cache: "no-store",
    }
  );
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`PostHog ${r.status}: ${text.slice(0, 200)}`);
  }
  const data = await r.json();
  return data.results ?? [];
}

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Apenas admin" }, { status: 403 });
  }

  if (!POSTHOG_PROJECT_ID || !POSTHOG_PERSONAL_API_KEY) {
    return NextResponse.json(
      { error: "PostHog não configurado no servidor" },
      { status: 500 }
    );
  }

  try {
    const [signups7d, posts7d, purchases7d, livesJoined7d, funil7d, eventos24h] =
      await Promise.all([
        hogql(
          `SELECT count() FROM events WHERE event = 'signup_completed' AND timestamp > now() - INTERVAL 7 DAY`
        ),
        hogql(
          `SELECT count() FROM events WHERE event = 'post_created' AND timestamp > now() - INTERVAL 7 DAY`
        ),
        hogql(
          `SELECT count() FROM events WHERE event = 'purchase_completed' AND timestamp > now() - INTERVAL 7 DAY`
        ),
        hogql(
          `SELECT count() FROM events WHERE event = 'live_joined' AND timestamp > now() - INTERVAL 7 DAY`
        ),
        hogql(`
          SELECT
            countIf(event = 'signup_started') AS started,
            countIf(event = 'signup_completed') AS completed
          FROM events
          WHERE event IN ('signup_started', 'signup_completed')
            AND timestamp > now() - INTERVAL 7 DAY
        `),
        hogql(
          `SELECT count() FROM events WHERE timestamp > now() - INTERVAL 24 HOUR`
        ),
      ]);

    const started = Number(funil7d[0]?.[0] ?? 0);
    const completed = Number(funil7d[0]?.[1] ?? 0);
    const taxa = started > 0 ? (completed / started) * 100 : 0;

    return NextResponse.json({
      cadastros_7d: Number(signups7d[0]?.[0] ?? 0),
      posts_7d: Number(posts7d[0]?.[0] ?? 0),
      compras_7d: Number(purchases7d[0]?.[0] ?? 0),
      lives_assistidas_7d: Number(livesJoined7d[0]?.[0] ?? 0),
      taxa_conversao_cadastro: Math.round(taxa * 10) / 10,
      eventos_24h: Number(eventos24h[0]?.[0] ?? 0),
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro" },
      { status: 500 }
    );
  }
}
