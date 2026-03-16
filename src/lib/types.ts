export type AssetType = 'Stock' | 'Cryptocurrency' | 'Real Estate Fund' | 'Commodity' | 'Currency';

export interface UserAsset {
  id: string;
  name: string;
  type: AssetType;
  location: string;
  riskLevel?: 'Conservador' | 'Moderado' | 'Agressivo' | 'Crítico';
}

export type DisplayMode = 'Essential' | 'Full';

export interface GlobalAlert {
  id: string;
  title: string;
  origin: 'Geopolítica' | 'Natureza' | 'Tech' | 'Mercado';
  causality: string;
  priority: 1 | 2 | 3 | 4 | 5;
  timestamp: Date;
}