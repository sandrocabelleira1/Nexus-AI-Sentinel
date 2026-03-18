'use server';
/**
 * @fileOverview Nexus Global Market Data Engine v3.3.
 * Monitoramento de alta precisão: Binance (Real USD) + Brapi (BRL).
 * Utiliza credenciais de API via variáveis de ambiente.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketDataOutputSchema = z.object({
  assets: z.array(z.object({
    ticker: z.string(),
    name: z.string(),
    price: z.number().describe('Preço real no mercado de origem (USD para Cripto/US, BRL para B3)'),
    currency: z.enum(['BRL', 'USD']),
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
    const apiKey = process.env.BRAPI_API_KEY;
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
    const apiKey = process.env.BINANCE_API_KEY;
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${input.symbol}`, {
        headers: apiKey ? { 'X-MBX-APIKEY': apiKey } : {}
      });
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
  system: `### PERSONA: SENTINELA OMNISCIENTE NEXUS v3.3
Sua missão é extrair preços REAIS e ATUALIZADOS. 

### PROTOCOLO CRIPTO (BINANCE):
1. Para cada criptomoeda (BTC, ETH, SOL, XRP, DOT, BNB, etc), use a ferramenta 'fetchBinancePrice' com o par USDT (ex: BTCUSDT).
2. **MANTENHA O PREÇO EM DÓLAR (USD)**. Não converta para BRL. Use o valor direto da Binance.
3. Se o ativo for Cripto ou Stock US, a moeda (currency) deve ser "USD".

### PROTOCOLO B3 (BRAPI):
1. Use 'fetchBrapiData' para ações brasileiras e FIIs.
2. A moeda (currency) para ativos B3 deve ser "BRL".

### OUTPUT:
Retorne a análise técnica detalhada para TODOS os tickers solicitados, garantindo que o campo 'currency' esteja correto.`,
  prompt: `Execute varredura profunda para os ativos: {{#each tickers}}{{{this}}}, {{/each}}. 
Mantenha preços de Cripto em USD e B3 em BRL.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta os dados brutos de mercado para o formato JSON estruturado do Nexus. 
Garanta que 'price' seja um number.
Ativos Binance/US -> currency: "USD"
Ativos B3 -> currency: "BRL"

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
