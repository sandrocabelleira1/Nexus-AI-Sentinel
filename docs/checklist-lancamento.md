# Checklist de conclusão e lançamento do Nexus

Este documento acompanha o trabalho por etapas. Marque um item como concluído apenas depois de verificar a implementação no ambiente indicado.

## Etapa 1 — Escopo do primeiro lançamento

### Proposta para a primeira versão

Começar com uma **beta privada e gratuita**, para validar produto, dados e custos antes de cobrar. O primeiro lançamento deve se apresentar como painel informativo de mercado e carteira, com assistente de IA experimental. Não anunciar recomendações personalizadas de compra, venda ou manutenção de ativos nem prometer monitoramento integral ou em tempo real.

### Incluído na beta proposta

- [ ] Cadastro, login e carteira manual do usuário.
- [ ] Painel de mercado com cotações claramente identificadas pela fonte e pelo horário de atualização.
- [ ] Alertas e notícias com fonte, data e distinção entre fato confirmado e análise da IA.
- [ ] Assistente Gemini para explicar informações e cenários, sem executar operações financeiras.
- [ ] Avisos claros de atraso, indisponibilidade ou caráter demonstrativo dos dados.
- [ ] Acesso apenas por convite ou lista limitada de usuários durante a homologação.

### Fora do escopo da beta

- [ ] Cobranças, assinaturas e liberação automática de planos pagos.
- [ ] Recomendações personalizadas apresentadas como ordem de compra ou venda.
- [ ] Alegação de cobertura de “todo o mercado” ou de monitoramento contínuo enquanto a atualização depende de ação administrativa.
- [ ] Execução de ordens ou conexão a contas/carteiras de corretoras.

### Decisões que o responsável pelo produto precisa confirmar

- [ ] Aprovar o lançamento beta privado e gratuito como primeira etapa.
- [ ] Aprovar o público inicial e o limite de participantes.
- [ ] Escolher os mercados/ativos cobertos no piloto (proposta: ativos brasileiros selecionados, câmbio USD/BRL e criptoativos selecionados).
- [ ] Definir a frequência de atualização que será prometida aos participantes, baseada no que o sistema realmente consegue cumprir.
- [ ] Confirmar se o assistente será apenas explicativo na beta, sem linguagem de “comprar/vender/segurar”.

**Estado:** proposta preparada; aguardando confirmação das decisões acima. Não avançar para cobrar clientes antes de fechar escopo, validação e revisão de conformidade.

## Etapa 2 — Produto e funcionalidades

- [ ] Testar cadastro, login, recuperação de senha e logout.
- [ ] Testar criação, edição e exclusão de ativos da carteira.
- [ ] Verificar isolamento dos dados entre contas.
- [ ] Testar o assistente Gemini com perguntas comuns, eventos atuais, hipóteses e perguntas sem dados suficientes.
- [ ] Validar a integração somente de leitura com a Polymarket (consulta pública no servidor, probabilidades rotuladas como implícitas e fallback em indisponibilidade). Código integrado localmente; falta validar na homologação.
- [ ] Confirmar que respostas mostram fontes e horários quando usados, e admitem incerteza.
- [ ] Testar indisponibilidade de Gemini, Firebase e fontes externas.
- [ ] Remover ou rotular dados de demonstração para não parecerem dados atuais.
- [ ] Validar uso em celular, computador, teclado e leitor de tela.

## Etapa 3 — Dados, atualizações e custos

- [ ] Confirmar fontes, direitos de uso comercial, preços e limites de cada API.
- [ ] Validar preços, moeda, horário, variação, identificador e mercado de cada ativo.
- [ ] Tratar divergências, dados ausentes, respostas inválidas e limites excedidos.
- [ ] Exibir fonte e última atualização para cotações, notícias e alertas.
- [ ] Configurar rotina automática de atualização, monitoramento e prevenção de alertas duplicados.
- [ ] Definir limites de uso e orçamento para Gemini e provedores de dados.

## Etapa 4 — Segurança, privacidade e suporte

- [ ] Revisar regras do Firestore e permissões administrativas.
- [ ] Confirmar no servidor os direitos de acesso a todas as funções premium.
- [ ] Reduzir os dados pessoais solicitados ao mínimo necessário.
- [ ] Implementar fluxo de exclusão de conta e dados.
- [ ] Publicar política de privacidade e termos de uso revisados para a operação real.
- [ ] Definir retenção, acesso interno, backups e recuperação de incidentes.
- [ ] Configurar logs sem expor segredos ou dados pessoais desnecessários.
- [ ] Definir canal e processo de suporte.

## Etapa 5 — Homologação e publicação beta

- [ ] Configurar ambiente separado de homologação e produção.
- [ ] Confirmar segredos e permissões do ambiente de produção sem expor valores.
- [ ] Executar testes ponta a ponta com contas de teste.
- [ ] Corrigir erros de build, autenticação, dados e acessibilidade.
- [ ] Validar domínio, HTTPS, monitoramento, alertas e orçamento.
- [ ] Fazer revisão de segurança e conferir procedimento de rollback.
- [ ] Publicar beta privada e acompanhar erros, custos e feedback.

## Etapa 6 — Preparação comercial (após a beta)

- [ ] Definir planos, preços, benefícios, limites e política de cancelamento.
- [ ] Implementar assinatura recorrente no Mercado Pago no servidor.
- [ ] Validar assinatura de webhook e confirmar pagamentos diretamente com o provedor.
- [ ] Tratar renovação, falha, cancelamento, reembolso e contestação idempotentemente.
- [ ] Criar página de gestão da assinatura e suporte de cobrança.
- [ ] Testar ciclo completo em homologação antes de credenciais reais.
- [ ] Fazer revisão jurídica da comunicação sobre análises financeiras e obrigações aplicáveis.
- [ ] Ativar pagamentos somente depois de aprovar todos os itens comerciais e operacionais.

## Critérios para considerar a beta pronta

- [ ] Todas as funções anunciadas estão testadas e funcionam com dados identificados.
- [ ] Erros de fontes e da IA são comunicados sem inventar resultados.
- [ ] Usuários não acessam dados de outras contas nem alteram privilégios.
- [ ] Privacidade, exclusão de conta, suporte, monitoramento e rollback estão preparados.
- [ ] O lançamento é limitado ao escopo e à frequência efetivamente validados.
