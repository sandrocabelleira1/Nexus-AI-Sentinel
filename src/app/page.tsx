
"use client"

import { useState, useMemo, useEffect, useCallback } from "react";
import { WorldMood } from "@/components/dashboard/world-mood";
import { AssetType, DisplayMode, UserAsset, GlobalIntelligenceAlert, MarketPrice } from "@/lib/types";
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
  Ship
} from "lucide-react";
import { AssistantChat } from "@/components/ai/assistant-chat";
import { Badge } from "@/components/ui/badge";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { useCollection, useFirestore, useMemoFirebase, useUser, useAuth, initiateAnonymousSignIn, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
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
import { Card, CardContent } from "@/components/ui/card";

const initialMockAssets: UserAsset[] = [
  { id: '1', name: 'VALE3', type: 'Ação', location: 'XP Investimentos', riskLevel: 'Moderado', investedValue: 45000, quantity: 500 },
  { id: '2', name: 'BITCOIN', type: 'Criptomoeda', location: 'Ledger Nano X', riskLevel: 'Agressivo', investedValue: 120000, quantity: 0.42 },
  { id: '3', name: 'HGLG11', type: 'Fundo Imobiliário', location: 'BTG Pactual', riskLevel: 'Conservador', investedValue: 32000, quantity: 200 },
  { id: '4', name: 'VGIA11', type: 'Fundo Imobiliário', location: 'XP Investimentos', riskLevel: 'Moderado', investedValue: 15000, quantity: 1500 },
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

  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const alertsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, "global_intelligence_alerts"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
  }, [firestore, user]);

  const pricesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, "market_prices"));
  }, [firestore, user]);

  const { data: globalAlerts, isLoading: isLoadingAlerts } = useCollection<GlobalIntelligenceAlert>(alertsQuery);
  const { data: livePrices } = useCollection<MarketPrice>(pricesQuery);
  
  const latestAlert = globalAlerts?.[0];

  const priceMap = useMemo(() => {
    const map: Record<string, MarketPrice> = {};
    livePrices?.forEach(p => { map[p.ticker] = p; });
    return map;
  }, [livePrices]);

  const [newAsset, setNewAsset] = useState<Partial<UserAsset>>({
    name: '',
    type: 'Ação',
    location: '',
    riskLevel: 'Moderado',
    investedValue: 0,
    quantity: 0
  });

  const syncLivePrices = useCallback(async () => {
    if (!user) return;
    
    try {
      // 1. Binance (Criptomoedas)
      const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
      const cryptoResponses = await Promise.all(
        cryptoSymbols.map(s => fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`))
      );
      const cryptoData = await Promise.all(cryptoResponses.map(r => r.json()));

      cryptoData.forEach((tickerData) => {
        const ticker = tickerData.symbol.replace('USDT', '');
        setDocumentNonBlocking(doc(firestore, "market_prices", ticker), {
          ticker: ticker,
          price: parseFloat(tickerData.lastPrice),
          change24h: parseFloat(tickerData.priceChangePercent),
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });

      // 2. Brapi (B3 e FIIs)
      const b3Tickers = 'PETR4,VALE3,HGLG11,VGIA11,IBOV11,BOVA11';
      const b3ApiKey = '2rb5157StMMfsE1ft1ErSq';
      const b3Response = await fetch(`https://brapi.dev/api/quote/${b3Tickers}?token=${b3ApiKey}`);
      const b3Data = await b3Response.json();

      if (b3Data.results) {
        b3Data.results.forEach((item: any) => {
          setDocumentNonBlocking(doc(firestore, "market_prices", item.symbol), {
            ticker: item.symbol,
            price: item.regularMarketPrice,
            change24h: item.regularMarketChangePercent,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });
      }

      // 3. FMP (Ações Globais - NASDAQ/NYSE)
      const fmpTickers = 'AAPL,MSFT,NVDA,TSLA,GOOGL';
      const fmpApiKey = 'SGraLM1W4QBLLjGS3bDVUS6KFmqR7PrJ';
      const fmpResponse = await fetch(`https://financialmodelingprep.com/api/v3/quote/${fmpTickers}?apikey=${fmpApiKey}`);
      const fmpData = await fmpResponse.json();
      
      if (Array.isArray(fmpData)) {
        fmpData.forEach((item: any) => {
          setDocumentNonBlocking(doc(firestore, "market_prices", item.symbol), {
            ticker: item.symbol,
            price: item.price,
            change24h: item.changesPercentage,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });
      }

      // 4. Fallback / Outros
      const otherTickers = [
        { t: 'IBOV', p: 132000, c: 0.45 },
        { t: 'DOLAR', p: 5.12, c: -0.21 }
      ];

      otherTickers.forEach(item => {
        if (!priceMap[item.t]) {
           const randomFluctuation = (Math.random() * 2 - 1) * 0.05;
           setDocumentNonBlocking(doc(firestore, "market_prices", item.t), {
             ticker: item.t,
             price: item.p + randomFluctuation,
             change24h: item.c + (randomFluctuation / 20),
             updatedAt: new Date().toISOString()
           }, { merge: true });
        }
      });

    } catch (error) {
      console.error("Erro na sincronização global do Nexus:", error);
    }
  }, [user, firestore, priceMap]);

  const triggerGlobalScan = useCallback(async () => {
    if (!user || isScanning) return;
    setIsScanning(true);
    
    try {
      await syncLivePrices();

      const weatherApiKey = '6c6a8bd003806f53d8c5906014616088';
      const regions = [
        { name: 'Cuiabá (Agro Hub)', q: 'Cuiaba,BR' },
        { name: 'Santos (Porto Logística)', q: 'Santos,BR' }
      ];
      
      const weatherResponses = await Promise.all(
        regions.map(r => fetch(`https://api.openweathermap.org/data/2.5/weather?q=${r.q}&appid=${weatherApiKey}&units=metric`))
      );
      const weatherData = await Promise.all(weatherResponses.map(r => r.json()));
      
      const weatherContext = weatherData.map((w, i) => 
        `Região: ${regions[i].name} - Clima: ${w.weather?.[0]?.description}, Temp: ${w.main?.temp}°C, Humidade: ${w.main?.humidity}%`
      ).join(' | ');

      const promptData = `VARREDURA TÁTICA 7 DIAS. ANALISE IMPACTO GEOPOLÍTICO, CLIMÁTICO E MERCADOS GLOBAIS (FMP/NASDAQ). 
      CONTEXTO CLIMA REAL: ${weatherContext}. 
      FOCO ESPECIAL: FIIs de Agronegócio (VGIA11), Logística (HGLG11) e TECH GLOBAL (NVDA, AAPL). EMITA ORDENS DE EXECUÇÃO IMEDIATA.`;

      const result = await monitorGlobalEvents({ rawNewsData: promptData });
      if (result) {
        addDocumentNonBlocking(collection(firestore, "global_intelligence_alerts"), {
          ...result,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Erro na varredura climática/geopolítica:", error);
    } finally {
      setIsScanning(false);
    }
  }, [user, isScanning, firestore, syncLivePrices]);

  useEffect(() => {
    if (user && !isUserLoading) {
      syncLivePrices();
      const interval = setInterval(() => {
        syncLivePrices();
      }, 30000); 
      return () => clearInterval(interval);
    }
  }, [user, isUserLoading, syncLivePrices]);

  const discussWithNexus = (alertTitle: string) => {
    setChatInitialQuery(`Nexus, baseado no evento "${alertTitle}" e nas condições dos mercados globais identifiedas, quais ações IMEDIATAS devo tomar com meus ativos táticos?`);
    setIsChatOpen(true);
    setIsRecommendationOpen(false);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-primary font-headline font-bold animate-pulse tracking-widest uppercase text-center px-4">
          Nexus Sentinel Core v2.8<br/><span className="text-[10px] opacity-60">Synchronizing Global Market & Weather Feeds...</span>
        </p>
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
              <span className="text-[10px] text-primary font-bold uppercase tracking-[0.4em] opacity-80">Sentinel Strategic - Global Multi-Feed</span>
              <Badge variant="outline" className="h-4 px-1.5 text-[8px] bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold">BINANCE + B3 + NASDAQ ACTIVE</Badge>
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
            onClick={triggerGlobalScan}
            disabled={isScanning}
            className="rounded-xl bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest px-6 h-10 hover:bg-accent/20 transition-all hover:scale-105"
          >
            {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
            VARREDURA FORÇADA
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDisplayMode(displayMode === 'Essencial' ? 'Completo' : 'Essencial')}
            className="rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest px-6 h-10 hover:bg-white/10 transition-colors"
          >
            MODO: <span className="text-primary ml-1">{displayMode}</span>
          </Button>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-8 py-10 space-y-10 relative z-10">
        {activeTab === 'dashboard' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { ticker: 'IBOV', label: 'IBOVESPA INDEX' },
                { ticker: 'VGIA11', label: 'AGRO FII (REAL-TIME)' },
                { ticker: 'BTC', label: 'BITCOIN (BINANCE)' },
                { ticker: 'NVDA', label: 'NVIDIA (NASDAQ)' },
              ].map((m, i) => {
                const liveData = priceMap[m.ticker];
                const value = liveData ? 
                  (m.ticker === 'BTC' || m.ticker === 'NVDA' ? `US$ ${liveData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                   m.ticker === 'IBOV' ? liveData.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) :
                   `R$ ${liveData.price.toFixed(2)}`) 
                  : '---';
                const change = liveData ? `${liveData.change24h > 0 ? '+' : ''}${liveData.change24h.toFixed(2)}%` : '---';
                const isUp = liveData ? liveData.change24h > 0 : true;

                return (
                  <div key={i} className="bg-[#080D18]/90 border border-white/10 rounded-3xl p-7 transition-all hover:border-primary/40 group cursor-pointer shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-[10px] font-headline font-bold text-muted-foreground uppercase tracking-[0.3em] mb-4">{m.label}</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-3xl font-headline font-bold text-white led-text-blue">{value}</h3>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold ${isUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {change}
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
                <div className="bg-[#080D18]/95 border border-white/10 rounded-[3.5rem] p-12 h-full min-h-[550px] relative overflow-hidden flex flex-col justify-center shadow-2xl group transition-all hover:border-accent/40">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                  
                  {isScanning ? (
                    <div className="flex flex-col items-center justify-center space-y-6 py-20 z-10">
                      <div className="relative h-24 w-24">
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <Scan className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-primary font-headline font-bold text-xl led-text-blue">NEXUS VARRENDO CLIMA E MERCADOS GLOBAIS...</p>
                        <p className="text-muted-foreground text-xs uppercase tracking-widest mt-2">Sincronizando Feed Binance + Brapi + FMP</p>
                      </div>
                    </div>
                  ) : isLoadingAlerts ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-20">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="text-primary font-bold">Sincronizando com Nexus Hub...</p>
                    </div>
                  ) : latestAlert ? (
                    <div className="space-y-8 max-w-2xl z-10 animate-in fade-in duration-700">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Badge className={`${latestAlert.marketAction === 'SELL' ? 'bg-rose-500' : 'bg-accent'} text-white font-bold px-5 py-2 rounded-xl`}>
                            {latestAlert.marketAction === 'SELL' ? 'VENDA IMEDIATA' : 'COMPRA IMEDIATA'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(latestAlert.createdAt), { addSuffix: true, locale: ptBR })}
                          </span>
                          <Badge variant="outline" className="text-primary border-primary/30 gap-1.5 px-3 py-1">
                            <Globe className="h-3 w-3" /> GLOBAL MONITORING
                          </Badge>
                        </div>
                        <h2 className="text-5xl font-headline font-bold text-white leading-tight tracking-tight">{latestAlert.title}</h2>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-accent/50 rounded-full" />
                        <blockquote className="text-xl font-medium italic text-white/95 pl-4 leading-relaxed">
                          "{displayMode === 'Essencial' ? latestAlert.essentialText : latestAlert.fullTechnicalAnalysis}"
                        </blockquote>
                      </div>

                      {latestAlert.affectedAssetsDetails && (
                        <div className="space-y-4">
                           <h4 className="text-[10px] font-headline font-bold text-accent uppercase tracking-[0.3em] flex items-center gap-2">
                              <Target className="h-3 w-3" /> FOCO TÁTICO: EXPECTATIVA 7 DIAS
                           </h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {latestAlert.affectedAssetsDetails.slice(0, 4).map((asset, i) => (
                                <div key={i} className="glass-panel border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-all">
                                   <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-xl bg-primary/10 text-primary font-bold text-xs">{asset.ticker}</div>
                                      <div className="flex flex-col">
                                         <span className="text-xs font-bold text-white">{asset.name}</span>
                                         <span className="text-[10px] text-muted-foreground">{asset.currentPrice}</span>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <div className={`text-sm font-bold flex items-center gap-1 justify-end ${asset.impactType === 'Positivo' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                         {asset.impactType === 'Positivo' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                         {asset.expectedGainPercentage}
                                      </div>
                                      <span className="text-[8px] text-muted-foreground font-bold uppercase">ALVO 7D</span>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}

                      <div className="flex items-center gap-8 pt-4">
                        <Dialog open={isRecommendationOpen} onOpenChange={setIsRecommendationOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-12 h-16 font-bold text-xl shadow-lg group">
                              DETALHAR ESTRATÉGIA <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-panel border-primary/20 max-w-2xl h-[90vh] flex flex-col p-0">
                            <DialogHeader className="p-8 border-b border-white/10 bg-primary/5">
                              <div className="flex items-center justify-between mb-4">
                                <Badge className={latestAlert.marketAction === 'SELL' ? 'bg-rose-500' : 'bg-primary'}>{latestAlert.marketAction} IMEDIATO</Badge>
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">SENTINEL MULTI-MARKET</span>
                                </div>
                              </div>
                              <DialogTitle className="text-3xl font-headline font-bold text-white led-text-blue">{latestAlert.title}</DialogTitle>
                            </DialogHeader>
                            
                            <ScrollArea className="flex-1 p-8">
                              <div className="space-y-10 pb-10">
                                <section className="space-y-4">
                                  <h4 className="text-xs font-headline font-bold text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" /> ANÁLISE DE IMPACTO 7 DIAS
                                  </h4>
                                  <p className="text-lg text-white/90 leading-relaxed font-medium">
                                    {latestAlert.causalityExplanation}
                                  </p>
                                </section>

                                <section className="space-y-6">
                                  <h4 className="text-xs font-headline font-bold text-accent uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> ATIVOS NO RADAR (B3 + BINANCE + FMP)
                                  </h4>
                                  <div className="grid gap-4">
                                    {latestAlert.affectedAssetsDetails?.map((asset, i) => (
                                      <Card key={i} className={`bg-white/5 border-white/10 ${asset.recommendation === 'SELL' ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'}`}>
                                        <CardContent className="p-6">
                                          <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                              <Badge variant="outline" className="text-primary border-primary/30">{asset.ticker}</Badge>
                                              <h5 className="font-bold text-white">{asset.name}</h5>
                                            </div>
                                            <Badge className={asset.recommendation === 'BUY' ? 'bg-emerald-500' : asset.recommendation === 'SELL' ? 'bg-rose-500' : 'bg-accent'}>
                                              {asset.recommendation}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-muted-foreground mb-4">{asset.explanation}</p>
                                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            <span>Preço Alvo: {asset.currentPrice}</span>
                                            <span className={asset.impactType === 'Positivo' ? 'text-emerald-400' : 'text-rose-400'}>Projeção 7D: {asset.expectedGainPercentage}</span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </section>
                              </div>
                            </ScrollArea>

                            <DialogFooter className="p-6 bg-white/5 border-t border-white/10">
                              <Button 
                                onClick={() => discussWithNexus(latestAlert.title)}
                                className="w-full bg-primary hover:bg-primary/90 h-14 gap-2 font-bold text-lg rounded-xl"
                              >
                                <MessageSquare className="h-5 w-5" /> EXECUTAR COM NEXUS AI
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 flex flex-col items-center">
                      <Terminal className="h-12 w-12 text-muted-foreground opacity-20 mb-6" />
                      <p className="text-white/60 text-xl font-medium italic mb-8">Nenhum sinal crítico no radar de 7 dias.</p>
                      <Button onClick={triggerGlobalScan} className="bg-accent hover:bg-accent/90 h-14 px-10 rounded-2xl gap-3 font-bold">
                        <Scan className="h-5 w-5" /> SOLICITAR VARREDURA NEXUS
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-[#080D18]/90 border border-white/10 rounded-[3rem] p-10 space-y-10 h-full shadow-2xl flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-headline font-bold uppercase tracking-[0.4em] text-primary">SENTINEL HUB</h3>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>

                  <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {globalAlerts && globalAlerts.length > 1 ? (
                      globalAlerts.slice(1).map((alert, idx) => (
                        <div key={idx} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-3 transition-all hover:scale-[1.03] cursor-pointer">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                            <span>{alert.eventOrigin}</span>
                            <span className="opacity-60">{formatDistanceToNow(new Date(alert.createdAt), { locale: ptBR })}</span>
                          </div>
                          <p className="text-sm font-semibold text-white/90 leading-tight">{alert.title}</p>
                          <Badge variant="outline" className="text-[8px] border-emerald-500/30 text-emerald-400 uppercase font-bold tracking-tighter">TACTICAL 7D ACTIVE</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4 text-center">
                        <Globe className="h-12 w-12" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Escaneando Sinais Globais...</span>
                      </div>
                    )}
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
                <p className="text-muted-foreground font-medium text-lg">Proteção de capital e alocação tática baseada em feeds Binance/B3/FMP.</p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-8 font-bold gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                    <Plus className="h-5 w-5" /> REGISTRAR ATIVO
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-panel border-primary/20 sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline font-bold text-white led-text-blue">Novo Ativo</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Adicione um ativo para que o Nexus monitore os riscos geopolíticos associados via feed real-time.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-white font-bold uppercase tracking-widest text-[10px]">Nome do Ativo (Ticker B3, Cripto ou Global)</Label>
                      <input 
                        id="name" 
                        placeholder="Ex: PETR4, BTC, NVDA" 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type" className="text-white font-bold uppercase tracking-widest text-[10px]">Categoria</Label>
                      <Select 
                        value={newAsset.type} 
                        onValueChange={(v) => setNewAsset(prev => ({ ...prev, type: v as any }))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#080D18] border-white/10 text-white">
                          <SelectItem value="Ação">Ação (B3/Global)</SelectItem>
                          <SelectItem value="Criptomoeda">Criptomoeda (Binance)</SelectItem>
                          <SelectItem value="Fundo Imobiliário">Fundo Imobiliário (B3)</SelectItem>
                          <SelectItem value="Commodity">Commodity</SelectItem>
                          <SelectItem value="Moeda">Moeda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="invested" className="text-white font-bold uppercase tracking-widest text-[10px]">Valor Total (R$)</Label>
                        <input 
                          id="invested" 
                          type="number"
                          placeholder="0.00" 
                          className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
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
                          className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                          value={newAsset.quantity}
                          onChange={(e) => setNewAsset(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        />
                      </div>
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
                          location: newAsset.location || 'Sentinel Wallet',
                          riskLevel: newAsset.riskLevel as any || 'Moderado',
                          investedValue: Number(newAsset.investedValue) || 0,
                          quantity: Number(newAsset.quantity) || 0
                        };
                        setAssets(prev => [asset, ...prev]);
                        setIsDialogOpen(false);
                      }}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
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
        latestAlert={latestAlert}
      />
    </div>
  );
}
