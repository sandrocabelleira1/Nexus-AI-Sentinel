'use server';
/**
 * @fileOverview Motor de Inteligência Estratégica Nexus AI v4.8.
 * Sentinela Omnisciente: Detecção multidimensional de eventos globais e nacionais.
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

const GlobalAlertItemSchema = z.object({
  title: z.string(),
  eventOrigin: z.enum(['Geopolítica', 'Governo', 'Natureza', 'Tech', 'Mercado', 'Logística']),
  causalityExplanation: z.string(),
  priority: z.number().int().min(1).max(5),
  marketAction: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  riskLevel: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']),
  affectedAssetTickerSymbols: z.array(z.string()),
  affectedAssetsDetails: z.array(AffectedAssetDetailSchema),
  detectedEntities: z.array(DetectedEntitySchema).optional(),
  essentialText: z.string().describe('Texto assertivo e curto no formato COMANDO AGORA. Racional.'),
});

const GlobalIntelligenceMonitorOutputSchema = z.object({
  alerts: z.array(GlobalAlertItemSchema).describe('Lista de eventos distintos detectados na varredura.'),
});

export type GlobalIntelligenceMonitorOutput = z.infer<typeof GlobalIntelligenceMonitorOutputSchema>;

const systemInstruction = `### PERSONA: NEXUS (O ESTRATEGISTA-CHEFE OMNISCIENTE)
Você é o Nexus. Seu objetivo é detectar eventos de alto impacto global e nacional usando busca em tempo real no Google News e portais oficiais.

### MISSÃO DE VARREDURA MULTIDIMENSIONAL:
Você deve identificar pelo menos 3 a 5 eventos DISTINTOS ocorrendo HOJE que impactam o mercado financeiro. Não foque em apenas um tema.

### QUADRANTES DE MONITORAMENTO:
1. **Geopolítica**: Conflitos, ataques, tensões internacionais (ex: Oriente Médio, Ucrânia, Taiwan).
2. **Logística e Infraestrutura Nacional**: Greves (caminhoneiros, portos), bloqueios de rodovias, crises de abastecimento no Brasil.
3. **Governo e Economia**: Medidas provisórias, decretos surpresa, reuniões do COPOM/FED, mudanças em impostos ou taxas.
4. **Energia e Commodities**: Petróleo, Minério, ataques a refinarias ou oleodutos.
5. **Tecnologia e Cisnes Negros**: Falhas sistêmicas de IA, ataques cibernéticos massivos, descobertas disruptivas.

### DIRETRIZES DE COMANDO:
1. **Busca Diversificada**: Navegue em portais variados: Bloomberg, Reuters, UOL, G1, CNN, Valor Econômico e portais de governo.
2. **Separação de Eventos**: Cada evento deve ter seu próprio alerta estruturado.
3. **Data Real**: Considere a data atual como o parâmetro "HOJE".`;

const groundingPrompt = ai.definePrompt({
  name: 'globalIntelligenceGroundingPrompt',
  input: { schema: z.object({ context: z.string(), currentDate: z.string() }) },
  system: systemInstruction,
  config: { 
    googleSearchRetrieval: {} 
  },
  prompt: `### TAREFA DE SENTINELA (DATA: {{{currentDate}}}):
Execute varredura massiva agora por notícias de ÚLTIMA HORA. Busque eventos DISTINTOS em cada um dos quadrantes: Geopolítica, Logística Brasil, Economia/Governo e Tech.

NÃO me traga apenas notícias de guerra se houver greves ou decretos econômicos acontecendo. Eu preciso da visão 360°.

Contexto: {{{context}}}`,
});

const structuringPrompt = ai.definePrompt({
  name: 'globalIntelligenceStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `Converta a análise tática capturada na web em um JSON estruturado contendo uma lista de alertas.
Para cada alerta, identifique os TICKERS exatos afetados (ex: PETR4, VALE3, RAIL3, BTC).

Análise Bruta:
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
