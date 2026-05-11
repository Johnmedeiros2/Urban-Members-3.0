import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a Urban Members coleta, usa e protege seus dados pessoais conforme a LGPD.",
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "1. Quem somos",
    content: `A Urbanicsa Tecnologia Ltda. ("Urban Members", "nós") opera a plataforma urbanicsa.com, um marketplace e comunidade para criadores digitais brasileiros. Somos o controlador dos seus dados pessoais nos termos da Lei nº 13.709/2018 (LGPD).

Contato do Encarregado de Dados (DPO): privacidade@urbanicsa.com`,
  },
  {
    title: "2. Dados que coletamos",
    content: `Coletamos apenas os dados necessários para operar a plataforma:

Dados de cadastro: nome completo, e-mail, senha (armazenada com hash bcrypt — nunca em texto claro), cidade, estado, país, ocupação.

Dados de uso: páginas visitadas, ações realizadas na plataforma (ex.: publicações, compras, cursos iniciados), identificador de sessão, endereço IP, tipo de dispositivo e navegador.

Dados de transações: histórico de compras e vendas, valores, datas. Esses dados são retidos por obrigação legal (5 anos conforme legislação tributária brasileira) mesmo após exclusão de conta.

Dados de indicação: ID do usuário que indicou você à plataforma, se aplicável.

Não coletamos dados sensíveis (saúde, biometria, origem étnica, orientação sexual, convicções religiosas ou políticas).`,
  },
  {
    title: "3. Como usamos seus dados",
    content: `Operação da plataforma (base legal: execução de contrato — Art. 7º, V, LGPD): autenticação, exibição do seu perfil, processamento de vendas e compras, entrega de cursos e lives.

Melhoria do serviço (base legal: legítimo interesse — Art. 7º, IX, LGPD): análise de uso agregado e anônimo para melhorar funcionalidades. Utilizamos PostHog apenas com seu consentimento explícito.

Comunicações transacionais (base legal: execução de contrato): e-mails de confirmação de compra, recuperação de senha, notificações de segurança. Não enviamos spam.

Cumprimento de obrigações legais (base legal: Art. 7º, II, LGPD): retenção de registros financeiros conforme exigido por lei.`,
  },
  {
    title: "4. Cookies e tecnologias de rastreamento",
    content: `Cookies estritamente necessários (sem consentimento exigido): sessão de autenticação (Supabase), preferências de tema e idioma.

Cookies analíticos (exigem seu consentimento): utilizamos PostHog para análise de uso. Você pode aceitar ou recusar no banner exibido ao acessar a plataforma pela primeira vez, ou a qualquer momento limpando seus cookies e recarregando a página.

Não utilizamos cookies de publicidade ou de redes sociais terceiras.`,
  },
  {
    title: "5. Compartilhamento de dados",
    content: `Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros para fins comerciais.

Compartilhamos dados apenas com:

Supabase Inc. (infraestrutura de banco de dados e autenticação): dados armazenados em servidores nos EUA com cláusulas contratuais padrão adequadas.

Vercel Inc. (hospedagem da plataforma): logs de acesso retidos por até 30 dias.

PostHog Inc. (análise de uso): somente se você consentiu. Dados pseudoanonimizados.

MercadoPago (processamento de pagamentos): dados necessários para completar transações, conforme política própria da plataforma.

Autoridades públicas: quando exigido por lei, decisão judicial ou regulamentação aplicável.`,
  },
  {
    title: "6. Retenção de dados",
    content: `Dados de conta: mantidos enquanto sua conta estiver ativa. Após exclusão de conta, dados pessoais são anonimizados em até 30 dias.

Dados de transações: retidos por 5 anos conforme obrigação tributária (Art. 37 do Código Tributário Nacional).

Logs de acesso: retidos por 6 meses conforme o Marco Civil da Internet (Lei nº 12.965/2014, Art. 15).

Dados analíticos: retidos por até 12 meses no PostHog (se consentido), após o que são excluídos ou anonimizados.`,
  },
  {
    title: "7. Seus direitos (LGPD)",
    content: `Você tem os seguintes direitos sobre seus dados pessoais:

Acesso: solicitar confirmação da existência e acesso aos seus dados.

Correção: atualizar dados incompletos, inexatos ou desatualizados — diretamente nas configurações do perfil ou por e-mail.

Exclusão: solicitar a exclusão dos seus dados pessoais. Para dados não sujeitos a retenção legal, excluímos em até 30 dias. Realize esse pedido diretamente na plataforma em Perfil → Conta → Excluir conta, ou pelo e-mail privacidade@urbanicsa.com.

Portabilidade: solicitar seus dados em formato estruturado (JSON/CSV) por e-mail.

Oposição: opor-se ao tratamento de dados baseado em legítimo interesse, incluindo o uso para análise de comportamento.

Revogação do consentimento: retirar o consentimento para cookies analíticos a qualquer momento limpando os cookies do navegador ou via configurações do site.

Informação sobre compartilhamento: saber com quem compartilhamos seus dados.

Para exercer qualquer direito, entre em contato: privacidade@urbanicsa.com. Respondemos em até 15 dias.`,
  },
  {
    title: "8. Segurança",
    content: `Adotamos medidas técnicas e organizacionais para proteger seus dados:

• Senhas armazenadas com hash bcrypt (nunca em texto claro)
• Comunicação criptografada via HTTPS/TLS em todo o site
• Banco de dados com criptografia em repouso (AES-256, gerenciado pelo Supabase)
• Autenticação de dois fatores (2FA) opcional via TOTP
• Acesso ao banco de dados restrito por Row Level Security (RLS)
• Sessão única: login em novo dispositivo encerra a sessão anterior

Em caso de incidente de segurança que afete seus dados, notificaremos você e a ANPD (Autoridade Nacional de Proteção de Dados) conforme exigido pela LGPD.`,
  },
  {
    title: "9. Crianças e adolescentes",
    content: `Nossa plataforma é destinada a maiores de 16 anos. Não coletamos intencionalmente dados de crianças (menores de 12 anos). Se identificarmos que dados de crianças foram coletados sem o consentimento adequado dos responsáveis, excluiremos esses dados imediatamente.`,
  },
  {
    title: "10. Alterações nesta política",
    content: `Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos alterações relevantes por e-mail ou aviso na plataforma com antecedência mínima de 15 dias. O uso continuado da plataforma após o prazo constitui aceite da versão atualizada.`,
  },
  {
    title: "11. Contato e DPO",
    content: `Encarregado de Proteção de Dados (DPO):
E-mail: privacidade@urbanicsa.com
Empresa: Urbanicsa Tecnologia Ltda.
Site: urbanicsa.com

Você também pode registrar reclamações junto à ANPD: gov.br/anpd`,
  },
];

export default function Privacidade() {
  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E5E5" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img src="/logo.svg" alt="Urban Members" width={32} height={32} />
            <span style={{ fontSize: "15px", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111" }}>Urban Members</span>
          </a>
          <a href="/termos" style={{ fontSize: "13px", color: "#525252", textDecoration: "none" }}>Termos de Uso →</a>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Título */}
        <div style={{ marginBottom: "40px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#FF5C2E", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            LGPD — Lei nº 13.709/2018
          </span>
          <h1 style={{ fontSize: "36px", fontWeight: 900, color: "#111111", letterSpacing: "-0.03em", marginTop: "8px", marginBottom: "12px" }}>
            Política de Privacidade
          </h1>
          <p style={{ fontSize: "14px", color: "#A3A3A3" }}>
            Última atualização: maio de 2026 · Versão 1.0
          </p>
          <p style={{ fontSize: "15px", color: "#525252", lineHeight: 1.7, marginTop: "16px", maxWidth: "640px" }}>
            Sua privacidade importa. Esta política explica de forma clara o que coletamos, como usamos, com quem compartilhamos e como você pode controlar seus dados pessoais na plataforma Urban Members.
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
            Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato com nosso DPO:
          </p>
          <a
            href="mailto:privacidade@urbanicsa.com"
            style={{ fontSize: "15px", fontWeight: 700, color: "#FF5C2E", textDecoration: "none" }}
          >
            privacidade@urbanicsa.com
          </a>
          <div style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
            <a href="/termos" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>Termos de Uso</a>
            <a href="/feed" style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>Voltar para a plataforma</a>
          </div>
        </div>
      </main>
    </div>
  );
}
