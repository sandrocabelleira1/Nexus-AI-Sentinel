'use server';
/**
 * @fileOverview Nexus Global Market Data Engine v3.5.
 * Monitoramento de alta precisão: Binance API Oficial (USD) + Brapi (BRL).
 * Agora inclui monitoramento de câmbio USD/BRL para consolidação de patrimônio.
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
    category: z.enum(['crypto', 'stocks', 'fiis', 'index', 'currency']),
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
    nexusVerdict: z.string().default('Nexus consolidou os dados de mercado em tempo real via Binance API.'),
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

const fetchUSDBRLTool = ai.defineTool(
  {
    name: 'fetchUSDBRL',
    description: 'Busca a cotação atual do Dólar para Real (USD-BRL).',
    inputSchema: z.object({}),
    outputSchema: z.object({ price: z.number(), pair: z.string() }),
  },
  async () => {
    try {
      const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
      const data = await response.json();
      return { price: parseFloat(data.USDBRL.bid), pair: "USD-BRL" };
    } catch (error) {
      return { price: 5.0, pair: "USD-BRL" }; // Fallback seguro
    }
  }
);

const fetchBinancePriceTool = ai.defineTool(
  {
    name: 'fetchBinancePrice',
    description: 'Busca o preço atual de uma criptomoeda na Binance. Requer o par USDT (ex: BTCUSDT).',
    inputSchema: z.object({ symbol: z.string().describe('O par de negociação, ex: BTCUSDT, ETHUSDT') }),
    outputSchema: z.object({ price: z.number(), symbol: z.string(), error: z.string().optional() }),
  },
  async (input) => {
    const apiKey = "x8KCDakybn0S6A8n1GacywVqd8XhoSjxDraC3DC6O2GuuuttKg9WVaZfeQoQ05ZD";
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${input.symbol}`, {
        headers: { 'X-MBX-APIKEY': apiKey }
      });
      const data = await response.json();
      if (data.price) {
        return { price: parseFloat(data.price), symbol: data.symbol };
      }
      return { error: data.msg || "Símbolo não encontrado", price: 0, symbol: input.symbol };
    } catch (error) {
      return { error: "Erro de conexão com a Binance", price: 0, symbol: input.symbol };
    }
  }
);

const marketDataPrompt = ai.definePrompt({
  name: 'marketDataPrompt',
  tools: [fetchBrapiDataTool, fetchBinancePriceTool, fetchUSDBRLTool],
  input: { schema: z.object({ tickers: z.array(z.string()) }) },
  system: `### PERSONA: SENTINELA OMNISCIENTE NEXUS v3.5 (CONSOLIDAÇÃO CAMBIAL)
Sua missão é extrair preços REAIS e o CÂMBIO atual para consolidação de portfólio.

### PROTOCOLO CRIPTO (BINANCE API):
1. Use 'fetchBinancePrice' para cada cripto (par USDT).
2. **PREÇO EM DÓLAR (USD)**. currency: "USD".

### PROTOCOLO CÂMBIO:
1. Use 'fetchUSDBRL' para obter a cotação do Dólar hoje.
2. Adicione um ativo com ticker "USDBRL" à lista final para que o app saiba converter o patrimônio.

### PROTOCOLO B3:
1. Use 'fetchBrapiData' para ativos brasileiros. currency: "BRL".`,
  prompt: `Execute varredura e extraia os preços para: {{#each tickers}}{{{this}}}, {{/each}}. 
Inclua obrigatoriamente a cotação USDBRL.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta para JSON estruturado. 
Garanta que o ativo USDBRL esteja presente.
Ativos Binance/US -> currency: "USD"
Ativos B3 -> currency: "BRL"

Dados brutos: {{{rawData}}}`,
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
