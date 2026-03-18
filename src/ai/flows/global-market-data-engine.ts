'use server';
/**
 * @fileOverview Nexus Global Market Data Engine.
 * Monitora todas as bolsas globais (NYSE, B3, LSE, TSE, etc) usando Brapi e Google Search.
 * Otimizado para varredura em massa de ativos.
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
  })),
});

export type MarketDataOutput = z.infer<typeof MarketDataOutputSchema>;

// Lista de Tickers de alta relevância para garantir densidade no dashboard
const B3_PRIORITY_TICKERS = [
  "PETR4", "VALE3", "ITUB4", "BBDC4", "ABEV3", "BBAS3", "B3SA3", "ITSA4", "WEGE3", "MGLU3", 
  "JBSS3", "SUZB3", "RENT3", "GGBR4", "LREN3", "ELET3", "BBSE3", "VIVT3", "CCRO3", "EQTL3", 
  "RADL3", "RAIL3", "SBSP3", "HYPE3", "CPLE6", "CSAN3", "CPFE3", "BRFS3", "CYRE3", "NTCO3", 
  "GOAU4", "BRAP4", "CMIG4", "TOTS3", "SOMA3", "MRVE3", "BEEF3", "QUAL3", "DXCO3", "USIM5",
  "AZUL4", "CVCB3", "PRIO3", "HGLG11", "XPLG11", "KNRI11", "MXRF11", "VISC11", "BTLG11"
];

const USA_PRIORITY_TICKERS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK.B", "V", "JNJ", 
  "WMT", "JPM", "PG", "MA", "UNH", "HD", "BAC", "DIS", "ADBE", "NFLX"
];

// Tool para buscar dados reais na Brapi
const fetchBrapiDataTool = ai.defineTool(
  {
    name: 'fetchBrapiData',
    description: 'Busca cotações em tempo real na API Brapi para ativos brasileiros e internacionais.',
    inputSchema: z.object({
      tickers: z.array(z.string()).describe('Lista de tickers para consulta (ex: PETR4, VALE3, AAPL, BTC)'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    const apiKey = "2rb5157StMMfsE1ft1ErSq"; // Chave API atualizada conforme solicitado
    if (!apiKey) return { error: "Brapi API Key não configurada." };

    try {
      const tickersString = input.tickers.join(',');
      const response = await fetch(`https://brapi.dev/api/quote/${tickersString}?token=${apiKey}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { error: "Falha na conexão com Brapi." };
    }
  }
);

const marketDataPrompt = ai.definePrompt({
  name: 'marketDataPrompt',
  tools: [fetchBrapiDataTool],
  input: { 
    schema: z.object({ 
      markets: z.array(z.string()),
      b3Tickers: z.array(z.string()),
      usaTickers: z.array(z.string())
    }) 
  },
  system: `### PERSONA: NEXUS (SENTINELA DE MERCADOS GLOBAIS)
Sua função é rastrear ativos nas principais bolsas do mundo AGORA. 
Utilize a ferramenta 'fetchBrapiData' para buscar TODOS os ativos da B3 e Blue Chips Americanas fornecidos.

Bolsas Monitoradas: NYSE, NASDAQ, B3, LSE, TSE, HKEX, SSE, Euronext, TSX, BSE, ASX e FSX.
Sua missão é entregar um dashboard DENSO e COMPLETO. Não economize nos dados.`,
  config: {
    googleSearchRetrieval: {},
  },
  prompt: `### TAREFA:
1. Use 'fetchBrapiData' para obter cotações reais dos seguintes tickers da B3: {{#each b3Tickers}}{{{this}}}, {{/each}}.
2. Use 'fetchBrapiData' para os seguintes tickers USA: {{#each usaTickers}}{{{this}}}, {{/each}}.
3. Para as demais bolsas ({{#each markets}}{{{this}}}, {{/each}}), use o Google Search para encontrar os 10 ativos mais movimentados de cada uma hoje.

Retorne os dados brutos de cotação para todos esses ativos.`,
});

const structurePrompt = ai.definePrompt({
  name: 'marketStructurePrompt',
  input: { schema: z.object({ rawData: z.string() }) },
  output: { schema: MarketDataOutputSchema },
  prompt: `Converta a varredura global em um JSON estruturado seguindo o esquema.
Certifique-se de que TODOS os ativos encontrados sejam incluídos. Se um preço for em BRL, converta para número. 
Se for em USD, mantenha como número.

Dados:
{{{rawData}}}`,
});

export async function fetchGlobalMarketData(): Promise<MarketDataOutput | null> {
  try {
    const markets = [
      "LSE UK", "TSE Japan", "HKEX Hong Kong", "SSE China", "Euronext EU", 
      "TSX Canada", "BSE India", "ASX Australia", "FSX Germany"
    ];

    const { text: rawData } = await marketDataPrompt({ 
      markets, 
      b3Tickers: B3_PRIORITY_TICKERS, 
      usaTickers: USA_PRIORITY_TICKERS 
    });
    
    const { output } = await structurePrompt({ rawData });

    if (!output) return null;
    return JSON.parse(JSON.stringify(output));
  } catch (error: any) {
    console.error("Market Data Engine Error:", error.message);
    return null;
  }
}
