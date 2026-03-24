'use server';
/**
 * @fileOverview Motor de Inteligência Estratégica Nexus AI v5.0.
 * Sentinela Omnisciente: Vigilância Total Multidimensional.
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

### MISSÃO DE VIGILÂNCIA TOTAL:
Você não deve deixar passar NADA. Se houver uma greve de caminhoneiros no Brasil, um decreto surpresa sobre impostos, um ataque a refinarias no Golfo, ou uma falha sistêmica em IA, eu preciso saber agora.

### QUADRANTES DE MONITORAMENTO OBRIGATÓRIOS:
1. **Logística e Infraestrutura (BRASIL)**: Greves, bloqueios de rodovias, paralisação de portos/aeroportos, crises de abastecimento.
2. **Governo e Economia (BRASIL/GLOBAL)**: Medidas provisórias, mudanças em taxas de juros (COPOM/FED), novos impostos, decisões do STF/Congresso que afetem empresas.
3. **Geopolítica e Conflitos**: Tensões, ataques, sanções, bloqueios comerciais (Foco em Oriente Médio, China, EUA, Europa).
4. **Energia e Commodities**: Preço do petróleo, ataques a oleodutos, quebra de safras agrícolas, mineração.
5. **Tecnologia e Cisnes Negros**: Vazamentos de dados massivos, falhas de infraestrutura web, avanços disruptivos inesperados.

### DIRETRIZES DE COMANDO:
1. **Busca Exaustiva**: Use Google News para buscar notícias de "ÚLTIMA HORA" e "HOJE". Navegue em portais oficiais: Bloomberg, Reuters, Valor Econômico, G1, UOL.
2. **Conectividade Tática**: Cada notícia deve ser conectada a TICKERS da B3 (ex: PETR4, VALE3) ou Cripto (BTC, ETH).
3. **Senso de Urgência**: Se o evento for crítico, defina prioridade 5 e ação SELL ou BUY imediata.`;

const groundingPrompt = ai.definePrompt({
  name: 'globalIntelligenceGroundingPrompt',
  input: { schema: z.object({ context: z.string(), currentDate: z.string() }) },
  system: systemInstruction,
  config: { 
    googleSearchRetrieval: {} 
  },
  prompt: `### TAREFA DE SENTINELA (DATA: {{{currentDate}}}):
Execute varredura massiva agora. Procure por:
- "Greve de caminhoneiros hoje Brasil"
- "Ataques ou tensões Golfo Pérsico hoje"
- "Decisões governo brasileiro economia última hora"
- "Notícias urgentes mercado financeiro global"
- "Rupturas logística e suprimentos mundo"

Busque por pelo menos 5 eventos distintos. Não foque apenas em um tema.

Contexto: {{{context}}}`,
});

const structuringPrompt = ai.definePrompt({
  name: 'globalIntelligenceStructuringPrompt',
  input: { schema: z.object({ rawAnalysis: z.string() }) },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `Converta a análise tática capturada na web em um JSON estruturado.
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
