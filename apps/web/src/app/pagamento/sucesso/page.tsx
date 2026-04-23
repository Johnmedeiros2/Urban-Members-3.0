import ResultadoPagamento from "../_componentes/ResultadoPagamento";

export default function SucessoPage() {
  return (
    <ResultadoPagamento
      tipo="sucesso"
      icone="✓"
      cor="#10B981"
      titulo="Pagamento aprovado"
      mensagem="Sua compra foi confirmada. O vendedor já foi notificado."
    />
  );
}
