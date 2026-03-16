'use server';
/**
 * @fileOverview Fluxo de monitoramento global do Nexus AI.
 * Utiliza inteligência real-time para analisar eventos globais autênticos.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GlobalIntelligenceMonitorInputSchema = z.object({
  rawNewsData: z.string().describe('Instrução para busca de dados reais ou feed de notícias atual.'),
});

const GlobalIntelligenceMonitorOutputSchema = z.object({
  title: z.string().describe('Título conciso do evento real identificado.'),
  eventOrigin: z.enum(['Geopolítica', 'Natureza', 'Tech', 'Mercado']),
  causalityExplanation: z.string().describe('Explicação causal REAL do evento no mercado financeiro.'),
  priority: z.number().int().min(1).max(5),
  marketAction: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  riskLevel: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']),
  affectedAssetTickerSymbols: z.array(z.string()),
  essentialText: z.string().describe('Resumo direto e profissional. Sem metáforas infantis.'),
  essentialGlossaryTerms: z.array(z.string()),
  fullTechnicalAnalysis: z.string().describe('Análise técnica baseada em dados reais de mercado.'),
  fullLocationRiskAnalysis: z.string().describe('Análise de risco geográfico real.'),
});

export const globalIntelligenceMonitorPrompt = ai.definePrompt({
  name: 'globalIntelligenceMonitorPrompt',
  input: { schema: GlobalIntelligenceMonitorInputSchema },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `### PERSONA: NEXUS (O LÍDER SENTINELA GLOBAL)
Você é o Nexus. Um líder absoluto em tendências e um verdadeiro especialista financeiro global.

### REGRAS DE OURO:
1. **PRECISÃO CIRÚRGICA**: NUNCA use "Imagine que...", "Pense no mercado como...". Vá direto aos fatos.
2. **CETICISMO TÉCNICO**: Analise cada avanço tecnológico com rigor. Separe valor de ruído.
3. **CONEXÃO REAL**: Se houver uma descoberta de recurso ou decisão de banco central, cite os tickers afetados imediatamente.

### INPUT:
{{{rawNewsData}}}

Gere o alerta em Português do Brasil de forma assertiva e autoritária.`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }) {
  const { output } = await globalIntelligenceMonitorPrompt(input);
  return output;
}
