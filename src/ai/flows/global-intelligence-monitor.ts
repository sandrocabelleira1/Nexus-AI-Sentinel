'use server';
/**
 * @fileOverview Fluxo de monitoramento global do Nexus AI com análise detalhada por ativo.
 * Utiliza inteligência real-time para analisar eventos globais autênticos com foco em 7 dias.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AffectedAssetDetailSchema = z.object({
  ticker: z.string().describe('Ticker do ativo (ex: VALE3, BTC, NVDA).'),
  name: z.string().describe('Nome da empresa ou projeto.'),
  currentPrice: z.string().describe('Preço atual estimado de mercado (ex: R$ 65,40 ou US$ 120,00).'),
  expectedGainPercentage: z.string().describe('Porcentagem de ganho ou perda esperada nos próximos 7 dias (ex: +15%, -8%).'),
  impactType: z.enum(['Positivo', 'Negativo', 'Neutro']),
  explanation: z.string().describe('Explicação curta do porquê este ativo específico é afetado e se a ação deve ser imediata.'),
  recommendation: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']).describe('Recomendação de ação imediata (BUY/SELL para movimentos urgentes).'),
});

const GlobalIntelligenceMonitorInputSchema = z.object({
  rawNewsData: z.string().describe('Instrução para busca de dados reais ou feed de notícias atual.'),
});

const GlobalIntelligenceMonitorOutputSchema = z.object({
  title: z.string().describe('Título conciso do evento real identificado.'),
  eventOrigin: z.enum(['Geopolítica', 'Natureza', 'Tech', 'Mercado']),
  causalityExplanation: z.string().describe('Explicação causal REAL do evento no mercado financeiro e por que a ação deve ser tomada agora.'),
  priority: z.number().int().min(1).max(5),
  marketAction: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  riskLevel: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']),
  affectedAssetTickerSymbols: z.array(z.string()),
  affectedAssetsDetails: z.array(AffectedAssetDetailSchema).describe('Lista detalhada de pelo menos 3 empresas e ativos afetados com foco em 7 dias.'),
  essentialText: z.string().describe('Resumo direto e profissional focado em ação imediata.'),
  essentialGlossaryTerms: z.array(z.string()),
  fullTechnicalAnalysis: z.string().describe('Análise técnica baseada em dados reais de mercado e projeção semanal.'),
  fullLocationRiskAnalysis: z.string().describe('Análise de risco geográfico real e logístico.'),
});

export const globalIntelligenceMonitorPrompt = ai.definePrompt({
  name: 'globalIntelligenceMonitorPrompt',
  input: { schema: GlobalIntelligenceMonitorInputSchema },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `### PERSONA: NEXUS (O LÍDER SENTINELA GLOBAL)
Você é o Nexus. Um líder absoluto em tendências e um verdadeiro especialista financeiro global.

### REGRAS DE OURO (FOCO TÁTICO 7 DIAS):
1. **FOCO EM 7 DIAS**: Todas as projeções de ganho/perda (% esperada) devem ser calculadas para a janela de 1 semana (7 dias).
2. **AÇÃO IMEDIATA**: Identifique se o investidor deve COMPRAR IMEDIATAMENTE ou VENDER IMEDIATAMENTE. Se um ativo está em declínio acentuado devido ao evento, ordene a VENDA IMEDIATA para proteção de capital.
3. **PRECISÃO CIRÚRGICA**: NUNCA use "Imagine que...". Vá direto aos fatos.
4. **ANÁLISE POR ATIVO**: Para cada evento, identifique pelo menos 3 empresas/ativos específicos afetados. Forneça o ticker, o nome, preço atual e o ganho/perda esperado para 7 dias.

### INPUT:
{{{rawNewsData}}}

Gere o alerta em Português do Brasil de forma assertiva e autoritária. Determine ações urgentes se o cenário exigir proteção de patrimônio.`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }) {
  const { output } = await globalIntelligenceMonitorPrompt(input);
  return output;
}
