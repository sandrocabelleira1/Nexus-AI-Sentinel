
"use client"

import { useState, useMemo } from "react";
import { MarketPrice } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Globe, 
  Zap, 
  Landmark, 
  Activity,
  Filter,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketExplorerProps {
  prices: MarketPrice[];
}

export function MarketExplorer({ prices }: MarketExplorerProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<'all' | 'crypto' | 'stocks' | 'fiis'>('all');

  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      const matchesSearch = p.ticker.toLowerCase().includes(search.toLowerCase());
      if (filter === 'all') return matchesSearch;
      if (filter === 'crypto') return matchesSearch && (p.ticker.length <= 4 || p.ticker === 'BITCOIN');
      if (filter === 'stocks') return matchesSearch && p.ticker.length > 4 && !p.ticker.endsWith('11');
      if (filter === 'fiis') return matchesSearch && p.ticker.endsWith('11');
      return matchesSearch;
    }).sort((a, b) => b.ticker.localeCompare(a.ticker));
  }, [prices, search, filter]);

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
          <p className="text-muted-foreground font-medium text-lg">Radar global de ativos integrados via Nexus Sentinel Hub.</p>
        </div>

        <div className="flex items-center gap-4 bg-[#080D18]/90 border border-white/10 p-4 rounded-3xl shadow-xl">
          <div className="flex flex-col items-center px-6 border-r border-white/5">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Ativos Ativos</span>
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

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary opacity-50" />
          <Input 
            placeholder="Pesquisar ticker (ex: BTC, VALE3, NVDA)..."
            className="h-16 pl-16 bg-[#080D18]/90 border-white/10 rounded-2xl text-lg font-medium focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
                "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all",
                filter === btn.id ? "bg-primary text-white shadow-lg led-glow-blue" : "text-muted-foreground hover:text-white"
              )}
            >
              <btn.icon className="h-4 w-4" /> {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPrices.map((price) => {
          const isUp = price.change24h > 0;
          const isIndex = price.ticker === 'IBOV' || price.ticker === 'DOLAR';
          
          return (
            <Card key={price.ticker} className="bg-[#080D18]/95 border-white/10 hover:border-primary/40 transition-all group cursor-pointer relative overflow-hidden rounded-[2rem] shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-bold tracking-widest mb-2 uppercase">
                      {price.ticker.length <= 4 && !isIndex ? 'Cripto (Binance)' : price.ticker.endsWith('11') ? 'FII (B3)' : isIndex ? 'Índice/Moeda' : 'Ação'}
                    </Badge>
                    <h3 className="text-3xl font-headline font-bold text-white led-text-blue">{price.ticker}</h3>
                  </div>
                  <div className={cn(
                    "p-3 rounded-xl border font-bold flex items-center gap-1 text-xs",
                    isUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  )}>
                    {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {price.change24h.toFixed(2)}%
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Cotação Atual</span>
                  <div className="text-3xl font-bold text-white">
                    {price.ticker === 'IBOV' ? price.price.toLocaleString() : 
                     (price.ticker.length <= 4 && price.ticker !== 'IBOV' ? 'US$ ' : 'R$ ') + 
                     price.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Atualizado há 1 min
                  </span>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse led-glow-blue" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredPrices.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 opacity-40">
            <Search className="h-12 w-12 mx-auto" />
            <p className="text-xl font-medium">Nenhum ativo encontrado para "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
