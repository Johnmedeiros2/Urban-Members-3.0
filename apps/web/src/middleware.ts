import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/cadastro", "/onboarding", "/admin", "/feed", "/mercado", "/sala-de-aula", "/perfil", "/pagamento", "/api/mercadopago", "/compras"];
const ADMIN_EMAIL = "johnmedeiros30@gmail.com";
const SUPABASE_CONFIGURED =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_url";

export async function middleware(request: NextRequest) {
  // Sem Supabase configurado, deixa tudo passar livremente
  if (!SUPABASE_CONFIGURED) return NextResponse.next({ request });

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some((r) => path === r || path.startsWith(r + "/"));

  if (!isPublic && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protege /admin — só bloqueia se houver usuário logado com e-mail diferente
  if (path.startsWith("/admin") && user && user.email !== ADMIN_EMAIL) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  // Deixa link de convite (cadastro?ref=...) passar sempre — a página trata o caso
  const temRef = request.nextUrl.searchParams.has("ref");
  if (user && (path === "/login" || (path === "/cadastro" && !temRef))) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.svg).*)"],
};
