import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Webhook MP: env vars faltando");
    return NextResponse.json({ error: "config" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: true });

  // MP manda { type: "payment", data: { id: "..." } }
  const paymentId = body.data?.id ?? body.resource;
  if (body.type !== "payment" || !paymentId) {
    return NextResponse.json({ ok: true });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
    const payment = new Payment(client);
    const info = await payment.get({ id: String(paymentId) });

    const transacao_id = info.external_reference;
    const status = info.status; // approved, pending, rejected, cancelled, refunded
    const metodo = info.payment_method_id;

    if (!transacao_id) return NextResponse.json({ ok: true });

    // Usa service role para bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const novoStatus =
      status === "approved" ? "concluida" :
      status === "rejected" || status === "cancelled" ? "cancelada" :
      "pendente";

    await supabase
      .from("transacoes")
      .update({
        status: novoStatus,
        mp_payment_id: String(paymentId),
        mp_payment_status: status,
        metodo_pagamento: metodo ?? "mercadopago",
      })
      .eq("id", transacao_id);

    // Se aprovado e é curso: matricula automaticamente
    if (novoStatus === "concluida") {
      const meta = info.metadata as { tipo?: string; item_id?: string } | undefined;
      if (meta?.tipo === "curso" && meta.item_id) {
        const { data: tx } = await supabase
          .from("transacoes")
          .select("comprador_id")
          .eq("id", transacao_id)
          .single();
        if (tx) {
          await supabase
            .from("curso_alunos")
            .insert({ curso_id: meta.item_id, morador_id: tx.comprador_id })
            .select();
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Webhook MP erro:", e);
    return NextResponse.json({ ok: true }); // MP espera 200 mesmo com erro
  }
}

export async function GET() {
  return NextResponse.json({ message: "Mercado Pago webhook endpoint ativo" });
}
