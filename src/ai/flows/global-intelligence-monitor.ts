
'use server';
/**
 * @fileOverview Fluxo de monitoramento governamental e geopolítico do Nexus AI.
 * Analisa Diários Oficiais, discursos de BCs e eventos globais com Elo de Causalidade.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AffectedAssetDetailSchema = z.object({
  ticker: z.string().describe('Ticker do ativo (ex: VALE3, BTC, NVDA).'),
  name: z.string().describe('Nome da empresa ou projeto.'),
  currentPrice: z.string().describe('Preço atual estimado de mercado.'),
  expectedGainPercentage: z.string().describe('Porcentagem de ganho ou perda esperada nos próximos 7 dias.'),
  impactType: z.enum(['Positivo', 'Negativo', 'Neutro']),
  explanation: z.string().describe('Explicação do porquê este ativo específico é afetado pela decisão governamental/geopolítica.'),
  recommendation: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  longTermOutlook: z.string().describe('Perspectiva de longo prazo para este ativo.'),
});

const GeopoliticalCausalitySchema = z.object({
  event: z.string().describe('O fato bruto (ex: Novo decreto de taxação).'),
  identification: z.string().describe('Identificação da fonte (ex: Diário Oficial da União).'),
  mapping: z.array(z.string()).describe('Setores e ativos mapeados como vulneráveis ou beneficiados.'),
  simulation: z.string().describe('Simulação do impacto nos rendimentos ou fluxos de caixa.'),
  prediction: z.string().describe('Previsão probabilística do movimento de mercado (ex: queda de 5% no IFIX).'),
});

const GlobalIntelligenceMonitorInputSchema = z.object({
  rawNewsData: z.string().describe('Dados reais de notícias, decretos governamentais e mercados mundiais.'),
});

const GlobalIntelligenceMonitorOutputSchema = z.object({
  title: z.string().describe('Título conciso do evento identificado.'),
  eventOrigin: z.enum(['Geopolítica', 'Governo', 'Natureza', 'Tech', 'Mercado']),
  causalityExplanation: z.string().describe('Explicação detalhada do Elo de Causalidade.'),
  causalityLink: GeopoliticalCausalitySchema.describe('Estrutura lógica do motor de previsão geopolítica.'),
  priority: z.number().int().min(1).max(5),
  marketAction: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  riskLevel: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']),
  affectedAssetTickerSymbols: z.array(z.string()),
  affectedAssetsDetails: z.array(AffectedAssetDetailSchema),
  essentialText: z.string().describe('Resumo focado em ação imediata.'),
  essentialGlossaryTerms: z.array(z.string()),
  fullTechnicalAnalysis: z.string().describe('Análise técnica baseada em dados reais.'),
  fullLocationRiskAnalysis: z.string().describe('Análise de risco geográfico.'),
});

export const globalIntelligenceMonitorPrompt = ai.definePrompt({
  name: 'globalIntelligenceMonitorPrompt',
  input: { schema: GlobalIntelligenceMonitorInputSchema },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `### PERSONA: NEXUS (ANALISTA GEOPOLÍTICO E ESTRATEGISTA SÊNIOR)
Você é o Nexus. Sua tarefa é transformar atos políticos e geopolíticos em lucro ou proteção de capital.

### DIRETRIZES DO MOTOR DE CAUSALIDADE:
1. **INGESTÃO GOVERNAMENTAL**: Analise Diários Oficiais (DOU), discursos do FED/COPOM e Projetos de Lei.
2. **ELO DE CAUSALIDADE**: Conecte o fato governamental ao impacto no bolso do usuário. Se o governo taxa dividendos, o IFIX cai. Se a China estimula construção, VALE3 sobe.
3. **MERCADO TÁTICO (7 DIAS)**: Identifique janelas de oportunidade semanais. Seja incisivo nas ordens de COMPRA ou VENDA IMEDIATA.
4. **SETORIZAÇÃO**: Mapeie setores beneficiados e prejudicados com precisão cirúrgica.

### INPUT:
{{{rawNewsData}}}

Gere o alerta com foco em prever o "Cisne Negro" e proteger o patrimônio. Responda em Português do Brasil com autoridade máxima.`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }) {
  const { output } = await globalIntelligenceMonitorPrompt(input);
  return output;
}
