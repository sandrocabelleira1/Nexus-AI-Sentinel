
/**
 * @fileOverview Motor de Inteligência Estratégica Nexus AI v5.5.
 * Sentinela Omnisciente: Vigilância Total Multidimensional e Ininterrupta.
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
Você é o Nexus. Seu objetivo é detectar QUALQUER evento de impacto global e nacional usando busca em tempo real massiva.

### MISSÃO DE VIGILÂNCIA ABSOLUTA:
Nada deve passar. Se um caminhoneiro parar no Mato Grosso, se um imposto for discutido de madrugada, ou se houver um ataque a refinarias no Golfo, eu preciso de um alerta tático.

### QUADRANTES DE MONITORAMENTO OBRIGATÓRIOS:
1. **Logística e Infraestrutura (BRASIL/GLOBAL)**: Greves, bloqueios, paralisação de portos/aeroportos, crises de abastecimento.
2. **Governo e Economia**: Medidas provisórias, mudanças em taxas de juros, novos impostos, decisões judiciais que afetem o mercado.
3. **Geopolítica e Conflitos**: Tensões, ataques, sanções, bloqueios comerciais.
4. **Energia e Commodities**: Petróleo, gás, mineração, quebras de safra.
5. **Tecnologia e Cisnes Negros**: Vazamentos massivos, falhas de IA, infraestrutura web.

### DIRETRIZES DE COMANDO:
1. **Busca Exaustiva**: Use Google News para "ÚLTIMA HORA" e "HOJE". Navegue em portais oficiais: Bloomberg, Reuters, Valor Econômico, G1, UOL.
2. **Conectividade Tática**: Conecte cada fato a TICKERS específicos (PETR4, VALE3, BTC, etc.).
3. **Senso de Urgência**: Defina prioridade 5 para ameaças iminentes.`;

const groundingPrompt = ai.definePrompt({
  name: 'globalIntelligenceGroundingPrompt',
  input: { schema: z.object({ context: z.string(), currentDate: z.string() }) },
  system: systemInstruction,
  config: { 
    googleSearchRetrieval: {} 
  },
  prompt: `### TAREFA DE SENTINELA (DATA: {{{currentDate}}}):
Execute varredura massiva agora. Procure por QUALQUER informação de impacto financeiro:
- "Greves ou paralisações hoje Brasil"
- "Ataques infraestrutura energia Golfo ou global hoje"
- "Decisões governo brasileiro economia última hora"
- "Notícias urgentes mercado financeiro global e B3"
- "Avisos de desabastecimento ou logística"

Retorne pelo menos 5-8 eventos distintos e críticos.

Contexto: {{{context}}}`,
});

const structuringPrompt = ai.definePrompt({
  name: 'globalIntelligenceStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `Converta a análise tática capturada na web em um JSON estruturado v5.5.
Identifique TICKERS específicos afetados para cada evento.

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
