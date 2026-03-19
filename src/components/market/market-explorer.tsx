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
  Activity, 
  Building2, 
  Coins, 
  ChevronRight,
  Loader2,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetDetailModal } from "./asset-detail-modal";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

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
          <p className="text-white/40 font-medium text-sm md:text-lg max-w-2xl leading-snug">Monitoramento Omnisciente v5.1: Gráficos de Telemetria e Análise Fundamentalista.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {filteredPrices.map((price) => {
          const isUp = price.change24h > 0;
          const isFii = price.category === 'fiis';
          const isUSD = price.currency === 'USD';
          const isBuySignal = isFii && (price.pvpRatio || 1) < 0.95 && (price.vacancyRate || 0) < 10;
          
          const isSyncing = isFii && (price.dividendAmount === undefined && price.dataCom === undefined);
          const hasImageError = imageErrors[price.ticker];
          
          // Dados do sparkline (usando dados reais se disponíveis, senão simulados)
          const sparklineData = price.sparkline ? 
            price.sparkline.map((v, i) => ({ value: v })) : 
            Array.from({ length: 12 }).map((_, i) => ({ value: price.price * (1 + (Math.random() * 0.02 - 0.01)) }));
          
          return (
            <Card key={price.ticker} 
              onClick={() => setSelectedAsset(price)}
              className={cn(
                "bg-[#080D18]/95 border-white/10 hover:border-primary/40 transition-all group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex flex-col cursor-pointer",
                isBuySignal && "border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
              )}
            >
              {isBuySignal && (
                <div className="bg-emerald-600 text-white text-[8px] md:text-[9px] font-bold uppercase py-1.5 md:py-2 px-3 md:px-4 text-center tracking-[0.2em] md:tracking-[0.3em] led-glow-blue">
                  ORDEM NEXUS: OPORTUNIDADE DE COMPRA
                </div>
              )}
              
              <CardContent className="p-6 md:p-8 space-y-5 md:space-y-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 md:gap-4">
                    {price.logo && !hasImageError ? (
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white p-1.5 md:p-2 border border-white/10 overflow-hidden shrink-0">
                        <img 
                          src={price.logo} 
                          alt={price.ticker} 
                          className="w-full h-full object-contain"
                          onError={() => handleImageError(price.ticker)}
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0">
                        {isFii ? <Building2 className="h-5 w-5 md:h-6 md:w-6" /> : isUSD ? <Coins className="h-5 w-5 md:h-6 md:w-6" /> : <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                        <Badge variant="outline" className="text-[7px] md:text-[8px] border-primary/30 text-primary uppercase font-bold tracking-widest px-1.5 md:px-2 py-0.5">
                          {price.exchange || (isUSD ? 'BINANCE' : 'B3')}
                        </Badge>
                      </div>
                      <h3 className="text-xl md:text-2xl font-headline font-bold text-white group-hover:text-primary transition-colors">{price.ticker}</h3>
                    </div>
                  </div>
                  <div className={cn("px-2.5 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl border font-bold text-xs", isUp ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-rose-400 border-rose-500/20 bg-rose-500/5")}>
                    {isUp ? '+' : ''}{price.change24h.toFixed(2)}%
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5 md:gap-2">
                  <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter">
                    {price.price.toLocaleString(isUSD ? 'en-US' : 'pt-BR', { 
                      style: 'currency', 
                      currency: isUSD ? 'USD' : 'BRL',
                      maximumFractionDigits: isUSD ? 4 : 2 
                    })}
                  </span>
                </div>

                {/* Sparkline Visual (Linha de Flutuação) */}
                <div className="h-12 w-full mt-2">
                   <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                      <Area type="monotone" dataKey="value" stroke={isUp ? "#10b981" : "#f43f5e"} fill={isUp ? "#10b98120" : "#f43f5e20"} strokeWidth={3} dot={false} />
                    </AreaChart>
                   </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 pt-2">
                  {isFii ? (
                    <>
                      <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 space-y-1">
                        <span className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase tracking-widest">DY AM</span>
                        <div className="text-sm font-bold text-emerald-400">{(price.dividendYield || 0).toFixed(2)}%</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 space-y-1">
                        <span className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase tracking-widest">P/VP</span>
                        <div className={cn("text-sm font-bold", (price.pvpRatio || 1) < 1 ? "text-emerald-400" : "text-white")}>
                          {(price.pvpRatio || 1).toFixed(2)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 space-y-1">
                        <span className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase tracking-widest">P/L</span>
                        <div className="text-sm font-bold text-white">{(price.peRatio || 0).toFixed(1)}x</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-3 md:p-4 space-y-1">
                        <span className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase tracking-widest">SAÚDE</span>
                        <div className="text-sm font-bold text-emerald-400">{price.healthStatus || 'Estável'}</div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              
              <div className="p-5 md:p-6 pt-0 mt-auto">
                <Button 
                  onClick={(e) => { e.stopPropagation(); setSelectedAsset(price); }}
                  className="w-full bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold text-[10px] md:text-xs h-10 md:h-12 rounded-lg md:rounded-xl group/btn"
                >
                  DETALHES E GRÁFICOS
                  <ChevronRight className="ml-2 h-3 w-3 md:h-4 md:w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
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
