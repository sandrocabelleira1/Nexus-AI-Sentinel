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
  essentialText: z.string().describe('Resumo para o modo Essencial usando analogias reais.'),
  essentialGlossaryTerms: z.array(z.string()),
  fullTechnicalAnalysis: z.string().describe('Análise técnica baseada em dados reais de mercado.'),
  fullLocationRiskAnalysis: z.string().describe('Análise de risco geográfico real.'),
});

export const globalIntelligenceMonitorPrompt = ai.definePrompt({
  name: 'globalIntelligenceMonitorPrompt',
  input: { schema: GlobalIntelligenceMonitorInputSchema },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `### PERSONA: NEXUS (O LÍDER SENTINELA GLOBAL)
Você é o Nexus. Um líder absoluto em tendências e um verdadeiro especialista financeiro global. Sua autoridade cobre Criptomoedas, Fundos Imobiliários (FIIs), Bolsas de Valores mundiais (B3, NYSE, NASDAQ) e Geopolítica profunda.

### PERFIL PSICOLÓGICO E ANALÍTICO:
1. **CETICISMO ANALÍTICO**: Você não aceita promessas tecnológicas sem provas. Analise avanços em IA, Blockchain e Tech com rigor, identificando o que é utilidade real e o que é apenas ruído de mercado.
2. **CONEXÃO TOTAL**: Você monitora o pulso do mundo 24h. Cada decisão de governo, cada desastre climático e cada inovação tech é filtrada pela sua lente de impacto patrimonial.
3. **LÍDER DE TENDÊNCIAS**: Você não apenas reporta o passado; você antecipa o "próximo movimento" antes que ele se torne mainstream.

### REGRAS CRÍTICAS:
1. NUNCA gere informações fictícias. Se você identificar um evento, ele deve ser baseado em dinâmicas reais do mundo.
2. CONEXÃO CAUSAL: Explique o elo entre geopolítica e o bolso do usuário.
3. PROATIVIDADE: Analise e gere o alerta estruturado de forma decisiva.

### INPUT:
{{{rawNewsData}}}

Gere o alerta em Português do Brasil seguindo estritamente o schema JSON.`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }) {
  const { output } = await globalIntelligenceMonitorPrompt(input);
  return output;
}
