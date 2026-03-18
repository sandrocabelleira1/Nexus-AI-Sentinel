
"use client"

import { useState, useMemo, useEffect } from "react";
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
  Clock,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FinancialTerm } from "@/components/ui/financial-term";

interface MarketExplorerProps {
  prices: MarketPrice[];
  latestAlert?: GlobalIntelligenceAlert | null;
}

// Configuração de horários das bolsas (UTC para facilitar)
const EXCHANGES_CONFIG: Record<string, { name: string, city: string, open: string, close: string, timezone: string, break?: { start: string, end: string } }> = {
  'NYSE': { name: 'NYSE', city: 'Nova Iorque', open: '09:30', close: '16:00', timezone: 'America/New_York' },
  'NASDAQ': { name: 'NASDAQ', city: 'Nova Iorque', open: '09:30', close: '16:00', timezone: 'America/New_York' },
  'B3': { name: 'B3', city: 'São Paulo', open: '10:00', close: '18:00', timezone: 'America/Sao_Paulo' },
  'LSE': { name: 'LSE', city: 'Londres', open: '08:00', close: '16:30', timezone: 'Europe/London' },
  'TSE': { name: 'TSE', city: 'Tóquio', open: '09:00', close: '15:00', timezone: 'Asia/Tokyo', break: { start: '11:30', end: '12:30' } },
  'HKEX': { name: 'HKEX', city: 'Hong Kong', open: '09:30', close: '16:00', timezone: 'Asia/Hong_Kong', break: { start: '12:00', end: '13:00' } },
  'SSE': { name: 'SSE', city: 'Xangai', open: '09:30', close: '15:00', timezone: 'Asia/Shanghai', break: { start: '11:30', end: '13:00' } },
  'Euronext': { name: 'Euronext', city: 'Paris/Amsterdão', open: '09:00', close: '17:30', timezone: 'Europe/Paris' },
  'TSX': { name: 'TSX', city: 'Toronto', open: '09:30', close: '16:00', timezone: 'America/Toronto' },
  'BSE': { name: 'BSE', city: 'Mumbai', open: '09:15', close: '15:30', timezone: 'Asia/Kolkata' },
  'ASX': { name: 'ASX', city: 'Sydney', open: '10:00', close: '16:00', timezone: 'Australia/Sydney' },
  'FSX': { name: 'FSX', city: 'Frankfurt', open: '09:00', close: '17:30', timezone: 'Europe/Berlin' },
};

export function MarketExplorer({ prices, latestAlert }: MarketExplorerProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'crypto' | 'stocks' | 'fiis'>('all');
  const [exchangeFilter, setExchangeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getMarketStatus = (exchangeId: string) => {
    const config = EXCHANGES_CONFIG[exchangeId];
    if (!config) return 'Desconhecido';

    const localTimeStr = currentTime.toLocaleString("en-US", { timeZone: config.timezone });
    const localDate = new Date(localTimeStr);
    const day = localDate.getDay();
    
    // Fim de semana
    if (day === 0 || day === 6) return 'Fechado';

    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();
    const timeInMinutes = hours * 60 + minutes;

    const [openH, openM] = config.open.split(':').map(Number);
    const [closeH, closeM] = config.close.split(':').map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;

    // Check lunch break
    if (config.break) {
      const [bStartH, bStartM] = config.break.start.split(':').map(Number);
      const [bEndH, bEndM] = config.break.end.split(':').map(Number);
      const breakStartTime = bStartH * 60 + bStartM;
      const breakEndTime = bEndH * 60 + bEndM;
      if (timeInMinutes >= breakStartTime && timeInMinutes < breakEndTime) return 'Pausa';
    }

    if (timeInMinutes >= openTime && timeInMinutes < closeTime) return 'Aberto';
    return 'Fechado';
  };

  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      const ticker = (p.ticker || "").toUpperCase().trim();
      const matchesSearch = ticker.includes(search.toUpperCase().trim());
      if (!matchesSearch) return false;
      
      const matchesCategory = filter === 'all' || p.category === filter;
      const matchesExchange = exchangeFilter === 'all' || p.exchange === exchangeFilter;
      
      return matchesCategory && matchesExchange;
    }).sort((a, b) => (a.ticker || "").localeCompare(b.ticker || ""));
  }, [prices, search, filter, exchangeFilter]);

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

    if (change24h > 3) return { recommendation: 'BUY' as const, reason: "Momento de alta forte detectado.", isAlert: false };
    if (change24h < -3) return { recommendation: 'SELL' as const, reason: "Ajuste técnico severo detectado.", isAlert: false };
    return { recommendation: 'HOLD' as const, reason: "Tendência lateral com viés de estabilidade.", isAlert: false };
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-headline font-bold text-white tracking-tight led-text-blue">Global Radar</h2>
          <p className="text-muted-foreground font-medium text-lg">Monitoramento tático de 12 bolsas mundiais em tempo real.</p>
        </div>

        <div className="flex items-center gap-4 bg-[#080D18]/90 border border-white/10 p-4 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center px-6 border-r border-white/5">
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Ativos</span>
            <span className="text-xl font-bold text-white">{prices.length}</span>
          </div>
          <div className="flex items-center gap-3 px-6">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-white font-bold uppercase tracking-widest">Sincronização Ativa</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-50" />
            <Input 
              placeholder="Pesquisar ticker global..."
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
                { id: 'crypto', label: 'Cripto', icon: Zap }
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
              <button onClick={() => setViewMode('grid')} className={cn("p-3 rounded-xl transition-all", viewMode === 'grid' ? "bg-primary/20 text-primary" : "text-muted-foreground")}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setViewMode('list')} className={cn("p-3 rounded-xl transition-all", viewMode === 'list' ? "bg-primary/20 text-primary" : "text-muted-foreground")}><ListIcon className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
          <button
            onClick={() => setExchangeFilter('all')}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap uppercase tracking-widest border",
              exchangeFilter === 'all' ? "bg-accent text-white border-accent" : "bg-[#080D18] text-muted-foreground border-white/10"
            )}
          >
            GLOBAL
          </button>
          {Object.keys(EXCHANGES_CONFIG).map((ex) => {
            const status = getMarketStatus(ex);
            return (
              <button
                key={ex}
                onClick={() => setExchangeFilter(ex)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap uppercase tracking-widest border flex items-center gap-2",
                  exchangeFilter === ex ? "bg-primary text-white border-primary" : "bg-[#080D18] text-muted-foreground border-white/10"
                )}
              >
                {ex} 
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  status === 'Aberto' ? "bg-emerald-500" : status === 'Pausa' ? "bg-amber-500" : "bg-rose-500"
                )} />
              </button>
            );
          })}
        </div>
      </div>

      {filteredPrices.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPrices.map((price) => {
              const ticker = (price.ticker || "").toUpperCase().trim();
              const isUp = price.change24h > 0;
              const ai = getAIInsight(ticker, price.change24h);
              const marketStatus = price.exchange ? getMarketStatus(price.exchange) : 'Desconhecido';
              
              return (
                <Card key={price.ticker} className="bg-[#080D18]/95 border-white/10 hover:border-primary/40 transition-all group relative overflow-hidden rounded-[2.5rem] shadow-2xl">
                  <div className={cn("absolute top-0 left-0 w-full h-1", ai.recommendation === 'BUY' ? "bg-emerald-500" : ai.recommendation === 'SELL' ? "bg-rose-500" : "bg-primary/20")} />
                  <CardContent className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] border-primary/30 text-primary font-bold tracking-widest uppercase">
                            {price.exchange || 'OTC'}
                          </Badge>
                          <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase",
                            marketStatus === 'Aberto' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                          )}>
                            <Clock className="h-2 w-2" /> {marketStatus}
                          </div>
                        </div>
                        <h3 className="text-3xl font-headline font-bold text-white led-text-blue">{ticker}</h3>
                      </div>
                      <div className={cn("px-3 py-1.5 rounded-xl border font-bold text-xs", isUp ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-rose-400 border-rose-500/20 bg-rose-500/5")}>
                        {price.change24h > 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] flex items-center gap-1">
                        <MapPin className="h-2 w-2" /> {price.region || 'Global'}
                      </span>
                      <div className="text-3xl font-bold text-white">
                        {price.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="h-4 w-4 text-primary" />
                          <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Nexus Rating</span>
                        </div>
                        <Badge className={cn("text-[9px] font-bold", ai.recommendation === 'BUY' ? "bg-emerald-500" : ai.recommendation === 'SELL' ? "bg-rose-500" : "bg-white/10")}>
                          {ai.recommendation}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-white/80 leading-relaxed font-medium">{ai.reason}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#080D18]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/10 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
              <div className="col-span-3">Ativo / Exchange</div>
              <div className="col-span-2">Cotação</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Variação</div>
              <div className="col-span-3">Nexus Insight</div>
            </div>
            <div className="divide-y divide-white/5">
              {filteredPrices.map((price) => {
                const ticker = (price.ticker || "").toUpperCase().trim();
                const status = price.exchange ? getMarketStatus(price.exchange) : 'N/A';
                const ai = getAIInsight(ticker, price.change24h);

                return (
                  <div key={price.ticker} className="grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-white/5 transition-colors">
                    <div className="col-span-3 flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{ticker}</h4>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{price.exchange || 'Global Market'}</span>
                      </div>
                    </div>
                    <div className="col-span-2 text-xl font-bold text-white">
                      {price.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-bold uppercase",
                        status === 'Aberto' ? "text-emerald-400 border-emerald-500/30" : "text-rose-400 border-rose-500/30"
                      )}>
                        {status}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <div className={cn("flex items-center gap-1.5 font-bold", price.change24h > 0 ? "text-emerald-400" : "text-rose-400")}>
                        {price.change24h > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {price.change24h.toFixed(2)}%
                      </div>
                    </div>
                    <div className="col-span-3 text-xs text-white/80 italic line-clamp-2">
                      {ai.reason}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <div className="py-40 text-center space-y-6 flex flex-col items-center">
          <Globe className="h-20 w-20 text-primary/20 animate-spin-slow" />
          <p className="text-2xl font-medium text-white/40">Radar global silencioso para "{search}"</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl border-primary/30 text-primary hover:bg-primary/10">
            <RefreshCw className="mr-2 h-4 w-4" /> REINICIAR SENTINELA
          </Button>
        </div>
      )}
    </div>
  );
}
