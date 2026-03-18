
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
}

export function PortfolioView({ assets, marketPrices, onUpdateAsset }: PortfolioViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcula patrimônio total baseado em preços de mercado e valor investido
  const { totalInvested, currentTotalValue } = useMemo(() => {
    return assets.reduce((acc, curr) => {
      const priceData = marketPrices.find(p => p.ticker === curr.ticker);
      const currentVal = priceData ? priceData.price * curr.quantity : curr.investedValue;
      return {
        totalInvested: acc.totalInvested + curr.investedValue,
        currentTotalValue: acc.currentTotalValue + currentVal
      };
    }, { totalInvested: 0, currentTotalValue: 0 });
  }, [assets, marketPrices]);

  const totalGainLoss = currentTotalValue - totalInvested;
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  const firestore = useFirestore();
  const { user } = useUser();

  // New Asset State
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
        ticker: formData.ticker.toUpperCase(),
        type: formData.type,
        location: formData.location,
        investedValue: Number(formData.investedValue),
        quantity: Number(formData.quantity),
        userId: user.uid,
        createdAt: new Date().toISOString(),
        riskLevel: 'Moderado' // Default risk for new assets
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
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest mt-1">Custódia Geopolítica em Tempo Real</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-8 rounded-2xl bg-primary text-background font-bold shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 transition-all flex items-center gap-3">
              <Plus className="h-5 w-5" /> ADICIONAR ATIVO
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-primary/30 sm:max-w-[500px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" /> Novo Aporte Estratégico
              </DialogTitle>
              <DialogDescription className="text-white/40 font-medium">
                O Nexus vinculará este ativo ao Radar Omnisciente v3.1.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAsset} className="grid gap-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Nome do Ativo</Label>
                  <Input 
                    required
                    placeholder="Ex: Petrobras"
                    className="bg-white/5 border-white/10 text-white h-12"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ticker (Símbolo)</Label>
                  <Input 
                    required
                    placeholder="Ex: PETR4"
                    className="bg-white/5 border-white/10 text-white h-12"
                    value={formData.ticker}
                    onChange={(e) => setFormData({...formData, ticker: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(val: AssetType) => setFormData({...formData, type: val})}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#080D18] border-white/10">
                      <SelectItem value="Ação">Ação</SelectItem>
                      <SelectItem value="Fundo Imobiliário">Fundo Imobiliário</SelectItem>
                      <SelectItem value="Criptomoeda">Criptomoeda</SelectItem>
                      <SelectItem value="Commodity">Commodity</SelectItem>
                      <SelectItem value="Moeda">Moeda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Custódia (Local)</Label>
                  <Input 
                    required
                    placeholder="Ex: XP, Binance, B3"
                    className="bg-white/5 border-white/10 text-white h-12"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Valor Investido (R$)</Label>
                  <Input 
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white h-12"
                    value={formData.investedValue}
                    onChange={(e) => setFormData({...formData, investedValue: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Quantidade</Label>
                  <Input 
                    required
                    type="number"
                    step="0.0001"
                    placeholder="0.0000"
                    className="bg-white/5 border-white/10 text-white h-12"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary text-background font-bold text-lg rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "REGISTRAR ATIVO NO NEXUS"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentTotalValue)}
            </h4>
            <div className={cn("flex items-center gap-1 text-xs md:text-sm font-bold", totalGainLoss >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {totalGainLoss >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {totalGainLossPercentage.toFixed(2)}%
            </div>
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
      {assets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {assets.map((asset) => {
            const priceData = marketPrices.find(p => p.ticker === asset.ticker);
            return (
              <AssetCard 
                key={asset.id} 
                asset={asset}
                currentMarketPrice={priceData?.price}
                onUpdate={onUpdateAsset}
              />
            );
          })}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5 space-y-6">
          <div className="p-6 bg-primary/10 rounded-full">
            <Wallet className="h-12 w-12 text-primary opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-lg font-headline font-bold text-white/60">Sua Wallet está Vazia</p>
            <p className="text-sm text-white/30 max-w-xs mx-auto mt-2">Registre seus primeiros ativos para ativar a Análise Preditiva do Nexus.</p>
          </div>
          <Button variant="outline" onClick={() => setIsAddOpen(true)} className="border-primary/40 text-primary hover:bg-primary/10">
            CADASTRAR MEU PRIMEIRO ATIVO
          </Button>
        </div>
      )}

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
