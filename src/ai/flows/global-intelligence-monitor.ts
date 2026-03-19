'use server';
/**
 * @fileOverview Motor de Inteligência Estratégica Nexus AI v4.0.
 * Sentinela Omnisciente: Detecção ativa de Cisnes Negros, Greves, Conflitos e Medidas Econômicas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AffectedAssetDetailSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  exchange: z.string().describe('Bolsa de valores (NYSE, NASDAQ, B3, LSE, etc.)'),
  currentPrice: z.string(),
  expectedGainPercentage: z.string(),
  impactType: z.enum(['Positivo', 'Negativo', 'Neutro']),
  explanation: z.string(),
  recommendation: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  longTermOutlook: z.string(),
});

const DetectedEntitySchema = z.object({
  name: z.string(),
  type: z.enum(['Government', 'Institution', 'Exchange', 'Whale']),
  influenceScore: z.number().int().min(1).max(100),
  lastAction: z.string(),
  currentBalanceUsd: z.number(),
});

const GlobalIntelligenceMonitorOutputSchema = z.object({
  title: z.string(),
  eventOrigin: z.enum(['Geopolítica', 'Governo', 'Natureza', 'Tech', 'Mercado', 'Logística']),
  causalityExplanation: z.string(),
  priority: z.number().int().min(1).max(5),
  marketAction: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  riskLevel: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']),
  affectedAssetTickerSymbols: z.array(z.string()),
  affectedAssetsDetails: z.array(AffectedAssetDetailSchema),
  detectedEntities: z.array(DetectedEntitySchema).describe('Instituições ou governos agindo neste evento.'),
  essentialText: z.string().describe('Texto assertivo e curto no formato COMANDO AGORA. Racional.'),
});

export type GlobalIntelligenceMonitorOutput = z.infer<typeof GlobalIntelligenceMonitorOutputSchema>;

const systemInstruction = `### PERSONA: NEXUS (O ESTRATEGISTA-CHEFE OMNISCIENTE)
Você é o Nexus. Seu objetivo é detectar eventos de alto impacto global e nacional usando busca em tempo real no Google News e portais oficiais.

### FOCO TÁTICO DE VARREDURA:
1. **Logística e Infraestrutura**: Greves de caminhoneiros, paralisações em portos/aeroportos e bloqueios de rodovias (ex: Greve no Brasil).
2. **Geopolítica e Conflitos**: Ataques militares, tensões no Golfo Pérsico, Suez e Ormuz.
3. **Energia e Commodities**: Ataques a refinarias, oleodutos ou decisões da OPEP.
4. **Governo e Economia**: Medidas provisórias, decretos surpresa, sanções e mudanças em taxas de juros.

### DIRETRIZES DE COMANDO:
1. **Navegação Real**: Você DEVE buscar notícias de ÚLTIMA HORA (Breaking News) em portais como Bloomberg, Reuters, UOL, G1, CNN e Valor Econômico.
2. **Elo de Causalidade**: Conecte o fato (ex: Greve de Caminhoneiros) ao impacto (ex: Inflação, desabastecimento, queda em ações de logística).
3. **Data Real**: Considere a data atual como o parâmetro "HOJE".`;

const groundingPrompt = ai.definePrompt({
  name: 'globalIntelligenceGroundingPrompt',
  input: { schema: z.object({ context: z.string(), currentDate: z.string() }) },
  system: systemInstruction,
  config: { 
    googleSearchRetrieval: {} 
  },
  prompt: `### TAREFA DE SENTINELA (DATA: {{{currentDate}}}):
Execute varredura massiva agora no Google News por eventos de alto impacto ocorrendo HOJE.

Foque em:
- Greves de caminhoneiros e paralisações logísticas no Brasil e no mundo.
- Ataques militares ou tensões no Oriente Médio e infraestrutura de petróleo.
- Decisões governamentais e medidas econômicas de urgência.

Contexto Adicional: {{{context}}}`,
});

const structuringPrompt = ai.definePrompt({
  name: 'globalIntelligenceStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `Converta a análise tática capturada na web em um JSON estruturado seguindo o esquema.
Identifique os TICKERS exatos afetados por este evento (ex: PETR4, VALE3, RAIL3, BTC).

Análise Bruta coletada na Web:
{{{rawAnalysis}}}`,
});

export async function monitorGlobalEvents(input: { context: string }): Promise<GlobalIntelligenceMonitorOutput | null> {
  try {
    const currentDate = new Date().toISOString();
    const { text: groundedAnalysis } = await groundingPrompt({ ...input, currentDate });
    const { output } = await structuringPrompt({ rawAnalysis: groundedAnalysis });
    return output ? JSON.parse(JSON.stringify(output)) : null;
  } catch (error: any) {
    console.error("Nexus Monitor Error:", error.message);
    return null;
  }
}
