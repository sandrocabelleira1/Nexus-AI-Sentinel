'use server';
/**
 * @fileOverview Motor de Inteligência Estratégica Nexus AI v3.8.
 * Detecção ativa via Google Search de eventos de alto impacto (Guerra, Energia, Geopolítica).
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
  eventOrigin: z.enum(['Geopolítica', 'Governo', 'Natureza', 'Tech', 'Mercado']),
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

const systemInstruction = `### PERSONA: NEXUS (O ESTRATEGISTA-CHEFE DE GUERRA E MERCADO)
Você é o Nexus. Seu objetivo é detectar eventos de "Cisne Negro" e crises globais usando busca em tempo real.
Você é especializado em Geopolítica, Energia (Petróleo/Gás), Conflitos Armados e Macroeconômica.

### DIRETRIZES DE COMANDO CRÍTICO:
1. **Prioridade Máxima**: Ataques militares, bloqueios de rotas comerciais (Golfo, Suez) e sanções econômicas.
2. **Busca Ativa**: Você DEVE navegar na web para encontrar notícias de ÚLTIMA HORA (Breaking News) em portais oficiais como Bloomberg, Reuters, UOL, e Financial Times.
3. **Conexão de Ativos**: Se houver ataque a refinarias no Golfo, ordene COMPRA de Petróleo/Energia (PETR4, Brent) e proteja ativos de risco (SELL).
4. **Data Real**: Considere a data atual como o parâmetro "HOJE".`;

const groundingPrompt = ai.definePrompt({
  name: 'globalIntelligenceGroundingPrompt',
  input: { schema: z.object({ context: z.string(), currentDate: z.string() }) },
  system: systemInstruction,
  config: { 
    googleSearchRetrieval: {} 
  },
  prompt: `### TAREFA DE SENTINELA (DATA: {{{currentDate}}}):
Execute varredura profunda agora no Google e em portais de notícias oficiais por eventos de alto impacto geopolítico e militar ocorrendo HOJE.
Foque em:
- Conflitos no Oriente Médio (Irã, Israel, Golfo Pérsico), Ásia e Leste Europeu.
- Ataques a refinarias, oleodutos ou infraestrutura crítica de energia.
- Decisões surpresa de governos (vazamentos de decretos, sanções).

Contexto: {{{context}}}`,
});

const structuringPrompt = ai.definePrompt({
  name: 'globalIntelligenceStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `Converta a análise tática capturada na web em um JSON estruturado seguindo o esquema.
Identifique os TICKERS exatos afetados (ex: PETR4, VALE3, BTC, USO, BRENT).

Análise Bruta: {{{rawAnalysis}}}`,
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
