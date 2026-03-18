"use client"

import { UserAsset } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, Zap, TrendingUp, Landmark, Boxes, Plus, Minus, Calculator, Info, ArrowUpRight, ArrowDownRight, Activity, Globe } from "lucide-react";
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

interface AssetCardProps {
  asset: UserAsset;
  currentMarketPrice?: number;
  onUpdate: (id: string, newQuantity: number, newValue: number) => void;
}

export function AssetCard({ asset, currentMarketPrice, onUpdate }: AssetCardProps) {
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  
  // Transaction State
  const [totalValueInput, setTotalValueInput] = useState<number>(0);
  const [unitPriceInput, setUnitPriceInput] = useState<number>(0);
  const [quantityInput, setQuantityInput] = useState<number>(0);

  // Cálculos de Real-Time Valuation
  const { currentValuation, gainLoss, gainLossPercentage } = useMemo(() => {
    if (!currentMarketPrice) {
      return { currentValuation: asset.investedValue, gainLoss: 0, gainLossPercentage: 0 };
    }
    const currentVal = currentMarketPrice * asset.quantity;
    const gl = currentVal - asset.investedValue;
    const glp = asset.investedValue > 0 ? (gl / asset.investedValue) * 100 : 0;
    return { currentValuation: currentVal, gainLoss: gl, gainLossPercentage: glp };
  }, [asset, currentMarketPrice]);

  // Auto-calculate logic
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
      case 'Criptomoeda': return Zap;
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

  const isBinancePowered = asset.type === 'Criptomoeda';

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
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              {isBinancePowered && (
                <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[8px] font-bold uppercase px-2 py-0.5 flex items-center gap-1">
                  <Globe className="h-2 w-2" /> Binance API
                </Badge>
              )}
              <Badge variant="outline" className="text-[9px] font-headline font-bold uppercase tracking-widest border-white/10 bg-white/5 px-3 py-1">
                {asset.type}
              </Badge>
            </div>
            {gainLossPercentage !== 0 && (
              <div className={cn("text-[10px] font-bold flex items-center gap-1", gainLoss >= 0 ? "text-emerald-400" : "text-rose-400")}>
                {gainLoss >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {gainLossPercentage.toFixed(2)}%
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
            {currentMarketPrice !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-400">
                  Cotação: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentMarketPrice)}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-primary font-bold text-xl led-text-blue">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentValuation)}
            </div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              POSIÇÃO TOTAL
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Dialog open={isBuyOpen} onOpenChange={(open) => { setIsBuyOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 h-10 font-bold"
              >
                <Plus className="h-4 w-4 mr-2" /> COMPRAR
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-emerald-500/20 sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline font-bold text-emerald-400 flex items-center gap-3">
                  <Calculator className="h-6 w-6" /> Novo Aporte
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  O Nexus calculará a quantidade com base no valor ou preço unitário.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label className="text-white font-bold uppercase tracking-widest text-[10px]">Valor Total do Aporte (R$)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="bg-white/5 border-white/10 text-white"
                    value={totalValueInput || ""}
                    onChange={(e) => handleValueChange(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-white font-bold uppercase tracking-widest text-[10px]">Preço Unitário Pago (R$)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="bg-white/5 border-white/10 text-white"
                    value={unitPriceInput || ""}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2 relative">
                  <Label className="text-white font-bold uppercase tracking-widest text-[10px]">Quantidade Adquirida</Label>
                  <Input 
                    type="number" 
                    placeholder="0.0000" 
                    className="bg-white/5 border-white/10 text-white pr-10"
                    value={quantityInput || ""}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  />
                  <div className="absolute right-3 bottom-2.5 opacity-40">
                    <Info className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => handleTransaction('buy')}
                  disabled={!quantityInput || !totalValueInput}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  CONFIRMAR APORTE
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isSellOpen} onOpenChange={(open) => { setIsSellOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                disabled={asset.quantity <= 0}
                className="rounded-xl bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 h-10 font-bold"
              >
                <Minus className="h-4 w-4 mr-2" /> VENDER
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-rose-500/20 sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline font-bold text-rose-400 flex items-center gap-3">
                  <Calculator className="h-6 w-6" /> Liquidar Posição
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Informe o valor da venda ou a quantidade para cálculo automático.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="grid gap-2">
                  <Label className="text-white font-bold uppercase tracking-widest text-[10px]">Valor Bruto da Venda (R$)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="bg-white/5 border-white/10 text-white"
                    value={totalValueInput || ""}
                    onChange={(e) => handleValueChange(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-white font-bold uppercase tracking-widest text-[10px]">Preço de Venda Unitário (R$)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="bg-white/5 border-white/10 text-white"
                    value={unitPriceInput || ""}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-white font-bold uppercase tracking-widest text-[10px]">Quantidade a Liquidar</Label>
                  <Input 
                    type="number" 
                    placeholder="0.0000" 
                    max={asset.quantity}
                    className="bg-white/5 border-white/10 text-white"
                    value={quantityInput || ""}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  />
                  {quantityInput > asset.quantity && (
                    <span className="text-[10px] text-rose-400 font-bold uppercase">Saldo insuficiente na Wallet</span>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => handleTransaction('sell')}
                  disabled={!quantityInput || !totalValueInput || quantityInput > asset.quantity}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                >
                  CONFIRMAR VENDA
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] block">Custo Médio</span>
            <span className="text-xs font-bold text-white/60">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.investedValue / (asset.quantity || 1))}
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
