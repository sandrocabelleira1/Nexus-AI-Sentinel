export type AssetType = 'Ação' | 'Criptomoeda' | 'Fundo Imobiliário' | 'Commodity' | 'Moeda';

export interface UserAsset {
  id: string;
  name: string;
  type: AssetType;
  location: string;
  riskLevel?: 'Conservador' | 'Moderado' | 'Agressivo' | 'Crítico';
  investedValue: number;
  quantity: number;
}

export type DisplayMode = 'Essencial' | 'Completo';

export interface AffectedAssetDetail {
  ticker: string;
  name: string;
  currentPrice: string;
  expectedGainPercentage: string;
  impactType: 'Positivo' | 'Negativo' | 'Neutro';
  explanation: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
}

export interface GlobalIntelligenceAlert {
  id: string;
  createdAt: string;
  title: string;
  eventOrigin: 'Geopolítica' | 'Natureza' | 'Tech' | 'Mercado';
  causalityExplanation: string;
  priority: number;
  marketAction: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
  riskLevel: 'Conservador' | 'Moderado' | 'Agressivo' | 'Crítico';
  affectedAssetTickerSymbols: string[];
  affectedAssetsDetails: AffectedAssetDetail[];
  essentialText: string;
  essentialGlossaryTerms: string[];
  fullTechnicalAnalysis: string;
  fullLocationRiskAnalysis: string;
}
