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
  Clock,
  MapPin,
  Heart,
  Activity,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketExplorerProps {
  prices: MarketPrice[];
  latestAlert?: GlobalIntelligenceAlert | null;
}

const EXCHANGES_CONFIG: Record<string, { name: string, city: string, open: string, close: string, timezone: string, break?: { start: string, end: string } }> = {
  'NYSE': { name: 'NYSE', city: 'Nova Iorque', open: '09:30', close: '16:00', timezone: 'America/New_York' },
  'NASDAQ': { name: 'NASDAQ', city: 'Nova Iorque', open: '09:30', close: '16:00', timezone: 'America/New_York' },
  'B3': { name: 'B3', city: 'São Paulo', open: '10:00', close: '18:00', timezone: 'America/Sao_Paulo' },
  'LSE': { name: 'LSE', city: 'Londres', open: '08:00', close: '16:30', timezone: 'Europe/London' },
  'TSE': { name: 'TSE', city: 'Tóquio', open: '09:00', close: '15:00', timezone: 'Asia/Tokyo', break: { start: '11:30', end: '12:30' } },
  'HKEX': { name: 'HKEX', city: 'Hong Kong', open: '09:30', close: '16:00', timezone: 'Asia/Hong_Kong', break: { start: '12:00', end: '13:00' } },
  'SSE': { name: 'SSE', city: 'Xangai', open: '09:30', close: '15:00', timezone: 'Asia/Shanghai', break: { start: '11:30', end: '13:00' } },
  'Euronext': { name: 'Euronext', city: 'Paris', open: '09:00', close: '17:30', timezone: 'Europe/Paris' },
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
    if (!config) return 'Fechado';
    const localTimeStr = currentTime.toLocaleString("en-US", { timeZone: config.timezone });
    const localDate = new Date(localTimeStr);
    const day = localDate.getDay();
    if (day === 0 || day === 6) return 'Fechado';
    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    const [openH, openM] = config.open.split(':').map(Number);
    const [closeH, closeM] = config.close.split(':').map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;
    if (config.break) {
      const [bStartH, bStartM] = config.break.start.split(':').map(Number);
      const [bEndH, bEndM] = config.break.end.split(':').map(Number);
      if (timeInMinutes >= (bStartH * 60 + bStartM) && timeInMinutes < (bEndH * 60 + bEndM)) return 'Pausa';
    }
    return (timeInMinutes >= openTime && timeInMinutes < closeTime) ? 'Aberto' : 'Fechado';
  };

  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      const ticker = (p.ticker || "").toUpperCase();
      const matchesSearch = ticker.includes(search.toUpperCase());
      const matchesCategory = filter === 'all' || p.category === filter;
      const matchesExchange = exchangeFilter === 'all' || p.exchange === exchangeFilter;
      return matchesSearch && matchesCategory && matchesExchange;
    });
  }, [prices, search, filter, exchangeFilter]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col md:flex-row items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-xl led-glow-blue">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-6xl font-headline font-bold text-white tracking-tighter led-text-blue">Terminal Global</h2>
          </div>
          <p className="text-white/40 font-medium text-xl max-w-2xl">Monitoramento de alta densidade em 12 bolsas mundiais via Brapi Pro & Nexus Neural Sync.</p>
        </div>

        <div className="flex items-center gap-6 bg-[#080D18]/90 border border-white/10 p-6 rounded-[2rem] shadow-2xl">
          <div className="flex flex-col items-center px-8 border-r border-white/10">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] mb-1">Radar Vivo</span>
            <span className="text-3xl font-bold text-white">{prices.length}</span>
          </div>
          <div className="flex items-center gap-4 px-4">
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-[0.4em]">PRO FEED ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-primary group-focus-within:led-text-blue transition-all" />
            <Input 
              placeholder="Pesquisar Ticker Global (AAPL, VALE3, BTC, HGLG11)..."
              className="h-20 pl-20 bg-[#080D18]/95 border-white/10 rounded-[1.5rem] text-xl font-bold focus-visible:ring-primary shadow-2xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[#080D18]/90 border border-white/10 p-2.5 rounded-[1.5rem] gap-2">
              {[
                { id: 'all', label: 'TODOS', icon: Globe },
                { id: 'stocks', label: 'AÇÕES', icon: TrendingUp },
                { id: 'fiis', label: 'FIIs', icon: Building2 },
                { id: 'crypto', label: 'CRIPTO', icon: Zap }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilter(btn.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-8 py-4 rounded-xl text-[10px] font-bold tracking-widest transition-all",
                    filter === btn.id ? "bg-primary text-white shadow-xl led-glow-blue" : "text-muted-foreground hover:text-white"
                  )}
                >
                  <btn.icon className="h-4 w-4" /> {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
          <button
            onClick={() => setExchangeFilter('all')}
            className={cn(
              "px-8 py-3 rounded-xl text-[10px] font-bold transition-all uppercase tracking-[0.3em] border",
              exchangeFilter === 'all' ? "bg-accent text-white border-accent led-glow-accent" : "bg-[#080D18] text-muted-foreground border-white/10"
            )}
          >
            GLOBAL RADAR
          </button>
          {Object.keys(EXCHANGES_CONFIG).map((ex) => {
            const status = getMarketStatus(ex);
            return (
              <button
                key={ex}
                onClick={() => setExchangeFilter(ex)}
                className={cn(
                  "px-6 py-3 rounded-xl text-[10px] font-bold transition-all uppercase tracking-[0.2em] border flex items-center gap-3",
                  exchangeFilter === ex ? "bg-primary text-white border-primary shadow-lg" : "bg-[#080D18] text-muted-foreground border-white/10"
                )}
              >
                {ex} 
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  status === 'Aberto' ? "bg-emerald-500 led-glow-blue" : "bg-rose-500"
                )} />
              </button>
            );
          })}
        </div>
      </div>

      {filteredPrices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPrices.map((price) => {
            const isUp = price.change24h > 0;
            const status = price.exchange ? getMarketStatus(price.exchange) : 'Fechado';
            
            return (
              <Card key={price.ticker} className="bg-[#080D18]/95 border-white/10 hover:border-primary/40 transition-all group relative overflow-hidden rounded-[2.5rem] shadow-2xl">
                <CardContent className="p-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-5">
                      {price.logo ? (
                        <img src={price.logo} alt={price.ticker} className="w-14 h-14 rounded-2xl bg-white p-2 border border-white/10 shadow-sm object-contain" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                          {price.category === 'fiis' ? <Building2 className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[8px] border-primary/30 text-primary uppercase font-bold tracking-widest px-2 py-0.5">
                            {price.exchange || 'OTC'}
                          </Badge>
                          <span className={cn("text-[8px] font-bold uppercase px-2 py-0.5 rounded", status === 'Aberto' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400")}>{status}</span>
                        </div>
                        <h3 className="text-3xl font-headline font-bold text-white group-hover:text-primary transition-colors">{price.ticker}</h3>
                      </div>
                    </div>
                    <div className={cn("px-4 py-2 rounded-xl border font-bold text-sm", isUp ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-rose-400 border-rose-500/20 bg-rose-500/5")}>
                      {isUp ? '+' : ''}{price.change24h.toFixed(2)}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-white tracking-tighter">
                        {price.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-white/40 font-bold text-xs uppercase tracking-widest">{price.exchange === 'B3' ? 'BRL' : 'USD'}</span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-primary">
                      <span>Fundamentos Pro</span>
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] text-white/40 uppercase font-bold tracking-widest block">Yield</span>
                        <span className="text-white font-bold text-xs">{(price.dividendYield || 0).toFixed(2)}%</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] text-white/40 uppercase font-bold tracking-widest block">
                          {price.category === 'fiis' ? 'P/VP' : 'P/L'}
                        </span>
                        <span className="text-white font-bold text-xs">
                          {price.category === 'fiis' ? (price.pvpRatio || 'N/A') : (price.peRatio || 'N/A')}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("w-full justify-center text-[9px] font-bold uppercase", (price.peRatio || 0) < 15 ? "border-emerald-500/30 text-emerald-400" : "border-white/10 text-white/40")}>
                      {price.healthStatus || 'Estável'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-40 text-center space-y-8 flex flex-col items-center">
          <Globe className="h-24 w-24 text-primary/10 animate-spin-slow" />
          <p className="text-3xl font-medium text-white/30 italic">Radar global silencioso para "{search}"</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl border-primary/30 text-primary h-14 px-12 font-bold uppercase tracking-widest hover:bg-primary/10 transition-all">
            <RefreshCw className="mr-3 h-5 w-5" /> REINICIAR SENTINELA
          </Button>
        </div>
      )}
    </div>
  );
}
