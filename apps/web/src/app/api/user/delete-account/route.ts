import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE() {
  const cookieStore = await cookies();

  // Cliente com cookie de sessão para identificar o usuário autenticado
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Anonimiza o perfil antes de deletar (mantém registros de transação por obrigação legal)
  await supabase
    .from("perfis")
    .update({
      nome: "Usuário removido",
      ocupacao: null,
      cidade_visita: null,
      foto_url: null,
    })
    .eq("id", user.id);

  // Deleta o usuário via Admin API (exige SUPABASE_SERVICE_ROLE_KEY)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    // Fallback: encerra a sessão e retorna instrução para contato manual
    await supabase.auth.signOut();
    return NextResponse.json(
      { partial: true, message: "Perfil anonimizado. Entre em contato com privacidade@urbanicsa.com para exclusão completa da autenticação." },
      { status: 200 }
    );
  }

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return NextResponse.json({ error: "Erro ao excluir conta. Tente novamente ou contate privacidade@urbanicsa.com." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
