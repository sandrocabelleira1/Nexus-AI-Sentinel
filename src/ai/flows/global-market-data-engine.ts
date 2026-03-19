'use server';
/**
 * @fileOverview Nexus Global Market Data Engine v4.1.
 * Monitoramento de alta precisão: Binance API + Grounding em Clube FII e sites B3.
 * Prioridade Total: NUNCA retornar preço 0. Se a API falhar, a varredura WEB OBRIGATORIAMENTE fornece o dado.
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
    if (!apiKey) return { error: "Sem chave Brapi" };
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
      return { price: 5.85, pair: "USD-BRL" }; 
    }
  }
);

const fetchBinancePriceTool = ai.defineTool(
  {
    name: 'fetchBinancePrice',
    description: 'Busca o preço atual de uma criptomoeda na Binance.',
    inputSchema: z.object({ symbol: z.string() }),
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
      return { error: "Erro Binance", price: 0, symbol: input.symbol };
    }
  }
);

const specializedMarketGroundingPrompt = ai.definePrompt({
  name: 'specializedMarketGroundingPrompt',
  input: { schema: z.object({ tickers: z.array(z.string()), currentDate: z.string() }) },
  system: `### PERSONA: NEXUS (O ANALISTA OMNISCIENTE)
Sua missão é visitar sites especializados (clubefii.com.br, statusinvest.com.br, B3, CoinMarketCap) via Google para extrair DADOS REAIS E PREÇOS ATUAIS.
Se a API falhar, você é a única fonte da verdade. NUNCA retorne preço 0.

EXTRAIA OBRIGATORIAMENTE:
1. PREÇO ATUAL de cada ativo (USD para Cripto, BRL para B3).
2. FIIs: P/VP, Vacância, Valor do Último Dividendo e Data Com (via clubefii.com.br).
3. Cripto: Preço spot na Binance ou CoinMarketCap agora.`,
  config: { googleSearchRetrieval: {} },
  prompt: `### TAREFA (DATA: {{{currentDate}}}):
Execute varredura profunda e extraia os PREÇOS E MÉTRICAS dos ativos: {{#each tickers}}{{{this}}}, {{/each}}.
Priorize o valor real de mercado encontrado na web caso as APIs falhem.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta os dados brutos coletados em um JSON estruturado seguindo o esquema fornecido.

DIRETRIZES CRÍTICAS PARA ELIMINAR VALORES ZERADOS:
1. PRIORIDADE DE PREÇO:
   - Se "API_BINANCE" ou "API_BRAPI" retornarem um preço > 0, use-o.
   - SE A API RETORNAR 0 OU ERRO, você OBRIGATORIAMENTE deve usar o preço encontrado em "WEB_GROUNDING".
   - NUNCA, SOB QUALQUER CIRCUNSTÂNCIA, deixe o preço como 0.00 se houver um valor numérico disponível no contexto web.
2. MOEDA: 
   - Criptomoedas (BTC, ETH, SOL, etc): SEMPRE em USD. Moeda: "USD".
   - Ações/FIIs B3: SEMPRE em BRL. Moeda: "BRL".
3. FIIs: Se "WEB_GROUNDING" cita dividendos ou vacância do Clube FII, preencha-os fielmente.

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
    
    // Step 1: APIs Oficiais
    const [brapi, usdRate, binancePrices] = await Promise.all([
      fetchBrapiDataTool({ tickers: tickersToFetch.filter(t => !t.match(cryptoRegex)) }),
      fetchUSDBRLTool({}),
      Promise.all(tickersToFetch.filter(t => t.match(cryptoRegex)).map(t => {
        const symbol = t.includes('USDT') ? t : t + 'USDT';
        return fetchBinancePriceTool({ symbol });
      }))
    ]);

    // Step 2: Grounding Web (Redundância Anti-Zero)
    const { text: groundedData } = await specializedMarketGroundingPrompt({ tickers: tickersToFetch, currentDate });

    const context = `
      API_BINANCE: ${JSON.stringify(binancePrices)}
      API_BRAPI: ${JSON.stringify(brapi)}
      API_USD (USDBRL): ${JSON.stringify(usdRate)}
      WEB_GROUNDING (PREÇOS REAIS E MÉTRICAS): 
      ${groundedData}
    `;

    const { output } = await structurePrompt({ rawData: context });
    return output ? JSON.parse(JSON.stringify(output)) : null;
  } catch (error: any) {
    console.error("Market Engine Error:", error.message);
    return null;
  }
}
