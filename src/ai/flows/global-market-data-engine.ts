'use server';
/**
 * @fileOverview Nexus Global Market Data Engine.
 * Monitora todas as bolsas globais (NYSE, B3, LSE, TSE, etc) usando Brapi e Google Search.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketDataOutputSchema = z.object({
  assets: z.array(z.object({
    ticker: z.string(),
    name: z.string(),
    price: z.number(),
    change24h: z.number(),
    category: z.enum(['crypto', 'stocks', 'fiis', 'index']),
    region: z.string(),
    exchange: z.string(),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

// Tool para buscar dados reais na Brapi para ativos brasileiros e globais suportados
const fetchBrapiDataTool = ai.defineTool(
  {
    name: 'fetchBrapiData',
    description: 'Busca cotações em tempo real na API Brapi para ativos brasileiros e internacionais.',
    inputSchema: z.object({
      tickers: z.array(z.string()).describe('Lista de tickers para consulta (ex: PETR4, VALE3, AAPL, BTC)'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    const apiKey = process.env.BRAPI_API_KEY;
    if (!apiKey) return { error: "Brapi API Key não configurada." };

    try {
      const tickersString = input.tickers.join(',');
      const response = await fetch(`https://brapi.dev/api/quote/${tickersString}?token=${apiKey}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { error: "Falha na conexão com Brapi." };
    }
  }
);

const marketDataPrompt = ai.definePrompt({
  name: 'marketDataPrompt',
  tools: [fetchBrapiDataTool],
  input: { schema: z.object({ markets: z.array(z.string()) }) },
  system: `### PERSONA: NEXUS (SENTINELA DE MERCADOS GLOBAIS)
Sua função é rastrear ativos nas principais bolsas do mundo AGORA. 
Utilize a ferramenta 'fetchBrapiData' para ativos da B3 (Brasil) e Blue Chips Americanas.
Para os demais mercados (TSE, LSE, SSE, etc.), utilize o Google Search integrado.

Bolsas Monitoradas: NYSE, NASDAQ, B3, LSE, TSE, HKEX, SSE, Euronext, TSX, BSE, ASX e FSX.`,
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### TAREFA:
Busque as cotações atuais para os seguintes mercados: {{#each markets}}{{{this}}}, {{/each}}.
Priorize os ativos mais relevantes de cada bolsa.

Dados Requeridos: Ativo (Ticker), Nome, Preço Atual, Variação 24h e Região.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta a varredura global em um JSON estruturado seguindo o esquema.
Certifique-se de que os números de preço e variação sejam convertidos corretamente para tipos numéricos.

Dados:
{{{rawData}}}`,
});

export async function fetchGlobalMarketData(): Promise<MarketDataOutput | null> {
  try {
    const markets = [
      "NYSE & NASDAQ USA", 
      "B3 Brasil", 
      "LSE UK", 
      "TSE Japan", 
      "HKEX Hong Kong", 
      "SSE China", 
      "Euronext EU", 
      "TSX Canada", 
      "BSE India", 
      "ASX Australia", 
      "FSX Germany"
    ];

    const { text: rawData } = await marketDataPrompt({ markets });
    const { output } = await structurePrompt({ rawData });

    if (!output) return null;
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("Market Data Engine Error:", error.message);
    return null;
  }
}
