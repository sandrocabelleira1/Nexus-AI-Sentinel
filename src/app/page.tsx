"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { WorldMood } from "@/components/dashboard/world-mood";
import { WhaleFlow } from "@/components/dashboard/whale-flow";
import { WarRoom } from "@/components/dashboard/war-room";
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
  ExternalLink
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      const results = await Promise.allSettled([
        monitorGlobalEvents({ rawNewsData: "Varredura Crítica Global Massiva: Monitorar todas as bolsas e ativos do mundo via Brapi e Neural Search." }),
        runAutonomousWhisperScan(),
        runWhaleDiscovery(),
        fetchGlobalMarketData()
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
  }, [isScanning, firestore]);

  useEffect(() => {
    if (currentUser && !isLoadingUser) {
      triggerGlobalScan();
      const interval = setInterval(triggerGlobalScan, 900000); // 15 min
      return () => clearInterval(interval);
    }
  }, [currentUser, isLoadingUser, triggerGlobalScan]);

  const handleDeepAnalysis = (context: string) => {
    setChatInitialQuery(`Comando Nexus sobre: ${context}. Execute projeção de ROI e análise de risco.`);
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

  return (
    <div className="min-h-screen relative selection:bg-primary selection:text-white overflow-x-hidden">
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />

      <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-5">
          <div className="p-3 rounded-2xl bg-primary/20 border border-primary/40 led-glow-blue">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-2xl led-text-blue tracking-tighter">NEXUS AI</h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-primary font-bold uppercase tracking-[0.4em] opacity-80">Estrategista Ativo</span>
              <div className="flex items-center gap-1">
                <Activity className="h-2 w-2 text-emerald-400 animate-pulse" />
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">GLOBAL RADAR ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center bg-[#080D18] rounded-2xl p-1 border border-white/10 shadow-2xl">
          <button onClick={() => setActiveTab('dashboard')} className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all", activeTab === 'dashboard' ? 'nav-item-active' : 'text-muted-foreground')}><LayoutGrid className="h-3.5 w-3.5" /> DASHBOARD</button>
          <button onClick={() => setActiveTab('market')} className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all", activeTab === 'market' ? 'nav-item-active' : 'text-muted-foreground')}><TrendingUp className="h-3.5 w-3.5" /> MARKET</button>
          <button onClick={() => setActiveTab('portfolio')} className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all", activeTab === 'portfolio' ? 'nav-item-active' : 'text-muted-foreground')}><Wallet className="h-3.5 w-3.5" /> WALLET</button>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={triggerGlobalScan} disabled={isScanning} className="rounded-xl bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold uppercase px-6 h-10 hover:bg-accent/20">
            {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Radar className="h-3 w-3 mr-2" />} VARREDURA 360°
          </Button>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-8 py-10 space-y-10 relative z-10">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column */}
            <div className="lg:col-span-3 flex flex-col gap-8 h-[850px]">
              <div className="flex-1">
                <WorldMood latestAlert={latestAlert} latestWhisper={latestWhisper} onAnalyze={handleDeepAnalysis} />
              </div>
              <div className="flex-1">
                <WarRoom entities={marketEntities || []} onAnalyze={handleDeepAnalysis} />
              </div>
            </div>

            {/* Central Strategic Column */}
            <div className="lg:col-span-6">
              <div className={cn(
                "bg-[#080D18]/95 border rounded-[3rem] h-[850px] relative overflow-hidden flex flex-col shadow-2xl transition-all group",
                hasCriticalRisk ? "border-rose-500/40" : "border-white/10 hover:border-primary/40"
              )}>
                <div className={cn(
                  "absolute top-0 left-0 w-full h-2 animate-pulse",
                  hasCriticalRisk ? "bg-gradient-to-r from-rose-500 via-rose-300 to-rose-500" : "bg-gradient-to-r from-primary via-accent to-primary"
                )} />
                
                <div className="absolute top-6 right-8 z-20 flex items-center gap-4">
                  {hasCriticalRisk && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-rose-500 animate-bounce" />
                      <span className="text-[10px] text-rose-500 font-bold uppercase tracking-[0.3em]">AMEAÇA DETECTADA</span>
                    </div>
                  )}
                  <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white/40 uppercase hover:bg-white/10 hover:text-white transition-all px-4">
                        <History className="h-3 w-3 mr-2" /> Arquivo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-panel border-white/10 sm:max-w-[800px] max-h-[80vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-headline font-bold text-white flex items-center gap-3">
                          <History className="h-6 w-6 text-primary" /> Histórico de Inteligência
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="flex-1 mt-6">
                        <div className="space-y-6 pb-10 pr-2">
                          {globalAlerts?.map((alert, idx) => (
                            <div key={alert.id} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => { handleDeepAnalysis(alert.title); setIsHistoryOpen(false); }}>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <Badge className={cn(
                                    "text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest",
                                    alert.marketAction === 'SELL' ? 'bg-rose-600' : 
                                    alert.marketAction === 'BUY' ? 'bg-emerald-600' : 'bg-primary'
                                  )}>
                                    {alert.marketAction}
                                  </Badge>
                                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                    {formatDistanceToNow(new Date(alert.createdAt), { locale: ptBR, addSuffix: true })}
                                  </span>
                                </div>
                                <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
                              </div>
                              <h4 className="text-lg font-bold text-white mb-2 leading-tight">{alert.title}</h4>
                              <p className="text-xs text-white/60 line-clamp-2 italic">{alert.essentialText}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>

                <ScrollArea className="h-full no-scrollbar">
                  <div className="p-10 space-y-12">
                    {latestAlert ? (
                      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <Badge className={cn(
                              "text-white font-bold px-8 py-3 rounded-2xl text-sm led-glow-blue tracking-widest",
                              latestAlert.marketAction === 'SELL' ? 'bg-rose-600' : 
                              latestAlert.marketAction === 'BUY' ? 'bg-emerald-600' : 'bg-primary'
                            )}>
                              ORDEM NEXUS: {latestAlert.marketAction === 'BUY' ? 'COMPRAR' : latestAlert.marketAction === 'SELL' ? 'VENDER' : latestAlert.marketAction}
                            </Badge>
                            <div className="flex items-center gap-3">
                              <ShieldAlert className={cn("h-6 w-6", latestAlert.priority === 5 ? "text-rose-500" : "text-accent")} />
                              <span className="text-xs text-white/40 font-bold uppercase tracking-[0.4em]">Prioridade {latestAlert.priority}/5</span>
                            </div>
                          </div>

                          <h2 className="text-5xl font-headline font-bold text-white leading-tight tracking-tighter">
                            {latestAlert.title}
                          </h2>
                          
                          <div className="flex items-center gap-4 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                            <Globe className="h-3.5 w-3.5 text-primary" />
                            <span>Origem: {latestAlert.eventOrigin}</span>
                            <div className="h-1 w-1 rounded-full bg-white/20" />
                            <span>Sinal: {latestAlert.riskLevel}</span>
                          </div>
                        </div>

                        <div className={cn(
                          "border rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden shadow-2xl",
                          hasCriticalRisk ? "bg-rose-500/10 border-rose-500/30" : "bg-white/5 border-white/10"
                        )}>
                          <p className="text-xl text-white font-medium leading-relaxed italic">
                            "{latestAlert.essentialText}"
                          </p>
                          <p className="text-sm text-white/50 leading-relaxed font-light">
                            {latestAlert.causalityExplanation}
                          </p>

                          {affectedPortfolioAssets.length > 0 && (
                            <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
                              <div className="flex items-center gap-2 text-rose-400">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">IMPACTO NA CUSTÓDIA:</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {affectedPortfolioAssets.map(asset => (
                                  <Badge key={asset.id} variant="outline" className="border-rose-500/40 text-rose-500 bg-rose-500/5 px-4 py-1">
                                    {asset.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {latestAlert.affectedAssetsDetails?.slice(0, 4).map((asset, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 transition-all cursor-pointer group/item" onClick={() => handleDeepAnalysis(`ROI ${asset.ticker}`)}>
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-xl font-bold text-white group-hover/item:text-primary">{asset.ticker}</span>
                                <Badge className={asset.impactType === 'Positivo' ? 'bg-emerald-600' : 'bg-rose-600'}>{asset.expectedGainPercentage}</Badge>
                              </div>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest">{asset.exchange}</p>
                            </div>
                          ))}
                        </div>

                        <Button 
                          onClick={() => handleDeepAnalysis(latestAlert.title)} 
                          className={cn(
                            "w-full h-20 rounded-[2rem] font-bold text-xl transition-all group/btn flex items-center justify-center gap-4",
                            hasCriticalRisk ? "bg-rose-600 hover:bg-rose-700 shadow-[0_0_40px_rgba(225,29,72,0.3)]" : "bg-primary hover:bg-primary/90 shadow-[0_0_40px_rgba(37,99,235,0.3)]"
                          )}
                        >
                          EXECUTAR ANÁLISE PROFUNDA
                          <ChevronRight className="h-6 w-6 group-hover/btn:translate-x-2 transition-transform" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-40 space-y-12 opacity-40">
                        <Radar className="h-24 w-24 text-primary animate-ping" />
                        <p className="max-w-xs text-center text-lg italic font-light">Nexus está decodificando o pulso global...</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-3 flex flex-col gap-8 h-[850px]">
              <div className="h-[400px]">
                <WhaleFlow transactions={whaleTransactions || []} onAnalyze={handleDeepAnalysis} />
              </div>
              <div className="flex-1 bg-[#080D18]/90 border border-white/10 rounded-[3rem] p-8 flex flex-col shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-headline font-bold uppercase tracking-[0.5em] text-primary">RUMORES & WHISPERS</h3>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <ScrollArea className="flex-1 no-scrollbar">
                  <div className="space-y-6 pr-4">
                    {whispers?.map((item, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all cursor-pointer group" onClick={() => handleDeepAnalysis(item.topic)}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-[8px] border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5">
                            SCORE: {item.foundation_score}%
                          </Badge>
                          <span className="text-[9px] text-white/40 font-bold">{formatDistanceToNow(new Date(item.timestamp), { locale: ptBR })}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors leading-tight mb-2">{item.topic}</h4>
                        <p className="text-[10px] text-white/50 line-clamp-2 italic">{item.market_impact}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && <MarketExplorer prices={marketPrices || []} latestAlert={latestAlert} />}
        {activeTab === 'portfolio' && <PortfolioView assets={userAssetsData || []} onUpdateAsset={handleUpdateAsset} />}
      </main>

      <AssistantChat assets={userAssetsData || []} displayMode={'Essencial'} externalOpen={isChatOpen} onOpenChange={handleOpenChange} initialQuery={chatInitialQuery} latestAlert={latestAlert} />
    </div>
  );
}
