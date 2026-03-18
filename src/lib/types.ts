
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

export interface WhaleTransaction {
  id: string;
  blockchain: string;
  symbol: string;
  amount: number;
  amountUsd: number;
  fromAddress: string;
  toAddress: string;
  transactionType: 'exchange_deposit' | 'exchange_withdrawal' | 'wallet_transfer';
  timestamp: string;
}

export interface MarketEntity {
  id: string;
  name: string;
  type: 'Government' | 'Institution' | 'Exchange' | 'Whale';
  influenceScore: number;
  lastAction: string;
  currentBalanceUsd: number;
}

export interface AffectedAssetDetail {
  ticker: string;
  name: string;
  currentPrice: string;
  expectedGainPercentage: string;
  impactType: 'Positivo' | 'Negativo' | 'Neutro';
  explanation: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
  longTermOutlook: string;
}

export interface GlobalIntelligenceAlert {
  id: string;
  createdAt: string;
  title: string;
  eventOrigin: 'Geopolítica' | 'Governo' | 'Natureza' | 'Tech' | 'Mercado';
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

export interface AutonomousInsight {
  id: string;
  timestamp: string;
  topic: string;
  foundation_score: number;
  source_credibility: 'Baixa' | 'Média' | 'Alta';
  market_impact: string;
  nexus_priority: number;
  scenarios: {
    optimistic: { desc: string; prob: string };
    baseline: { desc: string; prob: string };
    risk: { desc: string; prob: string };
  };
}

export interface MarketPrice {
  id: string;
  ticker: string;
  price: number;
  change24h: number;
  updatedAt: string;
  category?: 'crypto' | 'stocks' | 'fiis' | 'index';
  region?: 'Brazil' | 'USA' | 'Global';
}
