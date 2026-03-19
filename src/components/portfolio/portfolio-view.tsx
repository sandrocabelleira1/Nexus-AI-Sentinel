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
    <div className="space-y-8 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-white tracking-tighter led-text-blue">Minha Wallet</h2>
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest mt-1">Sincronização Ativa com Binance Core e B3</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 rounded-2xl bg-primary text-background font-bold shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 transition-all flex items-center gap-3">
              <Plus className="h-5 w-5" /> NOVO REGISTRO
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-primary/30 sm:max-w-[500px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" /> Registrar Aporte
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAsset} className="grid gap-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Nome</Label>
                  <Input required className="bg-white/5 border-white/10" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ticker</Label>
                  <Input required className="bg-white/5 border-white/10" value={formData.ticker} onChange={(e) => setFormData({...formData, ticker: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tipo</Label>
                  <Select value={formData.type} onValueChange={(val: AssetType) => setFormData({...formData, type: val})}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#080D18]">
                      <SelectItem value="Ação">Ação</SelectItem>
                      <SelectItem value="Fundo Imobiliário">Fundo Imobiliário</SelectItem>
                      <SelectItem value="Criptomoeda">Criptomoeda</SelectItem>
                      <SelectItem value="Commodity">Commodity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Local</Label>
                  <Input required className="bg-white/5 border-white/10" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Gasto</Label>
                  <Input required type="number" className="bg-white/5 border-white/10" value={formData.investedValue} onChange={(e) => setFormData({...formData, investedValue: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Qtd</Label>
                  <Input required type="number" step="0.000001" className="bg-white/5 border-white/10" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="h-14 bg-primary text-background font-bold rounded-2xl">
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "VINCULAR AO NEXUS"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-[#080D18]/90 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 space-y-3 relative overflow-hidden group shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-headline font-bold text-primary uppercase tracking-widest led-text-blue">Patrimônio Consolidado (BRL)</span>
            <PieChart className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl md:text-4xl font-headline font-bold text-white tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTotalValueBRL)}
            </h4>
            <div className={cn("flex items-center gap-1 text-xs font-bold", totalGainLoss >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {totalGainLoss >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(totalGainLossPercentage).toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="bg-[#080D18]/90 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 space-y-3 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-headline font-bold text-accent uppercase tracking-widest led-text-accent">Alocação Estratégica</span>
            <ShieldAlert className="h-4 w-4 text-accent" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent w-[65%]" />
            </div>
            <span className="text-white text-xs font-bold">Monitorado</span>
          </div>
        </div>

        <div className="bg-[#080D18]/95 border border-primary/20 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 space-y-3 relative overflow-hidden group led-glow-blue shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs font-headline font-bold text-primary uppercase tracking-widest">Dólar Comercial</span>
            <Coins className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-white">
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
        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5 space-y-6">
          <Wallet className="h-12 w-12 text-primary opacity-40" />
          <div className="text-center">
            <p className="text-lg font-headline font-bold text-white/60">Sua Wallet está Vazia</p>
            <p className="text-sm text-white/30 max-w-xs mx-auto mt-2">Inicie o monitoramento tático registrando seu primeiro ativo.</p>
          </div>
          <Button variant="outline" onClick={() => setIsAddOpen(true)} className="border-primary/40 text-primary">
            CADASTRAR MEU PRIMEIRO ATIVO
          </Button>
        </div>
      )}
    </div>
  );
}
