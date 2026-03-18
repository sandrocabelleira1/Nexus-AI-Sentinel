"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { WorldMood } from "@/components/dashboard/world-mood";
import { WhaleFlow } from "@/components/dashboard/whale-flow";
import { WarRoom } from "@/components/dashboard/war-room";
import { AssetType, DisplayMode, UserAsset, GlobalIntelligenceAlert, MarketPrice, AutonomousInsight, WhaleTransaction, MarketEntity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Cpu, 
  Globe, 
  Wallet, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  Terminal,
  Plus,
  Loader2,
  Scan,
  Radar,
  Activity,
  Target,
  LayoutGrid,
  ShieldAlert,
  ArrowUpRight,
  Landmark,
  BrainCircuit
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

export default function NexusDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'market'>('dashboard');
  const [isScanning, setIsScanning] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | null>(null);

  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const alertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "global_intelligence_alerts"), orderBy("createdAt", "desc"), limit(10));
  }, [firestore]);

  const whispersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "autonomous_insights"), orderBy("timestamp", "desc"), limit(10));
  }, [firestore]);

  const whalesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "whale_transactions"), orderBy("timestamp", "desc"), limit(15));
  }, [firestore]);

  const entitiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "market_entities"), orderBy("influenceScore", "desc"), limit(8));
  }, [firestore]);

  const pricesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "market_prices"), orderBy("updatedAt", "desc"), limit(50));
  }, [firestore]);

  const userAssetsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "assets");
  }, [firestore, user]);

  const { data: globalAlerts, isLoading: isLoadingAlerts } = useCollection<GlobalIntelligenceAlert>(alertsQuery);
  const { data: whispers } = useCollection<AutonomousInsight>(whispersQuery);
  const { data: whaleTransactions } = useCollection<WhaleTransaction>(whalesQuery);
  const { data: marketEntities } = useCollection<MarketEntity>(entitiesQuery);
  const { data: marketPrices } = useCollection<MarketPrice>(pricesQuery);
  const { data: userAssetsData } = useCollection<UserAsset>(userAssetsQuery);
  
  const latestAlert = globalAlerts?.[0];
  const latestWhisper = whispers?.[0];

  const unifiedRadarFeed = useMemo(() => {
    const alerts = (globalAlerts || []).map(a => ({
      id: a.id,
      type: 'ALERT' as const,
      title: a.title,
      timestamp: a.createdAt,
      priority: a.priority,
      origin: a.eventOrigin,
      summary: a.essentialText,
    }));
    const rumors = (whispers || []).map(w => ({
      id: w.id,
      type: 'WHISPER' as const,
      title: w.topic,
      timestamp: w.timestamp,
      priority: w.nexus_priority,
      score: w.foundation_score,
      summary: w.market_impact,
    }));
    return [...alerts, ...rumors].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [globalAlerts, whispers]);

  useEffect(() => {
    if (!user && !isUserLoading && auth) initiateAnonymousSignIn(auth);
  }, [user, isUserLoading, auth]);

  const triggerGlobalScan = useCallback(async () => {
    if (isScanning || !firestore) return;
    setIsScanning(true);
    try {
      const results = await Promise.allSettled([
        monitorGlobalEvents({ rawNewsData: "Varredura Crítica Global: Identificar ordens táticas de investimento em NYSE, B3 e LSE." }),
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
        
        geopoliticalResult.detectedEntities?.forEach(entity => {
          setDocumentNonBlocking(doc(firestore, "market_entities", entity.name.replace(/\s+/g, '_').toLowerCase()), {
            ...entity,
            id: entity.name.replace(/\s+/g, '_').toLowerCase(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
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
    if (user && !isUserLoading) {
      triggerGlobalScan();
      const interval = setInterval(triggerGlobalScan, 900000); // 15 min
      return () => clearInterval(interval);
    }
  }, [user, isUserLoading, triggerGlobalScan]);

  const handleDeepAnalysis = (context: string) => {
    setChatInitialQuery(`Comando Nexus sobre: ${context}. Execute projeção de ROI e análise de risco.`);
    setIsChatOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsChatOpen(open);
    if (!open) setChatInitialQuery(null);
  };

  const handleUpdateAsset = (id: string, newQty: number, newVal: number) => {
    if (!firestore || !user) return;
    setDocumentNonBlocking(doc(firestore, "users", user.uid, "assets", id), {
      quantity: newQty,
      investedValue: newVal,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  if (isUserLoading || isLoadingAlerts) {
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
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">REAL-TIME OPS</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Coluna Esquerda: World Mood & War Room */}
            <div className="lg:col-span-3 space-y-8">
              <WorldMood latestAlert={latestAlert} latestWhisper={latestWhisper} onAnalyze={handleDeepAnalysis} />
              <WarRoom entities={marketEntities || []} onAnalyze={handleDeepAnalysis} />
            </div>

            {/* Coluna Central: Centro de Comando (Indicações de Investimento) */}
            <div className="lg:col-span-6">
              <div className="bg-[#080D18]/95 border border-white/10 rounded-[3rem] h-[850px] relative overflow-hidden flex flex-col shadow-2xl transition-all hover:border-primary/40 group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
                
                <ScrollArea className="h-full">
                  <div className="p-10 space-y-12">
                    {latestAlert ? (
                      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        {/* Header do Comando */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <Badge className={cn("text-white font-bold px-6 py-2 rounded-xl text-xs led-glow-blue", latestAlert.marketAction === 'SELL' ? 'bg-rose-500' : 'bg-primary')}>
                              COMANDO NEXUS: {latestAlert.marketAction}
                            </Badge>
                            <div className="flex items-center gap-3">
                              <ShieldAlert className="h-5 w-5 text-accent animate-pulse" />
                              <span className="text-[10px] text-accent font-bold uppercase tracking-[0.3em]">Prioridade {latestAlert.priority}/5</span>
                            </div>
                          </div>
                          <h2 className="text-6xl font-headline font-bold text-white leading-tight tracking-tighter">
                            {latestAlert.title}
                          </h2>
                          <div className="flex items-center gap-4 text-white/40 text-sm font-bold uppercase tracking-widest">
                            <Globe className="h-4 w-4 text-primary" />
                            <span>Origem: {latestAlert.eventOrigin}</span>
                            <div className="h-1 w-1 rounded-full bg-white/20" />
                            <span>Detectado {formatDistanceToNow(new Date(latestAlert.createdAt), { locale: ptBR, addSuffix: true })}</span>
                          </div>
                        </div>

                        {/* Rationale do Estrategista */}
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-4">
                          <div className="flex items-center gap-3 text-primary">
                            <BrainCircuit className="h-6 w-6" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.4em]">Racional Estratégico</h3>
                          </div>
                          <p className="text-xl text-white/90 leading-relaxed font-medium italic">
                            "{latestAlert.essentialText}"
                          </p>
                          <p className="text-sm text-white/60 leading-relaxed">
                            {latestAlert.causalityExplanation}
                          </p>
                        </div>

                        {/* Ordens Táticas por Ativo */}
                        <div className="space-y-6">
                          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.5em] ml-2">Ativos Selecionados para Alocação</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {latestAlert.affectedAssetsDetails?.map((asset, i) => (
                              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all cursor-pointer group/item" onClick={() => handleDeepAnalysis(`Projeção para ${asset.ticker} na ${asset.exchange}`)}>
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex flex-col">
                                    <Badge variant="outline" className="w-fit text-[8px] border-primary/30 text-primary mb-1">{asset.exchange}</Badge>
                                    <span className="text-2xl font-bold text-white group-hover/item:text-primary transition-colors">{asset.ticker}</span>
                                  </div>
                                  <div className={cn("text-lg font-bold", asset.impactType === 'Positivo' ? 'text-emerald-400' : 'text-rose-400')}>
                                    {asset.expectedGainPercentage}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{asset.recommendation}</span>
                                  <ArrowUpRight className="h-4 w-4 text-white/20 group-hover/item:text-primary group-hover/item:translate-x-1 group-hover/item:-translate-y-1 transition-all" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Button onClick={() => handleDeepAnalysis(latestAlert.title)} className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] font-bold text-xl shadow-[0_0_50px_rgba(37,99,235,0.4)] group/btn">
                          EXECUTAR ANÁLISE PROFUNDA <ChevronRight className="ml-3 h-6 w-6 group-hover/btn:translate-x-2 transition-transform" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-40 space-y-8 opacity-40">
                        <Radar className="h-24 w-24 text-primary animate-ping" />
                        <div className="text-center space-y-4">
                          <h2 className="text-3xl font-headline font-bold text-white uppercase tracking-widest">Sincronizando Malha Neural</h2>
                          <p className="max-w-md mx-auto italic">O Nexus está lendo o mundo para gerar seu próximo comando de investimento...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Coluna Direita: Whale Flow & Whispers */}
            <div className="lg:col-span-3 space-y-8">
              <WhaleFlow transactions={whaleTransactions || []} onAnalyze={handleDeepAnalysis} />
              
              <div className="bg-[#080D18]/90 border border-white/10 rounded-[2.5rem] p-8 h-[380px] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-headline font-bold uppercase tracking-[0.5em] text-primary">RUMORES & WHISPERS</h3>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <ScrollArea className="flex-1">
                  <div className="space-y-6 pr-4">
                    {unifiedRadarFeed.filter(i => i.type === 'WHISPER').map((item, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 transition-all cursor-pointer group" onClick={() => handleDeepAnalysis(item.title)}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-[8px] border-primary/20 text-primary uppercase font-bold tracking-widest px-2 py-0.5">
                            FUNDAÇÃO: {item.score}%
                          </Badge>
                          <span className="text-[9px] text-white/40 font-bold">{formatDistanceToNow(new Date(item.timestamp), { locale: ptBR })}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors leading-tight mb-2">{item.title}</h4>
                        <p className="text-[10px] text-white/50 line-clamp-2 italic">{item.summary}</p>
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
