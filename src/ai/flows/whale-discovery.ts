
'use server';
/**
 * @fileOverview Nexus Whale Discovery Engine (Multi-Asset Moralis Powered).
 * Captura dados reais on-chain de múltiplos ativos (ETH, USDT, USDC, WBTC) 
 * e os transforma em insights táticos globais.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const maxDuration = 60;

const WhaleDiscoveryOutputSchema = z.object({
  detected_whales: z.array(z.object({
    blockchain: z.string(),
    symbol: z.string(),
    amount: z.number(),
    amountUsd: z.number(),
    fromAddress: z.string(),
    toAddress: z.string(),
    transactionType: z.enum(['exchange_deposit', 'exchange_withdrawal', 'wallet_transfer']),
    nexus_logic: z.string().describe('Explicação do porquê este movimento é relevante para o mercado global'),
  })),
});

export type WhaleDiscoveryOutput = z.infer<typeof WhaleDiscoveryOutputSchema>;

const structuringPrompt = ai.definePrompt({
  name: 'whaleStructuringPrompt',
  input: { schema: z.object({ rawBlockchainData: z.string() }) },
  output: { schema: WhaleDiscoveryOutputSchema },
  system: `### PERSONA: NEXUS (SENTINELA ON-CHAIN GLOBAL)
Sua tarefa é analisar dados brutos de transferências da rede e identificar movimentos de "Baleias" em QUALQUER criptomoeda.
Considere movimentos acima de US$ 500.000 como relevantes. 

DIRETRIZES:
1. Identifique a moeda pelo símbolo ou contrato.
2. Classifique o tipo de transação:
   - exchange_deposit: Destino é uma exchange (liquidação potencial).
   - exchange_withdrawal: Origem é uma exchange (acumulação potencial).
   - wallet_transfer: Entre carteiras privadas (movimentação de custódia).
3. Gere o "Nexus Logic": Uma frase curta explicando o impacto tático desse movimento no mercado.`,
  prompt: `Analise estes dados reais das redes agora e identifique as baleias críticas:
{{{rawBlockchainData}}}`,
});

export async function runWhaleDiscovery(): Promise<WhaleDiscoveryOutput | null> {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    console.error("Moralis API Key não configurada.");
    return null;
  }

  try {
    // Lista de contratos críticos para monitorar (USDT, USDC, WBTC no Ethereum)
    const tokensToMonitor = [
      { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
      { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
      { symbol: 'WBTC', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' }
    ];

    // Buscamos transferências para cada token em paralelo
    const tokenPromises = tokensToMonitor.map(token => 
      fetch(`https://deep-index.moralis.io/api/v2.2/erc20/${token.address}/transfers?chain=eth&limit=10`, {
        headers: { 'accept': 'application/json', 'X-API-Key': apiKey }
      }).then(res => res.json())
    );

    // Também buscamos transferências nativas de ETH
    const ethPromise = fetch(`https://deep-index.moralis.io/api/v2.2/eth/transfers?chain=eth&limit=10`, {
      headers: { 'accept': 'application/json', 'X-API-Key': apiKey }
    }).then(res => res.json());

    const allResults = await Promise.all([...tokenPromises, ethPromise]);
    const rawData = allResults.map((res, i) => {
      const label = tokensToMonitor[i]?.symbol || 'ETH';
      return `[${label} DATA]: ${JSON.stringify(res)}`;
    }).join('\n\n');

    const { output } = await structuringPrompt({ rawBlockchainData: rawData });

    if (!output) return null;
    
    // Serialização limpa para evitar erros de resposta do NextJS
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("Nexus Whale Discovery Error:", error.message);
    return null;
  }
}
