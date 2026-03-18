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
  Menu
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    return query(collection(firestore, "global_intelligence_alerts"), orderBy("createdAt", "desc"), limit(50));
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

  const affectedPortfolioAssets = useMemo(() => {
    if (!latestAlert || !userAssetsData) return [];
    const affectedTickers = latestAlert.affectedAssetTickerSymbols || [];
    return userAssetsData.filter(asset => {
      const ticker = asset.ticker || asset.name.split(' ')[0].toUpperCase();
      return affectedTickers.includes(ticker);
    });
  }, [latestAlert, userAssetsData]);

  const hasCriticalRisk = useMemo(() => {
    return affectedPortfolioAssets.some(a => latestAlert?.marketAction === 'SELL' || latestAlert?.priority === 5);
  }, [affectedPortfolioAssets, latestAlert]);

  useEffect(() => {
    if (!currentUser && !isLoadingUser && auth) initiateAnonymousSignIn(auth);
  }, [currentUser, isLoadingUser, auth]);

  const triggerGlobalScan = useCallback(async () => {
    if (isScanning || !firestore) return;
    setIsScanning(true);
    try {
      const userTickers = userAssetsData?.map(a => a.ticker).filter(Boolean) as string[] || [];
      const results = await Promise.allSettled([
        monitorGlobalEvents({ rawNewsData: "Varredura Crítica Global Massiva de FIIs v3.1, Ações e Cripto." }),
        runAutonomousWhisperScan(),
        runWhaleDiscovery(),
        fetchGlobalMarketData(userTickers)
      ]);

      const geopoliticalResult = results[0].status === 'fulfilled' ? results[0].value : null;
      const whispersResult = results[1].status === 'fulfilled' ? results[1].value : null;
      const whalesResult = results[2].status === 'fulfilled' ? results[2].value : null;
      const marketDataResult = results[3].status === 'fulfilled' ? results[3].value : null;

      if (geopoliticalResult) {
        addDocumentNonBlocking(collection(firestore, "global_intelligence_alerts"), {
          ...geopoliticalResult,
          createdAt: new Date().toISOString()
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
      const interval = setInterval(triggerGlobalScan, 900000); // 15 min
      return () => clearInterval(interval);
    }
  }, [currentUser, isLoadingUser, triggerGlobalScan]);

  const handleDeepAnalysis = (context: string) => {
    setChatInitialQuery(context);
    setIsChatOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsChatOpen(open);
    if (!open) setChatInitialQuery(null);
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
        <p className="text-primary font-headline font-bold animate-pulse uppercase tracking-[0.5em]">Nexus Strategic Core Initializing</p>
      </div>
    );
  }

  const NavButtons = () => (
    <>
      <button onClick={() => setActiveTab('dashboard')} className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all", activeTab === 'dashboard' ? 'nav-item-active' : 'text-muted-foreground')}><LayoutGrid className="h-3.5 w-3.5" /> DASHBOARD</button>
      <button onClick={() => setActiveTab('market')} className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all", activeTab === 'market' ? 'nav-item-active' : 'text-muted-foreground')}><TrendingUp className="h-3.5 w-3.5" /> MARKET</button>
      <button onClick={() => setActiveTab('portfolio')} className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all", activeTab === 'portfolio' ? 'nav-item-active' : 'text-muted-foreground')}><Wallet className="h-3.5 w-3.5" /> WALLET</button>
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
            <div className="flex items-center gap-2">
              <span className="text-[7px] md:text-[9px] text-primary font-bold uppercase tracking-[0.4em] opacity-80">Estrategista Ativo</span>
              <div className="flex items-center gap-1">
                <Activity className="h-2 w-2 text-emerald-400 animate-pulse" />
                <span className="text-[6px] md:text-[8px] text-emerald-400 font-bold uppercase tracking-widest">GLOBAL RADAR ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center bg-[#080D18] rounded-2xl p-1 border border-white/10 shadow-2xl">
          <NavButtons />
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="sm" onClick={triggerGlobalScan} disabled={isScanning} className="rounded-xl bg-accent/10 border border-accent/30 text-accent text-[9px] md:text-[10px] font-bold uppercase px-3 md:px-6 h-10 hover:bg-accent/20">
            {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Radar className="h-3 w-3 mr-2" />} <span className="hidden sm:inline">VARREDURA 360°</span>
          </Button>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#080D18] border-white/10 p-6 flex flex-col gap-4">
                <div className="mt-8 flex flex-col gap-2">
                   <NavButtons />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-10 relative z-10">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
            <div className="lg:col-span-3 flex flex-col gap-6 md:gap-8 order-2 lg:order-1">
              <div className="h-[350px] md:h-[400px]">
                <WorldMood latestAlert={latestAlert} latestWhisper={latestWhisper} onAnalyze={handleDeepAnalysis} />
              </div>
              <div className="h-[350px] md:h-[400px]">
                <WhispersRadar insights={whispers || []} onAnalyze={(ctx) => handleDeepAnalysis(ctx)} />
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className={cn(
                "bg-[#080D18]/95 border rounded-[2rem] md:rounded-[3rem] h-[600px] md:h-[850px] relative overflow-hidden flex flex-col shadow-2xl transition-all group",
                hasCriticalRisk ? "border-rose-500/40" : "border-white/10 hover:border-primary/40"
              )}>
                <div className={cn(
                  "absolute top-0 left-0 w-full h-2 animate-pulse",
                  hasCriticalRisk ? "bg-gradient-to-r from-rose-500 via-rose-300 to-rose-500" : "bg-gradient-to-r from-primary via-accent to-primary"
                )} />
                
                <div className="absolute top-4 md:top-6 right-4 md:right-8 z-20 flex items-center gap-3 md:gap-4">
                  {hasCriticalRisk && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-rose-500 animate-bounce" />
                      <span className="text-[8px] md:text-[10px] text-rose-500 font-bold uppercase tracking-[0.3em]">AMEAÇA</span>
                    </div>
                  )}
                  <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="bg-white/5 border border-white/10 rounded-xl text-[9px] md:text-[10px] font-bold text-white/40 uppercase hover:bg-white/10 hover:text-white transition-all px-3 md:px-4">
                        <History className="h-3 w-3 mr-2" /> <span className="hidden sm:inline">Arquivo</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-panel border-white/10 w-[95vw] sm:max-w-[800px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
                      <DialogHeader className="p-6 md:p-8 pb-0">
                        <DialogTitle className="text-xl md:text-2xl font-headline font-bold text-white flex items-center gap-3">
                          <History className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Histórico de Inteligência
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="flex-1 mt-6 h-[400px] md:h-[600px] px-6 md:px-8 pb-8 custom-scrollbar">
                        <div className="space-y-4 md:space-y-6 pr-4">
                          {globalAlerts?.map((alert, idx) => (
                            <div key={alert.id} className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => { handleDeepAnalysis(`Execute comando Nexus sobre: ${alert.title}. Projete o elo de causalidade global.`); setIsHistoryOpen(false); }}>
                              <div className="flex items-center justify-between mb-3 md:mb-4">
                                <div className="flex items-center gap-3">
                                  <Badge className={cn(
                                    "text-[8px] md:text-[9px] font-bold px-2 md:px-3 py-1 rounded-lg uppercase tracking-widest",
                                    alert.marketAction === 'SELL' ? 'bg-rose-600' : 
                                    alert.marketAction === 'BUY' ? 'bg-emerald-600' : 'bg-primary'
                                  )}>
                                    {alert.marketAction}
                                  </Badge>
                                  <span className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                    {formatDistanceToNow(new Date(alert.createdAt), { locale: ptBR, addSuffix: true })}
                                  </span>
                                </div>
                                <ExternalLink className="h-3 w-3 md:h-4 md:w-4 text-white/20 group-hover:text-primary transition-colors" />
                              </div>
                              <h4 className="text-base md:text-lg font-bold text-white mb-2 leading-tight">{alert.title}</h4>
                              <p className="text-[11px] md:text-xs text-white/60 line-clamp-2 italic">{alert.essentialText}</p>
                            </div>
                          ))}
                        </div>
                        <ScrollBar className="bg-white/5" />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>

                <ScrollArea className="h-full no-scrollbar">
                  <div className="p-6 md:p-10 space-y-8 md:space-y-12">
                    {latestAlert ? (
                      <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        <div className="space-y-4 md:space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <Badge className={cn(
                              "text-white font-bold px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm led-glow-blue tracking-widest w-fit",
                              latestAlert.marketAction === 'SELL' ? 'bg-rose-600' : 
                              latestAlert.marketAction === 'BUY' ? 'bg-emerald-600' : 'bg-primary'
                            )}>
                              ORDEM NEXUS: {latestAlert.marketAction === 'BUY' ? 'COMPRAR' : latestAlert.marketAction === 'SELL' ? 'VENDER' : latestAlert.marketAction}
                            </Badge>
                            <div className="flex items-center gap-3">
                              <ShieldAlert className={cn("h-5 w-5 md:h-6 md:w-6", latestAlert.priority === 5 ? "text-rose-500" : "text-accent")} />
                              <span className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-[0.4em]">Prioridade {latestAlert.priority}/5</span>
                            </div>
                          </div>

                          <h2 className="text-3xl md:text-5xl font-headline font-bold text-white leading-tight tracking-tighter">
                            {latestAlert.title}
                          </h2>
                          
                          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-white/40 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                            <Globe className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
                            <span>Origem: {latestAlert.eventOrigin}</span>
                            <div className="h-1 w-1 rounded-full bg-white/20" />
                            <span>Sinal: {latestAlert.riskLevel}</span>
                          </div>
                        </div>

                        <div className={cn(
                          "border rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 space-y-4 md:space-y-6 relative overflow-hidden shadow-2xl",
                          hasCriticalRisk ? "bg-rose-500/10 border-rose-500/30" : "bg-white/5 border-white/10"
                        )}>
                          <p className="text-lg md:text-xl text-white font-medium leading-relaxed italic">
                            "{latestAlert.essentialText}"
                          </p>
                          <p className="text-xs md:text-sm text-white/50 leading-relaxed font-light">
                            {latestAlert.causalityExplanation}
                          </p>

                          {affectedPortfolioAssets.length > 0 && (
                            <div className="pt-4 md:pt-6 mt-4 md:mt-6 border-t border-white/10 space-y-3 md:space-y-4">
                              <div className="flex items-center gap-2 text-rose-400">
                                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em]">IMPACTO NA CUSTÓDIA:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {affectedPortfolioAssets.map(asset => (
                                  <Badge key={asset.id} variant="outline" className="border-rose-500/40 text-rose-500 bg-rose-500/5 px-3 md:px-4 py-1">
                                    {asset.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {latestAlert.affectedAssetsDetails?.slice(0, 4).map((asset, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 hover:bg-white/10 transition-all cursor-pointer group/item" onClick={() => handleDeepAnalysis(`Comando Nexus: Execute análise 360 do ativo ${asset.ticker} (${asset.exchange}). Foco em ROI projetado e elo de causalidade.`)}>
                              <div className="flex items-center justify-between mb-3 md:mb-4">
                                <div className="flex items-center gap-3">
                                  {asset.ticker.includes('11') ? <Building2 className="h-4 w-4 md:h-5 md:w-5 text-primary" /> : <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />}
                                  <span className="text-lg md:text-xl font-bold text-white group-hover/item:text-primary">{asset.ticker}</span>
                                </div>
                                <Badge className={asset.impactType === 'Positivo' ? 'bg-emerald-600' : 'bg-rose-600'}>{asset.expectedGainPercentage}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[8px] md:text-[9px] border-primary/20 text-primary">{asset.exchange}</Badge>
                                <span className="text-[9px] md:text-[10px] text-white/40 uppercase font-bold tracking-widest">{asset.recommendation}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Button 
                          onClick={() => handleDeepAnalysis(`Execute comando Nexus de análise massiva sobre: ${latestAlert.title}.`)} 
                          className={cn(
                            "w-full h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] font-bold text-lg md:text-xl transition-all group/btn flex items-center justify-center gap-3 md:gap-4",
                            hasCriticalRisk ? "bg-rose-600 hover:bg-rose-700 shadow-[0_0_40px_rgba(225,29,72,0.3)]" : "bg-primary hover:bg-primary/90 shadow-[0_0_40px_rgba(37,99,235,0.3)]"
                          )}
                        >
                          <span className="hidden sm:inline">EXECUTAR</span> ANÁLISE PROFUNDA
                          <ChevronRight className="h-5 w-5 md:h-6 md:w-6 group-hover/btn:translate-x-2 transition-transform" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 md:py-40 space-y-8 md:space-y-12 opacity-40">
                        <Radar className="h-16 w-16 md:h-24 md:w-24 text-primary animate-ping" />
                        <p className="max-w-[200px] md:max-w-xs text-center text-base md:text-lg italic font-light">Nexus está decodificando o pulso global...</p>
                      </div>
                    )}
                  </div>
                  <ScrollBar className="bg-white/5" />
                </ScrollArea>
              </div>
            </div>

            <div className="lg:col-span-3 flex flex-col gap-6 md:gap-8 order-3 lg:order-3">
              <div className="h-[350px] md:h-[400px]">
                <WhaleFlow transactions={whaleTransactions || []} onAnalyze={(ctx) => handleDeepAnalysis(`Analise o movimento da baleia: ${ctx}`)} />
              </div>
              <div className="h-[350px] md:h-[400px]">
                <WarRoom entities={marketEntities || []} onAnalyze={(ctx) => handleDeepAnalysis(`Analise as ações táticas da entidade: ${ctx}`)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && <MarketExplorer prices={marketPrices || []} latestAlert={latestAlert} onAnalyze={handleDeepAnalysis} />}
        {activeTab === 'portfolio' && <PortfolioView assets={userAssetsData || []} marketPrices={marketPrices || []} onUpdateAsset={handleUpdateAsset} />}
      </main>

      <AssistantChat assets={userAssetsData || []} displayMode={'Essencial'} externalOpen={isChatOpen} onOpenChange={handleOpenChange} initialQuery={chatInitialQuery} latestAlert={latestAlert} />
    </div>
  );
}
