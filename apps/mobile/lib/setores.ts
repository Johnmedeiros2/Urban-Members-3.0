import { supabase } from "./supabase";

export type Setor = { id: string; nome: string; cor: string };

// Lista os setores reais (tabela bairros: id/nome/cor)
export async function listarSetores(): Promise<Setor[]> {
  const { data } = await supabase.from("bairros").select("id, nome, cor");
  return (data ?? []).map((b) => ({ id: b.id, nome: b.nome, cor: b.cor || "#FF5C2E" }));
}

// Registra um sinal de comportamento por setor.
// É "best-effort": se falhar (ex: tabela ainda não criada), nunca quebra a tela.
export async function registrarInteracao(
  setorId: string,
  tipo: "visita" | "curtida" | "post"
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("setor_interacoes").insert({
      morador_id: user.id,
      setor_id: setorId,
      tipo,
    });
  } catch {
    // silencioso: a coleta de dados não pode atrapalhar o uso do app
  }
}
