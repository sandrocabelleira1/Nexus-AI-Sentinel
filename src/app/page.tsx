
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
  Ship,
  Search,
  LayoutGrid,
  Scale,
  Gavel,
  Landmark
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'market'>('dashboard');
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
    livePrices?.forEach(p => { 
      map[p.ticker.toUpperCase()] = p; 
    });
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
      // 1. Cripto via Binance
      const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT'];
      const cryptoResponses = await Promise.all(
        cryptoSymbols.map(s => fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`))
      );
      const cryptoData = await Promise.all(cryptoResponses.map(r => r.json()));

      cryptoData.forEach((tickerData) => {
        if (tickerData.symbol) {
          const ticker = tickerData.symbol.replace('USDT', '');
          setDocumentNonBlocking(doc(firestore, "market_prices", ticker), {
            ticker: ticker,
            price: parseFloat(tickerData.lastPrice),
            change24h: parseFloat(tickerData.priceChangePercent),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      });

      // 2. B3 e FIIs via Brapi (adicionando .SA para melhor compatibilidade)
      const b3Tickers = 'PETR4.SA,VALE3.SA,HGLG11.SA,VGIA11.SA,IBOV11.SA,BOVA11.SA,ITUB4.SA,BBDC4.SA,KNRI11.SA';
      const b3ApiKey = '2rb5157StMMfsE1ft1ErSq';
      const b3Response = await fetch(`https://brapi.dev/api/quote/${b3Tickers}?token=${b3ApiKey}`);
      const b3Data = await b3Response.json();

      if (b3Data.results) {
        b3Data.results.forEach((item: any) => {
          const cleanTicker = item.symbol.replace('.SA', '');
          setDocumentNonBlocking(doc(firestore, "market_prices", cleanTicker), {
            ticker: cleanTicker,
            price: item.regularMarketPrice,
            change24h: item.regularMarketChangePercent,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        });
      }

      // 3. Globais via FMP
      const fmpTickers = 'AAPL,MSFT,NVDA,TSLA,GOOGL,AMZN,META';
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

    } catch (error) {
      console.error("Erro na sincronização global do Nexus:", error);
    }
  }, [user, firestore]);

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
        `Clima: ${w.weather?.[0]?.description} em ${regions[i].name}`
      ).join(' | ');

      const promptData = `### VARREDURA ESTRATÉGICA NEXUS 24/7
      1. ANALISE DIÁRIO OFICIAL DA UNIÃO (DOU) E DECRETOS GOVERNAMENTAIS RECENTES.
      2. ANALISE DISCURSOS DO FED E COPOM SOBRE TAXAS DE JUROS.
      3. CRUZE COM CLIMA ATUAL: ${weatherContext}.
      4. DEFINA ELO DE CAUSALIDADE PARA: FIIs, AGRO, TECH (NASDAQ) E CRIPTO.
      5. GERE ORDENS DE COMPRA/VENDA IMEDIATA PARA JANELA TÁTICA DE 7 DIAS.
      6. BUSQUE SINAIS FRACOS: MOVIMENTAÇÃO DE RESERVAS, SINAIS DE CISNE NEGRO.`;

      const result = await monitorGlobalEvents({ rawNewsData: promptData });
      if (result) {
        addDocumentNonBlocking(collection(firestore, "global_intelligence_alerts"), {
          ...result,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Erro na varredura geopolítica:", error);
    } finally {
      setIsScanning(false);
    }
  }, [user, isScanning, firestore, syncLivePrices]);

  useEffect(() => {
    if (user && !isUserLoading) {
      syncLivePrices();
      const interval = setInterval(() => {
        syncLivePrices();
      }, 60000); 
      return () => clearInterval(interval);
    }
  }, [user, isUserLoading, syncLivePrices]);

  const discussWithNexus = (alertTitle: string) => {
    setChatInitialQuery(`Nexus, baseado no Elo de Causalidade de "${alertTitle}", quais ações IMEDIATAS devo tomar para proteger meu capital e lucrar nos próximos 7 dias?`);
    setIsChatOpen(true);
    setIsRecommendationOpen(false);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-primary font-headline font-bold animate-pulse tracking-widest uppercase text-center px-4">
          Nexus Sentinel Core v2.8<br/><span className="text-[10px] opacity-60">Synchronizing Geopolitical & Market Feeds...</span>
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
              <span className="text-[10px] text-primary font-bold uppercase tracking-[0.4em] opacity-80">Sentinel Strategic - Geopolitical Core</span>
              <Badge variant="outline" className="h-4 px-1.5 text-[8px] bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold">RADAR 24/7 ACTIVE</Badge>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center bg-[#080D18] rounded-2xl p-1 border border-white/10 shadow-2xl">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'dashboard' ? 'nav-item-active' : 'text-muted-foreground hover:text-white'}`}><LayoutGrid className="h-3.5 w-3.5" /> DASHBOARD</button>
          <button onClick={() => setActiveTab('market')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'market' ? 'nav-item-active' : 'text-muted-foreground hover:text-white'}`}><TrendingUp className="h-3.5 w-3.5" /> MARKET</button>
          <button onClick={() => setActiveTab('portfolio')} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'portfolio' ? 'nav-item-active' : 'text-muted-foreground hover:text-white'}`}><Wallet className="h-3.5 w-3.5" /> WALLET</button>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={triggerGlobalScan} disabled={isScanning} className="rounded-xl bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest px-6 h-10 hover:bg-accent/20 transition-all hover:scale-105">
            {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />} VARREDURA FORÇADA
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDisplayMode(displayMode === 'Essencial' ? 'Completo' : 'Essencial')} className="rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest px-6 h-10 hover:bg-white/10 transition-colors">
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
                { ticker: 'VGIA11', label: 'AGRO FII' },
                { ticker: 'BTC', label: 'BITCOIN' },
                { ticker: 'NVDA', label: 'NVIDIA' },
              ].map((m, i) => {
                const liveData = priceMap[m.ticker.toUpperCase()];
                const value = liveData ? (m.ticker === 'BTC' || m.ticker === 'NVDA' ? `US$ ${liveData.price.toLocaleString()}` : `R$ ${liveData.price.toLocaleString()}`) : '---';
                const change = liveData ? `${liveData.change24h > 0 ? '+' : ''}${liveData.change24h.toFixed(2)}%` : '---';
                const isUp = liveData ? liveData.change24h > 0 : true;
                return (
                  <div key={i} className="bg-[#080D18]/90 border border-white/10 rounded-3xl p-7 transition-all hover:border-primary/40 group cursor-pointer shadow-2xl relative overflow-hidden">
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
                <div className="bg-[#080D18]/95 border border-white/10 rounded-[3.5rem] p-12 h-full min-h-[550px] relative overflow-hidden flex flex-col justify-center shadow-2xl group transition-all hover:border-accent/40">
                  {isScanning ? (
                    <div className="flex flex-col items-center justify-center space-y-6 py-20 z-10">
                      <div className="relative h-24 w-24">
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <Scan className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-primary font-headline font-bold text-xl led-text-blue uppercase tracking-tighter">Nexus Processando Decretos e Geopolítica...</p>
                        <p className="text-muted-foreground text-xs uppercase tracking-widest mt-2">Identificando Elos de Causalidade Táticos</p>
                      </div>
                    </div>
                  ) : latestAlert ? (
                    <div className="space-y-8 max-w-2xl z-10 animate-in fade-in duration-700">
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Badge className={`${latestAlert.marketAction === 'SELL' ? 'bg-rose-500' : 'bg-accent'} text-white font-bold px-5 py-2 rounded-xl`}>
                            {latestAlert.marketAction} IMEDIATA
                          </Badge>
                          <Badge variant="outline" className="text-primary border-primary/30 gap-1.5 px-3 py-1">
                            <Scale className="h-3 w-3" /> ELO GOVERNAMENTAL
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
                           {latestAlert.causalityLink && (
                             <div className="grid grid-cols-2 gap-4 pt-4">
                               <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                 <span className="text-[9px] text-accent font-bold uppercase tracking-widest block mb-1">Impacto Previsto</span>
                                 <span className="text-white text-sm font-bold">{latestAlert.causalityLink.prediction}</span>
                               </div>
                               <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                 <span className="text-[9px] text-primary font-bold uppercase tracking-widest block mb-1">Setores Mapeados</span>
                                 <span className="text-white text-xs font-medium">{latestAlert.causalityLink.mapping.join(', ')}</span>
                               </div>
                             </div>
                           )}
                        </div>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-[10px] font-headline font-bold text-accent uppercase tracking-[0.3em] flex items-center gap-2">
                            <Target className="h-3 w-3" /> RADAR TÁTICO: ALVO 7 DIAS
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
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="flex items-center gap-8 pt-4">
                        <Dialog open={isRecommendationOpen} onOpenChange={setIsRecommendationOpen}>
                          <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-12 h-16 font-bold text-xl shadow-lg group">
                              DETALHAR ELO DE CAUSALIDADE <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-panel border-primary/20 max-w-2xl h-[90vh] flex flex-col p-0">
                            <DialogHeader className="p-8 border-b border-white/10 bg-primary/5">
                              <div className="flex items-center justify-between mb-4">
                                <Badge className={latestAlert.marketAction === 'SELL' ? 'bg-rose-500' : 'bg-primary'}>{latestAlert.marketAction} TÁTICO</Badge>
                                <div className="flex items-center gap-2">
                                  <Gavel className="h-4 w-4 text-primary" />
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">NEXUS GOV PREDICTION</span>
                                </div>
                              </div>
                              <DialogTitle className="text-3xl font-headline font-bold text-white led-text-blue">{latestAlert.title}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="flex-1 p-8">
                              <div className="space-y-10 pb-10">
                                {latestAlert.causalityLink && (
                                  <section className="space-y-6">
                                    <h4 className="text-xs font-headline font-bold text-primary uppercase tracking-[0.3em]">ANÁLISE DE PROBABILIDADE</h4>
                                    <div className="grid gap-6">
                                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Identificação da Fonte</span>
                                        <p className="text-white font-medium">{latestAlert.causalityLink.identification}</p>
                                      </div>
                                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Simulação de Impacto</span>
                                        <p className="text-white/90 leading-relaxed">{latestAlert.causalityLink.simulation}</p>
                                      </div>
                                    </div>
                                  </section>
                                )}
                                <section className="space-y-6">
                                  <h4 className="text-xs font-headline font-bold text-accent uppercase tracking-[0.3em]">ORDENS DE EXECUÇÃO 7D</h4>
                                  <div className="grid gap-4">
                                    {latestAlert.affectedAssetsDetails?.map((asset, i) => (
                                      <Card key={i} className={`bg-white/5 border-white/10 ${asset.recommendation === 'SELL' ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'}`}>
                                        <CardContent className="p-6">
                                          <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                              <Badge variant="outline" className="text-primary border-primary/30">{asset.ticker}</Badge>
                                              <h5 className="font-bold text-white">{asset.name}</h5>
                                            </div>
                                            <Badge className={asset.recommendation === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'}>{asset.recommendation}</Badge>
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
                              <Button onClick={() => discussWithNexus(latestAlert.title)} className="w-full bg-primary hover:bg-primary/90 h-14 gap-2 font-bold text-lg rounded-xl"><MessageSquare className="h-5 w-5" /> EXECUTAR COM NEXUS AI</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 flex flex-col items-center">
                      <Terminal className="h-12 w-12 text-muted-foreground opacity-20 mb-6" />
                      <p className="text-white/60 text-xl font-medium italic mb-8">Nenhum "Cisne Negro" detectado no monitoramento geopolítico.</p>
                      <Button onClick={triggerGlobalScan} className="bg-accent hover:bg-accent/90 h-14 px-10 rounded-2xl gap-3 font-bold"><Scan className="h-5 w-5" /> SOLICITAR VARREDURA ESTRATÉGICA</Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-[#080D18]/90 border border-white/10 rounded-[3rem] p-10 space-y-10 h-full shadow-2xl flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-headline font-bold uppercase tracking-[0.4em] text-primary">GEOPOLITICAL HUB</h3>
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
                          <Badge variant="outline" className="text-[8px] border-emerald-500/30 text-emerald-400 uppercase font-bold">CAUSALITY ANALYZED</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4 text-center">
                        <Landmark className="h-12 w-12" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Aguardando Sinais de BCs e Governos...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'market' && <MarketExplorer prices={livePrices || []} />}
        {activeTab === 'portfolio' && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
             <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                <h2 className="text-5xl font-headline font-bold text-white tracking-tight">Sua Wallet</h2>
                <p className="text-muted-foreground font-medium text-lg">Proteção de capital e alocação tática baseada em previsões geopolíticas.</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild><Button className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-8 font-bold gap-3 shadow-[0_0_30px_rgba(37,99,235,0.3)]"><Plus className="h-5 w-5" /> REGISTRAR ATIVO</Button></DialogTrigger>
                <DialogContent className="glass-panel border-primary/20 sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline font-bold text-white led-text-blue">Novo Ativo</DialogTitle>
                    <DialogDescription className="text-muted-foreground">Adicione um ativo para monitoramento tático 7 dias.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-white font-bold uppercase tracking-widest text-[10px]">Ticker</Label>
                      <input id="name" placeholder="Ex: PETR4, BTC, NVDA" className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm" value={newAsset.name} onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                  </div>
                  <DialogFooter><Button type="submit" onClick={() => { setAssets(prev => [{ id: Math.random().toString(), name: (newAsset.name || '').toUpperCase(), type: 'Ação', location: 'Sentinel Wallet', investedValue: 0, quantity: 0 }, ...prev]); setIsDialogOpen(false); }} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl">CONFIRMAR REGISTRO</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <PortfolioView assets={assets} onUpdateAsset={(id, newQuantity, newValue) => { setAssets(prev => prev.map(a => a.id === id ? { ...a, quantity: newQuantity, investedValue: newValue } : a)); }} />
          </div>
        )}
      </main>

      <AssistantChat assets={assets} displayMode={displayMode} externalOpen={isChatOpen} onOpenChange={setIsChatOpen} initialQuery={chatInitialQuery} latestAlert={latestAlert} />
    </div>
  );
}
