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
  LayoutDashboard, 
  Wallet, 
  MessageSquare,
  ShieldCheck,
  Zap,
  Map as MapIcon
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

  const sectorRadar = [
    { title: 'Estímulo na China', status: 'Alta Correlação', color: 'blue' },
    { title: 'Juros nos EUA', status: 'Aguardando FED', color: 'orange' },
    { title: 'Safra Brasileira', status: 'Risco Climático', color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Header Estilo Design */}
      <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-headline font-bold text-2xl tracking-tight">NEXUS AI</h1>
        </div>

        <nav className="hidden md:flex items-center bg-[#0B1221] rounded-full p-1 border border-white/10">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'nav-item-active' : 'text-muted-foreground hover:text-white'}`}
          >
            <Globe className="h-4 w-4" /> Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'portfolio' ? 'nav-item-active' : 'text-muted-foreground hover:text-white'}`}
          >
            <Wallet className="h-4 w-4" /> Meus Ativos
          </button>
          <button 
            className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-white transition-all"
          >
            <MessageSquare className="h-4 w-4" /> Nexus Chat
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDisplayMode(displayMode === 'Essencial' ? 'Completo' : 'Essencial')}
            className="rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest px-4"
          >
            MODO {displayMode.toUpperCase()}
          </Button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-8 py-8 space-y-8">
        {/* Barra de Métricas Superiores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="metric-card">
              <p className="text-[10px] font-headline font-bold text-muted-foreground uppercase tracking-widest mb-2">{m.label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-headline font-bold">{m.value}</h3>
                <div className={`flex items-center gap-1 text-[11px] font-bold ${m.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {m.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {m.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grade Principal de 3 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Esquerda: Nexus Mood */}
          <div className="lg:col-span-3">
            <WorldMood />
          </div>

          {/* Centro: Oportunidade Geopolítica */}
          <div className="lg:col-span-6">
            <div className="bg-[#0B1221] border border-white/5 rounded-[2rem] p-10 h-full relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-10 right-10 p-4 rounded-2xl bg-accent/10 border border-accent/20">
                <Zap className="h-8 w-8 text-accent" />
              </div>
              
              <div className="space-y-6 max-w-xl">
                <div>
                  <h2 className="text-4xl font-headline font-bold mb-2">Oportunidade Geopolítica</h2>
                  <p className="text-muted-foreground">Nexus detectou correlação atípica na China.</p>
                </div>

                <blockquote className="text-xl font-medium leading-relaxed italic text-white/90">
                  "O novo pacote de estímulo de Pequim está gerando um influxo de R$ 4.2B em commodities. Sua Vale (VALE3) está 15% abaixo do preço-justo preditivo."
                </blockquote>

                <div className="flex items-center gap-4 pt-4">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-primary/20">
                    Ver Relatório Completo
                  </Button>
                  <Button variant="ghost" className="text-muted-foreground hover:text-white">
                    Ignorar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Direita: Monitor Geopolítico */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#0B1221] border border-white/5 rounded-[2rem] p-8 space-y-6 h-full">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-headline font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  Monitor Geopolítico
                </h3>
                <ShieldCheck className="h-5 w-5 text-muted-foreground/30" />
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-accent/5 border border-accent/20 space-y-2">
                  <div className="flex items-center gap-2 text-accent text-[10px] font-bold uppercase tracking-wider">
                    <Globe className="h-3 w-3" /> Alerta China
                  </div>
                  <p className="text-sm font-medium leading-snug">Novo estímulo anunciado em Pequim. Expectativa de alta no minério de ferro nas próximas 48h.</p>
                </div>

                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-wider">
                    <Zap className="h-3 w-3" /> Tech Insight
                  </div>
                  <p className="text-sm font-medium leading-snug">Semicondutores sob pressão logística. Monitorando Nvidia e Intel.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Dashboard: Radar e Mapa */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <h3 className="text-sm font-headline font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-6">
              <TrendingUp className="h-4 w-4" /> Radar de Setores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sectorRadar.map((s, i) => (
                <div key={i} className="bg-[#0B1221] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                  <h4 className="font-bold text-lg">{s.title}</h4>
                  <Badge variant="outline" className={`w-fit bg-white/5 border-white/10 ${i === 1 ? 'text-orange-400' : 'text-emerald-400'}`}>
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
             <div className="bg-[#0B1221] border border-white/5 rounded-[2rem] p-8 h-full flex flex-col items-center justify-center text-center space-y-4">
               <div className="p-4 rounded-2xl bg-white/5">
                 <MapIcon className="h-8 w-8 text-primary" />
               </div>
               <div>
                 <h4 className="font-bold text-lg mb-1">Nexus World Map</h4>
                 <p className="text-xs text-muted-foreground px-4">Explore o fluxo de capital global através do mapa de calor do Nexus.</p>
               </div>
               <Button variant="outline" className="w-full rounded-xl border-white/10 hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest py-6">
                 Abrir Mapa Mundial
               </Button>
             </div>
          </div>
        </div>
      </main>

      <AssistantChat assets={[]} displayMode={displayMode} />
    </div>
  );
}