// Converte uma data em texto relativo ("agora", "5min atrás", "2h atrás", "3d atrás")
export function tempoRelativo(iso: string | null | undefined): string {
  if (!iso) return "";
  const data = new Date(iso).getTime();
  if (Number.isNaN(data)) return "";
  const segundos = Math.floor((Date.now() - data) / 1000);

  if (segundos < 60) return "agora";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `${minutos}min atrás`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas}h atrás`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `${dias}d atrás`;
  const semanas = Math.floor(dias / 7);
  if (semanas < 5) return `${semanas}sem atrás`;
  return new Date(iso).toLocaleDateString("pt-BR");
}
