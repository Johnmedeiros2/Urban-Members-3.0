import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const LIVEKIT_URL = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

export async function POST(request: Request) {
  if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return NextResponse.json({ error: "LiveKit não configurado no servidor" }, { status: 500 });
  }

  const body = await request.json();
  const { live_id, modo } = body as { live_id: string; modo: "transmissor" | "espectador" };
  if (!live_id || !modo) {
    return NextResponse.json({ error: "live_id e modo obrigatorios" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* no-op */ },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });

  const { data: live } = await supabase
    .from("lives")
    .select("id, autor_id, tipo, nome_sala")
    .eq("id", live_id)
    .maybeSingle();

  if (!live) return NextResponse.json({ error: "Live nao encontrada" }, { status: 404 });
  if (live.tipo !== "nativa") return NextResponse.json({ error: "Esta live nao e nativa" }, { status: 400 });
  if (!live.nome_sala) return NextResponse.json({ error: "Sala nao configurada" }, { status: 500 });

  const ehAutor = live.autor_id === user.id;
  if (modo === "transmissor" && !ehAutor) {
    return NextResponse.json({ error: "Apenas o autor pode transmitir" }, { status: 403 });
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome")
    .eq("id", user.id)
    .maybeSingle();
  const nome = (perfil as { nome?: string } | null)?.nome ?? "Morador";

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: user.id,
    name: nome,
    ttl: 60 * 60 * 4, // 4 horas
  });

  at.addGrant({
    room: live.nome_sala,
    roomJoin: true,
    canPublish: modo === "transmissor",
    canPublishData: modo === "transmissor",
    canSubscribe: true,
  });

  const token = await at.toJwt();
  return NextResponse.json({ token, url: LIVEKIT_URL });
}
