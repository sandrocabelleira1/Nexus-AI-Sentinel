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
}

export function PortfolioView({ assets }: PortfolioViewProps) {
  return (
    <div className="space-y-10">
      {/* Portfolio Summary Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#080D18]/90 border border-white/10 rounded-[2rem] p-8 space-y-4 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-headline font-bold text-primary uppercase tracking-widest led-text-blue">Patrimônio Total</span>
            <PieChart className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-headline font-bold text-white tracking-tighter">R$ 2.450.800</h4>
            <span className="text-emerald-400 text-sm font-bold">+12.4%</span>
          </div>
        </div>

        <div className="bg-[#080D18]/90 border border-white/10 rounded-[2rem] p-8 space-y-4 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-headline font-bold text-accent uppercase tracking-widest led-text-accent">Alocação de Risco</span>
            <ShieldAlert className="h-5 w-5 text-accent" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[65%]" />
            </div>
            <span className="text-white font-bold">Moderado</span>
          </div>
        </div>

        <div className="bg-[#080D18]/95 border border-primary/20 rounded-[2rem] p-8 space-y-4 relative overflow-hidden group led-glow-blue">
          <div className="flex items-center justify-between">
            <span className="text-xs font-headline font-bold text-primary uppercase tracking-widest">Predição Nexus</span>
            <Target className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <p className="text-sm font-medium text-white/80 leading-relaxed">
            Seu portfólio está <span className="text-emerald-400 font-bold">Otimizado</span> para os eventos geopolíticos das próximas 72h.
          </p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>

      {/* Risk Map / Chart Placeholder Style */}
      <div className="bg-[#080D18]/90 border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-headline font-bold text-white flex items-center gap-3">
            <ArrowUpRight className="h-5 w-5 text-primary" />
            Análise Preditiva de Alocação
          </h3>
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Sentinel Matrix v2.6</span>
        </div>
        
        <div className="h-64 w-full flex items-end justify-between gap-4 px-4">
          {[60, 45, 80, 55, 90, 70, 85].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
              <div 
                className="w-full bg-primary/20 border-t-2 border-primary rounded-t-xl transition-all duration-500 group-hover:bg-primary/40 group-hover:scale-y-105" 
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Mês {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
