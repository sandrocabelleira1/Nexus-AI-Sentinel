
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
import { EvilEye } from "@/components/ui/evil-eye";
import FloatingLines from "@/components/ui/floating-lines";

// Stable constants to prevent re-initializing WebGL components
const LANDING_GRADIENT = ['#2563eb', '#7c3aed', '#db2777'];

export default function LandingPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<'PRO' | 'SOVEREIGN' | null>(null);

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
      if (initPoint) window.location.href = initPoint;
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
      <FloatingLines 
        linesGradient={LANDING_GRADIENT}
        animationSpeed={0.5}
        mixBlendMode="screen"
      />

      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

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

      <main className="relative z-10">
        <section className="relative pt-32 pb-40 px-6 overflow-hidden min-h-[800px] flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <EvilEye 
              eyeColor="#2563eb"
              intensity={1.8}
              pupilSize={0.55}
              irisWidth={0.28}
              glowIntensity={0.4}
              scale={0.9}
              noiseScale={1.2}
              pupilFollow={1.0}
              flameSpeed={1.2}
              backgroundColor="#000000"
            />
          </div>
          
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

        <section className="py-12 border-y border-white/5 bg-black/40 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />
          <div className="flex w-full overflow-hidden select-none">
            <div className="flex gap-8 px-4 animate-marquee whitespace-nowrap items-center" style={{ animationDuration: '100s' }}>
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
                    <span className={cn("text-xs font-bold", item.change24h >= 0 ? "text-emerald-400" : "text-rose-400")}>
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

        <section id="pricing" className="py-32 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-16 relative z-10 text-center">
            <div className="space-y-4">
              <h3 className="text-4xl md:text-7xl font-headline font-bold text-white tracking-tight uppercase">Planos de <span className="led-text-blue">Combate.</span></h3>
              <p className="text-white/40 font-medium max-w-2xl mx-auto text-lg uppercase tracking-widest">Escolha sua patente na rede de inteligência neural.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              <BorderGlow colors={['#c084fc', '#f472b6', '#38bdf8']}>
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
                    <div className="pt-6"><span className="text-4xl font-bold text-white tracking-tighter">GRATUITO</span></div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4 flex-1 text-left">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Dashboard de Sentimento Global (delay 15 min)</li>
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Registo manual de até 5 ativos</li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-8 pt-0">
                    <Link href={user ? "/" : "/register"} className="w-full">
                      <Button variant="outline" className="w-full h-14 rounded-xl border-white/10 text-white font-bold uppercase hover:bg-white/5">INICIAR RECRUTAMENTO</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </BorderGlow>

              <BorderGlow colors={['#38bdf8', '#c084fc', '#f472b6']}>
                <Card className="border-none bg-transparent rounded-[2.5rem] overflow-hidden relative flex flex-col h-full">
                  <CardHeader className="p-8 pb-0 text-left">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-primary/20 border border-primary/40 text-primary led-glow-blue"><Zap className="h-6 w-6" /></div>
                      <Badge className="bg-primary text-background text-[8px] font-bold uppercase tracking-widest px-3">PATENTE PRO</Badge>
                    </div>
                    <CardTitle className="text-2xl font-headline font-bold text-white uppercase mb-2">Nexus Pro</CardTitle>
                    <CardDescription className="text-white/40 font-medium">Investidores ativos & caçadores de Yield.</CardDescription>
                    <div className="pt-6 flex items-baseline gap-1"><span className="text-xs font-bold text-primary">R$</span><span className="text-5xl font-bold text-white tracking-tighter">19,90</span><span className="text-xs font-bold text-white/40">/mês</span></div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4 flex-1 text-left">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-xs text-white font-bold leading-relaxed"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Dados B3 e FIIs em TEMPO REAL (Brapi Pro)</li>
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Whisper Radar (Básico): Rumores validados pela IA</li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-8 pt-0">
                    <Button onClick={() => handleUpgrade('PRO')} disabled={loadingTier !== null} className="w-full h-14 rounded-xl bg-primary text-background font-bold uppercase shadow-lg hover:scale-105 transition-all">
                      {loadingTier === 'PRO' ? <Loader2 className="h-5 w-5 animate-spin" /> : "ASSUMIR POSTO PRO"}
                    </Button>
                  </CardFooter>
                </Card>
              </BorderGlow>

              <BorderGlow colors={['#f472b6', '#38bdf8', '#c084fc']}>
                <Card className="border-none bg-transparent rounded-[2.5rem] overflow-hidden flex flex-col h-full">
                  <CardHeader className="p-8 pb-0 text-left">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-accent/20 border border-accent/40 text-accent"><Crown className="h-6 w-6" /></div>
                      <Badge className="bg-accent text-background text-[8px] font-bold uppercase tracking-widest px-3">NÍVEL VIP</Badge>
                    </div>
                    <CardTitle className="text-2xl font-headline font-bold text-white uppercase mb-2">Neural Sovereign</CardTitle>
                    <CardDescription className="text-white/40 font-medium">Baleias e Traders Profissionais.</CardDescription>
                    <div className="pt-6 flex items-baseline gap-1"><span className="text-xs font-bold text-accent">R$</span><span className="text-5xl font-bold text-white tracking-tighter">59,90</span><span className="text-xs font-bold text-white/40">/mês</span></div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-4 flex-1 text-left">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-xs text-white font-bold leading-relaxed"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Whale Flow Full: Monitoramento On-chain Realtime</li>
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed"><CheckCircle2 className="h-4 w-4 text-accent shrink-0" /> Modo War Room: Mapa de Entidades completo</li>
                    </ul>
                  </CardContent>
                  <CardFooter className="p-8 pt-0">
                    <Button onClick={() => handleUpgrade('SOVEREIGN')} disabled={loadingTier !== null} className="w-full h-14 rounded-xl bg-accent text-background font-bold uppercase shadow-lg hover:scale-105 transition-all">
                      {loadingTier === 'SOVEREIGN' ? <Loader2 className="h-5 w-5 animate-spin" /> : "ELEVAR PARA SOVEREIGN"}
                    </Button>
                  </CardFooter>
                </Card>
              </BorderGlow>
            </div>
          </div>
        </section>

        <footer className="py-10 border-t border-white/10 px-6 text-center relative z-10">
          <p className="text-[10px] text-white/40 font-medium uppercase">&copy; 2026 Nexus AI Sentinel. Inteligência soberana para o novo mundo financeiro.</p>
        </footer>
      </main>
    </div>
  );
}
