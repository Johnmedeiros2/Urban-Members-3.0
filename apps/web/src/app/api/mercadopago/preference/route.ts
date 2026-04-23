import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

export async function POST(request: Request) {
  if (!MP_ACCESS_TOKEN) {
    return NextResponse.json({ error: "MERCADOPAGO_ACCESS_TOKEN não configurado" }, { status: 500 });
  }

  const body = await request.json();
  const { vendedor_id, valor, descricao, tipo, item_id } = body as {
    vendedor_id: string; valor: number; descricao: string;
    tipo: "produto" | "curso" | "pay"; item_id?: string;
  };

  if (!vendedor_id || !valor || valor <= 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  // Autentica usuário via cookies
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
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  // 1. Cria transação pendente no banco
  const { data: tx, error: txError } = await supabase
    .from("transacoes")
    .insert({
      comprador_id: user.id,
      vendedor_id,
      valor,
      descricao,
      status: "pendente",
      metodo_pagamento: "mercadopago",
    })
    .select()
    .single();

  if (txError || !tx) {
    console.error("Erro ao criar transação:", txError);
    return NextResponse.json({ error: "Erro ao criar transação" }, { status: 500 });
  }

  // 2. Cria preferência no Mercado Pago
  const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
  const preference = new Preference(client);

  const origin = request.headers.get("origin") ?? "https://urbanicsa.com";

  try {
    const resp = await preference.create({
      body: {
        items: [
          {
            id: item_id ?? tx.id,
            title: descricao,
            quantity: 1,
            unit_price: Number(valor),
            currency_id: "BRL",
          },
        ],
        external_reference: tx.id,
        back_urls: {
          success: `${origin}/pagamento/sucesso?tx=${tx.id}`,
          pending: `${origin}/pagamento/pendente?tx=${tx.id}`,
          failure: `${origin}/pagamento/falha?tx=${tx.id}`,
        },
        auto_return: "approved",
        notification_url: `${origin}/api/mercadopago/webhook`,
        metadata: { transacao_id: tx.id, tipo, item_id },
      },
    });

    // 3. Atualiza transação com preference_id
    await supabase
      .from("transacoes")
      .update({ mp_preference_id: resp.id })
      .eq("id", tx.id);

    return NextResponse.json({
      preference_id: resp.id,
      init_point: resp.init_point,
      sandbox_init_point: resp.sandbox_init_point,
      transacao_id: tx.id,
    });
  } catch (e: unknown) {
    console.error("Erro MP preference:", e);
    // Cancela a transação se MP falhou
    await supabase.from("transacoes").update({ status: "cancelada" }).eq("id", tx.id);
    const msg = e instanceof Error ? e.message : "Erro no Mercado Pago";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
