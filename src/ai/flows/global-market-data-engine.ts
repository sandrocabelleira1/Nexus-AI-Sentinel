'use server';
/**
 * @fileOverview Nexus Global Market Data Engine v3.1.
 * Monitoramento massivo multi-fonte: Brapi + Clube FII + Binance + Web Intelligence.
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
    dividendYield: z.number().default(0),
    peRatio: z.number().optional(),
    pvpRatio: z.number().default(1),
    healthStatus: z.string().default('Estável'),
    // FII v3.1 - Extração Omnisciente
    fiiType: z.enum(['Papel', 'Tijolo', 'Agro', 'Misto']).default('Misto'),
    dividendAmount: z.number().default(0),
    dataCom: z.string().default('Aguardando'),
    paymentDate: z.string().default('Aguardando'),
    vacancyRate: z.number().default(0),
    nexusVerdict: z.string().default('Nexus está analisando os fundamentos táticos para este ativo.'),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

const PRIORITY_TICKERS = [
  // B3 FIIs v3.1
  "HGLG11", "MXRF11", "XPLG11", "KNRI11", "VISC11", "BTLG11", "XPML11", "HCTR11", "IRDM11", "CPTS11", "RECR11", "VILG11", "KNCR11", "HGBS11",
  // B3 TOP
  "PETR4", "VALE3", "ITUB4", "BBDC4", "ABEV3", "BBAS3", "WEGE3", "MGLU3", "RENT3", "B3SA3",
  // US TOP
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
  // CRYPTO TOP (Monitorados via Binance)
  "BTC", "ETH", "SOL"
];

const fetchBrapiDataTool = ai.defineTool(
  {
    name: 'fetchBrapiData',
    description: 'Busca cotações e fundamentos na API Brapi para ativos B3 e US.',
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

const fetchBinancePriceTool = ai.defineTool(
  {
    name: 'fetchBinancePrice',
    description: 'Busca o preço atual de criptomoedas na API da Binance (ex: BTCUSDT).',
    inputSchema: z.object({ symbol: z.string().describe('O símbolo do par, ex: BTCUSDT') }),
    outputSchema: z.object({ price: z.string(), symbol: z.string() }),
  },
  async (input) => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${input.symbol}`);
      return await response.json();
    } catch (error) {
      return { error: "Erro Binance" };
    }
  }
);

const marketDataPrompt = ai.definePrompt({
  name: 'marketDataPrompt',
  tools: [fetchBrapiDataTool, fetchBinancePriceTool],
  input: { schema: z.object({ tickers: z.array(z.string()) }) },
  config: { 
    googleSearchRetrieval: {} 
  },
  system: `Você é o Sentinela Omnisciente do Nexus AI.
### MISSÃO DE VARREDURA 360°:
1. Para ativos B3 e US, use a ferramenta fetchBrapiData.
2. Para CRIPTO (BTC, ETH, SOL), use obrigatoriamente a ferramenta fetchBinancePrice (use o par USDT, ex: BTCUSDT). Converta o valor para BRL (use cotação aproximada do USD via pesquisa se necessário).
3. Use a pesquisa na web (Google Search) para enriquecer os dados com fontes de elite:
   - CLUBEFII.COM.BR (Obrigatório para FIIs: Dividendos, Vacância, P/VP, Data Com).
   - Portais de RI para notícias de última hora.
4. Você DEVE retornar valores para TODOS os campos solicitados no output, mesmo que sejam 0 ou 'Aguardando'.`,
  prompt: `Execute varredura profunda e omnisciente para: {{#each tickers}}{{{this}}}, {{/each}}. 
Cruze dados da Binance para Cripto, Brapi para ações e Clube FII para fundos imobiliários. Garanta que a resposta contenha os fundamentos táticos completos e o preço mais recente.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta a análise tática para JSON. 
Garanta que para Criptomoedas, a "exchange" seja marcada como "Binance".

Dados brutos: {{{rawData}}}`,
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
