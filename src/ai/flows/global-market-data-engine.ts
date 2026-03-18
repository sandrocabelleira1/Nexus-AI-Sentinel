'use server';
/**
 * @fileOverview Nexus Global Market Data Engine v3.2.
 * Monitoramento de alta precisão: Binance (Real-time) + Brapi + Google Intelligence.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketDataOutputSchema = z.object({
  assets: z.array(z.object({
    ticker: z.string(),
    name: z.string(),
    price: z.number().describe('Preço final convertido para BRL'),
    change24h: z.number(),
    category: z.enum(['crypto', 'stocks', 'fiis', 'index']),
    region: z.string(),
    exchange: z.string(),
    logo: z.string().optional(),
    dividendYield: z.number().default(0),
    peRatio: z.number().optional(),
    pvpRatio: z.number().default(1),
    healthStatus: z.string().default('Estável'),
    fiiType: z.enum(['Papel', 'Tijolo', 'Agro', 'Misto']).default('Misto'),
    dividendAmount: z.number().default(0),
    dataCom: z.string().default('Aguardando'),
    paymentDate: z.string().default('Aguardando'),
    vacancyRate: z.number().default(0),
    nexusVerdict: z.string().default('Nexus consolidou os dados de mercado em tempo real.'),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

const DEFAULT_TICKERS = [
  "HGLG11", "MXRF11", "XPLG11", "KNRI11", "VISC11", "XPML11",
  "PETR4", "VALE3", "ITUB4", "BBAS3", "WEGE3",
  "AAPL", "MSFT", "NVDA",
  "BTC", "ETH", "SOL", "BNB", "XRP", "DOT"
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
      const data = await response.json();
      return { price: data.price, symbol: data.symbol };
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
  system: `### PERSONA: SENTINELA OMNISCIENTE NEXUS v3.2
Sua missão é extrair preços REAIS e ATUALIZADOS. 

### PROTOCOLO CRIPTO (BINANCE):
1. Para cada criptomoeda (BTC, ETH, SOL, XRP, DOT, BNB, etc), use a ferramenta 'fetchBinancePrice' com o par USDT (ex: BTCUSDT).
2. **CRÍTICO**: Use o Google Search para obter a cotação ATUAL do Dólar (USD/BRL).
3. Calcule o preço em BRL: (Preço Binance em USDT) * (Cotação USD/BRL). 
4. Não invente valores. Se a Binance diz 65000 e o dólar é 5.00, o preço é 325000.

### PROTOCOLO B3/US (BRAPI):
1. Use 'fetchBrapiData' para ações e FIIs.
2. Enriqueça com dados do Clube FII via Google Search para dividendos e vacância.

### OUTPUT:
Retorne a análise técnica detalhada para TODOS os tickers solicitados.`,
  prompt: `Execute varredura profunda para os ativos: {{#each tickers}}{{{this}}}, {{/each}}. 
Consolide os preços da Binance convertidos para BRL e os fundamentos da Brapi/Clube FII.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta os dados brutos de mercado para o formato JSON estruturado do Nexus. 
Garanta que os preços sejam números (number) e reflitam o valor real em BRL.

Dados: {{{rawData}}}`,
});

export async function fetchGlobalMarketData(customTickers?: string[]): Promise<MarketDataOutput | null> {
  try {
    const tickersToFetch = customTickers && customTickers.length > 0 
      ? [...new Set([...DEFAULT_TICKERS, ...customTickers])]
      : DEFAULT_TICKERS;

    const { text: rawData } = await marketDataPrompt({ tickers: tickersToFetch });
    const { output } = await structurePrompt({ rawData });
    return output ? JSON.parse(JSON.stringify(output)) : null;
  } catch (error: any) {
    console.error("Market Engine Error:", error.message);
    return null;
  }
}
