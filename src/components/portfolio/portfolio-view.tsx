
"use client"

import { UserAsset } from "@/lib/types";
import { AssetCard } from "./asset-card";
import { 
  TrendingUp, 
  ShieldAlert, 
  PieChart, 
  ArrowUpRight,
  Target
} from "lucide-react";

interface PortfolioViewProps {
  assets: UserAsset[];
  onUpdateAsset: (id: string, newQuantity: number, newValue: number) => void;
}

export function PortfolioView({ assets, onUpdateAsset }: PortfolioViewProps) {
  const totalValue = assets.reduce((acc, curr) => acc + curr.investedValue, 0);

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Portfolio Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-[#080D18]/90 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 space-y-3 md:space-y-4 relative overflow-hidden group shadow-2xl">
          <div className="absolute -top-10 -right-10 w-24 md:w-32 h-24 md:h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-headline font-bold text-primary uppercase tracking-widest led-text-blue">Patrimônio Total</span>
            <PieChart className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl md:text-4xl font-headline font-bold text-white tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
            </h4>
            <span className="text-emerald-400 text-xs md:text-sm font-bold">+12.4%</span>
          </div>
        </div>

        <div className="bg-[#080D18]/90 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 space-y-3 md:space-y-4 relative overflow-hidden group shadow-2xl">
          <div className="absolute -top-10 -right-10 w-24 md:w-32 h-24 md:h-32 bg-accent/10 rounded-full blur-3xl" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-headline font-bold text-accent uppercase tracking-widest led-text-accent">Alocação de Risco</span>
            <ShieldAlert className="h-4 w-4 md:h-5 md:w-5 text-accent" />
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex-1 h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[65%]" />
            </div>
            <span className="text-white text-sm md:text-base font-bold">Moderado</span>
          </div>
        </div>

        <div className="bg-[#080D18]/95 border border-primary/20 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 space-y-3 md:space-y-4 relative overflow-hidden group led-glow-blue shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-headline font-bold text-primary uppercase tracking-widest">Predição Nexus</span>
            <Target className="h-4 w-4 md:h-5 md:w-5 text-primary animate-pulse" />
          </div>
          <p className="text-[11px] md:text-sm font-medium text-white/80 leading-relaxed">
            Seu portfólio está <span className="text-emerald-400 font-bold">Otimizado</span> para os eventos geopolíticos das próximas 72h.
          </p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {assets.map((asset) => (
          <AssetCard 
            key={asset.id} 
            asset={asset} 
            onUpdate={onUpdateAsset}
          />
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-[#080D18]/90 border border-white/10 rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
          <h3 className="text-base md:text-lg font-headline font-bold text-white flex items-center gap-2 md:gap-3">
            <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            Análise Preditiva de Alocação
          </h3>
          <span className="text-[9px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest">Sentinel Matrix v2.6</span>
        </div>
        
        <div className="h-48 md:h-64 w-full flex items-end justify-between gap-2 md:gap-4 px-2 md:px-4">
          {[60, 45, 80, 55, 90, 70, 85].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 md:gap-4 group">
              <div 
                className="w-full bg-primary/20 border-t-2 border-primary rounded-t-lg md:rounded-t-xl transition-all duration-500 group-hover:bg-primary/40 group-hover:scale-y-105 shadow-[0_0_20px_rgba(37,99,235,0.2)]" 
                style={{ height: `${h}%` }}
              />
              <span className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase">M{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
