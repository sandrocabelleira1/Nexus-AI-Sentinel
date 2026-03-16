
"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { WorldMood } from "@/components/dashboard/world-mood";
import { AssetType, DisplayMode, UserAsset, GlobalIntelligenceAlert } from "@/lib/types";
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
  Plus,
  Clock,
  Loader2,
  Scan,
  Sparkles,
  Info,
  BarChart4,
  MapPin,
  MessageSquare
} from "lucide-react";
import { AssistantChat } from "@/components/ai/assistant-chat";
import { Badge } from "@/components/ui/badge";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { useCollection, useFirestore, useMemoFirebase, useUser, useAuth, initiateAnonymousSignIn, addDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { monitorGlobalEvents } from "@/ai/flows/global-intelligence-monitor";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | null>(null);

  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Autenticação anônima automática
  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // Escutando Alertas Globais do Firestore (Hub de Eventos Real-Time)
  const alertsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, "global_intelligence_alerts"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
  }, [firestore, user]);

  const { data: globalAlerts, isLoading: isLoadingAlerts } = useCollection<GlobalIntelligenceAlert>(alertsQuery);
  const latestAlert = globalAlerts?.[0];

  const [newAsset, setNewAsset] = useState<Partial<UserAsset>>({
    name: '',
    type: 'Ação',
    location: '',
    riskLevel: 'Moderado',
    investedValue: 0,
    quantity: 0
  });

  const triggerGlobalScan = useCallback(async () => {
    if (!user || isScanning) return;
    setIsScanning(true);
    
    try {
      const result = await monitorGlobalEvents({ 
        rawNewsData: "IDENTIFIQUE O EVENTO GLOBAL REAL MAIS CRÍTICO NAS ÚLTIMAS 24H (GEOPOLÍTICA, CLIMA OU FINANÇAS) E ANALISE O IMPACTO." 
      });
      
      if (result) {
        addDocumentNonBlocking(collection(firestore, "global_intelligence_alerts"), {
          ...result,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      // Erros tratados pelo FirebaseErrorListener
    } finally {
      setIsScanning(false);
    }
  }, [user, isScanning, firestore]);

  useEffect(() => {
    if (user && !isUserLoading) {
      const interval = setInterval(() => {
        triggerGlobalScan();
      }, 600000); // 10 minutos
      return () => clearInterval(interval);
    }
  }, [user, isUserLoading, triggerGlobalScan]);

  const discussWithNexus = (alertTitle: string) => {
    setChatInitialQuery(`Nexus, vamos discutir sobre o alerta: "${alertTitle}". Qual sua visão estratégica detalhada?`);
    setIsChatOpen(true);
    setIsRecommendationOpen(false);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-primary font-headline font-bold animate-pulse tracking-widest">INICIALIZANDO SENTINELA REAL-TIME...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative selection:bg-primary selection:text-white">
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />

      <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-5">
          <div className="p-3 rounded-2xl bg-primary/20 border border-primary/40 led-glow-blue animate-pulse">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-2xl tracking-tight leading-none led-text-blue">NEXUS AI</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-primary font-bold uppercase tracking-[0.4em] opacity-80">Sentinel Core v2.6 - REAL-TIME</span>
              <Badge variant="outline" className="h-4 px-1.5 text-[8px] bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold">SENTINELA ATIVA</Badge>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'IBOVESPA', value: '132.450', change: '+0.85%', trend: 'up' },
                { label: 'S&P 500', value: '5.120', change: '-0.12%', trend: 'down' },
                { label: 'BITCOIN', value: 'US$ 64.120', change: '+2.4%', trend: 'up' },
                { label: 'DÓLAR', value: 'R$ 5,08', change: '-0.45%', trend: 'down' },
              ].map((m, i) => (
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
                <WorldMood />
              </div>

              <div className="lg:col-span-6">
                <div className="bg-[#080D18]/95 border border-white/10 rounded-[3rem] p-12 h-full min-h-[500px] relative overflow-hidden flex flex-col justify-center shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)] group transition-all hover:border-accent/40">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                  <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary/30 transition-colors" />
                  <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
                  
                  {isScanning ? (
                    <div className="flex flex-col items-center justify-center space-y-6 py-20 z-10">
                      <div className="relative h-24 w-24">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-primary font-headline font-bold text-xl tracking-widest led-text-blue">NEXUS VARRENDO O GLOBO...</p>
                        <p className="text-muted-foreground text-sm font-medium animate-pulse">Captando sinais reais de mercados e geopolítica</p>
                      </div>
                    </div>
                  ) : isLoadingAlerts ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-20">
                      <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-primary font-bold animate-pulse">Sincronizando com Nexus Hub...</p>
                    </div>
                  ) : latestAlert ? (
                    <div className="space-y-10 max-w-2xl z-10 animate-in fade-in duration-700">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Badge className="bg-accent text-white font-bold px-5 py-2 rounded-xl uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(249,115,22,0.5)]">
                            ALERTA {latestAlert.priority >= 4 ? 'CRÍTICO' : 'INTELIGENTE'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(latestAlert.createdAt), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        <h2 className="text-5xl font-headline font-bold leading-[1.05] tracking-tight text-white">{latestAlert.title}</h2>
                        <p className="text-xl text-muted-foreground font-medium flex items-center gap-3">
                          <Terminal className="h-5 w-5 text-primary" />
                          Fonte: {latestAlert.eventOrigin} (Inteligência Real)
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-accent/50 rounded-full" />
                        <blockquote className="text-2xl font-medium leading-relaxed italic text-white/95 pl-4">
                          "{displayMode === 'Essencial' ? latestAlert.essentialText : latestAlert.fullTechnicalAnalysis}"
                        </blockquote>
                      </div>

                      <div className="flex items-center gap-8 pt-8">
                        <Dialog open={isRecommendationOpen} onOpenChange={setIsRecommendationOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-12 h-16 font-bold text-xl shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95">
                              RECOMENDAÇÃO NEXUS <ChevronRight className="ml-2 h-6 w-6" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-panel border-primary/20 max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden">
                            <DialogHeader className="p-8 border-b border-white/10 bg-primary/5">
                              <div className="flex items-center gap-4 mb-4">
                                <Badge className="bg-primary text-white font-bold">{latestAlert.marketAction} SIGNAL</Badge>
                                <Badge variant="outline" className="border-primary/30 text-primary">RISCO {latestAlert.riskLevel.toUpperCase()}</Badge>
                              </div>
                              <DialogTitle className="text-3xl font-headline font-bold text-white led-text-blue">{latestAlert.title}</DialogTitle>
                              <DialogDescription className="text-muted-foreground flex items-center gap-2 mt-2">
                                <Clock className="h-4 w-4" /> Gerado pelo Nexus Sentinel em {new Date(latestAlert.createdAt).toLocaleString('pt-BR')}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <ScrollArea className="flex-1 p-8">
                              <div className="space-y-8 pb-8">
                                <section className="space-y-4">
                                  <h4 className="text-xs font-headline font-bold text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Info className="h-4 w-4" /> Nexus Causal Link
                                  </h4>
                                  <p className="text-lg text-white/90 leading-relaxed font-medium">
                                    {latestAlert.causalityExplanation}
                                  </p>
                                </section>

                                {displayMode === 'Essencial' ? (
                                  <section className="space-y-4">
                                    <h4 className="text-xs font-headline font-bold text-accent uppercase tracking-[0.3em] flex items-center gap-2">
                                      <Terminal className="h-4 w-4" /> Glossário de Apoio
                                    </h4>
                                    <Accordion type="single" collapsible className="w-full">
                                      {latestAlert.essentialGlossaryTerms.map((term, i) => (
                                        <AccordionItem key={i} value={`term-${i}`} className="border-white/5">
                                          <AccordionTrigger className="text-white hover:text-primary transition-colors text-sm font-bold">
                                            {term}
                                          </AccordionTrigger>
                                          <AccordionContent className="text-muted-foreground text-sm">
                                            O Nexus identificou este termo como fundamental para entender a dinâmica atual do mercado relacionada ao evento {latestAlert.eventOrigin}.
                                          </AccordionContent>
                                        </AccordionItem>
                                      ))}
                                    </Accordion>
                                  </section>
                                ) : (
                                  <>
                                    <section className="space-y-4">
                                      <h4 className="text-xs font-headline font-bold text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                        <BarChart4 className="h-4 w-4" /> Análise Técnica Profunda
                                      </h4>
                                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 font-mono text-sm text-primary/90 leading-relaxed">
                                        {latestAlert.fullTechnicalAnalysis}
                                      </div>
                                    </section>
                                    <section className="space-y-4">
                                      <h4 className="text-xs font-headline font-bold text-accent uppercase tracking-[0.3em] flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Matriz de Risco Geográfica
                                      </h4>
                                      <p className="text-muted-foreground text-sm leading-relaxed">
                                        {latestAlert.fullLocationRiskAnalysis}
                                      </p>
                                    </section>
                                  </>
                                )}

                                <section className="space-y-4">
                                  <h4 className="text-xs font-headline font-bold text-white uppercase tracking-[0.3em]">Ativos Impactados</h4>
                                  <div className="flex flex-wrap gap-3">
                                    {latestAlert.affectedAssetTickerSymbols.map((ticker, i) => (
                                      <Badge key={i} variant="secondary" className="bg-white/5 border border-white/10 hover:border-primary/50 transition-colors px-4 py-2 text-sm font-bold text-white">
                                        {ticker}
                                      </Badge>
                                    ))}
                                  </div>
                                </section>
                              </div>
                            </ScrollArea>

                            <DialogFooter className="p-6 bg-white/5 border-t border-white/10 flex sm:justify-between items-center gap-4">
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest hidden sm:block">
                                SENTINEL ID: {latestAlert.id.slice(0, 8).toUpperCase()}
                              </p>
                              <Button 
                                onClick={() => discussWithNexus(latestAlert.title)}
                                className="bg-primary hover:bg-primary/90 rounded-xl px-8 gap-2 font-bold shadow-lg"
                              >
                                <MessageSquare className="h-4 w-4" /> DISCUTIR COM NEXUS
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Badge variant="outline" className="h-16 px-8 rounded-2xl border-white/10 bg-white/5 flex flex-col justify-center items-start">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Sinal de Mercado</span>
                          <span className={`text-xl font-bold ${latestAlert.marketAction === 'BUY' ? 'text-emerald-400' : latestAlert.marketAction === 'SELL' ? 'text-rose-400' : 'text-accent'}`}>
                            {latestAlert.marketAction}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 space-y-8 z-10 flex flex-col items-center">
                      <div className="p-6 rounded-full bg-white/5 border border-white/10">
                        <Terminal className="h-12 w-12 text-muted-foreground opacity-20" />
                      </div>
                      <div className="space-y-4">
                        <p className="text-white/60 text-xl font-medium italic">Sentinela em modo de escuta passiva...</p>
                        <Button 
                          onClick={triggerGlobalScan}
                          disabled={isScanning}
                          className="bg-accent hover:bg-accent/90 text-white font-bold h-14 px-10 rounded-2xl gap-3 shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:scale-105"
                        >
                          <Scan className="h-5 w-5" /> FORÇAR VARREDURA GLOBAL AGORA
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-3 space-y-8">
                <div className="bg-[#080D18]/90 border border-white/10 rounded-[2.5rem] p-10 space-y-10 h-full shadow-2xl relative overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-xs font-headline font-bold uppercase tracking-[0.4em] text-primary led-text-blue">
                      SENTINEL HUB
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">FEED REAL-TIME</span>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {globalAlerts && globalAlerts.length > 1 ? (
                      globalAlerts.slice(1).map((alert, idx) => (
                        <div key={idx} className={`p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-3 transition-all hover:scale-[1.03] cursor-pointer hover:border-primary/30 animate-in slide-in-from-right-5 duration-300`}>
                          <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-primary`}>
                            <span>{alert.eventOrigin}</span>
                            <span className="text-muted-foreground opacity-60">
                              {formatDistanceToNow(new Date(alert.createdAt), { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm font-semibold leading-tight text-white/90">{alert.title}</p>
                          <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" /> NEXUS VERIFIED
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                        <Globe className="h-12 w-12" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Aguardando mais informações do Nexus Hub</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest text-center animate-pulse">
                      PRÓXIMA VARREDURA AUTOMÁTICA EM CURSO...
                    </p>
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
                      <input 
                        id="name" 
                        placeholder="Ex: PETR4, ETH" 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
                        <input 
                          id="invested" 
                          type="number"
                          placeholder="0.00" 
                          className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          value={newAsset.investedValue}
                          onChange={(e) => setNewAsset(prev => ({ ...prev, investedValue: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="qty" className="text-white font-bold uppercase tracking-widest text-[10px]">Quantidade</Label>
                        <input 
                          id="qty" 
                          type="number"
                          placeholder="0" 
                          className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          value={newAsset.quantity}
                          onChange={(e) => setNewAsset(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location" className="text-white font-bold uppercase tracking-widest text-[10px]">Localização / Custódia</Label>
                      <input 
                        id="location" 
                        placeholder="Ex: XP, Binance, Ledger" 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
                      onClick={() => {
                        const asset: UserAsset = {
                          id: Math.random().toString(36).substr(2, 9),
                          name: (newAsset.name || '').toUpperCase(),
                          type: (newAsset.type as AssetType) || 'Ação',
                          location: newAsset.location || '',
                          riskLevel: newAsset.riskLevel as any,
                          investedValue: Number(newAsset.investedValue) || 0,
                          quantity: Number(newAsset.quantity) || 0
                        };
                        setAssets(prev => [asset, ...prev]);
                        setIsDialogOpen(false);
                        setNewAsset({ name: '', type: 'Ação', location: '', riskLevel: 'Moderado', investedValue: 0, quantity: 0 });
                      }}
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
              onUpdateAsset={(id, newQuantity, newValue) => {
                setAssets(prev => prev.map(a => a.id === id ? { ...a, quantity: newQuantity, investedValue: newValue } : a));
              }}
            />
          </div>
        )}
      </main>

      <AssistantChat 
        assets={assets} 
        displayMode={displayMode} 
        externalOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        initialQuery={chatInitialQuery}
      />
    </div>
  );
}
