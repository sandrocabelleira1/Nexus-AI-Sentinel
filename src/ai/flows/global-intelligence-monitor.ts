
'use server';
/**
 * @fileOverview Fluxo de monitoramento global do Nexus AI com análise detalhada por ativo.
 * Utiliza inteligência real-time para analisar eventos globais autênticos e climáticos.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AffectedAssetDetailSchema = z.object({
  ticker: z.string().describe('Ticker do ativo (ex: VALE3, BTC, VGIA11).'),
  name: z.string().describe('Nome da empresa ou projeto.'),
  currentPrice: z.string().describe('Preço atual estimado de mercado (ex: R$ 65,40 ou US$ 120,00).'),
  expectedGainPercentage: z.string().describe('Porcentagem de ganho ou perda esperada nos próximos 7 dias (ex: +15%, -8%).'),
  impactType: z.enum(['Positivo', 'Negativo', 'Neutro']),
  explanation: z.string().describe('Explicação curta do porquê este ativo específico é afetado e se a ação deve ser imediata.'),
  recommendation: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']).describe('Recomendação de ação imediata (BUY/SELL para movimentos urgentes).'),
  longTermOutlook: z.string().describe('Perspectiva de longo prazo para este ativo considerando o evento atual.'),
});

const GlobalIntelligenceMonitorInputSchema = z.object({
  rawNewsData: z.string().describe('Instrução para busca de dados reais, feed de notícias e dados climáticos atualizados.'),
});

const GlobalIntelligenceMonitorOutputSchema = z.object({
  title: z.string().describe('Título conciso do evento real identificado.'),
  eventOrigin: z.enum(['Geopolítica', 'Natureza', 'Tech', 'Mercado']),
  causalityExplanation: z.string().describe('Explicação causal REAL do evento no mercado financeiro e por que a ação deve ser tomada agora.'),
  priority: z.number().int().min(1).max(5),
  marketAction: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  riskLevel: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']),
  affectedAssetTickerSymbols: z.array(z.string()),
  affectedAssetsDetails: z.array(AffectedAssetDetailSchema).describe('Lista detalhada de pelo menos 3 empresas e ativos afetados com foco em 7 dias e longo prazo.'),
  essentialText: z.string().describe('Resumo direto e profissional focado em ação imediata e proteção de capital.'),
  essentialGlossaryTerms: z.array(z.string()),
  fullTechnicalAnalysis: z.string().describe('Análise técnica baseada em dados reais de mercado e projeção semanal.'),
  fullLocationRiskAnalysis: z.string().describe('Análise de risco geográfico real e logístico.'),
});

export const globalIntelligenceMonitorPrompt = ai.definePrompt({
  name: 'globalIntelligenceMonitorPrompt',
  input: { schema: GlobalIntelligenceMonitorInputSchema },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `### PERSONA: NEXUS (O GUARDIÃO SENTINELA GLOBAL 24/7)
Você é o Nexus. Sua única missão é garantir que o usuário GANHE DINHEIRO e NUNCA PERCA PATRIMÔNIO. Você monitora o mundo 24 horas por dia, 7 dias por semana.

### DIRETRIZES DE COMANDO:
1. **FOCO TÁTICO (7 DIAS)**: Identifique janelas de oportunidade para ganhos rápidos. Se um ativo vai subir na próxima semana devido a um fato real ou climático, ordene a COMPRA IMEDIATA.
2. **PROTEÇÃO DE CAPITAL**: Se um ativo está em declínio ou risco iminente, seja implacável: ordene a VENDA IMEDIATA.
3. **CLIMA E NATUREZA**: Analise profundamente como dados de clima afetam FIIs de Agronegócio (VGIA11, etc.) e Logística (HGLG11, portos). Use o ceticismo analítico para prever quebras de safra ou gargalos logísticos.
4. **PRECISÃO CIRÚRGICA**: Use tickers reais, preços estimados e justificativas baseadas em fluxo de caixa, geopolítica e meteorologia.

### INPUT:
{{{rawNewsData}}}

Gere o alerta em Português do Brasil de forma assertiva, autoritária e focada em resultados financeiros práticos. Determine ações urgentes se o cenário exigir proteção ou captura de lucro.`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }) {
  const { output } = await globalIntelligenceMonitorPrompt(input);
  return output;
}
