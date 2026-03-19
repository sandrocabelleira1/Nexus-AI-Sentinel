'use server';
/**
 * @fileOverview Nexus Global Market Data Engine v3.9.
 * Monitoramento de alta precisão: Binance API + Grounding em Clube FII e sites B3.
 * Busca ativa via web para dados que APIs não fornecem (Vacância, P/VP, etc).
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
    nexusVerdict: z.string().default('Nexus consolidou os dados via varredura web e APIs oficiais.'),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

const DEFAULT_TICKERS = [
  "HGLG11", "MXRF11", "XPLG11", "KNRI11", "VISC11", "XPML11",
  "PETR4", "VALE3", "ITUB4", "BBAS3", "WEGE3",
  "AAPL", "MSFT", "NVDA",
  "BTC", "ETH", "SOL", "BNB", "XRP", "DOT", "ADA", "LINK"
];

const fetchBrapiDataTool = ai.defineTool(
  {
    name: 'fetchBrapiData',
    description: 'Busca cotações na API Brapi para ativos B3 e US.',
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
      return { price: 5.80, pair: "USD-BRL" }; 
    }
  }
);

const fetchBinancePriceTool = ai.defineTool(
  {
    name: 'fetchBinancePrice',
    description: 'Busca o preço atual de uma criptomoeda na Binance. Requer o par USDT (ex: BTCUSDT).',
    inputSchema: z.object({ symbol: z.string().describe('O par de negociação, ex: BTCUSDT') }),
    outputSchema: z.object({ price: z.number(), symbol: z.string(), error: z.string().optional() }),
  },
  async (input) => {
    const apiKey = "x8KCDakybn0S6A8n1GacywVqd8XhoSjxDraC3DC6O2GuuuttKg9WVaZfeQoQ05ZD";
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${input.symbol}`, {
        headers: { 'X-MBX-APIKEY': apiKey }
      });
      if (!response.ok) throw new Error("Binance API error");
      const data = await response.json();
      return { price: parseFloat(data.price), symbol: data.symbol };
    } catch (error) {
      console.error(`Error fetching ${input.symbol} from Binance:`, error);
      return { error: "Erro Binance", price: 0, symbol: input.symbol };
    }
  }
);

const specializedMarketGroundingPrompt = ai.definePrompt({
  name: 'specializedMarketGroundingPrompt',
  input: { schema: z.object({ tickers: z.array(z.string()), currentDate: z.string() }) },
  system: `### PERSONA: NEXUS (O ANALISTA OMNISCIENTE)
Sua missão é visitar sites especializados (clubefii.com.br, statusinvest.com.br, B3) via Google para extrair:
1. Para FIIs: P/VP, Vacância, Valor do Último Dividendo e Data Com.
2. Para Ações: Dividend Yield e Saúde Financeira.
3. Para Cripto: Sentimento de mercado e notícias de última hora na Binance/CoinMarketCap.`,
  config: { googleSearchRetrieval: {} },
  prompt: `### TAREFA (DATA: {{{currentDate}}}):
Execute varredura profunda para os ativos: {{#each tickers}}{{{this}}}, {{/each}}.
Identifique as métricas de FIIs no clubefii.com.br. Tente encontrar os preços mais recentes de Cripto via busca web caso a API falhe.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta os dados brutos coletados em um JSON estruturado seguindo o esquema fornecido.

DIRETRIZES CRÍTICAS:
1. PRIORIDADE DE PREÇO: SEMPRE use o preço vindo da "API_BINANCE" para criptomoedas e "API_BRAPI" para ações/FIIs. Nunca deixe o preço como 0 se houver valor nas APIs.
2. MOEDA: 
   - Criptomoedas (BTC, ETH, SOL, etc): SEMPRE em USD. Moeda: "USD".
   - Ações/FIIs B3: SEMPRE em BRL. Moeda: "BRL".
   - Ativo "USDBRL": OBRIGATÓRIO incluir na lista com a taxa vinda da "API_USD".
3. METRICAS FII: Se "WEB_GROUNDING" contiver dados de Dividendos, Vacância ou P/VP do Clube FII, preencha-os.
4. CATEGORIA: Classifique corretamente como 'crypto', 'stocks', 'fiis' ou 'currency'.

Dados brutos coletados: 
{{{rawData}}}`,
});

export async function fetchGlobalMarketData(customTickers?: string[]): Promise<MarketDataOutput | null> {
  try {
    const cryptoRegex = /BTC|ETH|SOL|BNB|XRP|DOT|ADA|LINK|USDT|USDC/;
    const tickersToFetch = customTickers && customTickers.length > 0 
      ? [...new Set([...DEFAULT_TICKERS, ...customTickers])]
      : DEFAULT_TICKERS;

    const currentDate = new Date().toISOString();
    
    // Step 1: APIs Oficiais (Rápido e Preciso)
    const [brapi, usdRate, binancePrices] = await Promise.all([
      fetchBrapiDataTool({ tickers: tickersToFetch.filter(t => !t.match(cryptoRegex)) }),
      fetchUSDBRLTool({}),
      Promise.all(tickersToFetch.filter(t => t.match(cryptoRegex)).map(t => {
        // Normaliza ticker para Binance (ex: BTC -> BTCUSDT)
        const symbol = t.includes('USDT') ? t : t + 'USDT';
        return fetchBinancePriceTool({ symbol });
      }))
    ]);

    // Step 2: Grounding Neural (Profundo - FIIs e Notícias)
    const { text: groundedData } = await specializedMarketGroundingPrompt({ tickers: tickersToFetch, currentDate });

    const context = `
      API_BINANCE (Preços em USD): ${JSON.stringify(binancePrices)}
      API_BRAPI (B3/US Stocks): ${JSON.stringify(brapi)}
      API_USD (Taxa USDBRL): ${JSON.stringify(usdRate)}
      WEB_GROUNDING (Métricas Clube FII / Notícias): 
      ${groundedData}
    `;

    const { output } = await structurePrompt({ rawData: context });
    return output ? JSON.parse(JSON.stringify(output)) : null;
  } catch (error: any) {
    console.error("Market Engine Error:", error.message);
    return null;
  }
}
