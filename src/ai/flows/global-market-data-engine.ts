'use server';
/**
 * @fileOverview Nexus Global Market Data Engine v5.1.
 * Monitoramento de alta precisão + Geração de Séries Temporais para Gráficos e Candles.
 * Busca ativa de dividendos e múltiplos via Web Grounding.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketDataOutputSchema = z.object({
  assets: z.array(z.object({
    ticker: z.string(),
    name: z.string(),
    price: z.number(),
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
    nexusVerdict: z.string().default('O Nexus está avaliando as sinapses do mercado para este ativo.'),
    sparkline: z.array(z.number()).describe('Array de 24 números representando o preço nas últimas 24h.'),
    candles: z.array(z.object({
      time: z.string(),
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
    })).describe('Array de 15 objetos para gráfico de velas.'),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

const DEFAULT_TICKERS = [
  "HGLG11", "MXRF11", "XPLG11", "KNRI11", "VISC11", "XPML11",
  "PETR4", "VALE3", "ITUB4", "BBAS3", "WEGE3",
  "AAPL", "MSFT", "NVDA",
  "BTC", "ETH", "SOL", "BNB"
];

const fetchBrapiDataTool = ai.defineTool(
  {
    name: 'fetchBrapiData',
    description: 'Busca cotações e logotipos na API Brapi.',
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
    outputSchema: z.object({ price: z.number() }),
  },
  async () => {
    try {
      const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL');
      const data = await response.json();
      return { price: parseFloat(data.USDBRL.bid) };
    } catch (error) {
      return { price: 5.85 }; 
    }
  }
);

const fetchBinancePriceTool = ai.defineTool(
  {
    name: 'fetchBinancePrice',
    description: 'Busca o preço atual de uma criptomoeda na Binance.',
    inputSchema: z.object({ symbol: z.string() }),
    outputSchema: z.object({ price: z.number(), symbol: z.string() }),
  },
  async (input) => {
    const apiKey = "x8KCDakybn0S6A8n1GacywVqd8XhoSjxDraC3DC6O2GuuuttKg9WVaZfeQoQ05ZD";
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${input.symbol}`, {
        headers: { 'X-MBX-APIKEY': apiKey }
      });
      const data = await response.json();
      return { price: parseFloat(data.price), symbol: data.symbol };
    } catch (error) {
      return { price: 0, symbol: input.symbol };
    }
  }
);

const specializedMarketGroundingPrompt = ai.definePrompt({
  name: 'specializedMarketGroundingPrompt',
  input: { schema: z.object({ tickers: z.array(z.string()), currentDate: z.string() }) },
  system: `### PERSONA: NEXUS (ANALISTA DE ELITE)
Sua missão é extrair DADOS FUNDAMENTALISTAS atualizados (Clube FII, Status Invest, Investidor10) e gerar a telemetria de flutuação dos ativos.
Navegue ativamente para encontrar Dividendos, Data Com, P/VP e Vacância.`,
  config: { googleSearchRetrieval: {} },
  prompt: `### TAREFA (DATA: {{{currentDate}}}):
Extraia dividendos recentes, P/L, P/VP e vacância para: {{#each tickers}}{{{this}}}, {{/each}}.
Gere também uma série temporal realista (sparkline de 24 pontos e candles de 15 pontos) para cada ativo baseada na volatilidade real e preço atual.
NÃO RETORNE PREÇOS COMO 0. Se não encontrar, use a estimativa tática baseada no contexto de mercado.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta os dados brutos em JSON estruturado v5.1. 
  
  DIRETRIZES TÁTICAS:
  1. **Telemetria**: 'sparkline' deve ter 24 números (evite linhas retas, simule volatilidade). 'candles' deve ter 15 objetos com open/high/low/close realistas.
  2. **Fundamentos**: Preencha 'pvpRatio', 'dividendAmount', 'vacancyRate', 'dataCom' e 'paymentDate' baseados nos sites especializados (Clube FII/Status Invest).
  3. **Veredito**: Crie uma análise curta (2 frases) sobre o custo-benefício atual do ativo.
  
  Dados Brutos Capturados: {{{rawData}}}`,
});

export async function fetchGlobalMarketData(customTickers?: string[]): Promise<MarketDataOutput | null> {
  try {
    const tickersToFetch = customTickers && customTickers.length > 0 
      ? [...new Set([...DEFAULT_TICKERS, ...customTickers])]
      : DEFAULT_TICKERS;

    const cryptoRegex = /BTC|ETH|SOL|BNB/;
    const currentDate = new Date().toISOString();
    
    const [brapi, usdRate, binancePrices] = await Promise.all([
      fetchBrapiDataTool({ tickers: tickersToFetch.filter(t => !t.match(cryptoRegex)) }),
      fetchUSDBRLTool({}),
      Promise.all(tickersToFetch.filter(t => t.match(cryptoRegex)).map(t => fetchBinancePriceTool({ symbol: t + 'USDT' })))
    ]);

    const { text: groundedData } = await specializedMarketGroundingPrompt({ tickers: tickersToFetch, currentDate });

    const context = `
      API_BINANCE: ${JSON.stringify(binancePrices)}
      API_BRAPI: ${JSON.stringify(brapi)}
      API_USD: ${JSON.stringify(usdRate)}
      WEB_GROUNDING_FUNDAMENTALS: ${groundedData}
    `;

    const { output } = await structurePrompt({ rawData: context });
    return output ? JSON.parse(JSON.stringify(output)) : null;
  } catch (error: any) {
    console.error("Market Engine Error:", error.message);
    return null;
  }
}
