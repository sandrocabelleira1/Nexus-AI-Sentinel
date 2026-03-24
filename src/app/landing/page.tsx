
"use client"

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Cpu, 
  Globe, 
  TrendingUp, 
  Zap, 
  Radar, 
  ArrowRight, 
  ShieldAlert, 
  Activity,
  BrainCircuit,
  Lock,
  ChevronRight,
  Building2,
  Coins,
  Waves,
  CheckCircle2,
  Crown,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { createCheckoutPreference } from "@/app/actions/payments";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { MarketPrice } from "@/lib/types";
import { BorderGlow } from "@/components/ui/border-glow";
import { DecryptedText } from "@/components/ui/decrypted-text";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export default function LandingPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<'PRO' | 'SOVEREIGN' | null>(null);

  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-nexus');
  const fiiImage = PlaceHolderImages.find(img => img.id === 'feature-fii');
  const cryptoImage = PlaceHolderImages.find(img => img.id === 'feature-crypto');

  // Ticker Data Integration
  const marketPricesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "market_prices"), limit(12));
  }, [firestore]);

  const { data: realMarketPrices } = useCollection<MarketPrice>(marketPricesQuery);

  const tickerItems = useMemo(() => {
    const mockData = [
      { ticker: "PETR4", price: 38.45, change24h: 2.4, verdict: "COMPRA", currency: "BRL" },
      { ticker: "MXRF11", price: 10.22, change24h: -0.5, verdict: "HOLD", currency: "BRL" },
      { ticker: "BTC", price: 64230, change24h: 4.1, verdict: "WHALE BUY", currency: "USD" },
      { ticker: "VALE3", price: 62.10, change24h: -1.2, verdict: "WATCH", currency: "BRL" },
      { ticker: "ETH", price: 3450, change24h: 1.8, verdict: "ACCUMULATION", currency: "USD" },
      { ticker: "HGLG11", price: 164.20, change24h: 0.2, verdict: "YIELD WIN", currency: "BRL" },
      { ticker: "ITUB4", price: 32.15, change24h: 1.1, verdict: "COMPRA", currency: "BRL" },
      { ticker: "SOL", price: 145.20, change24h: 5.4, verdict: "BULLISH", currency: "USD" },
    ];

    if (realMarketPrices && realMarketPrices.length > 0) {
      return realMarketPrices.map(p => ({
        ticker: p.ticker,
        price: p.price,
        change24h: p.change24h,
        verdict: p.nexusVerdict?.split('.')[0] || "ANALYSING",
        currency: p.currency
      }));
    }
    return mockData;
  }, [realMarketPrices]);

  const handleUpgrade = async (tier: 'PRO' | 'SOVEREIGN') => {
    if (!user) {
      router.push('/login?redirect=/landing');
      return;
    }

    setLoadingTier(tier);
    try {
      const { initPoint } = await createCheckoutPreference(tier, user.uid);
      if (initPoint) {
        window.location.href = initPoint;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no Checkout",
        description: error.message || "Não foi possível iniciar o pagamento.",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="h-20 border-b border-white/10 px-6 md:px-12 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20 border border-primary/40 led-glow-blue">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-headline font-bold text-xl led-text-blue tracking-tighter uppercase">NEXUS AI</h1>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#investments" className="text-xs font-bold text-white/60 hover:text-primary transition-colors tracking-widest uppercase">Investimentos</a>
          <a href="#crypto" className="text-xs font-bold text-white/60 hover:text-primary transition-colors tracking-widest uppercase">Cripto & Whales</a>
          <a href="#pricing" className="text-xs font-bold text-white/60 hover:text-primary transition-colors tracking-widest uppercase">Planos Táticos</a>
          {user ? (
            <Link href="/">
              <Button className="bg-primary text-background rounded-xl font-bold text-xs px-6 h-10 uppercase">
                IR PARA O TERMINAL
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="border-primary/40 text-primary rounded-xl font-bold text-xs px-6 h-10 uppercase">
                ACESSAR TERMINAL
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-flicker">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Omnisciente v5.6 Ativo</span>
            </div>
            
            <h2 className="text-5xl md:text-8xl font-headline font-bold text-white tracking-tighter leading-[0.9] max-w-5xl mx-auto uppercase">
              O Olho de Vidro da <br/>
              <span className="led-text-blue">
                <DecryptedText text="Nova Economia." />
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto font-medium leading-relaxed">
              Vantagem competitiva através da antecipação. O Nexus AI não apenas monitora, ele detecta cisnes negros e baleias on-chain antes que o mercado reaja.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href={user ? "/" : "/register"}>
                <Button className="h-16 px-10 rounded-2xl bg-primary text-background font-bold text-lg shadow-[0_0_50px_rgba(37,99,235,0.4)] hover:scale-105 transition-all group uppercase">
                  {user ? "ACESSAR SISTEMA" : "INICIAR PROTOCOLO"}
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="h-16 px-10 rounded-2xl border border-white/10 text-white/60 font-bold hover:bg-white/5 uppercase">
                  LOGIN ESTRATEGISTA
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Live Dynamic Ticker */}
        <section className="py-12 border-y border-white/5 bg-black/40 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />
          <div className="flex w-full overflow-hidden select-none">
            <div className="flex gap-8 px-4 animate-marquee whitespace-nowrap items-center">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <div key={i} className="inline-flex items-center gap-4 bg-[#080D18]/90 px-6 py-4 rounded-2xl border border-white/10 shadow-xl min-w-[280px]">
                  <div className="flex flex-col">
                    <span className="font-headline font-bold text-white text-lg tracking-tight">{item.ticker}</span>
                    <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{item.currency} Asset</span>
                  </div>
                  <div className="flex flex-col items-end flex-1">
                    <div className="text-sm font-bold text-white">
                      {item.price.toLocaleString(item.currency === 'USD' ? 'en-US' : 'pt-BR', { 
                        style: 'currency', 
                        currency: item.currency || 'BRL' 
                      })}
                    </div>
                    <span className={cn(
                      "text-xs font-bold", 
                      item.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                    </span>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[8px] border-primary/40 text-primary font-bold uppercase tracking-widest px-3 py-1 bg-primary/5",
                    item.verdict === 'COMPRA' || item.verdict === 'WHALE BUY' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : ''
                  )}>
                    {item.verdict}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-7xl mx-auto space-y-16 relative z-10 text-center">
            <div className="space-y-4">
              <h3 className="text-4xl md:text-7xl font-headline font-bold text-white tracking-tight uppercase">Planos de <span className="led-text-blue">Combate.</span></h3>
              <p className="text-white/40 font-medium max-w-2xl mx-auto text-lg uppercase tracking-widest">Escolha sua patente na rede de inteligência neural.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Tier 1: Sentinel (Gratuito) */}
              <BorderGlow
                edgeSensitivity={15}
                glowColor="40 80 80"
                backgroundColor="#080D18"
                borderRadius={40}
                glowRadius={18}
                glowIntensity={2.4}
                coneSpread={32}
                animated
                colors={['#c084fc', '#f472b6', '#38bdf8']}
              >
                <Card className="border-none bg-transparent rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all flex flex-col h-full">
                  <CardHeader className="p-8 pb-0 text-left">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-[8px] border-white/20 text-white/40 uppercase tracking-widest">Nível 1</Badge>
                    </div>
                    <CardTitle className="text-2xl font-headline font-bold text-white uppercase mb-2">Nexus Sentinel</CardTitle>
                    <CardDescription className="text-white/40 font-medium">Investidores iniciantes.</CardDescription>
                    <div className="pt-6">
                      <span className="text-4xl font-bold text-white tracking-tighter">GRATUITO</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4 flex-1 text-left">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        Dashboard de Sentimento Global (delay 15 min)
                      </li>
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        Registo manual de até 5 ativos
                      </li>
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        Notificações push padrão (sem WhatsApp)
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-8 pt-0">
                    <Link href={user ? "/" : "/register"} className="w-full">
                      <Button variant="outline" className="w-full h-14 rounded-xl border-white/10 text-white font-bold uppercase hover:bg-white/5">INICIAR RECRUTAMENTO</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </BorderGlow>

              {/* Tier 2: Pro (R$ 19,90) */}
              <BorderGlow
                edgeSensitivity={15}
                glowColor="40 80 80"
                backgroundColor="#080D18"
                borderRadius={40}
                glowRadius={18}
                glowIntensity={2.4}
                coneSpread={32}
                animated
                colors={['#38bdf8', '#c084fc', '#f472b6']}
              >
                <Card className="border-none bg-transparent rounded-[2.5rem] overflow-hidden relative flex flex-col h-full">
                  <CardHeader className="p-8 pb-0 text-left">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-primary/20 border border-primary/40 text-primary led-glow-blue">
                        <Zap className="h-6 w-6" />
                      </div>
                      <Badge className="bg-primary text-background text-[8px] font-bold uppercase tracking-widest px-3">PATENTE PRO</Badge>
                    </div>
                    <CardTitle className="text-2xl font-headline font-bold text-white uppercase mb-2">Nexus Pro</CardTitle>
                    <CardDescription className="text-white/40 font-medium">Investidores ativos & caçadores de Yield.</CardDescription>
                    <div className="pt-6 flex items-baseline gap-1">
                      <span className="text-xs font-bold text-primary">R$</span>
                      <span className="text-5xl font-bold text-white tracking-tighter">19,90</span>
                      <span className="text-xs font-bold text-white/40">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4 flex-1 text-left">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-xs text-white font-bold leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        Dados B3 e FIIs em TEMPO REAL (Brapi Pro)
                      </li>
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        Magic Number Calculator: Automação de metas
                      </li>
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        Whisper Radar (Básico): Rumores validados pela IA
                      </li>
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        WhatsApp Básico: 3 alertas críticos/semana
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-8 pt-0">
                    <Button 
                      onClick={() => handleUpgrade('PRO')} 
                      disabled={loadingTier !== null}
                      className="w-full h-14 rounded-xl bg-primary text-background font-bold uppercase shadow-lg hover:scale-105 transition-all"
                    >
                      {loadingTier === 'PRO' ? <Loader2 className="h-5 w-5 animate-spin" /> : "ASSUMIR POSTO PRO"}
                    </Button>
                  </CardFooter>
                </Card>
              </BorderGlow>

              {/* Tier 3: Neural Sovereign (R$ 59,90) */}
              <BorderGlow
                edgeSensitivity={15}
                glowColor="40 80 80"
                backgroundColor="#080D18"
                borderRadius={40}
                glowRadius={18}
                glowIntensity={2.4}
                coneSpread={32}
                animated
                colors={['#f472b6', '#38bdf8', '#c084fc']}
              >
                <Card className="border-none bg-transparent rounded-[2.5rem] overflow-hidden flex flex-col h-full">
                  <CardHeader className="p-8 pb-0 text-left">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-accent/20 border border-accent/40 text-accent">
                        <Crown className="h-6 w-6" />
                      </div>
                      <Badge className="bg-accent text-background text-[8px] font-bold uppercase tracking-widest px-3">NÍVEL VIP</Badge>
                    </div>
                    <CardTitle className="text-2xl font-headline font-bold text-white uppercase mb-2">Neural Sovereign</CardTitle>
                    <CardDescription className="text-white/40 font-medium">Baleias e Traders Profissionais.</CardDescription>
                    <div className="pt-6 flex items-baseline gap-1">
                      <span className="text-xs font-bold text-accent">R$</span>
                      <span className="text-5xl font-bold text-white tracking-tighter">59,90</span>
                      <span className="text-xs font-bold text-white/40">/mês</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4 flex-1 text-left">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-xs text-white font-bold leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        Whale Flow Full: Monitoramento On-chain Realtime
                      </li>
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        Neural Consensus: Veredito Gemini sobre Relatórios
                      </li>
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        WhatsApp Sovereign: Alertas ilimitados de Baleias
                      </li>
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        Modo War Room: Mapa de Entidades completo
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-8 pt-0">
                    <Button 
                      onClick={() => handleUpgrade('SOVEREIGN')} 
                      disabled={loadingTier !== null}
                      className="w-full h-14 rounded-xl bg-accent text-background font-bold uppercase shadow-lg hover:scale-105 transition-all"
                    >
                      {loadingTier === 'SOVEREIGN' ? <Loader2 className="h-5 w-5 animate-spin" /> : "ELEVAR PARA SOVEREIGN"}
                    </Button>
                  </CardFooter>
                </Card>
              </BorderGlow>
            </div>
          </div>
        </section>

        {/* Deep Dive Section */}
        <section id="investments" className="py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative group">
               <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full group-hover:bg-primary/30 transition-all" />
               <SpotlightCard className="p-4 relative overflow-hidden shadow-2xl border-white/20">
                 <img 
                    src={fiiImage?.imageUrl} 
                    alt="FII Investments" 
                    className="rounded-[2.5rem] opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                    data-ai-hint={fiiImage?.imageHint}
                 />
                 <div className="absolute top-10 right-10 flex flex-col gap-2">
                    <Badge className="bg-emerald-600 text-[10px] font-bold py-2 px-4 rounded-xl led-glow-blue">P/VP: 0.88</Badge>
                    <Badge className="bg-primary text-[10px] font-bold py-2 px-4 rounded-xl">YIELD: 1.1% AM</Badge>
                 </div>
               </SpotlightCard>
            </div>
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">B3 & FII Terminal</span>
              </div>
              <h3 className="text-4xl md:text-6xl font-headline font-bold text-white leading-tight uppercase">Dominância em <span className="led-text-blue">Renda Variável.</span></h3>
              <p className="text-lg text-white/50 leading-relaxed font-medium">
                O Nexus não apenas mostra o preço. Ele monitora em tempo real via **Grounding Neural** dados do Clube FII e Status Invest para entregar:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Vacância Física", desc: "Alertas imediatos sobre saída de inquilinos em galpões e shoppings." },
                  { title: "Cálculo P/VP", desc: "Identificação automática de ativos operando abaixo do valor patrimonial." },
                  { title: "Dividend Tracker", desc: "Datas Com e Pagamento sincronizados com os comunicados oficiais." },
                  { title: "Veredito Nexus", desc: "Análise tática sobre o custo-benefício de cada ativo no cenário atual." }
                ].map((item, i) => (
                  <SpotlightCard key={i} className="p-6 rounded-2xl hover:border-primary/40 transition-colors">
                    <h4 className="text-sm font-bold text-white uppercase mb-2">{item.title}</h4>
                    <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                  </SpotlightCard>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Crypto Section */}
        <section id="crypto" className="py-32 px-6 bg-[#080D18]/50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
                <Coins className="h-4 w-4 text-accent" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Crypto Core & Whale Flow</span>
              </div>
              <h3 className="text-4xl md:text-6xl font-headline font-bold text-white leading-tight uppercase">Siga o <span className="led-text-accent">Smart Money.</span></h3>
              <p className="text-lg text-white/50 leading-relaxed font-medium">
                Monitore o fluxo de capitais das baleias on-chain (ETH, BTC, USDT). Saiba se o volume está entrando em exchanges para liquidar ou saindo para custódia.
              </p>
              <ul className="space-y-4">
                {[
                  "Detecção de Transferências On-Chain > U$ 1M",
                  "Monitoramento de Liquidez em tempo real (Binance API)",
                  "Alertas de Acumulação e Distribuição tática",
                  "Integração com Moralis para dados institucionais"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-bold text-sm uppercase">
                    <Waves className="h-5 w-5 text-accent" /> {item}
                  </li>
                ))}
              </ul>
              <Button onClick={() => handleUpgrade('SOVEREIGN')} className="h-14 px-8 rounded-xl bg-accent text-background font-bold uppercase shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                {loadingTier === 'SOVEREIGN' ? <Loader2 className="h-4 w-4 animate-spin" /> : "VER RADAR DE BALEIAS"}
              </Button>
            </div>
            <div className="order-1 lg:order-2 relative group">
               <div className="absolute inset-0 bg-accent/20 blur-[120px] rounded-full" />
               <SpotlightCard className="p-4 relative overflow-hidden shadow-2xl border-white/20">
                 <img 
                    src={cryptoImage?.imageUrl} 
                    alt="Crypto Whales" 
                    className="rounded-[2.5rem] opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                    data-ai-hint={cryptoImage?.imageHint}
                 />
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Radar className="h-20 w-20 text-accent animate-ping opacity-20" />
                 </div>
               </SpotlightCard>
            </div>
          </div>
        </section>

        {/* Global Trends Section */}
        <section id="trends" className="py-32 px-6">
          <div className="max-w-7xl mx-auto text-center space-y-16">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-6xl font-headline font-bold text-white tracking-tight uppercase">Vigilância <span className="text-primary">Omnisciente.</span></h3>
              <p className="text-white/40 font-medium max-w-2xl mx-auto text-lg">O Nexus utiliza o **Navegador Neural** para vasculhar portais globais e identificar o impacto de cada fato no seu bolso.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: Globe, title: "Geopolítica", color: "blue" },
                { icon: Zap, title: "Energy & Commodities", color: "orange" },
                { icon: ShieldAlert, title: "Cisnes Negros", color: "rose" },
                { icon: BrainCircuit, title: "Rumores IA", color: "emerald" }
              ].map((f, i) => (
                <SpotlightCard key={i} className="p-10 space-y-6 group hover:border-primary/40 transition-all">
                  <div className={cn(
                    "p-4 rounded-2xl w-fit mx-auto",
                    f.color === 'blue' ? 'bg-primary/20 text-primary' : 
                    f.color === 'orange' ? 'bg-accent/20 text-accent' : 
                    f.color === 'rose' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-400'
                  )}>
                    <f.icon className="h-10 w-10" />
                  </div>
                  <h4 className="text-xl font-bold text-white uppercase">{f.title}</h4>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 px-6 text-center space-y-12 relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
           <h2 className="text-5xl md:text-8xl font-headline font-bold text-white tracking-tighter uppercase relative z-10">
             O Futuro da <span className="led-text-blue">Análise</span> é Autônomo.
           </h2>
           <p className="text-xl text-white/40 max-w-2xl mx-auto uppercase tracking-widest font-bold">
             Junte-se a 2.450+ estrategistas de elite no Nexus AI Terminal.
           </p>
           <div className="relative z-10">
             <Link href={user ? "/" : "/register"}>
               <Button className="h-24 px-16 rounded-[2.5rem] bg-primary text-background font-bold text-3xl shadow-[0_0_80px_rgba(37,99,235,0.6)] hover:scale-105 transition-all uppercase">
                 {user ? "IR PARA O TERMINAL" : "ASSUMIR COMANDO AGORA"}
               </Button>
             </Link>
           </div>
           <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.5em]">Nexus AI Sentinel - Autonomous Intelligence Core v5.6</p>
        </section>
      </main>

      <footer className="py-10 border-t border-white/10 px-6 text-center">
        <p className="text-[10px] text-white/40 font-medium uppercase">&copy; 2026 Nexus AI Sentinel. Inteligência soberana para o novo mundo financeiro.</p>
      </footer>
    </div>
  );
}
