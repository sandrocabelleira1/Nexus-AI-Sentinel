"use client"

import { useState, useMemo } from "react";
import { MarketPrice, GlobalIntelligenceAlert } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  TrendingUp, 
  Globe, 
  Building2, 
  Coins, 
  ChevronRight,
  Zap,
  CalendarDays,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetDetailModal } from "./asset-detail-modal";

interface MarketExplorerProps {
  prices: MarketPrice[];
  latestAlert?: GlobalIntelligenceAlert | null;
  onAnalyze?: (context: string) => void;
}

export function MarketExplorer({ prices, latestAlert, onAnalyze }: MarketExplorerProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'crypto' | 'stocks' | 'fiis'>('all');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [selectedAsset, setSelectedAsset] = useState<MarketPrice | null>(null);

  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      const ticker = (p.ticker || "").toUpperCase();
      const matchesSearch = ticker.includes(search.toUpperCase());
      const matchesCategory = filter === 'all' || p.category === filter;
      return matchesSearch && matchesCategory;
    });
  }, [prices, search, filter]);

  const handleImageError = (ticker: string) => {
    setImageErrors(prev => ({ ...prev, [ticker]: true }));
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-2.5 bg-primary/20 rounded-lg md:rounded-xl led-glow-blue">
              <Globe className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-white tracking-tighter led-text-blue">Terminal Global Pro</h2>
          </div>
          <p className="text-white/40 font-medium text-sm md:text-lg max-w-2xl leading-snug">Monitoramento Omnisciente v5.2: Dados Fundamentalistas e Veredito Nexus.</p>
        </div>

        <div className="flex items-center gap-4 md:gap-6 bg-[#080D18]/90 border border-white/10 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl w-fit">
          <div className="flex flex-col items-center px-4 md:px-8 border-r border-white/10">
            <span className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] mb-1">Scanner</span>
            <span className="text-xl md:text-3xl font-bold text-white">{prices.length}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 px-2 md:px-4">
            <Zap className="h-3 w-3 md:h-4 md:w-4 text-primary animate-pulse" />
            <span className="text-[9px] md:text-[11px] text-primary font-bold uppercase tracking-[0.2em] md:tracking-[0.4em]">LIVE DATA STREAM</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-primary" />
          <Input 
            placeholder="Buscar ativos por ticker..."
            className="h-16 md:h-20 pl-14 md:pl-20 bg-[#080D18]/95 border-white/10 rounded-xl md:rounded-[1.5rem] text-lg md:text-xl font-bold focus-visible:ring-primary shadow-2xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center bg-[#080D18]/90 border border-white/10 p-1.5 md:p-2 rounded-xl md:rounded-[1.5rem] gap-1 md:gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'TODOS', icon: Globe },
            { id: 'stocks', label: 'AÇÕES', icon: TrendingUp },
            { id: 'fiis', label: 'FIIs', icon: Building2 },
            { id: 'crypto', label: 'CRIPTO', icon: Coins }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold tracking-widest transition-all whitespace-nowrap",
                filter === btn.id ? "bg-primary text-white shadow-xl led-glow-blue" : "text-muted-foreground hover:text-white"
              )}
            >
              <btn.icon className="h-3 w-3 md:h-3.5 md:w-3.5" /> {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredPrices.map((price) => {
          const isUp = price.change24h > 0;
          const isFii = price.category === 'fiis';
          const isUSD = price.currency === 'USD';
          const isBuySignal = isFii && (price.pvpRatio || 1) < 0.95;
          const hasImageError = imageErrors[price.ticker];
          
          return (
            <Card key={price.ticker} 
              className={cn(
                "bg-[#080D18] border-white/10 transition-all group relative overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col border",
                isBuySignal && "border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
              )}
            >
              {isBuySignal && (
                <div className="bg-emerald-600 text-white text-[8px] md:text-[9px] font-bold uppercase py-2.5 px-4 text-center tracking-[0.3em] led-glow-blue w-full">
                  ORDEM NEXUS: COMPRA (DESCONTO PATRIMONIAL)
                </div>
              )}
              
              <CardContent className="p-8 space-y-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {price.logo && !hasImageError ? (
                        <img 
                          src={price.logo} 
                          alt={price.ticker} 
                          className="w-full h-full object-contain p-2"
                          onError={() => handleImageError(price.ticker)}
                        />
                      ) : (
                        <div className="text-primary">
                          {isFii ? <Building2 className="h-7 w-7" /> : isUSD ? <Coins className="h-7 w-7" /> : <TrendingUp className="h-7 w-7" />}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[7px] border-primary/30 text-primary uppercase font-bold px-1.5">
                          {price.exchange || (isUSD ? 'BINANCE' : 'B3')}
                        </Badge>
                        {isFii && <Badge className="bg-primary/20 text-primary border-primary/30 text-[7px]">{price.fiiType || 'Tijolo'}</Badge>}
                      </div>
                      <h3 className="text-2xl font-headline font-bold text-white tracking-tight">{price.ticker}</h3>
                    </div>
                  </div>
                  <div className={cn("px-3 py-1.5 rounded-xl border font-bold text-[10px]", isUp ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-rose-400 border-rose-500/20 bg-rose-500/5")}>
                    {price.change24h.toFixed(2)}%
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white tracking-tighter">
                    {price.price.toLocaleString(isUSD ? 'en-US' : 'pt-BR', { 
                      style: 'currency', 
                      currency: isUSD ? 'USD' : 'BRL',
                      maximumFractionDigits: isUSD ? 4 : 2 
                    })}
                  </span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ativo {price.currency}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Coins className="h-3 w-3" />
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Dividend Tracker</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {price.dividendAmount ? price.dividendAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                    </div>
                    <div className="text-[9px] font-bold text-emerald-400 uppercase">{(price.dividendYield || 0).toFixed(2)}% AM</div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Building2 className="h-3 w-3" />
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em]">Vacância</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {(price.vacancyRate || 0).toFixed(1)}%
                    </div>
                    <div className="text-[9px] font-bold text-white/40 uppercase">Estável</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3 w-3 text-primary/60" />
                    <div className="flex flex-col">
                      <span className="text-[7px] font-bold text-white/40 uppercase">Data Com</span>
                      <span className="text-[10px] font-bold text-white">{price.dataCom || '---'}</span>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
                    <div className="flex flex-col">
                      <span className="text-[7px] font-bold text-white/40 uppercase">Pagamento</span>
                      <span className="text-[10px] font-bold text-white">{price.paymentDate || '---'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#0D1525] border border-white/5 rounded-2xl">
                  <p className="text-[11px] text-white/60 italic leading-relaxed text-center">
                    "{price.nexusVerdict || 'N/D (Not available from raw data, defaulting to empty string)'}"
                  </p>
                </div>

                <Button 
                  onClick={(e) => { e.stopPropagation(); setSelectedAsset(price); }}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs h-14 rounded-2xl group/btn tracking-widest uppercase"
                >
                  Análise 360°
                  <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AssetDetailModal 
        asset={selectedAsset} 
        isOpen={!!selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
        onAnalyze={onAnalyze}
      />
    </div>
  );
}
