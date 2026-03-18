'use server';
/**
 * @fileOverview Nexus Global Market Data Engine.
 * Expandido para monitoramento massivo de FIIs v3.0 e busca global.
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
    // FII v3.0
    fiiType: z.enum(['Papel', 'Tijolo', 'Agro', 'Misto']).optional(),
    dividendAmount: z.number().optional(),
    dataCom: z.string().optional(),
    paymentDate: z.string().optional(),
    vacancyRate: z.number().optional(),
    nexusVerdict: z.string().optional(),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

// Lista expandida focando em FIIs e Ações TOP
const PRIORITY_TICKERS = [
  // B3 FIIs v3.0
  "HGLG11", "MXRF11", "XPLG11", "KNRI11", "VISC11", "BTLG11", "XPML11", "HCTR11", "IRDM11", "CPTS11", "RECR11", "VILG11", "KNCR11", "HGBS11",
  // B3 TOP
  "PETR4", "VALE3", "ITUB4", "BBDC4", "ABEV3", "BBAS3", "WEGE3", "MGLU3", "RENT3", "B3SA3",
  // US TOP
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
  // CRYPTO TOP
  "BTC", "ETH", "SOL"
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
  system: `Você é o Sentinela de Mercados Globais e Especialista em FIIs v3.0. 
### MISSÃO FII v3.0:
1. Identifique o tipo de fundo (Papel, Tijolo, Agro).
2. Extraia o P/VP, Vacância Física e Dividendos (Valor, Data Com e Data de Pagamento).
3. Gere o "Veredito Nexus": Uma frase curta indicando se é COMPRA baseada em:
   - P/VP < 0.95 (Desconto).
   - Vacância < 10%.
   - Dividendos estáveis ou crescentes.
4. Para ativos globais, use o Google Search como fallback.`,
  prompt: `Varredura Estratégica: Busque dados em tempo real para: {{#each tickers}}{{{this}}}, {{/each}}. 
Dê atenção especial aos Fundos Imobiliários e suas métricas de dividendos e vacância.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta a análise tática para JSON rigoroso.
Para FIIs, preencha todos os campos v3.0 (dividendAmount, dataCom, paymentDate, vacancyRate, nexusVerdict).
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
