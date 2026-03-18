
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
  Heart,
  Waves,
  LayoutGrid,
  Activity
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function NexusDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'market'>('dashboard');
  const [isScanning, setIsScanning] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | null>(null);
  const [lastAutoScan, setLastAutoScan] = useState<Date>(new Date());

  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Real-time Listeners
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
    return query(collection(firestore, "whale_transactions"), orderBy("timestamp", "desc"), limit(10));
  }, [firestore]);

  const entitiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "market_entities"), orderBy("influenceScore", "desc"), limit(5));
  }, [firestore]);

  const pricesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "market_prices"), orderBy("ticker", "asc"));
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

  // Initial Auth
  useEffect(() => {
    if (!user && !isUserLoading && auth) initiateAnonymousSignIn(auth);
  }, [user, isUserLoading, auth]);

  const triggerGlobalScan = useCallback(async () => {
    if (isScanning || !firestore) return;
    setIsScanning(true);
    try {
      const results = await Promise.allSettled([
        monitorGlobalEvents({ rawNewsData: "Varredura 360: Foco em Whale Flows e Geopolítica Institucional." }),
        runAutonomousWhisperScan(),
        runWhaleDiscovery()
      ]);

      const geopoliticalResult = results[0].status === 'fulfilled' ? results[0].value : null;
      const whispersResult = results[1].status === 'fulfilled' ? results[1].value : null;
      const whalesResult = results[2].status === 'fulfilled' ? results[2].value : null;

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

      // Initialize default prices if empty or during scan update
      const defaultAssets: MarketPrice[] = [
        { id: 'BTC', ticker: 'BTC', price: 98450.25, change24h: 3.45, category: 'crypto', updatedAt: new Date().toISOString() },
        { id: 'ETH', ticker: 'ETH', price: 3250.12, change24h: -1.20, category: 'crypto', updatedAt: new Date().toISOString() },
        { id: 'SOL', ticker: 'SOL', price: 185.44, change24h: 8.12, category: 'crypto', updatedAt: new Date().toISOString() },
        { id: 'VALE3', ticker: 'VALE3', price: 62.45, change24h: 0.54, category: 'stocks', updatedAt: new Date().toISOString() },
        { id: 'PETR4', ticker: 'PETR4', price: 38.12, change24h: -2.31, category: 'stocks', updatedAt: new Date().toISOString() },
        { id: 'HGLG11', ticker: 'HGLG11', price: 164.20, change24h: 0.15, category: 'fiis', updatedAt: new Date().toISOString() },
        { id: 'IBOV', ticker: 'IBOV', price: 128450, change24h: 0.87, category: 'index', updatedAt: new Date().toISOString() },
      ];

      defaultAssets.forEach(asset => {
        setDocumentNonBlocking(doc(firestore, "market_prices", asset.ticker), asset, { merge: true });
      });

      setLastAutoScan(new Date());
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
    setChatInitialQuery(`Análise profunda sobre: ${context}. Me dê sugestões de investimento baseadas nisso.`);
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
        <p className="text-primary font-headline font-bold animate-pulse uppercase tracking-[0.5em]">Nexus Unit Initialization</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative selection:bg-primary selection:text-white">
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />

      <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-5">
          <div className="p-3 rounded-2xl bg-primary/20 border border-primary/40 led-glow-blue">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-2xl led-text-blue">NEXUS AI</h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-primary font-bold uppercase tracking-[0.4em] opacity-80">Autonomous Intel Unit</span>
              <div className="flex items-center gap-1">
                <Heart className="h-2 w-2 text-rose-500 fill-rose-500 animate-pulse" />
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">PULSE ACTIVE</span>
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
          <div className="hidden xl:flex flex-col items-end mr-4">
            <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Sentinela v3.6</span>
            <span className="text-[10px] text-white font-bold">{formatDistanceToNow(lastAutoScan, { addSuffix: true, locale: ptBR })}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={triggerGlobalScan} disabled={isScanning} className="rounded-xl bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold uppercase px-6 h-10 hover:bg-accent/20">
            {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Radar className="h-3 w-3 mr-2" />} VARREDURA 360°
          </Button>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-8 py-10 space-y-10 relative z-10">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <WorldMood latestAlert={latestAlert} latestWhisper={latestWhisper} onAnalyze={handleDeepAnalysis} />
              <WarRoom entities={marketEntities || []} onAnalyze={handleDeepAnalysis} />
            </div>

            <div className="lg:col-span-6 space-y-8">
              <div className="bg-[#080D18]/95 border border-white/10 rounded-[3.5rem] p-12 h-full min-h-[600px] relative overflow-hidden flex flex-col justify-center shadow-2xl transition-all hover:border-primary/40">
                
                {latestAlert ? (
                  <div className="space-y-8 z-10 animate-in fade-in duration-700">
                    {isScanning && (
                      <div className="absolute top-8 right-12 flex items-center gap-2 text-primary/40">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Atualizando Inteligência...</span>
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <Badge className={cn("text-white font-bold px-5 py-2 rounded-xl", latestAlert.marketAction === 'SELL' ? 'bg-rose-500' : 'bg-accent')}>
                          ORDEM: {latestAlert.marketAction}
                        </Badge>
                        <Badge variant="outline" className="text-primary border-primary/30 gap-1.5 px-3 py-1 uppercase font-bold text-[10px]">
                          ELO DE CAUSALIDADE DETECTADO
                        </Badge>
                      </div>
                      <h2 className="text-6xl font-headline font-bold text-white leading-tight tracking-tighter">{latestAlert.title}</h2>
                    </div>
                    <p className="text-2xl font-medium italic text-white/90 leading-relaxed border-l-4 border-accent pl-6">
                      "{latestAlert.essentialText}"
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {latestAlert.affectedAssetsDetails?.slice(0, 4).map((asset, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:border-primary/40 transition-all cursor-pointer" onClick={() => handleDeepAnalysis(`Impacto de ${latestAlert.title} no ativo ${asset.ticker}`)}>
                          <div>
                            <span className="text-xs font-bold text-primary block mb-1">{asset.ticker}</span>
                            <span className="text-sm font-bold text-white">{asset.name}</span>
                          </div>
                          <div className={cn("text-sm font-bold", asset.impactType === 'Positivo' ? 'text-emerald-400' : 'text-rose-400')}>
                            {asset.expectedGainPercentage}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => handleDeepAnalysis(latestAlert.title)} className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-12 h-16 font-bold text-xl shadow-lg w-full sm:w-auto">
                      ANALISAR ESTRATÉGIA <ChevronRight className="ml-2 h-6 w-6" />
                    </Button>
                  </div>
                ) : isScanning ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-20 z-10">
                    <div className="relative h-24 w-24">
                      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <Radar className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-primary font-headline font-bold text-xl led-text-blue uppercase tracking-widest">Processando Ciclo Neural...</p>
                  </div>
                ) : (
                  <div className="text-center py-20 flex flex-col items-center">
                    <Terminal className="h-12 w-12 text-muted-foreground opacity-20 mb-6" />
                    <p className="text-white/60 text-xl font-medium italic mb-8">Nenhum "Cisne Negro" no radar imediato.</p>
                    <Button onClick={triggerGlobalScan} className="bg-accent hover:bg-accent/90 h-14 px-10 rounded-2xl gap-3 font-bold"><Scan className="h-5 w-5" /> FORÇAR VARREDURA GLOBAL</Button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
              <WhaleFlow transactions={whaleTransactions || []} onAnalyze={handleDeepAnalysis} />
              <div className="bg-[#080D18]/90 border border-white/10 rounded-[2.5rem] p-8 h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-headline font-bold uppercase tracking-[0.4em] text-primary">WHISPER RADAR</h3>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-6">
                    {unifiedRadarFeed.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-all cursor-pointer" onClick={() => handleDeepAnalysis(item.title)}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-[8px] border-primary/20 text-primary">
                            {item.type === 'WHISPER' ? `SUSSURRO: ${item.score}%` : 'ALERTA GLOBAL'}
                          </Badge>
                          <span className="text-[9px] text-white/40">{formatDistanceToNow(new Date(item.timestamp), { locale: ptBR })}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white/90 mb-2">{item.title}</h4>
                        <p className="text-[10px] text-white/60 line-clamp-2">{item.summary}</p>
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
