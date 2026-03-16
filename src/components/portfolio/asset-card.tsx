"use client"

import { UserAsset } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Shield, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetCardProps {
  asset: UserAsset;
}

export function AssetCard({ asset }: AssetCardProps) {
  const getRiskStyles = (risk?: string) => {
    switch (risk) {
      case 'Crítico': return 'risk-red text-rose-400';
      case 'Agressivo': return 'risk-orange text-orange-400';
      case 'Moderado': return 'risk-blue text-blue-400';
      default: return 'risk-green text-emerald-400';
    }
  };

  const Icon = asset.type === 'Criptomoeda' ? Zap : asset.type === 'Ação' ? TrendingUp : Wallet;

  return (
    <Card className={cn(
      "glass-panel transition-all duration-300 hover:scale-[1.02] cursor-pointer group",
      getRiskStyles(asset.riskLevel)
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="text-[10px] font-headline uppercase tracking-widest border-primary/20 bg-primary/5">
            {asset.type}
          </Badge>
        </div>
        
        <h3 className="text-xl font-headline font-bold mb-1 tracking-tight">{asset.name}</h3>
        
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <Shield className="h-3 w-3" />
          <span>{asset.location}</span>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-headline">Status</span>
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full animate-pulse",
              asset.riskLevel === 'Crítico' ? "bg-rose-500" : "bg-emerald-500"
            )} />
            <span className="text-xs font-medium">Monitorando</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
