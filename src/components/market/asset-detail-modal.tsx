"use client"

import React, { useMemo } from "react"
import { MarketPrice, CandleData } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Building2, 
  Coins, 
  Activity, 
  Globe, 
  Zap, 
  CalendarDays, 
  CheckCircle2, 
  Warehouse,
  BarChart3,
  LineChart,
  Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Line
} from "recharts"

interface AssetDetailModalProps {
  asset: MarketPrice | null
  isOpen: boolean
  onClose: () => void
  onAnalyze?: (context: string) => void
}

export function AssetDetailModal({ asset, isOpen, onClose, onAnalyze }: AssetDetailModalProps) {
  if (!asset) return null

  const isUp = asset.change24h > 0
  const isUSD = asset.currency === 'USD'
  const isFii = asset.category === 'fiis'

  // Simulação de dados se não existirem
  const sparklineData = useMemo(() => {
    if (asset.sparkline) return asset.sparkline.map((v, i) => ({ time: i, value: v }))
    // Fallback: Gera flutuação simulada
    return Array.from({ length: 24 }).map((_, i) => ({
      time: i,
      value: asset.price * (1 + (Math.random() * 0.04 - 0.02))
    }))
  }, [asset])

  const candleData = useMemo(() => {
    if (asset.candles) return asset.candles
    // Fallback: Gera velas táticas
    return Array.from({ length: 15 }).map((_, i) => {
      const base = asset.price * (1 + (Math.random() * 0.02 - 0.01))
      const open = base * (1 + (Math.random() * 0.01 - 0.005))
      const close = base * (1 + (Math.random() * 0.01 - 0.005))
      return {
        time: `${i}h`,
        open,
        close,
        high: Math.max(open, close) * 1.002,
        low: Math.min(open, close) * 0.998,
      }
    })
  }, [asset])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-panel border-white/10 w-[95vw] max-w-[1000px] max-h-[90vh] overflow-y-auto custom-scrollbar p-0 rounded-[2.5rem]">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
        
        <DialogHeader className="p-8 pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary led-glow-blue overflow-hidden">
                {asset.logo ? (
                  <img src={asset.logo} alt={asset.ticker} className="w-full h-full object-contain p-2" />
                ) : (
                  isFii ? <Building2 className="h-8 w-8" /> : isUSD ? <Coins className="h-8 w-8" /> : <TrendingUp className="h-8 w-8" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] border-primary/40 text-primary font-bold tracking-widest uppercase">
                    {asset.exchange || (isUSD ? 'BINANCE' : 'B3')}
                  </Badge>
                  {isFii && <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">{asset.fiiType || 'Misto'}</Badge>}
                </div>
                <DialogTitle className="text-3xl font-headline font-bold text-white tracking-tighter led-text-blue">
                  {asset.ticker}
                </DialogTitle>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-4xl font-bold text-white tracking-tighter">
                {asset.price.toLocaleString(isUSD ? 'en-US' : 'pt-BR', { 
                  style: 'currency', 
                  currency: isUSD ? 'USD' : 'BRL',
                  maximumFractionDigits: isUSD ? 4 : 2 
                })}
              </div>
              <div className={cn("text-sm font-bold flex items-center justify-end gap-1 mt-1", isUp ? "text-emerald-400" : "text-rose-400")}>
                {isUp ? '+' : ''}{asset.change24h.toFixed(2)}% (24h)
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#080D18]/90 border border-white/10 rounded-[2rem] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Telemetria Candlestick</span>
                </div>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold">LIVE STREAM</Badge>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={candleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#080D18', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="close" barSize={12}>
                      {candleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.close > entry.open ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                    <Line type="monotone" dataKey="high" stroke="rgba(255,255,255,0.2)" dot={false} strokeWidth={1} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <LineChart className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Alta 24h</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {(asset.price * 1.02).toLocaleString(isUSD ? 'en-US' : 'pt-BR', { style: 'currency', currency: isUSD ? 'USD' : 'BRL' })}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-rose-400">
                  <LineChart className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Baixa 24h</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {(asset.price * 0.98).toLocaleString(isUSD ? 'en-US' : 'pt-BR', { style: 'currency', currency: isUSD ? 'USD' : 'BRL' })}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <Target className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Alvo Nexus</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {(asset.price * 1.15).toLocaleString(isUSD ? 'en-US' : 'pt-BR', { style: 'currency', currency: isUSD ? 'USD' : 'BRL' })}
                </div>
              </div>
            </div>
          </div>

          {/* Side Info Panel */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#080D18]/90 border border-white/10 rounded-[2rem] p-6 space-y-6 shadow-2xl">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Fundamentos Ativos</span>
              </div>

              {isFii ? (
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl space-y-1">
                      <span className="text-[8px] text-muted-foreground font-bold uppercase">P/VP</span>
                      <div className={cn("text-lg font-bold", (asset.pvpRatio || 1) < 1 ? "text-emerald-400" : "text-white")}>
                        {(asset.pvpRatio || 1.0).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl space-y-1">
                      <span className="text-[8px] text-muted-foreground font-bold uppercase">Vacância</span>
                      <div className="text-lg font-bold text-white">
                        {(asset.vacancyRate || 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                       <span className="text-[8px] text-primary font-bold uppercase">Dividend Yield AM</span>
                       <Badge className="bg-emerald-600 text-[8px]">{(asset.dividendYield || 0).toFixed(2)}%</Badge>
                    </div>
                    <div className="text-xl font-bold text-white">
                      R$ {(asset.dividendAmount || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">P/L Projetado</span>
                    <span className="text-sm font-bold text-white">{(asset.peRatio || 12.5).toFixed(1)}x</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">Status Saúde</span>
                    <span className="text-sm font-bold text-emerald-400">{asset.healthStatus || 'Saudável'}</span>
                  </div>
                </div>
              )}

              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                 <p className="text-[11px] text-white/60 italic leading-relaxed">
                   "{asset.nexusVerdict || 'O Nexus está avaliando as sinapses do mercado para este ativo.'}"
                 </p>
              </div>

              <button 
                onClick={() => onAnalyze?.(`Execute comando Nexus de análise 360 para o ativo ${asset.ticker}.`)}
                className="w-full h-14 bg-primary text-background font-bold text-xs rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:scale-105 transition-all"
              >
                SOLICITAR ANÁLISE 360°
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Atividade de Baleias</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-white/40">Acumulação 24h</span>
                  <span className="text-[10px] font-bold text-emerald-400">+12.4M USD</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-[10px] text-white/40">Liquidez em Exchange</span>
                  <span className="text-[10px] font-bold text-rose-400">-3.1M USD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
