import ResultadoPagamento from "../_componentes/ResultadoPagamento";

export default function FalhaPage() {
  return (
    <ResultadoPagamento
      tipo="falha"
      icone="✕"
      cor="#EF4444"
      titulo="Pagamento não concluído"
      mensagem="A transação não foi aprovada. Você pode tentar novamente quando quiser."
    />
  );
}
