"use client"

import { UserAsset } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Shield, Zap, TrendingUp, Landmark, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetCardProps {
  asset: UserAsset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const getRiskStyles = (risk?: string) => {
    switch (risk) {
      case 'Crítico': return 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]';
      case 'Agressivo': return 'border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]';
      case 'Moderado': return 'border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.1)]';
      default: return 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]';
    }
  };

  const getRiskText = (risk?: string) => {
    switch (risk) {
      case 'Crítico': return 'text-rose-400';
      case 'Agressivo': return 'text-orange-400';
      case 'Moderado': return 'text-blue-400';
      default: return 'text-emerald-400';
    }
  };

  const getIcon = () => {
    switch (asset.type) {
      case 'Criptomoeda': return Zap;
      case 'Ação': return TrendingUp;
      case 'Fundo Imobiliário': return Landmark;
      case 'Commodity': return Boxes;
      default: return Wallet;
    }
  };

  const Icon = getIcon();

  return (
    <Card className={cn(
      "bg-[#080D18]/90 border transition-all duration-500 hover:scale-[1.05] cursor-pointer group relative overflow-hidden rounded-[2.5rem]",
      getRiskStyles(asset.riskLevel)
    )}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <CardContent className="p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:led-glow-blue transition-all">
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="outline" className="text-[9px] font-headline font-bold uppercase tracking-widest border-white/10 bg-white/5 px-3 py-1">
            {asset.type}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <h3 className="text-2xl font-headline font-bold text-white tracking-tight group-hover:text-primary transition-colors">{asset.name}</h3>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-wider">
            <Landmark className="h-3.5 w-3.5" />
            <span>{asset.location}</span>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] block">Risco</span>
            <span className={cn("text-xs font-bold uppercase", getRiskText(asset.riskLevel))}>
              {asset.riskLevel || 'Estável'}
            </span>
          </div>
          <div className="text-right space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] block">Status</span>
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full animate-pulse",
                asset.riskLevel === 'Crítico' ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"
              )} />
              <span className="text-xs font-bold text-white">ATIVO</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
