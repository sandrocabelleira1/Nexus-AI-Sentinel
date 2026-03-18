'use server';
/**
 * @fileOverview Nexus Global Market Data Engine v3.1.
 * Monitoramento massivo multi-fonte: Brapi + Clube FII + Web Intelligence.
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
    dividendYield: z.number().default(0),
    peRatio: z.number().optional(),
    pvpRatio: z.number().default(1),
    healthStatus: z.string().default('Estável'),
    // FII v3.1 - Extração Omnisciente
    fiiType: z.enum(['Papel', 'Tijolo', 'Agro', 'Misto']).default('Misto'),
    dividendAmount: z.number().default(0),
    dataCom: z.string().default('Aguardando'),
    paymentDate: z.string().default('Aguardando'),
    vacancyRate: z.number().default(0),
    nexusVerdict: z.string().default('Nexus está analisando os fundamentos táticos para este ativo.'),
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

const PRIORITY_TICKERS = [
  // B3 FIIs v3.1
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
  system: `Você é o Sentinela Omnisciente do Nexus AI.
### MISSÃO DE VARREDURA 360°:
1. Use a ferramenta fetchBrapiData para obter o esqueleto dos dados (preço, variação).
2. Use a pesquisa na web (Google Search) para enriquecer os dados com fontes de elite:
   - CLUBEFII.COM.BR (Obrigatório para FIIs: Dividendos, Vacância, P/VP, Data Com).
   - Portais de RI (Relação com Investidores) para notícias de última hora.
   - On-chain trackers para Cripto.
3. Se os dados de dividendos ou vacância não estiverem na Brapi, você DEVE extraí-los manualmente das buscas web.
4. Você DEVE retornar valores para TODOS os campos solicitados no output, mesmo que sejam 0 ou 'Aguardando'. Não deixe campos undefined.`,
  prompt: `Execute varredura profunda e omnisciente para: {{#each tickers}}{{{this}}}, {{/each}}. 
Cruze dados da Brapi com as informações mais recentes do Clube FII e portais financeiros mundiais. Garanta que a resposta contenha os fundamentos táticos completos.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta a análise tática para JSON. 
Garanta que dividendAmount, dataCom, paymentDate e vacancyRate estejam preenchidos. Se não encontrou o valor exato, use 0 para números e "Aguardando" para textos.

Dados brutos: {{{rawData}}}`,
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
