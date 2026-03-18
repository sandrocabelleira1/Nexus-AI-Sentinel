'use server';
/**
 * @fileOverview Nexus Global Market Data Engine.
 * Monitoramento massivo de FIIs v3.0 com extração rigorosa de dados do Clube FII.
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
    // FII v3.0 - Extração Obrigatória
    fiiType: z.enum(['Papel', 'Tijolo', 'Agro', 'Misto']).optional(),
    dividendAmount: z.number().optional(),
    dataCom: z.string().optional(),
    paymentDate: z.string().optional(),
    vacancyRate: z.number().optional(),
    nexusVerdict: z.string().optional(),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

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
    description: 'Busca cotações e fundamentos na API Brapi.',
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
  config: { 
    googleSearchRetrieval: {} 
  },
  system: `Você é o Sentinela de Mercados Globais e Especialista em FIIs v3.0. 
### MISSÃO DE EXTRAÇÃO RIGOROSA:
1. Para cada ticker de FII listado, você DEVE encontrar os seguintes dados reais no site CLUBEFII.COM.BR:
   - Valor do último dividendo pago (em R$).
   - Data Com e Data de Pagamento.
   - Vacância Física (%).
   - P/VP atual.
2. Se os dados não estiverem disponíveis na ferramenta de cotação, use a pesquisa na web para capturar os valores mais recentes do Clube FII.
3. Não retorne 0 se a informação puder ser encontrada. Procure por "rendimento anunciado" ou "dividendos [TICKER]".`,
  prompt: `Execute varredura profunda para: {{#each tickers}}{{{this}}}, {{/each}}. 
Priorize capturar os fundamentos reais de dividendos e vacância para os fundos imobiliários usando o Clube FII.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta a análise técnica para JSON. 
Certifique-se de que os campos dividendAmount, dataCom, paymentDate e vacancyRate para FIIs estejam preenchidos com os valores reais encontrados na análise.

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
