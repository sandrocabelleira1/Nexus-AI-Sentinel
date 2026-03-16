"use client"

import { UserAsset } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Zap, TrendingUp, Landmark, Boxes, Plus, Minus, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AssetCardProps {
  asset: UserAsset;
  onUpdate: (id: string, newQuantity: number, newValue: number) => void;
}

export function AssetCard({ asset, onUpdate }: AssetCardProps) {
  const [isManaging, setIsManaging] = useState(false);

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

  const handleQuickAction = (delta: number) => {
    const newQty = Math.max(0, asset.quantity + delta);
    // Simulação de preço médio/valor proporcional
    const pricePerUnit = asset.investedValue / (asset.quantity || 1);
    const newVal = newQty * pricePerUnit;
    onUpdate(asset.id, newQty, newVal);
  };

  return (
    <Card className={cn(
      "bg-[#080D18]/90 border transition-all duration-500 hover:scale-[1.02] group relative overflow-hidden rounded-[2.5rem]",
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
        
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-2xl font-headline font-bold text-white tracking-tight group-hover:text-primary transition-colors">{asset.name}</h3>
            <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
              <Landmark className="h-3 w-3" />
              <span>{asset.location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-primary font-bold text-xl led-text-blue">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.investedValue)}
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              QTD: {asset.quantity.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleQuickAction(1)}
            className="rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 h-10 font-bold"
          >
            <Plus className="h-4 w-4 mr-2" /> COMPRAR
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleQuickAction(-1)}
            disabled={asset.quantity <= 0}
            className="rounded-xl bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 h-10 font-bold"
          >
            <Minus className="h-4 w-4 mr-2" /> VENDER
          </Button>
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
            <div className="flex items-center gap-2 justify-end">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full animate-pulse",
                asset.riskLevel === 'Crítico' ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"
              )} />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Ativo</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
