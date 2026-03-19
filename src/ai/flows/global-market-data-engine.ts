'use server';
/**
 * @fileOverview Nexus Global Market Data Engine v4.3.
 * Monitoramento de alta precisão: Binance API + Grounding em Clube FII e sites B3.
 * Foco: Extração de Dividendos, P/L, P/VP, Logotipos e Identificação de Oportunidades.
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
    logo: z.string().optional().describe('URL direta do logotipo do ativo (ex: da Brapi ou sites oficiais)'),
    dividendYield: z.number().default(0).describe('Yield anualizado (ex: 12.5)'),
    peRatio: z.number().optional().describe('Índice P/L para ações'),
    pvpRatio: z.number().default(1).describe('Índice P/VP para FIIs'),
    healthStatus: z.string().default('Estável'),
    fiiType: z.enum(['Papel', 'Tijolo', 'Agro', 'Misto']).default('Misto'),
    dividendAmount: z.number().default(0).describe('Valor em moeda do último dividendo pago'),
    dataCom: z.string().default('Aguardando'),
    paymentDate: z.string().default('Aguardando'),
    vacancyRate: z.number().default(0),
    nexusVerdict: z.string().default('O Nexus está avaliando as sinapses do mercado para este ativo.'),
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
    description: 'Busca cotações e logotipos na API Brapi para ativos B3 e US.',
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
    outputSchema: z.object({ price: v => typeof v === 'number' ? v : 5.85, pair: z.string() }),
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
    const apiKey = process.env.BINANCE_API_KEY || "x8KCDakybn0S6A8n1GacywVqd8XhoSjxDraC3DC6O2GuuuttKg9WVaZfeQoQ05ZD";
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
  system: `### PERSONA: NEXUS (O ANALISTA FUNDAMENTALISTA OMNISCIENTE)
Sua missão é visitar sites de elite (clubefii.com.br, statusinvest.com.br, Investidor10) via Google para extrair DADOS FUNDAMENTALISTAS REAIS.

PARA CADA ATIVO, EXTRAIA OBRIGATORIAMENTE:
1. **Logotipo**: Encontre a URL oficial do logotipo do ativo. Se estiver na API Brapi (campo logourl), use-a.
2. **Dividendos**: Valor do último provento pago (R$ ou $), Yield Anual (%) e as datas (Data Com e Pagamento).
3. **Saúde Financeira**: 
   - Ações: P/L (Preço sobre Lucro). Classifique como 'Saudável' se P/L < 15.
   - FIIs: P/VP e Vacância Física. Classifique como 'Desconto' se P/VP < 1.0.
4. **Preço Real**: Se as APIs falharem, o valor encontrado em sites especializados é a VERDADE FINAL.`,
  config: { googleSearchRetrieval: {} },
  prompt: `### TAREFA (DATA: {{{currentDate}}}):
Execute varredura profunda e extraia os LOGOTIPOS, DIVIDENDOS, P/L, P/VP e VACÂNCIA dos ativos: {{#each tickers}}{{{this}}}, {{/each}}.
Identifique se há OPORTUNIDADES de compra (ativos subvalorizados ou com yields excepcionais).`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta os dados brutos coletados em um JSON estruturado seguindo o esquema fornecido.

DIRETRIZES DE ELITE PARA DADOS FUNDAMENTALISTAS:
1. **Logo Tracker**: Preencha o campo 'logo' com a URL de imagem encontrada (Brapi field 'logourl' ou web). Certifique-se de que a URL seja válida.
2. **Dividend Tracker**: Preencha 'dividendAmount', 'dividendYield', 'dataCom' e 'paymentDate' com os dados extraídos da WEB (Clube FII / Status Invest).
3. **Nexus Verdict**: Crie uma análise curta (2 frases) baseada nos fundamentos (ex: "FII com P/VP atrativo e vacância controlada. Yield acima da média.").
4. **Identificação de Oportunidade**: Se um ativo tiver P/VP < 0.95 ou Dividend Yield > 10%, reforce isso no veredito.
5. **Moeda**: Cripto em USD, B3 em BRL.

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

    // Step 2: Grounding Web Fundamentalista (FIIs, Ações e Proventos)
    const { text: groundedData } = await specializedMarketGroundingPrompt({ tickers: tickersToFetch, currentDate });

    const context = `
      API_BINANCE: ${JSON.stringify(binancePrices)}
      API_BRAPI: ${JSON.stringify(brapi)}
      API_USD (USDBRL): ${JSON.stringify(usdRate)}
      WEB_GROUNDING (FUNDAMENTOS, LOGOTIPOS, DIVIDENDOS E OPORTUNIDADES): 
      ${groundedData}
    `;

    const { output } = await structurePrompt({ rawData: context });
    return output ? JSON.parse(JSON.stringify(output)) : null;
  } catch (error: any) {
    console.error("Market Engine Error:", error.message);
    return null;
  }
}
