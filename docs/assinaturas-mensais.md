# Assinaturas mensais do Nexus

## Estado atual

Os valores anunciados para PRO (R$ 19,90/mês) e SOVEREIGN (R$ 59,90/mês) são para **assinatura recorrente**. O código anterior usava uma preferência de Checkout Pro e produzia uma cobrança única. O checkout foi suspenso nesta proposta até que a cobrança e os direitos de acesso coincidam.

## Fluxo a implementar

1. O navegador envia o ID token Firebase ao servidor; o servidor verifica a identidade e escolhe preço e plano em uma lista fixa. Dados de preço ou ID de outro usuário nunca vêm do cliente.
2. O servidor cria uma ordem interna com ID aleatório, usuário, plano, valor, moeda e estado pendente. Cria uma assinatura mensal via API `/preapproval` do Mercado Pago, com `frequency=1`, `frequency_type=months`, `currency_id=BRL` e `external_reference` igual ao ID interno. Retorna apenas o `init_point`.
3. Após o retorno do Mercado Pago, a página consulta o estado interno. Parâmetros de URL jamais liberam PRO ou SOVEREIGN.
4. Para cada notificação assinada de `subscription_preapproval` ou `subscription_authorized_payment`, o servidor valida a assinatura e consulta o recurso diretamente na API do Mercado Pago. Concede acesso somente depois de confirmar a fatura e o pagamento aprovado, conferindo assinatura, valor e moeda.
5. Cada renovação atualiza a data até a qual o acesso está pago. Falha, pausa, cancelamento, estorno e contestação alteram o estado de modo explícito, sem apagar o histórico. O mesmo evento recebido duas vezes deve produzir um único efeito.
6. Uma rotina de reconciliação consulta periodicamente assinaturas/faturas, pois notificações podem falhar ou chegar fora de ordem. O usuário deve poder ver o estado e solicitar cancelamento.
7. Todas as ações premium no servidor devem verificar o direito de acesso, além do bloqueio visual do painel.

## Implantação

Configurar token privado e segredo de assinatura no Secret Manager; limitar o acesso à conta de execução. Usar credenciais de teste e homologação para conferir primeira cobrança, renovação, falha, cancelamento e estorno. Só depois publicar os botões pagos.

## Referências oficiais

- [Criar assinatura](https://www.mercadopago.com.br/developers/pt/reference/online-payments/subscriptions/create-preapproval/post)
- [Assinatura com pagamento pendente](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/integration-configuration/subscription-no-associated-plan/pending-payments)
- [Webhooks de assinaturas](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/additional-content/your-integrations/notifications/webhooks)
- [Obter dados de fatura](https://www.mercadopago.com.br/developers/pt/reference/online-payments/subscriptions/get-authorized-payment/get)
- [Gerenciar assinatura](https://www.mercadopago.com.br/developers/pt/docs/subscriptions/subscription-management)
