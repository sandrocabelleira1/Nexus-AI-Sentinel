# Nexus AI Sentinel

Aplicativo experimental de análise de mercado e carteira com interface em português. Reúne painéis de preços, alertas, detecção de grandes transferências em criptoativos e recursos de IA. Este repositório concentra o código e o histórico do projeto.

> **Aviso:** sinais e textos gerados por IA não são recomendação de investimento. Dados externos podem atrasar ou ficar indisponíveis. Registros antigos de demonstração podem continuar visíveis até serem removidos do Firestore.

## Tecnologias

- Next.js 15, React 19 e TypeScript
- Firebase Authentication, Cloud Firestore e App Hosting
- Genkit e Gemini
- Mercado Pago Checkout Pro
- Fontes de mercado: Brapi, Binance, AwesomeAPI e Moralis

## Estrutura

- `src/app`: páginas, painel, ações de servidor e webhook de pagamentos
- `src/ai`: fluxos de análise e coleta de dados
- `src/components`: componentes de interface
- `src/firebase`: cliente Firebase e hooks
- `src/lib`: tipos e inicialização administrativa
- `firestore.rules`: autorização de leitura e escrita do banco
- `apphosting.yaml`: configuração do App Hosting

## Execução local

Use Node.js compatível com Next.js 15. Instale as dependências com `npm install` e execute `npm run dev`. Configure o projeto Firebase de desenvolvimento e as variáveis necessárias em um arquivo local ignorado pelo Git.

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_BASE_URL` | Origem HTTPS pública usada pelo retorno e webhook do checkout; `http://localhost:9002` em desenvolvimento |
| `MP_ACCESS_TOKEN` | Token privado do Mercado Pago, somente no servidor |
| `MP_WEBHOOK_SECRET` | Segredo de assinatura dos webhooks do Mercado Pago |
| `GEMINI_API_KEY` | Chave do Gemini usada pelo Genkit no servidor |
| `MORALIS_API_KEY` | Consultas on-chain |
| `BRAPI_API_KEY` | Consultas de ativos brasileiros |

No App Hosting, mantenha essas credenciais no Secret Manager e conceda acesso apenas à conta de execução do aplicativo. Não publique arquivos `.env`, chaves privadas ou tokens no GitHub. O Firebase Admin SDK usa as credenciais padrão do ambiente Google.

## Autorização e pagamentos

O cliente se autentica com Firebase Authentication. O checkout verifica o ID token no servidor e associa a preferência a uma ordem privada no Firestore. O retorno do navegador apenas consulta o estado dessa ordem. A patente paga é liberada pelo webhook depois de validar a assinatura da notificação e consultar o pagamento aprovado no Mercado Pago, conferindo valor, moeda e ordem. Configure no painel do Mercado Pago o evento **Pagamentos** para `https://SEU_DOMINIO/api/mercadopago/webhook`.

As regras `firestore.rules` precisam ser publicadas no **mesmo projeto Firebase** junto com a versão corrigida do aplicativo. O Admin SDK não depende das regras do cliente e a conta de execução precisa de acesso ao Firestore. Antes de publicar, confira também compras antigas, estornos, permissões de serviço e o conteúdo já existente nas coleções globais.

## Atualização do feed global

A coleta de dados globais é iniciada por um administrador autenticado; uma trava no Firestore limita a frequência. Usuários comuns apenas leem o feed. Para operação contínua, configure uma rotina agendada de servidor com monitoramento e orçamento de APIs.

## Google AI Studio

A migração oficial do espaço do Firebase Studio para o Google AI Studio deve ser feita **pela conta que criou o espaço**. O projeto Firebase, o banco e o App Hosting continuam sendo serviços separados do editor. Após a migração, conecte o Google AI Studio a **este repositório existente**, sem criar uma cópia, se a opção estiver disponível. Preserve o App Hosting com GitHub Sync para manter a URL e os domínios atuais. Verifique os segredos antes de conectar a branch de implantação.

## Situação

O projeto ainda requer revisão em ambiente de homologação antes de publicar as alterações de segurança. Nenhum resultado exibido deve ser tratado como dado financeiro auditado.
