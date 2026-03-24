"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { WorldMood } from "@/components/dashboard/world-mood";
import { WhaleFlow } from "@/components/dashboard/whale-flow";
import { WarRoom } from "@/components/dashboard/war-room";
import { WhispersRadar } from "@/components/dashboard/whispers-radar";
import { UserAsset, GlobalIntelligenceAlert, MarketPrice, AutonomousInsight, WhaleTransaction, MarketEntity, UserProfile } from "@/lib/types";
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
  ChevronLeft,
  LogOut,
  ShieldEllipsis,
  User,
  Info,
  Crown,
  Lock
} from "lucide-react";
import { AssistantChat } from "@/components/ai/assistant-chat";
import { Badge } from "@/components/ui/badge";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { MarketExplorer } from "@/components/market/market-explorer";
import { useCollection, useFirestore, useMemoFirebase, useUser, useAuth, addDocumentNonBlocking, setDocumentNonBlocking, useDoc } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ConsentDialog } from "@/components/auth/consent-dialog";
import { signOut } from "firebase/auth";
import Link from "next/link";

export default function NexusDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'market'>('dashboard');
  const [isScanning, setIsScanning] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | null>(null);

  const firestore = useFirestore();
  const auth = useAuth();
  const { user: currentUser } = useUser();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return doc(firestore, "users", currentUser.uid);
  }, [firestore, currentUser]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const adminCheckRef = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return doc(firestore, "admin_roles", currentUser.uid);
  }, [firestore, currentUser]);
  const { data: adminRole } = useDoc(adminCheckRef);

  const effectiveTier = useMemo(() => {
    if (adminRole) return 'SOVEREIGN';
    return userProfile?.subscriptionTier || 'SENTINEL';
  }, [adminRole, userProfile]);

  useEffect(() => {
    if (currentUser && firestore) {
      const userRef = doc(firestore, "users", currentUser.uid);
      const syncData: any = {
        id: currentUser.uid,
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      };
      
      if (currentUser.displayName && currentUser.displayName !== "Estrategista Nexus") {
        syncData.displayName = currentUser.displayName;
      }

      if (userProfile && !userProfile.subscriptionTier) {
        syncData.subscriptionTier = "SENTINEL";
      }

      setDocumentNonBlocking(userRef, syncData, { merge: true });
    }
  }, [currentUser, firestore, userProfile]);

  const alertsQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return query(collection(firestore, "global_intelligence_alerts"), orderBy("createdAt", "desc"), limit(20));
  }, [firestore, currentUser]);

  const whispersQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return query(collection(firestore, "autonomous_insights"), orderBy("timestamp", "desc"), limit(20));
  }, [firestore, currentUser]);

  const whalesQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return query(collection(firestore, "whale_transactions"), orderBy("timestamp", "desc"), limit(30));
  }, [firestore, currentUser]);

  const entitiesQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return query(collection(firestore, "market_entities"), orderBy("influenceScore", "desc"), limit(15));
  }, [firestore, currentUser]);

  const pricesQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return query(collection(firestore, "market_prices"), orderBy("updatedAt", "desc"), limit(500));
  }, [firestore, currentUser]);

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

  const triggerGlobalScan = useCallback(async () => {
    if (isScanning || !firestore || !auth.currentUser) return;
    
    setIsScanning(true);
    try {
      const userTickers = userAssetsData?.map(a => a.ticker).filter(Boolean) as string[] || [];
      const results = await Promise.allSettled([
        monitorGlobalEvents({ context: "VIGILÂNCIA OMNISCIENTE TOTAL 5.5 - BUSCA MASSIVA HOJE" }),
        runAutonomousWhisperScan(),
        runWhaleDiscovery(),
        fetchGlobalMarketData(userTickers)
      ]);

      const monitorResult = results[0].status === 'fulfilled' ? results[0].value : null;
      const whispersResult = results[1].status === 'fulfilled' ? results[1].value : null;
      const whalesResult = results[2].status === 'fulfilled' ? results[2].value : null;
      const marketDataResult = results[3].status === 'fulfilled' ? results[3].value : null;

      if (auth.currentUser) {
        if (monitorResult?.alerts) {
          monitorResult.alerts.forEach(alert => {
            if (auth.currentUser) {
              addDocumentNonBlocking(collection(firestore, "global_intelligence_alerts"), {
                ...alert,
                createdAt: new Date().toISOString()
              });
            }
          });
        }

        if (whispersResult?.detected_whispers) {
          whispersResult.detected_whispers.forEach(w => {
            if (auth.currentUser) {
              addDocumentNonBlocking(collection(firestore, "autonomous_insights"), {
                ...w,
                timestamp: new Date().toISOString()
              });
            }
          });
        }

        if (whalesResult?.detected_whales) {
          whalesResult.detected_whales.forEach(tw => {
            if (auth.currentUser) {
              addDocumentNonBlocking(collection(firestore, "whale_transactions"), {
                ...tw,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString()
              });
            }
          });
        }

        if (marketDataResult?.assets) {
          marketDataResult.assets.forEach(asset => {
            if (auth.currentUser) {
              setDocumentNonBlocking(doc(firestore, "market_prices", asset.ticker), {
                ...asset,
                id: asset.ticker,
                updatedAt: new Date().toISOString()
              }, { merge: true });
            }
          });
        }
      }
    } catch (e) { 
      console.error("Global Scan Error:", e); 
    } finally { 
      setIsScanning(false); 
    }
  }, [isScanning, firestore, userAssetsData, auth]);

  useEffect(() => {
    if (currentUser) {
      triggerGlobalScan();
      const interval = setInterval(triggerGlobalScan, 600000);
      return () => clearInterval(interval);
    }
  }, [currentUser, triggerGlobalScan]);

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

  const NavButtons = () => (
    <div className="flex flex-col lg:flex-row gap-2 w-full">
      <button onClick={() => setActiveTab('dashboard')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all w-full lg:w-auto", activeTab === 'dashboard' ? 'nav-item-active' : 'text-muted-foreground hover:bg-white/5')}><LayoutGrid className="h-4 w-4" /> DASHBOARD</button>
      <button onClick={() => setActiveTab('market')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all w-full lg:w-auto", activeTab === 'market' ? 'nav-item-active' : 'text-muted-foreground hover:bg-white/5')}><TrendingUp className="h-4 w-4" /> MARKET</button>
      <button onClick={() => setActiveTab('portfolio')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all w-full lg:w-auto", activeTab === 'portfolio' ? 'nav-item-active' : 'text-muted-foreground hover:bg-white/5')}><Wallet className="h-4 w-4" /> WALLET</button>
    </div>
  );

  return (
    <AuthGuard>
      <ConsentDialog />
      <div className="min-h-screen relative selection:bg-primary selection:text-white flex flex-col">
        <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />

        <header className="h-16 md:h-20 border-b border-white/10 px-4 md:px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-2xl z-50">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="p-2 md:p-3 rounded-xl bg-primary/20 border border-primary/40 led-glow-blue">
              <Cpu className="h-4 w-4 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-bold text-sm md:text-2xl led-text-blue tracking-tighter">NEXUS AI</h1>
                {effectiveTier && (
                  <Badge className={cn(
                    "text-[7px] md:text-[8px] font-bold px-1.5 py-0.5 rounded-lg",
                    effectiveTier === 'SOVEREIGN' ? 'bg-accent text-background' :
                    effectiveTier === 'PRO' ? 'bg-primary text-background' :
                    'bg-white/10 text-white/40'
                  )}>
                    {effectiveTier}
                  </Badge>
                )}
              </div>
              {currentUser?.displayName && (
                <div className="flex items-center gap-1">
                  <span className="text-[8px] md:text-[10px] text-primary/60 font-bold uppercase tracking-widest hidden xs:block">COMANDANTE:</span>
                  <span className="text-[8px] md:text-[10px] text-white font-bold uppercase tracking-tight truncate max-w-[80px] md:max-w-none">{currentUser.displayName}</span>
                </div>
              )}
            </div>
          </div>

          <nav className="hidden lg:flex items-center bg-[#080D18] rounded-2xl p-1 border border-white/10 shadow-2xl">
            <NavButtons />
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={triggerGlobalScan} disabled={isScanning} className="rounded-xl bg-accent/10 border border-accent/30 text-accent h-9 w-9 md:h-10 md:w-10 hover:bg-accent/20">
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white lg:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#080D18] border-white/10 p-6 flex flex-col gap-6 w-72">
                 <div className="flex flex-col gap-4 mt-8">
                   <NavButtons />
                   <div className="h-px bg-white/10 my-4" />
                   {adminRole && (
                    <Link href="/admin">
                      <Button variant="outline" className="w-full border-primary/40 text-primary rounded-xl h-12 font-bold text-xs">
                        <ShieldEllipsis className="h-4 w-4 mr-2" /> PAINEL ADMIN
                      </Button>
                    </Link>
                   )}
                   {effectiveTier !== 'SOVEREIGN' && (
                      <Link href="/landing#pricing">
                        <Button className="w-full bg-accent text-background rounded-xl h-12 font-bold text-xs">
                          <Crown className="h-4 w-4 mr-2" /> UPGRADE SOVEREIGN
                        </Button>
                      </Link>
                    )}
                   <Button variant="ghost" onClick={() => signOut(auth)} className="w-full text-rose-500 hover:bg-rose-500/10 rounded-xl h-12 font-bold text-xs justify-start">
                     <LogOut className="h-4 w-4 mr-2" /> ENCERRAR SESSÃO
                   </Button>
                 </div>
              </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon" onClick={() => signOut(auth)} className="hidden lg:flex text-white/40 hover:text-rose-500 rounded-xl transition-colors">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 md:px-8 py-4 md:py-10 space-y-6 md:space-y-10 relative z-10 overflow-y-auto no-scrollbar">
          {activeTab === 'dashboard' && (
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-8 items-start">
              
              <div className="w-full lg:col-span-3 flex flex-col gap-6 md:gap-8 order-2 lg:order-1">
                <div className="h-[350px] md:h-[400px]">
                  <WorldMood latestAlert={latestAlert} latestWhisper={latestWhisper} onAnalyze={handleDeepAnalysis} />
                </div>
                <div className="h-[350px] md:h-[400px] relative">
                  <WhispersRadar insights={whispers || []} onAnalyze={handleDeepAnalysis} />
                  {effectiveTier === 'SENTINEL' && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center rounded-[2rem] md:rounded-[3rem]">
                      <Lock className="h-8 w-8 text-primary mb-3" />
                      <h4 className="text-xs font-bold text-white uppercase mb-1">RADAR BLOQUEADO</h4>
                      <p className="text-[9px] text-white/60 mb-4 uppercase tracking-widest leading-relaxed">Upgrade para ver rumores validados.</p>
                      <Link href="/landing#pricing">
                        <Button variant="outline" className="border-primary/40 text-primary rounded-xl font-bold text-[9px] px-4 h-8">UPGRADE</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full lg:col-span-6 order-1 lg:order-2">
                <div className="bg-[#080D18]/95 border border-white/10 rounded-[2rem] md:rounded-[3rem] min-h-[450px] md:h-[820px] relative overflow-hidden flex flex-col shadow-2xl transition-all hover:border-primary/40">
                  <div className="absolute top-3 right-4 md:top-4 md:right-8 z-20 flex items-center gap-2 md:gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="p-1.5 md:p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">
                          <Info className="h-3.5 w-3.5 text-primary" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="glass-panel border-primary/30 w-72 md:w-80 p-5 rounded-3xl">
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Manual Tático: Alertas</h4>
                          <p className="text-[11px] text-white/80 leading-relaxed">O motor central de decisão do Nexus, cruzando fatos geopolíticos com o mercado.</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2 md:px-4 py-1 rounded-lg md:rounded-xl text-[7px] md:text-[10px] font-bold animate-pulse">
                      SENTINELA ATIVO
                    </Badge>
                  </div>

                  <Carousel className="w-full h-full">
                    <CarouselContent className="h-full">
                      {globalAlerts && globalAlerts.length > 0 ? (
                        globalAlerts.map((alert, index) => (
                          <CarouselItem key={alert.id} className="h-full">
                            <ScrollArea className="h-full">
                              <div className="p-5 md:p-10 space-y-6 md:space-y-8">
                                <div className="flex items-center justify-between">
                                  <Badge className={cn(
                                    "text-white font-bold px-4 md:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-sm led-glow-blue tracking-widest",
                                    alert.marketAction === 'SELL' ? 'bg-rose-600' : 
                                    alert.marketAction === 'BUY' ? 'bg-emerald-600' : 'bg-primary'
                                  )}>
                                    ORDEM: {alert.marketAction}
                                  </Badge>
                                  <span className="text-[8px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    {index + 1} / {globalAlerts.length}
                                  </span>
                                </div>

                                <h2 className="text-xl md:text-5xl font-headline font-bold text-white leading-tight tracking-tighter">
                                  {alert.title}
                                </h2>
                                
                                <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-[2.5rem] p-5 md:p-8 space-y-4 md:space-y-6">
                                  <p className="text-sm md:text-xl text-white font-medium italic leading-relaxed">
                                    "{alert.essentialText}"
                                  </p>
                                  <p className="text-[11px] md:text-sm text-white/50 leading-relaxed font-light line-clamp-4 md:line-clamp-none">
                                    {alert.causalityExplanation}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl">
                                    <span className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase tracking-widest block mb-1">Risco</span>
                                    <span className="text-[10px] md:text-xs text-white font-medium">{alert.riskLevel}</span>
                                  </div>
                                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl">
                                    <span className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase tracking-widest block mb-1">Prioridade</span>
                                    <span className="text-[10px] md:text-xs text-white font-medium">{alert.priority}/5</span>
                                  </div>
                                </div>

                                <Button 
                                  onClick={() => handleDeepAnalysis(`Execute comando Nexus de análise sobre: ${alert.title}.`)} 
                                  className="w-full h-14 md:h-20 rounded-xl md:rounded-[2rem] bg-primary hover:bg-primary/90 font-bold text-sm md:text-xl flex items-center justify-center gap-2 md:gap-4"
                                >
                                  ANÁLISE 360°
                                  <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
                                </Button>
                              </div>
                              <ScrollBar className="bg-white/5" />
                            </ScrollArea>
                          </CarouselItem>
                        ))
                      ) : (
                        <CarouselItem className="h-full">
                          <div className="flex flex-col items-center justify-center h-full py-20 md:py-40 opacity-40">
                            <Radar className="h-16 w-16 md:h-24 md:w-24 text-primary animate-ping" />
                            <p className="text-center mt-6 text-[8px] md:text-[10px] font-bold tracking-[0.3em] uppercase">Vigilância Ativa...</p>
                          </div>
                        </CarouselItem>
                      )}
                    </CarouselContent>
                    {globalAlerts && globalAlerts.length > 1 && (
                      <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 flex gap-2 md:gap-4 z-30">
                        <CarouselPrevious className="static translate-y-0 h-10 w-10 md:h-14 md:w-14 bg-white/5 border-white/10 text-white rounded-xl" />
                        <CarouselNext className="static translate-y-0 h-10 w-10 md:h-14 md:w-14 bg-white/5 border-white/10 text-white rounded-xl" />
                      </div>
                    )}
                  </Carousel>
                </div>
              </div>

              <div className="w-full lg:col-span-3 flex flex-col gap-6 md:gap-8 order-3">
                <div className="h-[350px] md:h-[400px] relative">
                  <WhaleFlow transactions={whaleTransactions || []} onAnalyze={handleDeepAnalysis} />
                  {effectiveTier === 'SENTINEL' && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center rounded-[2rem] md:rounded-[3rem]">
                      <Lock className="h-8 w-8 text-primary mb-3" />
                      <h4 className="text-xs font-bold text-white uppercase mb-1">FLOW BLOQUEADO</h4>
                      <p className="text-[9px] text-white/60 mb-4 uppercase tracking-widest leading-relaxed">Upgrade para ver Baleias.</p>
                      <Link href="/landing#pricing">
                        <Button variant="outline" className="border-accent/40 text-accent rounded-xl font-bold text-[9px] px-4 h-8">UPGRADE</Button>
                      </Link>
                    </div>
                  )}
                </div>
                <div className="h-[350px] md:h-[400px] relative">
                  <WarRoom entities={marketEntities || []} onAnalyze={handleDeepAnalysis} />
                  {effectiveTier !== 'SOVEREIGN' && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center rounded-[2rem] md:rounded-[3rem]">
                      <Lock className="h-8 w-8 text-primary mb-3" />
                      <h4 className="text-xs font-bold text-white uppercase mb-1">WAR ROOM EXCLUSIVO</h4>
                      <p className="text-[9px] text-white/60 mb-4 uppercase tracking-widest leading-relaxed">Mapeie Instituições no SOVEREIGN.</p>
                      <Link href="/landing#pricing">
                        <Button variant="outline" className="border-accent/40 text-accent rounded-xl font-bold text-[9px] px-4 h-8">UPGRADE</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'market' && <MarketExplorer prices={marketPrices || []} latestAlert={latestAlert} onAnalyze={handleDeepAnalysis} tier={effectiveTier} />}
          {activeTab === 'portfolio' && <PortfolioView assets={userAssetsData || []} marketPrices={marketPrices || []} onUpdateAsset={handleUpdateAsset} onAnalyze={handleDeepAnalysis} tier={effectiveTier} />}
        </main>

        <AssistantChat assets={userAssetsData || []} displayMode={'Essencial'} userName={currentUser?.displayName} externalOpen={isChatOpen} onOpenChange={setIsChatOpen} initialQuery={chatInitialQuery} latestAlert={latestAlert} />
      </div>
    </AuthGuard>
  );
}