
"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { WorldMood } from "@/components/dashboard/world-mood";
import { AssetType, DisplayMode, UserAsset, GlobalIntelligenceAlert, MarketPrice, AutonomousInsight } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  Globe, 
  Wallet, 
  Zap, 
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
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  CloudLightning,
  Ship,
  Search,
  LayoutGrid,
  Scale,
  Gavel,
  Landmark,
  Eye,
  Radar,
  Heart
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
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NexusDashboard() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('Essencial');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'market'>('dashboard');
  const [isScanning, setIsScanning] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | null>(null);
  const [lastAutoScan, setLastAutoScan] = useState<Date>(new Date());

  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Initialize Auth
  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  // Real-time Listeners
  const alertsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, "global_intelligence_alerts"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
  }, [firestore, user]);

  const whispersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, "autonomous_insights"),
      orderBy("timestamp", "desc"),
      limit(5)
    );
  }, [firestore, user]);

  const pricesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, "market_prices"));
  }, [firestore, user]);

  const { data: globalAlerts } = useCollection<GlobalIntelligenceAlert>(alertsQuery);
  const { data: whispers } = useCollection<AutonomousInsight>(whispersQuery);
  const { data: livePrices } = useCollection<MarketPrice>(pricesQuery);
  
  const latestAlert = globalAlerts?.[0];

  const priceMap = useMemo(() => {
    const map: Record<string, MarketPrice> = {};
    livePrices?.forEach(p => { 
      const ticker = (p.ticker || "").toUpperCase().trim();
      if (ticker) map[ticker] = p; 
    });
    return map;
  }, [livePrices]);

  // Sync Logic
  const syncLivePrices = useCallback(async () => {
    if (!user) return;
    
    const savePrice = (ticker: string, data: Partial<MarketPrice>) => {
      const cleanTicker = ticker.toUpperCase().replace('.SA', '').trim();
      setDocumentNonBlocking(doc(firestore, "market_prices", cleanTicker), {
        ticker: cleanTicker,
        updatedAt: new Date().toISOString(),
        ...data
      }, { merge: true });
    };

    try {
      const twelveDataKey = '1dfd3b0de4ee45beb09371dee7fc399f';
      const globalSymbols = 'AAPL,MSFT,GOOGL,AMZN,TSLA,META,NVDA,BTC/USD,ETH/USD,SPY,QQQ';
      
      fetch(`https://api.twelvedata.com/quote?symbol=${globalSymbols}&apikey=${twelveDataKey}`)
        .then(r => r.json())
        .then(data => {
          Object.keys(data).forEach(symbol => {
            const item = data[symbol];
            if (item && item.price) {
              const ticker = symbol.split('/')[0];
              savePrice(ticker, {
                price: parseFloat(item.price),
                change24h: parseFloat(item.percent_change || 0),
                category: ticker === 'BTC' || ticker === 'ETH' ? 'crypto' : 'stocks'
              });
            }
          });
        }).catch(() => {});

      const b3Token = '2rb5157StMMfsE1ft1ErSq';
      const b3Tickers = ['PETR4', 'VALE3', 'ITUB4', 'HGLG11', 'VGIA11', 'MXRF11'];
      b3Tickers.forEach(t => {
        fetch(`https://brapi.dev/api/quote/${t}?token=${b3Token}`)
          .then(r => r.json())
          .then(data => {
            if (data.results?.[0]) {
              const item = data.results[0];
              savePrice(t, {
                price: item.regularMarketPrice,
                change24h: item.regularMarketChangePercent,
                category: t.endsWith('11') ? 'fiis' : 'stocks'
              });
            }
          }).catch(() => {});
      });
    } catch (error) {
      console.error("Nexus Sync Engine Failure:", error);
    }
  }, [user, firestore]);

  const triggerGlobalScan = useCallback(async () => {
    if (!user || isScanning) return;
    setIsScanning(true);
    
    try {
      await syncLivePrices();

      const [geopoliticalResult, whispersResult] = await Promise.all([
        monitorGlobalEvents({ rawNewsData: "Varredura estratégica global autônoma." }),
        runAutonomousWhisperScan()
      ]);

      if (geopoliticalResult) {
        addDocumentNonBlocking(collection(firestore, "global_intelligence_alerts"), {
          ...geopoliticalResult,
          createdAt: new Date().toISOString()
        });
      }

      if (whispersResult && whispersResult.detected_whispers) {
        whispersResult.detected_whispers.forEach(whisper => {
          addDocumentNonBlocking(collection(firestore, "autonomous_insights"), {
            ...whisper,
            timestamp: new Date().toISOString()
          });
        });
      }
      setLastAutoScan(new Date());
    } catch (error) {
      console.error("Erro na varredura global:", error);
    } finally {
      setIsScanning(false);
    }
  }, [user, isScanning, firestore, syncLivePrices]);

  // AUTONOMOUS CYCLE: The Pulse of Nexus
  useEffect(() => {
    if (user && !isUserLoading) {
      // First scan on mount
      triggerGlobalScan();
      
      // Price Sync every 60 seconds
      const priceInterval = setInterval(syncLivePrices, 60000); 
      
      // Full AI Global Scan every 15 minutes (Simulating the 24h Autonomous Engine)
      const aiScanInterval = setInterval(triggerGlobalScan, 900000); 
      
      return () => {
        clearInterval(priceInterval);
        clearInterval(aiScanInterval);
      };
    }
  }, [user, isUserLoading, triggerGlobalScan, syncLivePrices]);

  const discussWithNexus = (alertTitle: string) => {
    setChatInitialQuery(`Nexus, baseado em "${alertTitle}", qual a melhor estratégia de proteção agora?`);
    setIsChatOpen(true);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-primary font-headline font-bold animate-pulse uppercase tracking-widest">NEXUS SENTINEL v3.0 ACTIVE</p>
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
              <span className="text-[9px] text-primary font-bold uppercase tracking-[0.4em] opacity-80">Autonomous Sentinel v3.0</span>
              <div className="flex items-center gap-1">
                <Heart className="h-2 w-2 text-rose-500 fill-rose-500 animate-pulse" />
                <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">PULSE ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center bg-[#080D18] rounded-2xl p-1 border border-white/10 shadow-2xl">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'nav-item-active' : 'text-muted-foreground'}`}><LayoutGrid className="h-3.5 w-3.5" /> DASHBOARD</button>
          <button onClick={() => setActiveTab('market')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'market' ? 'nav-item-active' : 'text-muted-foreground'}`}><TrendingUp className="h-3.5 w-3.5" /> MARKET</button>
          <button onClick={() => setActiveTab('portfolio')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'portfolio' ? 'nav-item-active' : 'text-muted-foreground'}`}><Wallet className="h-3.5 w-3.5" /> WALLET</button>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden xl:flex flex-col items-end mr-4">
            <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Última Varredura</span>
            <span className="text-[10px] text-white font-bold">{formatDistanceToNow(lastAutoScan, { addSuffix: true, locale: ptBR })}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={triggerGlobalScan} disabled={isScanning} className="rounded-xl bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold uppercase px-6 h-10 hover:bg-accent/20">
            {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Radar className="h-3 w-3 mr-2" />} VARREDURA 360°
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDisplayMode(displayMode === 'Essencial' ? 'Completo' : 'Essencial')} className="rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase px-6 h-10">
            MODO: <span className="text-primary ml-1">{displayMode}</span>
          </Button>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-8 py-10 space-y-10 relative z-10">
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { ticker: 'IBOV', label: 'IBOVESPA' },
                { ticker: 'HGLG11', label: 'HGLG LOGÍSTICA' },
                { ticker: 'BTC', label: 'BITCOIN' },
                { ticker: 'NVDA', label: 'NVIDIA' },
              ].map((m, i) => {
                const liveData = priceMap[m.ticker.toUpperCase()];
                const value = liveData ? (m.ticker === 'BTC' || m.ticker === 'NVDA' ? `US$ ${liveData.price.toLocaleString()}` : `R$ ${liveData.price.toLocaleString()}`) : '---';
                const change = liveData ? `${liveData.change24h > 0 ? '+' : ''}${liveData.change24h.toFixed(2)}%` : '---';
                const isUp = liveData ? liveData.change24h > 0 : true;
                return (
                  <div key={i} className="bg-[#080D18]/90 border border-white/10 rounded-3xl p-7 transition-all hover:border-primary/40 group shadow-2xl relative overflow-hidden">
                    <p className="text-[10px] font-headline font-bold text-muted-foreground uppercase tracking-[0.3em] mb-4">{m.label}</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-headline font-bold text-white led-text-blue">{value}</h3>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />} {change}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3">
                <WorldMood />
              </div>

              <div className="lg:col-span-6">
                <div className="bg-[#080D18]/95 border border-white/10 rounded-[3.5rem] p-12 h-full min-h-[550px] relative overflow-hidden flex flex-col justify-center shadow-2xl transition-all hover:border-accent/40">
                  {isScanning ? (
                    <div className="flex flex-col items-center justify-center space-y-6 py-20 z-10">
                      <div className="relative h-24 w-24">
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <Radar className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                      </div>
                      <p className="text-primary font-headline font-bold text-xl led-text-blue uppercase">Nexus caçando sussurros globais...</p>
                    </div>
                  ) : latestAlert ? (
                    <div className="space-y-8 z-10 animate-in fade-in duration-700">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Badge className={`${latestAlert.marketAction === 'SELL' ? 'bg-rose-500' : 'bg-accent'} text-white font-bold px-5 py-2 rounded-xl`}>
                            {latestAlert.marketAction} IMEDIATA
                          </Badge>
                          <Badge variant="outline" className="text-primary border-primary/30 gap-1.5 px-3 py-1 uppercase font-bold text-[10px]">
                            <Radar className="h-3 w-3" /> ELO DE CAUSALIDADE
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-bold">{formatDistanceToNow(new Date(latestAlert.createdAt), { addSuffix: true, locale: ptBR })}</span>
                        </div>
                        <h2 className="text-5xl font-headline font-bold text-white leading-tight tracking-tight">{latestAlert.title}</h2>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-accent/50 rounded-full" />
                        <div className="space-y-4 pl-4">
                           <p className="text-xl font-medium italic text-white/95 leading-relaxed">
                             "{displayMode === 'Essencial' ? latestAlert.essentialText : latestAlert.causalityExplanation}"
                           </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-[10px] font-headline font-bold text-accent uppercase tracking-[0.3em] flex items-center gap-2">
                            <Target className="h-3 w-3" /> RADAR TÁTICO: ATIVOS EM RISCO
                         </h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {latestAlert.affectedAssetsDetails?.slice(0, 4).map((asset, i) => (
                              <div key={i} className="glass-panel border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary font-bold text-xs">{asset.ticker}</div>
                                    <div className="flex flex-col">
                                       <span className="text-xs font-bold text-white">{asset.name}</span>
                                       <span className={`text-[10px] font-bold ${asset.impactType === 'Positivo' ? 'text-emerald-400' : 'text-rose-400'}`}>Impacto {asset.impactType}</span>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <div className={`text-sm font-bold ${asset.impactType === 'Positivo' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                       {asset.expectedGainPercentage}
                                    </div>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="flex items-center gap-8 pt-4">
                        <Button onClick={() => discussWithNexus(latestAlert.title)} className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-12 h-16 font-bold text-xl shadow-lg">
                          DETALHAR ESTRATÉGIA <ChevronRight className="ml-2 h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 flex flex-col items-center">
                      <Terminal className="h-12 w-12 text-muted-foreground opacity-20 mb-6" />
                      <p className="text-white/60 text-xl font-medium italic mb-8">Nenhum "Cisne Negro" detectado.</p>
                      <Button onClick={triggerGlobalScan} className="bg-accent hover:bg-accent/90 h-14 px-10 rounded-2xl gap-3 font-bold"><Scan className="h-5 w-5" /> SOLICITAR VARREDURA ESTRATÉGICA</Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-[#080D18]/90 border border-white/10 rounded-[3rem] p-10 space-y-8 h-full shadow-2xl flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-headline font-bold uppercase tracking-[0.4em] text-primary">WHISPER RADAR</h3>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  
                  <ScrollArea className="flex-1 pr-2">
                    <div className="space-y-6">
                      {whispers && whispers.length > 0 ? (
                        whispers.map((whisper, idx) => (
                          <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 hover:border-primary/40 transition-all">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[8px] border-primary/30 text-primary font-bold uppercase">
                                Rumor: {whisper.foundation_score}% Found.
                              </Badge>
                              <span className="text-[9px] text-muted-foreground font-bold">{formatDistanceToNow(new Date(whisper.timestamp), { locale: ptBR })}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white/90 leading-tight">{whisper.topic}</h4>
                            
                            <div className="grid grid-cols-3 gap-2">
                               <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                  <span className="text-[7px] text-emerald-400 font-bold uppercase">Otimista</span>
                                  <span className="text-[9px] text-white font-bold">{whisper.scenarios.optimistic.prob}</span>
                               </div>
                               <div className="flex flex-col items-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                  <span className="text-[7px] text-blue-400 font-bold uppercase">Base</span>
                                  <span className="text-[9px] text-white font-bold">{whisper.scenarios.baseline.prob}</span>
                               </div>
                               <div className="flex flex-col items-center p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                  <span className="text-[7px] text-rose-400 font-bold uppercase">Risco</span>
                                  <span className="text-[9px] text-white font-bold">{whisper.scenarios.risk.prob}</span>
                               </div>
                            </div>

                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                               Impacto: <span className="text-white font-medium">{whisper.market_impact}</span>
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="h-40 flex flex-col items-center justify-center opacity-20 space-y-4 text-center">
                          <Eye className="h-10 w-10" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Nexus em vigilância silenciosa...</span>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'market' && <MarketExplorer prices={livePrices || []} latestAlert={latestAlert} />}
        {activeTab === 'portfolio' && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
             <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                <h2 className="text-5xl font-headline font-bold text-white tracking-tight">Sua Wallet</h2>
                <p className="text-muted-foreground font-medium text-lg">Proteção de capital baseada em previsões globais e sussurros de mercado.</p>
              </div>
            </div>
            <PortfolioView assets={[]} onUpdateAsset={() => {}} />
          </div>
        )}
      </main>

      <AssistantChat assets={[]} displayMode={displayMode} externalOpen={isChatOpen} onOpenChange={setIsChatOpen} initialQuery={chatInitialQuery} latestAlert={latestAlert} />
    </div>
  );
}
