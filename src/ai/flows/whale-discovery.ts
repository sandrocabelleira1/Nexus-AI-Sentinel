
'use server';
/**
 * @fileOverview Nexus Whale Discovery Engine (Moralis Powered).
 * Captura dados reais on-chain e os transforma em insights táticos.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WhaleDiscoveryOutputSchema = z.object({
  detected_whales: z.array(z.object({
    blockchain: z.string(),
    symbol: z.string(),
    amount: z.number(),
    amountUsd: z.number(),
    fromAddress: z.string(),
    toAddress: z.string(),
    transactionType: z.enum(['exchange_deposit', 'exchange_withdrawal', 'wallet_transfer']),
    nexus_logic: z.string().describe('Explicação do porquê este movimento é relevante'),
  })),
});

export type WhaleDiscoveryOutput = z.infer<typeof WhaleDiscoveryOutputSchema>;

const structuringPrompt = ai.definePrompt({
  name: 'whaleStructuringPrompt',
  input: { schema: z.object({ rawBlockchainData: z.string() }) },
  output: { schema: WhaleDiscoveryOutputSchema },
  system: `Você é o Nexus (Sentinela On-Chain). 
Sua tarefa é analisar dados brutos de transferências da Moralis e identificar "Baleias".
Considere movimentos acima de US$ 500.000 como relevantes.
Classifique como:
- exchange_deposit: Se o destino for uma exchange conhecida (Binance, Coinbase, etc).
- exchange_withdrawal: Se a origem for uma exchange.
- wallet_transfer: Entre carteiras privadas.`,
  prompt: `Analise estes dados reais da rede e identifique as baleias:
{{{rawBlockchainData}}}`,
});

export async function runWhaleDiscovery(): Promise<WhaleDiscoveryOutput | null> {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    console.error("Moralis API Key não configurada.");
    return null;
  }

  try {
    // Focamos no contrato de USDT no Ethereum para detectar fluxo de stablecoins
    const usdtContract = '0xdac17f958d2ee523a2206206994597c13d831ec7';
    const url = `https://deep-index.moralis.io/api/v2.2/erc20/${usdtContract}/transfers?chain=eth&limit=15`;

    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'X-API-Key': apiKey
      }
    });

    if (!response.ok) throw new Error(`Moralis API Error: ${response.statusText}`);
    
    const rawData = await response.json();
    const { output } = await structuringPrompt({ rawBlockchainData: JSON.stringify(rawData) });

    if (!output) return null;
    
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("Whale Discovery Error:", error.message);
    return null;
  }
}
