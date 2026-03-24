"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { WorldMood } from "@/components/dashboard/world-mood";
import { WhaleFlow } from "@/components/dashboard/whale-flow";
import { WarRoom } from "@/components/dashboard/war-room";
import { WhispersRadar } from "@/components/dashboard/whispers-radar";
import { UserAsset, GlobalIntelligenceAlert, MarketPrice, AutonomousInsight, WhaleTransaction, MarketEntity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Cpu, 
  Globe, 
  Wallet, 
  ChevronRight,
  ShieldCheck,
  Terminal,
  Loader2,
  Radar,
  Activity,
  LayoutGrid,
  ShieldAlert,
  ArrowUpRight,
  BrainCircuit,
  AlertTriangle,
  Zap,
  Target,
  History,
  Clock,
  ExternalLink,
  Building2,
  Coins,
  Menu,
  ChevronLeft
} from "lucide-react";
import { AssistantChat } from "@/components/ai/assistant-chat";
import { Badge } from "@/components/ui/badge";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { MarketExplorer } from "@/components/market/market-explorer";
import { useCollection, useFirestore, useMemoFirebase, useUser, useAuth, initiateAnonymousSignIn, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { monitorGlobalEvents } from "@/ai/flows/global-intelligence-monitor";
import { runAutonomousWhisperScan } from "@/ai/flows/autonomous-whisper-engine";
import { runWhaleDiscovery } from "@/ai/flows/whale-discovery";
import { fetchGlobalMarketData } from "@/ai/flows/global-market-data-engine";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function NexusDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'market'>('dashboard');
  const [isScanning, setIsScanning] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const firestore = useFirestore();
  const auth = useAuth();

  const { user: currentUser, isUserLoading: isLoadingUser } = useUser();

  const alertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "global_intelligence_alerts"), orderBy("createdAt", "desc"), limit(20));
  }, [firestore]);

  const whispersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "autonomous_insights"), orderBy("timestamp", "desc"), limit(20));
  }, [firestore]);

  const whalesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "whale_transactions"), orderBy("timestamp", "desc"), limit(30));
  }, [firestore]);

  const entitiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "market_entities"), orderBy("influenceScore", "desc"), limit(15));
  }, [firestore]);

  const pricesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "market_prices"), orderBy("updatedAt", "desc"), limit(500));
  }, [firestore]);

  const userAssetsQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return collection(firestore, "users", currentUser.uid, "assets");
  }, [firestore, currentUser]);

  const { data: globalAlerts, isLoading: isLoadingAlerts } = useCollection<GlobalIntelligenceAlert>(alertsQuery);
  const { data: whispers } = useCollection<AutonomousInsight>(whispersQuery);
  const { data: whaleTransactions } = useCollection<WhaleTransaction>(whalesQuery);
  const { data: marketEntities } = useCollection<MarketEntity>(entitiesQuery);
  const { data: marketPrices } = useCollection<MarketPrice>(pricesQuery);
  const { data: userAssetsData } = useCollection<UserAsset>(userAssetsQuery);
  
  const latestAlert = globalAlerts?.[0];
  const latestWhisper = whispers?.[0];

  useEffect(() => {
    if (!currentUser && !isLoadingUser && auth) initiateAnonymousSignIn(auth);
  }, [currentUser, isLoadingUser, auth]);

  const triggerGlobalScan = useCallback(async () => {
    if (isScanning || !firestore) return;
    setIsScanning(true);
    try {
      const userTickers = userAssetsData?.map(a => a.ticker).filter(Boolean) as string[] || [];
      const results = await Promise.allSettled([
        monitorGlobalEvents({ context: "VIGILÂNCIA OMNISCIENTE TOTAL 5.0 - BUSCA MASSIVA HOJE" }),
        runAutonomousWhisperScan(),
        runWhaleDiscovery(),
        fetchGlobalMarketData(userTickers)
      ]);

      const monitorResult = results[0].status === 'fulfilled' ? results[0].value : null;
      const whispersResult = results[1].status === 'fulfilled' ? results[1].value : null;
      const whalesResult = results[2].status === 'fulfilled' ? results[2].value : null;
      const marketDataResult = results[3].status === 'fulfilled' ? results[3].value : null;

      if (monitorResult?.alerts) {
        monitorResult.alerts.forEach(alert => {
          addDocumentNonBlocking(collection(firestore, "global_intelligence_alerts"), {
            ...alert,
            createdAt: new Date().toISOString()
          });
        });
      }

      if (whispersResult?.detected_whispers) {
        whispersResult.detected_whispers.forEach(w => {
          addDocumentNonBlocking(collection(firestore, "autonomous_insights"), {
            ...w,
            timestamp: new Date().toISOString()
          });
        });
      }

      if (whalesResult?.detected_whales) {
        whalesResult.detected_whales.forEach(tw => {
          addDocumentNonBlocking(collection(firestore, "whale_transactions"), {
            ...tw,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
          });
        });
      }

      if (marketDataResult?.assets) {
        marketDataResult.assets.forEach(asset => {
          setDocumentNonBlocking(doc(firestore, "market_prices", asset.ticker), {
            ...asset,
            id: asset.ticker,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });
      }
    } catch (e) { 
      console.error("Global Scan Error:", e); 
    } finally { 
      setIsScanning(false); 
    }
  }, [isScanning, firestore, userAssetsData]);

  useEffect(() => {
    if (currentUser && !isLoadingUser) {
      triggerGlobalScan();
      const interval = setInterval(triggerGlobalScan, 600000); // 10 min
      return () => clearInterval(interval);
    }
  }, [currentUser, isLoadingUser, triggerGlobalScan]);

  const handleDeepAnalysis = (context: string) => {
    setChatInitialQuery(context);
    setIsChatOpen(true);
  };

  const handleUpdateAsset = (id: string, newQty: number, newVal: number) => {
    if (!firestore || !currentUser) return;
    setDocumentNonBlocking(doc(firestore, "users", currentUser.uid, "assets", id), {
      quantity: newQty,
      investedValue: newVal,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  if (isLoadingUser || isLoadingAlerts) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-primary font-headline font-bold animate-pulse uppercase tracking-[0.5em]">Nexus Core Initializing</p>
      </div>
    );
  }

  const NavButtons = () => (
    <>
      <button onClick={() => setActiveTab('dashboard')} className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all w-full lg:w-auto text-left lg:text-center", activeTab === 'dashboard' ? 'nav-item-active' : 'text-muted-foreground')}><LayoutGrid className="h-3.5 w-3.5" /> DASHBOARD</button>
      <button onClick={() => setActiveTab('market')} className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all w-full lg:w-auto text-left lg:text-center", activeTab === 'market' ? 'nav-item-active' : 'text-muted-foreground')}><TrendingUp className="h-3.5 w-3.5" /> MARKET</button>
      <button onClick={() => setActiveTab('portfolio')} className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all w-full lg:w-auto text-left lg:text-center", activeTab === 'portfolio' ? 'nav-item-active' : 'text-muted-foreground')}><Wallet className="h-3.5 w-3.5" /> WALLET</button>
    </>
  );

  return (
    <div className="min-h-screen relative selection:bg-primary selection:text-white overflow-x-hidden">
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />

      <header className="h-20 border-b border-white/10 px-4 md:px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="p-2 md:p-3 rounded-2xl bg-primary/20 border border-primary/40 led-glow-blue">
            <Cpu className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-lg md:text-2xl led-text-blue tracking-tighter">NEXUS AI</h1>
          </div>
        </div>

        <nav className="hidden lg:flex items-center bg-[#080D18] rounded-2xl p-1 border border-white/10 shadow-2xl">
          <NavButtons />
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" onClick={triggerGlobalScan} disabled={isScanning} className="rounded-xl bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold px-6 h-10 hover:bg-accent/20">
            {isScanning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Radar className="h-3 w-3 mr-2" />} VARREDURA 5.0
          </Button>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-white/10 p-6 flex flex-col gap-6">
                 <NavButtons />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8 md:space-y-10 relative z-10">
        {activeTab === 'dashboard' && (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
            <div className="w-full lg:col-span-6 order-1 lg:order-2">
              <div className="bg-[#080D18]/95 border border-white/10 rounded-[2rem] md:rounded-[3rem] min-h-[500px] md:h-[850px] relative overflow-hidden flex flex-col shadow-2xl transition-all hover:border-primary/40">
                <div className="absolute top-4 right-8 z-20 flex items-center gap-4">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-xl text-[10px] font-bold animate-pulse">
                    SENTINELA ATIVO
                  </Badge>
                </div>

                <Carousel className="w-full h-full">
                  <CarouselContent className="h-full">
                    {globalAlerts && globalAlerts.length > 0 ? (
                      globalAlerts.map((alert, index) => (
                        <CarouselItem key={alert.id} className="h-full">
                          <ScrollArea className="h-full">
                            <div className="p-6 md:p-10 space-y-8">
                              <div className="flex items-center justify-between">
                                <Badge className={cn(
                                  "text-white font-bold px-8 py-3 rounded-2xl text-sm led-glow-blue tracking-widest",
                                  alert.marketAction === 'SELL' ? 'bg-rose-600' : 
                                  alert.marketAction === 'BUY' ? 'bg-emerald-600' : 'bg-primary'
                                )}>
                                  ORDEM NEXUS: {alert.marketAction}
                                </Badge>
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                                  {index + 1} / {globalAlerts.length} • {alert.eventOrigin}
                                </span>
                              </div>

                              <h2 className="text-3xl md:text-5xl font-headline font-bold text-white leading-tight tracking-tighter">
                                {alert.title}
                              </h2>
                              
                              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                                <p className="text-lg md:text-xl text-white font-medium italic">
                                  "{alert.essentialText}"
                                </p>
                                <p className="text-sm text-white/50 leading-relaxed font-light">
                                  {alert.causalityExplanation}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block mb-1">Origem</span>
                                  <span className="text-xs text-white font-medium">{alert.eventOrigin}</span>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block mb-1">Risco</span>
                                  <span className="text-xs text-white font-medium">{alert.riskLevel}</span>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block mb-1">Prioridade</span>
                                  <span className="text-xs text-white font-medium">{alert.priority}/5</span>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest block mb-1">Data</span>
                                  <span className="text-xs text-white font-medium">{formatDistanceToNow(new Date(alert.createdAt), { locale: ptBR, addSuffix: true })}</span>
                                </div>
                              </div>

                              <Button 
                                onClick={() => handleDeepAnalysis(`Execute comando Nexus de análise sobre: ${alert.title}. Detalhe o impacto em ativos como ${alert.affectedAssetTickerSymbols.join(', ')}.`)} 
                                className="w-full h-20 rounded-[2rem] bg-primary hover:bg-primary/90 font-bold text-xl flex items-center justify-center gap-4"
                              >
                                SOLICITAR ANÁLISE 360°
                                <ChevronRight className="h-6 w-6" />
                              </Button>
                            </div>
                            <ScrollBar className="bg-white/5" />
                          </ScrollArea>
                        </CarouselItem>
                      ))
                    ) : (
                      <CarouselItem className="h-full">
                        <div className="flex flex-col items-center justify-center h-full py-40 opacity-40">
                          <Radar className="h-24 w-24 text-primary animate-ping" />
                          <p className="text-center mt-8 font-bold tracking-[0.5em] uppercase">Vigilância Omnisciente Ativa...</p>
                        </div>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  {globalAlerts && globalAlerts.length > 1 && (
                    <div className="absolute bottom-10 right-10 flex gap-4 z-30">
                      <CarouselPrevious className="static translate-y-0 h-14 w-14 bg-white/5 border-white/10 hover:bg-primary/20 text-white rounded-2xl" />
                      <CarouselNext className="static translate-y-0 h-14 w-14 bg-white/5 border-white/10 hover:bg-primary/20 text-white rounded-2xl" />
                    </div>
                  )}
                </Carousel>
              </div>
            </div>

            <div className="w-full lg:col-span-3 flex flex-col gap-8 order-2 lg:order-1">
              <div className="h-[400px]">
                <WorldMood latestAlert={latestAlert} latestWhisper={latestWhisper} onAnalyze={handleDeepAnalysis} />
              </div>
              <div className="h-[400px]">
                <WhispersRadar insights={whispers || []} onAnalyze={handleDeepAnalysis} />
              </div>
            </div>

            <div className="w-full lg:col-span-3 flex flex-col gap-8 order-3 lg:order-3">
              <div className="h-[400px]">
                <WhaleFlow transactions={whaleTransactions || []} onAnalyze={handleDeepAnalysis} />
              </div>
              <div className="h-[400px]">
                <WarRoom entities={marketEntities || []} onAnalyze={handleDeepAnalysis} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && <MarketExplorer prices={marketPrices || []} latestAlert={latestAlert} onAnalyze={handleDeepAnalysis} />}
        {activeTab === 'portfolio' && <PortfolioView assets={userAssetsData || []} marketPrices={marketPrices || []} onUpdateAsset={handleUpdateAsset} onAnalyze={handleDeepAnalysis} />}
      </main>

      <AssistantChat assets={userAssetsData || []} displayMode={'Essencial'} externalOpen={isChatOpen} onOpenChange={setIsChatOpen} initialQuery={chatInitialQuery} latestAlert={latestAlert} />
    </div>
  );
}
