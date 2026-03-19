
'use server';
/**
 * @fileOverview Nexus Global Market Data Engine v3.4.
 * Monitoramento de alta precisão: Binance API Oficial (USD) + Brapi (BRL).
 * Utiliza credenciais de API via variáveis de ambiente para dados em tempo real.
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

const fetchBinancePriceTool = ai.defineTool(
  {
    name: 'fetchBinancePrice',
    description: 'Busca o preço atual de uma criptomoeda na Binance. Requer o par USDT (ex: BTCUSDT).',
    inputSchema: z.object({ symbol: z.string().describe('O par de negociação, ex: BTCUSDT, ETHUSDT') }),
    outputSchema: z.object({ price: z.number(), symbol: z.string(), error: z.string().optional() }),
  },
  async (input) => {
    const apiKey = process.env.BINANCE_API_KEY;
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${input.symbol}`, {
        headers: apiKey ? { 'X-MBX-APIKEY': apiKey } : {}
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
  tools: [fetchBrapiDataTool, fetchBinancePriceTool],
  input: { schema: z.object({ tickers: z.array(z.string()) }) },
  system: `### PERSONA: SENTINELA OMNISCIENTE NEXUS v3.4 (BINANCE CORE)
Sua missão é extrair preços REAIS, ATUALIZADOS e ABSOLUTOS. 

### PROTOCOLO CRIPTO (BINANCE API):
1. Use obrigatoriamente a ferramenta 'fetchBinancePrice' para cada criptomoeda solicitada.
2. Importante: Você deve passar o par USDT (ex: para BTC use BTCUSDT, para ETH use ETHUSDT, para SOL use SOLUSDT).
3. **MANTENHA O PREÇO EM DÓLAR (USD)**. Não tente converter para BRL. O valor retornado pela Binance é o preço real em USD.
4. Defina 'currency' como "USD" para todos os ativos extraídos da Binance.

### PROTOCOLO B3 (BRAPI):
1. Use 'fetchBrapiData' para ações brasileiras e FIIs.
2. Defina 'currency' como "BRL" para ativos B3.

### REQUISITO DE SAÍDA:
Gere uma análise técnica para todos os tickers. Se o preço for da Binance, use o valor exato retornado em USD.`,
  prompt: `Execute varredura profunda e extraia os preços em tempo real para: {{#each tickers}}{{{this}}}, {{/each}}. 
Priorize dados da Binance API para Cripto e mantenha em USD.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta os dados brutos de mercado para o formato JSON estruturado do Nexus. 
Garanta que 'price' seja o number exato extraído das ferramentas.
Ativos da Binance/US -> currency: "USD"
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
