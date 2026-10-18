
export type AssetType = 'Ação' | 'Criptomoeda' | 'Fundo Imobiliário' | 'Commodity' | 'Moeda';
export type SubscriptionTier = 'SENTINEL' | 'PRO' | 'SOVEREIGN';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  whatsapp: string;
  age: number;
  address: string;
  preferredDisplayMode: string;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
  updatedAt: string;
}

export interface UserAsset {
  id: string;
  name: string;
  ticker?: string; // Ticker para cruzamento de dados
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
  nexus_logic?: string;
  is_simulated?: boolean;
}

export interface MarketEntity {
  id: string;
  name: string;
  type: 'Government' | 'Institution' | 'Exchange' | 'Whale';
  influenceScore: number;
  lastAction: string;
  currentBalanceUsd: number;
  updatedAt: string;
}

export interface AffectedAssetDetail {
  ticker: string;
  name: string;
  exchange: string;
  currentPrice: string;
  expectedGainPercentage: string;
  impactType: 'Positivo' | 'Negativo' | 'Neutro';
  explanation: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'WATCH';
  longTermOutlook: string;
}

export interface GlobalAlert {
  id: string;
  title: string;
  origin: string;
  causality: string;
  priority: number;
  timestamp: string | Date;
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
  detectedEntities?: MarketEntity[];
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

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MarketPrice {
  id: string;
  ticker: string;
  price: number;
  currency: 'BRL' | 'USD';
  change24h: number;
  updatedAt: string;
  category?: 'crypto' | 'stocks' | 'fiis' | 'index';
  region?: string;
  exchange?: string;
  logo?: string;
  dividendYield?: number;
  peRatio?: number;
  pvpRatio?: number;
  healthStatus?: string;
  // FII Specific v3.0
  fiiType?: 'Papel' | 'Tijolo' | 'Agro' | 'Misto';
  dividendAmount?: number;
  dataCom?: string;
  paymentDate?: string;
  vacancyRate?: number;
  vacancyRateFinancial?: number;
  nexusVerdict?: string;
  // Visual Data v5.0
  sparkline?: number[];
  candles?: CandleData[];
}
