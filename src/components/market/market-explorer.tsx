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
  TrendingDown, 
  Globe, 
  Zap, 
  Landmark, 
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  BrainCircuit,
  AlertTriangle,
  Flag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FinancialTerm } from "@/components/ui/financial-term";

interface MarketExplorerProps {
  prices: MarketPrice[];
  latestAlert?: GlobalIntelligenceAlert | null;
}

export function MarketExplorer({ prices, latestAlert }: MarketExplorerProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'crypto' | 'stocks' | 'fiis'>('all');
  const [regionFilter, setRegionFilter] = useState<'all' | 'Brazil' | 'USA' | 'Global'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      const ticker = (p.ticker || "").toUpperCase().trim();
      const matchesSearch = ticker.includes(search.toUpperCase().trim());
      
      if (!matchesSearch) return false;
      
      const matchesCategory = filter === 'all' || p.category === filter;
      const matchesRegion = regionFilter === 'all' || p.region === regionFilter;
      
      return matchesCategory && matchesRegion;
    }).sort((a, b) => (a.ticker || "").localeCompare(b.ticker || ""));
  }, [prices, search, filter, regionFilter]);

  const getAIInsight = (ticker: string, change24h: number) => {
    const alertDetail = latestAlert?.affectedAssetsDetails?.find(
      d => d.ticker.toUpperCase() === ticker.toUpperCase()
    );

    if (alertDetail) {
      return {
        recommendation: alertDetail.recommendation,
        reason: alertDetail.explanation,
        isAlert: true
      };
    }

    if (change24h > 3) return { recommendation: 'BUY' as const, reason: "Momento de alta forte detectado. Fluxo institucional sugere continuação na janela de 7 dias.", isAlert: false };
    if (change24h < -3) return { recommendation: 'SELL' as const, reason: "Ajuste técnico severo detectado. Sugere-se proteção de capital até estabilização.", isAlert: false };
    if (change24h > 0) return { recommendation: 'HOLD' as const, reason: "Tendência lateral com viés de alta. Manter posição para captura de valorização residual.", isAlert: false };
    return { recommendation: 'WATCH' as const, reason: "Ativo em zona de neutralidade. Aguardando gatilho de volume para nova ordem estratégica.", isAlert: false };
  };

  const stats = useMemo(() => {
    const up = prices.filter(p => p.change24h > 0).length;
    return {
      total: prices.length,
      bullish: up,
      bearish: prices.length - up
    };
  }, [prices]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-headline font-bold text-white tracking-tight">Market Explorer</h2>
          <p className="text-muted-foreground font-medium text-lg">Radar global de ativos monitorados via Nexus Sentinel.</p>
        </div>

        <div className="flex items-center gap-4 bg-[#080D18]/90 border border-white/10 p-4 rounded-3xl shadow-xl">
          <div className="flex flex-col items-center px-6 border-r border-white/5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Monitorados</span>
            <span className="text-xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="flex flex-col items-center px-6 border-r border-white/5">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Em Alta</span>
            <span className="text-xl font-bold text-emerald-400">{stats.bullish}</span>
          </div>
          <div className="flex flex-col items-center px-6">
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Em Queda</span>
            <span className="text-xl font-bold text-rose-400">{stats.bearish}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-50" />
            <Input 
              placeholder="Pesquisar ticker (ex: BTC, VALE3, AAPL)..."
              className="h-16 pl-16 bg-[#080D18]/90 border-white/10 rounded-2xl text-lg font-medium focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#080D18]/90 border border-white/10 p-2 rounded-2xl gap-2">
              {[
                { id: 'all', label: 'Todos', icon: Globe },
                { id: 'stocks', label: 'Ações', icon: TrendingUp },
                { id: 'crypto', label: 'Cripto', icon: Zap },
                { id: 'fiis', label: 'FIIs', icon: Landmark }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilter(btn.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    filter === btn.id ? "bg-primary text-white shadow-lg led-glow-blue" : "text-muted-foreground hover:text-white"
                  )}
                >
                  <btn.icon className="h-4 w-4" /> {btn.label}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[#080D18]/90 border border-white/10 p-2 rounded-2xl gap-1">
              <button onClick={() => setViewMode('grid')} className={cn("p-3 rounded-xl transition-all", viewMode === 'grid' ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-white")}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setViewMode('list')} className={cn("p-3 rounded-xl transition-all", viewMode === 'list' ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-white")}><ListIcon className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[#080D18]/90 border border-white/10 p-2 rounded-2xl gap-2 w-fit">
          {[
            { id: 'all', label: 'Global (Tudo)', icon: Globe },
            { id: 'Brazil', label: 'B3 Brasil', icon: Flag },
            { id: 'USA', label: 'USA Markets', icon: Landmark },
            { id: 'Global', label: 'On-Chain / Global', icon: Zap }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setRegionFilter(btn.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap uppercase tracking-widest",
                regionFilter === btn.id ? "bg-accent text-white shadow-lg led-glow-accent" : "text-muted-foreground hover:text-white"
              )}
            >
              <btn.icon className="h-3.5 w-3.5" /> {btn.label}
            </button>
          ))}
        </div>
      </div>

      {filteredPrices.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPrices.map((price) => {
              const isUp = price.change24h > 0;
              const ticker = (price.ticker || "").toUpperCase().trim();
              const categoryLabel = price.category === 'crypto' ? 'Cripto' : price.category === 'fiis' ? 'FII' : 'Ação';
              const ai = getAIInsight(ticker, price.change24h);
              
              return (
                <Card key={price.ticker} className="bg-[#080D18]/95 border-white/10 hover:border-primary/40 transition-all group cursor-pointer relative overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col">
                  <div className={cn("absolute top-0 left-0 w-full h-1", ai.recommendation === 'BUY' ? "bg-emerald-500" : ai.recommendation === 'SELL' ? "bg-rose-500" : "bg-primary/20")} />
                  <CardContent className="p-8 space-y-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-bold tracking-widest uppercase">
                            {categoryLabel}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-white/10 text-white/40 font-bold uppercase">
                            {price.region}
                          </Badge>
                        </div>
                        <h3 className="text-3xl font-headline font-bold text-white led-text-blue">
                          <FinancialTerm term="TICKER">{ticker}</FinancialTerm>
                        </h3>
                      </div>
                      <div className={cn("p-3 rounded-xl border font-bold flex items-center gap-1 text-xs", isUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20")}>
                        {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {price.change24h.toFixed(2)}%
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Cotação Atual</span>
                      <div className="text-3xl font-bold text-white">
                        {ticker === 'IBOV' ? price.price.toLocaleString() : 
                         (price.region === 'Brazil' ? 'R$ ' : 'US$ ') + 
                         price.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </div>
                    </div>

                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="h-4 w-4 text-primary" />
                          <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Nexus AI Rating</span>
                        </div>
                        <Badge className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md", ai.recommendation === 'BUY' ? "bg-emerald-500" : ai.recommendation === 'SELL' ? "bg-rose-500" : "bg-white/10 text-white")}>
                          {ai.recommendation}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-white/80 leading-relaxed font-medium">{ai.reason}</p>
                      {ai.isAlert && <div className="flex items-center gap-1.5 text-accent text-[9px] font-bold uppercase tracking-widest mt-2"><AlertTriangle className="h-3 w-3" /> Alerta Crítico Ativo</div>}
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Monitoramento Global</span>
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#080D18]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/10 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              <div className="col-span-3">Ativo</div>
              <div className="col-span-1">Região</div>
              <div className="col-span-2">Cotação</div>
              <div className="col-span-2">Variação 24h</div>
              <div className="col-span-1">Rating</div>
              <div className="col-span-3">Nexus Insight</div>
            </div>
            <div className="divide-y divide-white/5">
              {filteredPrices.map((price) => {
                const ticker = (price.ticker || "").toUpperCase().trim();
                const isUp = price.change24h > 0;
                const ai = getAIInsight(ticker, price.change24h);

                return (
                  <div key={price.ticker} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="col-span-3 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        {price.category === 'crypto' ? <Zap className="h-4 w-4" /> : price.category === 'fiis' ? <Landmark className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg group-hover:text-primary transition-colors">{ticker}</h4>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{price.name}</span>
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Badge variant="outline" className="text-[9px] border-white/10 text-white/40">{price.region}</Badge>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xl font-bold text-white">
                        {(price.region === 'Brazil' ? 'R$ ' : 'US$ ') + price.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className={cn("flex items-center gap-1.5 font-bold", isUp ? "text-emerald-400" : "text-rose-400")}>
                        {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {price.change24h.toFixed(2)}%
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Badge className={cn("font-bold text-[10px]", ai.recommendation === 'BUY' ? "bg-emerald-500" : ai.recommendation === 'SELL' ? "bg-rose-500" : "bg-white/10")}>{ai.recommendation}</Badge>
                    </div>
                    <div className="col-span-3">
                      <p className="text-xs text-white/90 line-clamp-2">{ai.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <div className="col-span-full py-40 text-center space-y-4 opacity-40 flex flex-col items-center">
          <Search className="h-16 w-16 mb-4" />
          <p className="text-2xl font-medium">Nenhum ativo global no radar para "{search}"</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">Recarregar Sentinela</Button>
        </div>
      )}
    </div>
  );
}
