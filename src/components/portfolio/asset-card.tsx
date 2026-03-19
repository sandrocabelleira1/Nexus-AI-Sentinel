"use client"

import { UserAsset, MarketPrice } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Zap, TrendingUp, Landmark, Boxes, Plus, Minus, Calculator, Info, ArrowUpRight, ArrowDownRight, Activity, Globe, Coins, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssetDetailModal } from "@/components/market/asset-detail-modal";

interface AssetCardProps {
  asset: UserAsset;
  marketPriceData?: MarketPrice;
  onUpdate: (id: string, newQuantity: number, newValue: number) => void;
  onAnalyze?: (context: string) => void;
}

export function AssetCard({ asset, marketPriceData, onUpdate, onAnalyze }: AssetCardProps) {
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Transaction State
  const [totalValueInput, setTotalValueInput] = useState<number>(0);
  const [unitPriceInput, setUnitPriceInput] = useState<number>(0);
  const [quantityInput, setQuantityInput] = useState<number>(0);

  const isUSD = marketPriceData?.currency === 'USD' || asset.type === 'Criptomoeda';

  const { currentValuation, gainLoss, gainLossPercentage } = useMemo(() => {
    if (!marketPriceData) {
      return { currentValuation: asset.investedValue, gainLoss: 0, gainLossPercentage: 0 };
    }
    const currentVal = marketPriceData.price * asset.quantity;
    const gl = currentVal - asset.investedValue;
    const glp = asset.investedValue > 0 ? (gl / asset.investedValue) * 100 : 0;
    return { currentValuation: currentVal, gainLoss: gl, gainLossPercentage: glp };
  }, [asset, marketPriceData]);

  const handleValueChange = (val: number) => {
    setTotalValueInput(val);
    if (unitPriceInput > 0) {
      setQuantityInput(Number((val / unitPriceInput).toFixed(4)));
    }
  };

  const handlePriceChange = (price: number) => {
    setUnitPriceInput(price);
    if (price > 0 && totalValueInput > 0) {
      setQuantityInput(Number((totalValueInput / price).toFixed(4)));
    }
  };

  const handleQuantityChange = (qty: number) => {
    setQuantityInput(qty);
    if (qty > 0 && unitPriceInput > 0) {
      setTotalValueInput(Number((qty * unitPriceInput).toFixed(2)));
    } else if (qty > 0 && totalValueInput > 0) {
      setUnitPriceInput(Number((totalValueInput / qty).toFixed(2)));
    }
  };

  const resetForm = () => {
    setTotalValueInput(0);
    setUnitPriceInput(0);
    setQuantityInput(0);
  };

  const getRiskStyles = (risk?: string) => {
    switch (risk) {
      case 'Crítico': return 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]';
      case 'Agressivo': return 'border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]';
      case 'Moderado': return 'border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.1)]';
      default: return 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]';
    }
  };

  const Icon = (() => {
    switch (asset.type) {
      case 'Criptomoeda': return Coins;
      case 'Ação': return TrendingUp;
      case 'Fundo Imobiliário': return Landmark;
      case 'Commodity': return Boxes;
      default: return Wallet;
    }
  })();

  const handleTransaction = (type: 'buy' | 'sell') => {
    const multiplier = type === 'buy' ? 1 : -1;
    const newQty = Math.max(0, asset.quantity + (quantityInput * multiplier));
    const newVal = Math.max(0, asset.investedValue + (totalValueInput * multiplier));
    
    onUpdate(asset.id, newQty, newVal);
    setIsBuyOpen(false);
    setIsSellOpen(false);
    resetForm();
  };

  return (
    <>
      <Card className={cn(
        "bg-[#080D18]/90 border transition-all duration-500 hover:scale-[1.02] group relative overflow-hidden rounded-[2.5rem] cursor-pointer",
        getRiskStyles(asset.riskLevel)
      )} onClick={() => setIsDetailOpen(true)}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:led-glow-blue transition-all">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                {isUSD && (
                  <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[8px] font-bold uppercase px-2 py-0.5 flex items-center gap-1">
                    <Globe className="h-2 w-2" /> BINANCE USD
                  </Badge>
                )}
                <Badge variant="outline" className="text-[9px] font-headline font-bold uppercase tracking-widest border-white/10 bg-white/5 px-3 py-1">
                  {asset.type}
                </Badge>
              </div>
              {gainLossPercentage !== 0 && (
                <div className={cn("text-[10px] font-bold flex items-center gap-1", gainLoss >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {gainLoss >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(gainLossPercentage).toFixed(2)}%
                </div>
              )}
            </div>
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
                {new Intl.NumberFormat(isUSD ? 'en-US' : 'pt-BR', { 
                  style: 'currency', 
                  currency: isUSD ? 'USD' : 'BRL' 
                }).format(currentValuation)}
              </div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                VALUATION
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsBuyOpen(true)}
              className="rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 h-10 font-bold"
            >
              <Plus className="h-4 w-4 mr-2" /> APORTAR
            </Button>

            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsSellOpen(true)}
              disabled={asset.quantity <= 0}
              className="rounded-xl bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 h-10 font-bold"
            >
              <Minus className="h-4 w-4 mr-2" /> LIQUIDAR
            </Button>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest flex items-center gap-2">
              Ver Telemetria <ChevronRight className="h-3 w-3" />
            </span>
            <div className="flex items-center gap-2 justify-end">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full animate-pulse",
                asset.riskLevel === 'Crítico' ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"
              )} />
              <span className="text-xs font-bold text-white uppercase tracking-widest">AO VIVO</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail View triggered by card click */}
      {marketPriceData && (
        <AssetDetailModal 
          asset={marketPriceData} 
          isOpen={isDetailOpen} 
          onClose={() => setIsDetailOpen(false)} 
          onAnalyze={onAnalyze}
        />
      )}

      {/* Transaction Modals */}
      <Dialog open={isBuyOpen} onOpenChange={(open) => { setIsBuyOpen(open); if(!open) resetForm(); }}>
        <DialogContent className="glass-panel border-emerald-500/20 sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-emerald-400 flex items-center gap-3">
              <Calculator className="h-6 w-6" /> Novo Aporte
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase text-white/40">Valor Total ({isUSD ? 'USD' : 'BRL'})</Label>
              <Input type="number" className="bg-white/5 border-white/10" value={totalValueInput || ""} onChange={(e) => handleValueChange(Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase text-white/40">Preço Unitário</Label>
              <Input type="number" className="bg-white/5 border-white/10" value={unitPriceInput || ""} onChange={(e) => handlePriceChange(Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase text-white/40">Quantidade</Label>
              <Input type="number" className="bg-white/5 border-white/10" value={quantityInput || ""} onChange={(e) => handleQuantityChange(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleTransaction('buy')} className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold h-12 rounded-xl">CONFIRMAR</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSellOpen} onOpenChange={(open) => { setIsSellOpen(open); if(!open) resetForm(); }}>
        <DialogContent className="glass-panel border-rose-500/20 sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold text-rose-400 flex items-center gap-3">
              <Calculator className="h-6 w-6" /> Liquidar
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase text-white/40">Valor Bruto ({isUSD ? 'USD' : 'BRL'})</Label>
              <Input type="number" className="bg-white/5 border-white/10" value={totalValueInput || ""} onChange={(e) => handleValueChange(Number(e.target.value))} />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase text-white/40">Quantidade</Label>
              <Input type="number" max={asset.quantity} className="bg-white/5 border-white/10" value={quantityInput || ""} onChange={(e) => handleQuantityChange(Number(e.target.value))} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => handleTransaction('sell')} className="w-full bg-rose-500 hover:bg-rose-600 font-bold h-12 rounded-xl">LIQUIDAR AGORA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
