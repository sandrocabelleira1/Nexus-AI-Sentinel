"use client"

import { useState, useEffect } from "react";
import { WorldMood } from "@/components/dashboard/world-mood";
import { UserAsset, DisplayMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  Globe, 
  Wallet, 
  MessageSquare,
  ShieldCheck,
  Zap,
  Map as MapIcon,
  ChevronRight
} from "lucide-react";
import { AssistantChat } from "@/components/ai/assistant-chat";
import { Badge } from "@/components/ui/badge";

export default function NexusDashboard() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('Essencial');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const metrics = [
    { label: 'IBOVESPA', value: '132.450', change: '+0.85%', trend: 'up' },
    { label: 'S&P 500', value: '5.120', change: '-0.12%', trend: 'down' },
    { label: 'BITCOIN', value: 'US$ 64.120', change: '+2.4%', trend: 'up' },
    { label: 'DÓLAR', value: 'R$ 5,08', change: '-0.45%', trend: 'down' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 selection:bg-primary selection:text-white">
      {/* Header Command Center Style */}
      <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-2xl bg-primary/20 border border-primary/30 led-glow-blue">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-2xl tracking-tight leading-none">NEXUS AI</h1>
            <span className="text-[9px] text-primary font-bold uppercase tracking-[0.4em] opacity-70">Sentinel Core v2.6</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center bg-[#080D18] rounded-2xl p-1 border border-white/10 shadow-inner">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'nav-item-active' : 'text-muted-foreground hover:text-white'}`}
          >
            <Globe className="h-4 w-4" /> DASHBOARD
          </button>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'portfolio' ? 'nav-item-active' : 'text-muted-foreground hover:text-white'}`}
          >
            <Wallet className="h-4 w-4" /> PATRIMÔNIO
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDisplayMode(displayMode === 'Essencial' ? 'Completo' : 'Essencial')}
            className="rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest px-6 h-10 hover:bg-white/10"
          >
            MODO: <span className="text-primary ml-1">{displayMode}</span>
          </Button>
          <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative">
            <Zap className="h-5 w-5 text-accent animate-pulse-glow" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-8 py-10 space-y-10">
        {/* Metric Grid with LED Borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <div key={i} className="bg-[#080D18] border border-white/5 rounded-3xl p-7 transition-all hover:border-primary/20 group cursor-pointer shadow-lg">
              <p className="text-[10px] font-headline font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 group-hover:text-primary transition-colors">{m.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-headline font-bold tracking-tighter">{m.value}</h3>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${m.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {m.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {m.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Central Dashboard Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* World Mood Gauge */}
          <div className="lg:col-span-3">
            <WorldMood />
          </div>

          {/* Main Intelligence Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#080D18] border border-white/10 rounded-[3rem] p-12 h-full relative overflow-hidden flex flex-col justify-center shadow-2xl group transition-all hover:border-accent/30">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="absolute top-12 right-12 p-5 rounded-3xl bg-accent/10 border border-accent/20 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                <Zap className="h-10 w-10 text-accent animate-pulse" />
              </div>
              
              <div className="space-y-8 max-w-2xl z-10">
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent font-bold px-4 py-1.5 rounded-xl uppercase tracking-widest text-[10px]">Alerta Crítico</Badge>
                  <h2 className="text-5xl font-headline font-bold leading-[1.1] tracking-tight">Oportunidade Geopolítica</h2>
                  <p className="text-lg text-muted-foreground font-medium">Nexus detectou correlação atípica no mercado asiático.</p>
                </div>

                <blockquote className="text-2xl font-medium leading-relaxed italic text-white/90 border-l-4 border-accent pl-8 py-2">
                  "O novo pacote de estímulo de Pequim está gerando um influxo de <span className="text-accent led-text-accent">R$ 4.2B</span> em commodities. Sua posição em <span className="text-primary underline underline-offset-8">Vale (VALE3)</span> está 15% abaixo do preço-justo preditivo."
                </blockquote>

                <div className="flex items-center gap-6 pt-6">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-10 h-16 font-bold text-lg shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                    ANALISAR IMPACTO <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="ghost" className="text-muted-foreground hover:text-white font-bold h-16 px-8 rounded-2xl">
                    IGNORAR GATILHO
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel Monitoring */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-[#080D18] border border-white/10 rounded-[2.5rem] p-10 space-y-8 h-full shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-headline font-bold uppercase tracking-[0.3em] text-primary led-text-blue">
                  SENTINEL MONITOR
                </h3>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="space-y-6">
                {[
                  { tag: 'China', icon: Globe, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', msg: 'Estímulo anunciado. Alta no minério prevista em 48h.' },
                  { tag: 'Tech', icon: Zap, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', msg: 'Semicondutores sob pressão logística na Malásia.' },
                  { tag: 'Agro', icon: MapIcon, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', msg: 'Geada no Paraná pode afetar contratos de café.' }
                ].map((item, idx) => (
                  <div key={idx} className={`p-6 rounded-[2rem] ${item.bg} border ${item.border} space-y-3 transition-transform hover:scale-[1.02] cursor-pointer`}>
                    <div className={`flex items-center gap-2 ${item.color} text-[10px] font-bold uppercase tracking-widest`}>
                      <item.icon className="h-4 w-4" /> Alerta {item.tag}
                    </div>
                    <p className="text-sm font-semibold leading-relaxed text-white/80">{item.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <AssistantChat assets={[]} displayMode={displayMode} />
    </div>
  );
}
