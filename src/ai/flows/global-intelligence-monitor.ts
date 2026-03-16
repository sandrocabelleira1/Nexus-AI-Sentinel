
'use server';
/**
 * @fileOverview Motor de Inteligência Geopolítica Nexus AI v2.
 * Monitora Diários Oficiais, Bancos Centrais e Geopolítica Global em busca de Sinais Fracos.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AffectedAssetDetailSchema = z.object({
  ticker: z.string().describe('Ticker do ativo (ex: VALE3, BTC, NVDA).'),
  name: z.string().describe('Nome da empresa ou projeto.'),
  currentPrice: z.string().describe('Preço atual estimado de mercado.'),
  expectedGainPercentage: z.string().describe('Porcentagem de ganho ou perda esperada nos próximos 7 dias.'),
  impactType: z.enum(['Positivo', 'Negativo', 'Neutro']),
  explanation: z.string().describe('Explicação do Elo de Causalidade para este ativo específico.'),
  recommendation: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  longTermOutlook: z.string().describe('Perspectiva estratégica para além dos 7 dias.'),
});

const GeopoliticalCausalitySchema = z.object({
  event: z.string().describe('O fato bruto (ex: Novo decreto de taxação ou movimentação de ouro por governos).'),
  identification: z.string().describe('Identificação da fonte primária (ex: Diário Oficial da União, FED, COPOM).'),
  mapping: z.array(z.string()).describe('Setores e ativos mapeados como vulneráveis ou beneficiados.'),
  simulation: z.string().describe('Simulação do impacto nos rendimentos e fluxo de caixa.'),
  prediction: z.string().describe('Previsão probabilística do movimento de mercado para a próxima semana.'),
});

const GlobalIntelligenceMonitorInputSchema = z.object({
  rawNewsData: z.string().describe('Dados reais de notícias, decretos governamentais e mercados mundiais.'),
});

const GlobalIntelligenceMonitorOutputSchema = z.object({
  title: z.string().describe('Título conciso do alerta.'),
  eventOrigin: z.enum(['Geopolítica', 'Governo', 'Natureza', 'Tech', 'Mercado']),
  causalityExplanation: z.string().describe('Explicação detalhada do Elo de Causalidade.'),
  causalityLink: GeopoliticalCausalitySchema.describe('Estrutura lógica do motor de previsão geopolítica.'),
  priority: z.number().int().min(1).max(5),
  marketAction: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  riskLevel: z.enum(['Conservador', 'Moderado', 'Agressivo', 'Crítico']),
  affectedAssetTickerSymbols: z.array(z.string()),
  affectedAssetsDetails: z.array(AffectedAssetDetailSchema),
  essentialText: z.string().describe('Resumo focado em ação imediata (Compra/Venda).'),
  essentialGlossaryTerms: z.array(z.string()),
  fullTechnicalAnalysis: z.string().describe('Análise técnica baseada em dados reais.'),
  fullLocationRiskAnalysis: z.string().describe('Análise de risco baseada em custódia.'),
});

export const globalIntelligenceMonitorPrompt = ai.definePrompt({
  name: 'globalIntelligenceMonitorPrompt',
  input: { schema: GlobalIntelligenceMonitorInputSchema },
  output: { schema: GlobalIntelligenceMonitorOutputSchema },
  prompt: `### PERSONA: NEXUS (O GUARDIÃO E ESTRATEGISTA GEOPOLÍTICO 24/7)
Você é o Nexus. Seu objetivo é garantir que o usuário ganhe dinheiro e evitar que perca dinheiro. Você é incansável, cético e focado em resultados.

### DIRETRIZES DO MOTOR DE SENTINELA:
1. **SINAIS FRACOS E CISNES NEGROS**: Procure por movimentos anômalos de governos (movimentação de reservas de ouro, novos decretos, mudanças de tom em discursos de BCs).
2. **ELO DE CAUSALIDADE (CAUSALITY LINK)**: Conecte o ato político (ex: taxação de dividendos) ao impacto no bolso (ex: queda do IFIX). Explique o PORQUÊ.
3. **JANELA TÁTICA (7 DIAS)**: Identifique janelas de lucro rápido. Seja direto: se o ativo está em declínio, ordene VENDA IMEDIATA. Se há oportunidade, ordene COMPRA IMEDIATA.
4. **FONTES DE ESCUTA**: Analise como se tivesse acesso ao Diário Oficial da União (DOU), discursos do FED/COPOM e Projetos de Lei.

### INPUT:
{{{rawNewsData}}}

Gere o alerta estratégico em Português do Brasil com autoridade máxima. Foque em proteger o patrimônio e capturar o lucro de curto prazo.`,
});

export async function monitorGlobalEvents(input: { rawNewsData: string }) {
  const { output } = await globalIntelligenceMonitorPrompt(input);
  return output;
}
