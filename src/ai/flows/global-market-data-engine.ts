'use server';
/**
 * @fileOverview Nexus Global Market Data Engine.
 * Expandido para monitoramento massivo e busca global via Google Search fallback.
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
    logo: z.string().optional(),
    dividendYield: z.number().optional(),
    peRatio: z.number().optional(),
    pvpRatio: z.number().optional(),
    healthStatus: z.string().optional(),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

// Lista expandida para varredura inicial massiva
const PRIORITY_TICKERS = [
  // B3 TOP
  "PETR4", "VALE3", "ITUB4", "BBDC4", "ABEV3", "BBAS3", "WEGE3", "MGLU3", "RENT3", "B3SA3", "HYPE3", "LREN3", "GGBR4", "CSNA3", "NTCO3",
  // B3 FIIs
  "HGLG11", "MXRF11", "XPLG11", "KNRI11", "VISC11", "BTLG11", "XPML11", "HCTR11", "IRDM11", "CPTS11", "RECR11", "VILG11",
  // US TOP
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "BRK.B", "V", "JNJ", "WMT", "JPM", "PG", "MA", "UNH",
  // CRYPTO TOP
  "BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOT", "LINK", "AVAX", "MATIC", "SHIB", "TRX", "LTC", "BCH"
];

const fetchBrapiDataTool = ai.defineTool(
  {
    name: 'fetchBrapiData',
    description: 'Busca cotações, logos e fundamentos na API Brapi Pro.',
    inputSchema: z.object({ tickers: z.array(z.string()) }),
    outputSchema: z.any(),
  },
  async (input) => {
    const apiKey = "2rb5157StMMfsE1ft1ErSq";
    try {
      const response = await fetch(`https://brapi.dev/api/quote/${input.tickers.join(',')}?token=${apiKey}&fundamentals=true`);
      return await response.json();
    } catch (error) {
      return { error: "Erro Brapi" };
    }
  }
);

const marketDataPrompt = ai.definePrompt({
  name: 'marketDataPrompt',
  tools: [fetchBrapiDataTool],
  input: { schema: z.object({ tickers: z.array(z.string()) }) },
  config: { googleSearchRetrieval: {} },
  system: `Você é o Sentinela de Mercados Globais. 
1. Use a ferramenta Brapi para ativos conhecidos.
2. Use Google Search para ativos que não retornarem dados na Brapi ou para encontrar novos ativos em alta no Japão, Europa, Ásia, etc.
3. Classifique categoricamente: 'crypto', 'stocks', 'fiis' ou 'index'.
4. Avalie saúde financeira com base em P/L, Margens e P/VP.`,
  prompt: `Varredura Global: Busque dados em tempo real para: {{#each tickers}}{{{this}}}, {{/each}}. 
Se encontrar novos ativos relevantes durante a busca na web, inclua-os na análise.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta a análise tática de ativos globais para JSON rigoroso.
Dados: {{{rawData}}}`,
});

export async function fetchGlobalMarketData(): Promise<MarketDataOutput | null> {
  try {
    const { text: rawData } = await marketDataPrompt({ tickers: PRIORITY_TICKERS });
    const { output } = await structurePrompt({ rawData });
    return output ? JSON.parse(JSON.stringify(output)) : null;
  } catch (error: any) {
    console.error("Market Engine Error:", error.message);
    return null;
  }
}
