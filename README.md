# Nexus AI Sentinel

Aplicativo experimental de análise de mercado e carteira com interface em português. Reúne painéis de preços, alertas, detecção de grandes transferências em criptoativos e recursos de IA. Este repositório concentra o código e o histórico do projeto.

> **Aviso:** sinais e textos gerados por IA não são recomendação de investimento. Dados externos podem atrasar ou ficar indisponíveis. Registros antigos de demonstração podem continuar visíveis até serem removidos do Firestore.

## Tecnologias

- Next.js 15, React 19 e TypeScript
- Firebase Authentication, Cloud Firestore e App Hosting
- Genkit e Gemini
- Mercado Pago: integração de assinaturas mensais em planejamento; checkout atual suspenso
- Fontes de mercado: Brapi, Binance, AwesomeAPI e Moralis

## Estrutura

- `src/app`: páginas, painel e ações de servidor
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
| `GEMINI_API_KEY` | Chave do Gemini usada pelo Genkit no servidor |
| `MORALIS_API_KEY` | Consultas on-chain |
| `BRAPI_API_KEY` | Consultas de ativos brasileiros |

No App Hosting, mantenha essas credenciais no Secret Manager e conceda acesso apenas à conta de execução do aplicativo. Não publique arquivos `.env`, chaves privadas ou tokens no GitHub. O Firebase Admin SDK usa as credenciais padrão do ambiente Google.

## Autorização e assinaturas

O cliente se autentica com Firebase Authentication. As regras impedem que ele altere diretamente seu plano. Os valores exibidos para PRO e SOVEREIGN são **mensais**, conforme a decisão do projeto, mas a implementação anterior criava somente uma cobrança única. Por isso, os botões pagos estão desativados até existir uma integração recorrente completa com confirmação de cada fatura, tratamento de falhas, cancelamento e estorno. Não libere planos com base em parâmetros de URL. Consulte o [roteiro de assinaturas mensais](docs/assinaturas-mensais.md).

As regras `firestore.rules` foram publicadas no projeto Firebase em 17/10/2026. A versão corrigida do aplicativo ainda precisa ser implantada no App Hosting. O Admin SDK não depende das regras do cliente e a conta de execução precisa de acesso ao Firestore. Revise planos antigos, estornos e o conteúdo já existente nas coleções globais.

## Assistente de IA

O navegador envia o ID token Firebase a uma ação de servidor. A ação verifica a identidade, lê a carteira do Firestore e limita as consultas a cinco por dia por conta, com intervalo mínimo de 30 segundos. Respostas da IA são experimentais e precisam ser conferidas nas fontes.

## Atualização do feed global

A coleta de dados globais é iniciada por um administrador autenticado; uma trava no Firestore limita a frequência. Usuários comuns apenas leem o feed. Para operação contínua, configure uma rotina agendada de servidor com monitoramento e orçamento de APIs.

## Google AI Studio

A migração oficial do espaço do Firebase Studio para o Google AI Studio deve ser feita **pela conta que criou o espaço**. O projeto Firebase, o banco e o App Hosting continuam sendo serviços separados do editor. Após a migração, conecte o Google AI Studio a **este repositório existente** pela opção de vincular ou importar do GitHub, sem criar uma cópia. Preserve o App Hosting com GitHub Sync para manter a URL e os domínios atuais. Verifique os segredos antes de conectar a branch de implantação.

## Situação

As regras de acesso já foram publicadas, mas o aplicativo ainda requer revisão em ambiente de homologação antes da implantação da versão nova. As assinaturas mensais não estão implementadas. Nenhum resultado exibido deve ser tratado como dado financeiro auditado.
