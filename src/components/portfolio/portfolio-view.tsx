
"use client"

import { useState, useMemo } from "react";
import { UserAsset, AssetType, MarketPrice } from "@/lib/types";
import { AssetCard } from "./asset-card";
import { 
  TrendingUp, 
  ShieldAlert, 
  PieChart, 
  ArrowUpRight,
  Target,
  Plus,
  Building2,
  Wallet,
  Coins,
  Boxes,
  Loader2,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";
import { cn } from "@/lib/utils";

interface PortfolioViewProps {
  assets: UserAsset[];
  marketPrices: MarketPrice[];
  onUpdateAsset: (id: string, newQuantity: number, newValue: number) => void;
  onAnalyze?: (context: string) => void;
}

export function PortfolioView({ assets, marketPrices, onUpdateAsset, onAnalyze }: PortfolioViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usdRate = useMemo(() => {
    const rateAsset = marketPrices.find(p => p.ticker.toUpperCase() === 'USDBRL');
    return rateAsset ? rateAsset.price : 5.85; 
  }, [marketPrices]);

  const { totalInvestedBRL, currentTotalValueBRL } = useMemo(() => {
    const effectiveRate = usdRate || 5.85;

    return assets.reduce((acc, curr) => {
      const assetTicker = curr.ticker?.toUpperCase() || "";
      const priceData = marketPrices.find(p => 
        p.ticker.toUpperCase() === assetTicker || 
        p.ticker.toUpperCase().replace('USDT', '') === assetTicker
      );
      
      const isUSDAsset = curr.type === 'Criptomoeda' || (priceData?.currency === 'USD');
      const rawCurrentPrice = priceData && priceData.price > 0 ? priceData.price : (curr.investedValue / (curr.quantity || 1));
      
      const currentValOriginal = rawCurrentPrice * curr.quantity;
      const investedOriginal = curr.investedValue;

      const currentValBRL = isUSDAsset ? currentValOriginal * effectiveRate : currentValOriginal;
      const investedBRL = isUSDAsset ? investedOriginal * effectiveRate : investedOriginal;

      return {
        totalInvestedBRL: acc.totalInvestedBRL + investedBRL,
        currentTotalValueBRL: acc.currentTotalValueBRL + currentValBRL
      };
    }, { totalInvestedBRL: 0, currentTotalValueBRL: 0 });
  }, [assets, marketPrices, usdRate]);

  const totalGainLoss = currentTotalValueBRL - totalInvestedBRL;
  const totalGainLossPercentage = totalInvestedBRL > 0 ? (totalGainLoss / totalInvestedBRL) * 100 : 0;

  const firestore = useFirestore();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    type: "Ação" as AssetType,
    location: "",
    investedValue: "",
    quantity: ""
  });

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user) return;

    setIsSubmitting(true);
    try {
      const assetData = {
        name: formData.name,
        ticker: formData.ticker.toUpperCase().trim(),
        type: formData.type,
        location: formData.location,
        investedValue: Number(formData.investedValue),
        quantity: Number(formData.quantity),
        userId: user.uid,
        createdAt: new Date().toISOString(),
        riskLevel: 'Moderado'
      };

      await addDocumentNonBlocking(collection(firestore, "users", user.uid, "assets"), assetData);
      
      setIsAddOpen(false);
      setFormData({
        name: "",
        ticker: "",
        type: "Ação",
        location: "",
        investedValue: "",
        quantity: ""
      });
    } catch (error) {
      console.error("Erro ao adicionar ativo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-headline font-bold text-white tracking-tighter led-text-blue">Minha Wallet</h2>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Sincronização Ativa Binance & B3</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl bg-primary text-background font-bold shadow-lg flex items-center gap-2">
              <Plus className="h-4 w-4" /> NOVO REGISTRO
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-primary/30 w-[95vw] max-w-[500px] rounded-[1.5rem] md:rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl font-headline font-bold text-white flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" /> Registrar Aporte
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAsset} className="grid gap-4 md:gap-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-white/40 uppercase">Nome</Label>
                  <Input required className="bg-white/5 border-white/10 h-10 text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-white/40 uppercase">Ticker</Label>
                  <Input required className="bg-white/5 border-white/10 h-10 text-sm" value={formData.ticker} onChange={(e) => setFormData({...formData, ticker: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-white/40 uppercase">Tipo</Label>
                  <Select value={formData.type} onValueChange={(val: AssetType) => setFormData({...formData, type: val})}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-10 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#080D18]">
                      <SelectItem value="Ação">Ação</SelectItem>
                      <SelectItem value="Fundo Imobiliário">Fundo Imobiliário</SelectItem>
                      <SelectItem value="Criptomoeda">Criptomoeda</SelectItem>
                      <SelectItem value="Commodity">Commodity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-white/40 uppercase">Local</Label>
                  <Input required className="bg-white/5 border-white/10 h-10 text-sm" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-white/40 uppercase">Total Gasto</Label>
                  <Input required type="number" className="bg-white/5 border-white/10 h-10 text-sm" value={formData.investedValue} onChange={(e) => setFormData({...formData, investedValue: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-white/40 uppercase">Qtd</Label>
                  <Input required type="number" step="0.000001" className="bg-white/5 border-white/10 h-10 text-sm" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="h-12 bg-primary text-background font-bold rounded-xl mt-2">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "VINCULAR AO NEXUS"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="bg-[#080D18]/90 border border-white/10 rounded-2xl md:rounded-[2rem] p-5 md:p-8 space-y-2 md:space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[9px] md:text-xs font-headline font-bold text-primary uppercase tracking-widest led-text-blue">Patrimônio (BRL)</span>
            <PieChart className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h4 className="text-xl md:text-4xl font-headline font-bold text-white tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTotalValueBRL)}
            </h4>
            <div className={cn("flex items-center gap-1 text-[10px] md:text-xs font-bold", totalGainLoss >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {totalGainLoss >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(totalGainLossPercentage).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-[#080D18]/90 border border-white/10 rounded-2xl md:rounded-[2rem] p-5 md:p-8 space-y-2 md:space-y-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[9px] md:text-xs font-headline font-bold text-accent uppercase tracking-widest led-text-accent">Alocação</span>
            <ShieldAlert className="h-3.5 w-3.5 text-accent" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[65%]" />
            </div>
            <span className="text-white text-[10px] font-bold">Monitorado</span>
          </div>
        </div>

        <div className="bg-[#080D18]/95 border border-primary/20 rounded-2xl md:rounded-[2rem] p-5 md:p-8 space-y-2 md:space-y-3 led-glow-blue shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[9px] md:text-xs font-headline font-bold text-primary uppercase tracking-widest">Dólar Comercial</span>
            <Coins className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="text-lg md:text-2xl font-bold text-white">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(usdRate)}
          </div>
        </div>
      </div>

      {assets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {assets.map((asset) => {
            const assetTicker = asset.ticker?.toUpperCase() || "";
            const priceData = marketPrices.find(p => 
              p.ticker.toUpperCase() === assetTicker || 
              p.ticker.toUpperCase().replace('USDT', '') === assetTicker
            );
            return (
              <AssetCard 
                key={asset.id} 
                asset={asset}
                marketPriceData={priceData}
                onUpdate={onUpdateAsset}
                onAnalyze={onAnalyze}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-12 md:py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2rem] md:rounded-[3rem] bg-white/5 space-y-6 px-6 text-center">
          <Wallet className="h-10 w-10 md:h-12 md:w-12 text-primary opacity-40" />
          <div className="space-y-1">
            <p className="text-base md:text-lg font-headline font-bold text-white/60">Sua Wallet está Vazia</p>
            <p className="text-xs text-white/30 max-w-xs mx-auto">Registre seu primeiro ativo para iniciar o monitoramento tático.</p>
          </div>
          <Button variant="outline" onClick={() => setIsAddOpen(true)} className="border-primary/40 text-primary h-12 px-8 rounded-xl font-bold text-xs">
            CADASTRAR ATIVO
          </Button>
        </div>
      )}
    </div>
  );
}
