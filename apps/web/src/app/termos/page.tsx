import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos e condições de uso da plataforma Urban Members.",
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "1. Aceitação dos termos",
    content: `Ao se cadastrar na plataforma Urban Members, operada pela Urbanicsa Tecnologia Ltda. ("Urban Members", "nós"), você declara ter lido, compreendido e concordado com estes Termos de Uso e com nossa Política de Privacidade.

Se não concordar com qualquer parte destes termos, não utilize a plataforma.

Menores de 16 anos não podem criar contas sem consentimento e supervisão de um responsável legal.`,
  },
  {
    title: "2. O que é a plataforma",
    content: `Urban Members é uma plataforma digital brasileira que conecta criadores e compradores, oferecendo:

• Marketplace: venda de produtos digitais e físicos entre membros
• Cursos: criação e consumo de conteúdo educacional
• Lives: transmissões ao vivo entre criadores e sua audiência
• Comunidade: publicações, interações e conexões entre membros
• Urban Score: sistema de reputação gamificado

A plataforma é um intermediário tecnológico. Não somos responsáveis pelo conteúdo criado por usuários nem pelas transações entre compradores e vendedores além do processamento técnico.`,
  },
  {
    title: "3. Cadastro e conta",
    content: `Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas com sua conta. Notifique-nos imediatamente em caso de uso não autorizado.

Cada pessoa pode ter apenas uma conta. Contas duplicadas podem ser suspensas.

Você deve fornecer informações verdadeiras e mantê-las atualizadas. Contas com informações falsas podem ser encerradas sem aviso prévio.

Você pode ativar a autenticação de dois fatores (2FA) para maior segurança — recomendamos fortemente.`,
  },
  {
    title: "4. Regras de uso",
    content: `É proibido usar a plataforma para:

• Publicar conteúdo ilegal, difamatório, obsceno, racista, discriminatório ou que viole direitos de terceiros
• Spam, phishing ou qualquer forma de comunicação enganosa
• Vender produtos falsificados, ilegais ou que violem propriedade intelectual
• Criar contas falsas ou se passar por outra pessoa
• Tentar invadir ou comprometer a segurança da plataforma
• Realizar atividades que violem a legislação brasileira

Violações podem resultar em suspensão ou exclusão permanente da conta, sem direito a reembolso de valores eventualmente pagos.`,
  },
  {
    title: "5. Taxas e pagamentos",
    content: `Urban Members cobra uma taxa de 10% sobre o valor de cada venda concluída na plataforma. Não cobramos mensalidade, assinatura ou taxa para criar conta.

A taxa é deduzida automaticamente no momento do repasse ao vendedor. O valor líquido (90% do preço de venda) é creditado na sua carteira Urban.

Saques estão sujeitos a prazo de processamento (geralmente 2 dias úteis) e às políticas do MercadoPago.

Reembolsos em caso de cancelamento de compra são regulados pela nossa Política de Reembolso, disponível na central de ajuda.`,
  },
  {
    title: "6. Conteúdo do usuário",
    content: `Você mantém a propriedade intelectual do conteúdo que publica (cursos, produtos, posts, imagens).

Ao publicar na plataforma, você concede à Urban Members uma licença não exclusiva, gratuita e mundial para exibir, distribuir e promover esse conteúdo exclusivamente para operar e divulgar a plataforma.

Você declara que tem os direitos necessários sobre todo o conteúdo que publica e que ele não viola direitos de terceiros.

Conteúdo que viole direitos autorais pode ser removido mediante notificação conforme a Lei nº 9.610/1998 e o Marco Civil da Internet.`,
  },
  {
    title: "7. Programa de indicações",
    content: `Urban Members oferece um programa de indicações em que membros recebem 3% do valor das compras realizadas por pessoas que convidaram para a plataforma.

Comissões são válidas apenas para compras realizadas por indicados que se cadastraram através do seu link único. Não são válidas para autocompras ou compras entre contas relacionadas.

Suspeitamos de fraude? Podemos suspender o programa para contas suspeitas e reter comissões pendentes enquanto investigamos.

O Urban Members pode alterar as regras do programa de indicações com aviso prévio de 30 dias.`,
  },
  {
    title: "8. Disponibilidade e modificações",
    content: `Nos esforçamos para manter a plataforma disponível 24/7, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência.

Podemos modificar, suspender ou encerrar funcionalidades da plataforma. Para mudanças relevantes que afetem monetização ou direitos dos usuários, comunicaremos com no mínimo 30 dias de antecedência.`,
  },
  {
    title: "9. Limitação de responsabilidade",
    content: `Urban Members não é parte nas transações entre usuários e não garante a qualidade, segurança ou legalidade dos produtos e serviços ofertados por vendedores.

Nossa responsabilidade total por danos decorrentes do uso da plataforma está limitada ao valor das taxas pagas por você nos últimos 12 meses.

Não somos responsáveis por: danos indiretos, perda de lucros, perda de dados, ou danos decorrentes de falhas de terceiros (ex.: provedores de pagamento, hospedagem).`,
  },
  {
    title: "10. Rescisão e exclusão de conta",
    content: `Você pode encerrar sua conta a qualquer momento em Perfil → Conta → Excluir conta. Dados pessoais serão anonimizados em até 30 dias (exceto dados sujeitos a retenção legal).

Podemos encerrar sua conta por violação destes termos. Em casos graves (fraude, conteúdo ilegal), o encerramento pode ser imediato.

Valores em carteira no momento do encerramento serão processados para saque conforme as regras de retirada em vigor.`,
  },
  {
    title: "11. Lei aplicável e foro",
    content: `Estes Termos são regidos pelas leis da República Federativa do Brasil. Para resolução de disputas, fica eleito o foro da Comarca de São Paulo — SP, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

Antes de recorrer ao judiciário, incentivamos a resolução amigável via contato@urbanicsa.com.`,
  },
  {
    title: "12. Alterações nestes termos",
    content: `Podemos atualizar estes Termos periodicamente. Notificaremos alterações relevantes por e-mail ou aviso na plataforma com antecedência mínima de 15 dias. O uso continuado após o prazo constitui aceite da versão atualizada.`,
  },
  {
    title: "13. Contato",
    content: `Dúvidas sobre estes Termos? Entre em contato:

E-mail geral: contato@urbanicsa.com
Privacidade e LGPD: privacidade@urbanicsa.com
Urbanicsa Tecnologia Ltda. · urbanicsa.com`,
  },
];

export default function Termos() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E5E5" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
            <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111" }}>Urban Members</span>
          </a>
          <a href="/privacidade" style={{ fontSize: "13px", color: "#525252", textDecoration: "none" }}>Privacidade →</a>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Título */}
        <div style={{ marginBottom: "40px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF5C2E", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Urbanicsa Tecnologia Ltda.
          </span>
          <h1 style={{ fontSize: "36px", fontWeight: 900, color: "#111111", letterSpacing: "-0.03em", marginTop: "8px", marginBottom: "12px" }}>
            Termos de Uso
          </h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3" }}>
            Última atualização: maio de 2026 · Versão 1.0
          </p>
          <p style={{ fontSize: "15px", color: "#525252", lineHeight: 1.7, marginTop: "16px", maxWidth: "640px" }}>
            Estes são os termos que regem o uso da plataforma Urban Members. Leia com atenção antes de criar sua conta.
          </p>
        </div>

        {/* Seções */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {SECTIONS.map((section, i) => (
            <div
              key={i}
              style={{
                borderTop: "1px solid #E5E5E5",
                paddingTop: "32px",
                paddingBottom: "32px",
              }}
            >
              <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#111111", marginBottom: "14px", letterSpacing: "-0.02em" }}>
                {section.title}
              </h2>
              <div style={{ fontSize: "14px", color: "#525252", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé da página */}
        <div style={{ marginTop: "48px", padding: "24px", background: "#111111", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            Dúvidas ou questionamentos sobre estes termos?
          </p>
          <a
            href="mailto:contato@urbanicsa.com"
            style={{ fontSize: "15px", fontWeight: 700, color: "#FF5C2E", textDecoration: "none" }}
          >
            contato@urbanicsa.com
          </a>
          <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
            <a href="/privacidade" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>Política de Privacidade</a>
            <a href="/feed" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>Voltar para a plataforma</a>
          </div>
        </div>
      </main>
    </div>
  );
}
