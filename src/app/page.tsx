"use client"

import { useState } from "react";
import { WorldMood } from "@/components/dashboard/world-mood";
import { AssetType, DisplayMode, UserAsset } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  Globe, 
  Wallet, 
  Zap, 
  Map as MapIcon, 
  ChevronRight,
  Activity,
  ShieldCheck,
  Terminal,
  Plus
} from "lucide-react";
import { AssistantChat } from "@/components/ai/assistant-chat";
import { Badge } from "@/components/ui/badge";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
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

const initialMockAssets: UserAsset[] = [
  { id: '1', name: 'VALE3', type: 'Ação', location: 'XP Investimentos', riskLevel: 'Moderado', investedValue: 45000, quantity: 500 },
  { id: '2', name: 'BITCOIN', type: 'Criptomoeda', location: 'Ledger Nano X', riskLevel: 'Agressivo', investedValue: 120000, quantity: 0.42 },
  { id: '3', name: 'HGLG11', type: 'Fundo Imobiliário', location: 'BTG Pactual', riskLevel: 'Conservador', investedValue: 32000, quantity: 200 },
  { id: '4', name: 'OURO', type: 'Commodity', location: 'Reserva Física', riskLevel: 'Conservador', investedValue: 85000, quantity: 15 },
];

export default function NexusDashboard() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('Essencial');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio'>('dashboard');
  const [assets, setAssets] = useState<UserAsset[]>(initialMockAssets);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [newAsset, setNewAsset] = useState<Partial<UserAsset>>({
    name: '',
    type: 'Ação',
    location: '',
    riskLevel: 'Moderado',
    investedValue: 0,
    quantity: 0
  });

  const metrics = [
    { label: 'IBOVESPA', value: '132.450', change: '+0.85%', trend: 'up' },
    { label: 'S&P 500', value: '5.120', change: '-0.12%', trend: 'down' },
    { label: 'BITCOIN', value: 'US$ 64.120', change: '+2.4%', trend: 'up' },
    { label: 'DÓLAR', value: 'R$ 5,08', change: '-0.45%', trend: 'down' },
  ];

  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.location) return;
    
    const asset: UserAsset = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAsset.name.toUpperCase(),
      type: (newAsset.type as AssetType) || 'Ação',
      location: newAsset.location,
      riskLevel: newAsset.riskLevel as any,
      investedValue: Number(newAsset.investedValue) || 0,
      quantity: Number(newAsset.quantity) || 0
    };

    setAssets(prev => [asset, ...prev]);
    setIsDialogOpen(false);
    setNewAsset({ name: '', type: 'Ação', location: '', riskLevel: 'Moderado', investedValue: 0, quantity: 0 });
  };

  const handleUpdateAsset = (id: string, newQuantity: number, newValue: number) => {
    setAssets(prev => prev.map(a => 
      a.id === id ? { ...a, quantity: newQuantity, investedValue: newValue } : a
    ));
  };

  return (
    <div className="min-h-screen relative selection:bg-primary selection:text-white">
      {/* Grade Cibernética de Fundo */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />

      {/* Header Estilo Centro de Comando */}
      <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-5">
          <div className="p-3 rounded-2xl bg-primary/20 border border-primary/40 led-glow-blue animate-pulse">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-2xl tracking-tight leading-none led-text-blue">NEXUS AI</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-primary font-bold uppercase tracking-[0.4em] opacity-80">Sentinel Core v2.6</span>
              <Badge variant="outline" className="h-4 px-1.5 text-[8px] bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold">ONLINE</Badge>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center bg-[#080D18] rounded-2xl p-1 border border-white/10 shadow-2xl">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-10 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'dashboard' ? 'nav-item-active' : 'text-muted-foreground hover:text-white'}`}
          >
            <Globe className="h-4 w-4" /> DASHBOARD
          </button>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-10 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'portfolio' ? 'nav-item-active' : 'text-muted-foreground hover:text-white'}`}
          >
            <Wallet className="h-4 w-4" /> WALLET
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDisplayMode(displayMode === 'Essencial' ? 'Completo' : 'Essencial')}
            className="rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest px-6 h-10 hover:bg-white/10 transition-colors"
          >
            MODO: <span className="text-primary ml-1">{displayMode}</span>
          </Button>
          <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group">
            <Zap className="h-5 w-5 text-accent animate-pulse" />
            <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-8 py-10 space-y-10 relative z-10">
        {activeTab === 'dashboard' ? (
          <>
            {/* Metric Grid - LED Accents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((m, i) => (
                <div key={i} className="bg-[#080D18]/90 border border-white/10 rounded-3xl p-7 transition-all hover:border-primary/40 group cursor-pointer shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-[10px] font-headline font-bold text-muted-foreground uppercase tracking-[0.3em] mb-4 group-hover:text-primary transition-colors">{m.label}</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-headline font-bold tracking-tighter text-white group-hover:scale-105 transition-transform origin-left">{m.value}</h3>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold ${m.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]'}`}>
                      {m.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
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
                <div className="bg-[#080D18]/95 border border-white/10 rounded-[3rem] p-12 h-full relative overflow-hidden flex flex-col justify-center shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)] group transition-all hover:border-accent/40">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                  <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/30 transition-colors" />
                  <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
                  
                  <div className="absolute top-12 right-12 p-6 rounded-3xl bg-accent/10 border border-accent/20 shadow-[0_0_40px_rgba(249,115,22,0.2)]">
                    <Zap className="h-10 w-10 text-accent animate-pulse" />
                  </div>
                  
                  <div className="space-y-10 max-w-2xl z-10">
                    <div className="space-y-3">
                      <Badge className="bg-accent text-white font-bold px-5 py-2 rounded-xl uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(249,115,22,0.5)]">ALERTA CRÍTICO</Badge>
                      <h2 className="text-6xl font-headline font-bold leading-[1.05] tracking-tight text-white">Impacto Geopolítico</h2>
                      <p className="text-xl text-muted-foreground font-medium flex items-center gap-3">
                        <Terminal className="h-5 w-5 text-primary" />
                        Nexus detectou anomalias nas rotas do minério.
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-6 top-0 bottom-0 w-1 bg-accent/50 rounded-full" />
                      <blockquote className="text-2xl font-medium leading-relaxed italic text-white/95 pl-4">
                        "O novo pacote de estímulo de Pequim está gerando um influxo de <span className="text-accent led-text-accent font-bold">R$ 4.2B</span> em commodities. Sua posição em <span className="text-primary underline underline-offset-[12px] decoration-primary/40 led-text-blue">Vale (VALE3)</span> está 15% abaixo do preço-justo preditivo."
                      </blockquote>
                    </div>

                    <div className="flex items-center gap-8 pt-8">
                      <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-12 h-16 font-bold text-xl shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95">
                        ANALISAR IMPACTO <ChevronRight className="ml-2 h-6 w-6" />
                      </Button>
                      <Button variant="ghost" className="text-muted-foreground hover:text-white font-bold h-16 px-10 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/5">
                        IGNORAR GATILHO
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel Monitoring */}
              <div className="lg:col-span-3 space-y-8">
                <div className="bg-[#080D18]/90 border border-white/10 rounded-[2.5rem] p-10 space-y-10 h-full shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-xs font-headline font-bold uppercase tracking-[0.4em] text-primary led-text-blue">
                      SENTINEL MONITOR
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">Live</span>
                    </div>
                  </div>

                  <div className="space-y-8 relative z-10">
                    {[
                      { tag: 'Geopolítica', icon: Globe, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30', msg: 'Estímulo anunciado em Pequim. Alta no minério prevista em 48h.' },
                      { tag: 'Tecnologia', icon: Zap, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', msg: 'Semicondutores sob pressão logística na Malásia. Impacto em NVDA.' },
                      { tag: 'Agronegócio', icon: MapIcon, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', msg: 'Geada no Paraná detectada por satélite. Risco em Fiagros.' }
                    ].map((item, idx) => (
                      <div key={idx} className={`p-8 rounded-[2.5rem] ${item.bg} border ${item.border} space-y-4 transition-all hover:scale-[1.03] cursor-pointer hover:shadow-2xl`}>
                        <div className={`flex items-center gap-3 ${item.color} text-[11px] font-bold uppercase tracking-[0.2em]`}>
                          <item.icon className="h-5 w-5" /> {item.tag}
                        </div>
                        <p className="text-sm font-semibold leading-relaxed text-white/90 leading-relaxed">{item.msg}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                          <ShieldCheck className="h-3 w-3" /> VERIFICADO PELO NEXUS
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                <h2 className="text-5xl font-headline font-bold text-white tracking-tight">Sua Wallet</h2>
                <p className="text-muted-foreground font-medium text-lg">Monitoramento em tempo real de ativos globais.</p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-8 font-bold gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                    <Plus className="h-5 w-5" /> ADICIONAR ATIVO
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-panel border-primary/20 sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline font-bold text-white led-text-blue">Novo Ativo</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Registre um novo ativo na sua Wallet Sentinel.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-white font-bold uppercase tracking-widest text-[10px]">Nome do Ativo (Ticker)</Label>
                      <Input 
                        id="name" 
                        placeholder="Ex: PETR4, ETH" 
                        className="bg-white/5 border-white/10 text-white"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type" className="text-white font-bold uppercase tracking-widest text-[10px]">Tipo</Label>
                      <Select 
                        value={newAsset.type} 
                        onValueChange={(v) => setNewAsset(prev => ({ ...prev, type: v as any }))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#080D18] border-white/10 text-white">
                          <SelectItem value="Ação">Ação</SelectItem>
                          <SelectItem value="Criptomoeda">Criptomoeda</SelectItem>
                          <SelectItem value="Fundo Imobiliário">Fundo Imobiliário</SelectItem>
                          <SelectItem value="Commodity">Commodity</SelectItem>
                          <SelectItem value="Moeda">Moeda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="invested" className="text-white font-bold uppercase tracking-widest text-[10px]">Valor Investido (R$)</Label>
                        <Input 
                          id="invested" 
                          type="number"
                          placeholder="0.00" 
                          className="bg-white/5 border-white/10 text-white"
                          value={newAsset.investedValue}
                          onChange={(e) => setNewAsset(prev => ({ ...prev, investedValue: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="qty" className="text-white font-bold uppercase tracking-widest text-[10px]">Quantidade</Label>
                        <Input 
                          id="qty" 
                          type="number"
                          placeholder="0" 
                          className="bg-white/5 border-white/10 text-white"
                          value={newAsset.quantity}
                          onChange={(e) => setNewAsset(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location" className="text-white font-bold uppercase tracking-widest text-[10px]">Localização / Custódia</Label>
                      <Input 
                        id="location" 
                        placeholder="Ex: XP, Binance, Ledger" 
                        className="bg-white/5 border-white/10 text-white"
                        value={newAsset.location}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="risk" className="text-white font-bold uppercase tracking-widest text-[10px]">Nível de Risco</Label>
                      <Select 
                        value={newAsset.riskLevel} 
                        onValueChange={(v) => setNewAsset(prev => ({ ...prev, riskLevel: v as any }))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Selecione o risco" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#080D18] border-white/10 text-white">
                          <SelectItem value="Conservador">Conservador</SelectItem>
                          <SelectItem value="Moderado">Moderado</SelectItem>
                          <SelectItem value="Agressivo">Agressivo</SelectItem>
                          <SelectItem value="Crítico">Crítico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      onClick={handleAddAsset}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                    >
                      CONFIRMAR REGISTRO
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <PortfolioView 
              assets={assets} 
              onUpdateAsset={handleUpdateAsset}
            />
          </div>
        )}
      </main>

      <AssistantChat assets={assets} displayMode={displayMode} />
    </div>
  );
}
