import ResultadoPagamento from "../_componentes/ResultadoPagamento";

export default function PendentePage() {
  return (
    <ResultadoPagamento
      tipo="pendente"
      icone="⏳"
      cor="#F59E0B"
      titulo="Pagamento em processamento"
      mensagem="Recebemos seu pagamento. Assim que for aprovado, seu acesso é liberado."
    />
  );
}
