
"use client"

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  Cpu, 
  ArrowRight, 
  Activity,
  CheckCircle2,
  Crown,
  Loader2,
  ShieldCheck,
  Zap
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
import EvilEye from "@/components/ui/evil-eye";

export default function LandingPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<'PRO' | 'SOVEREIGN' | null>(null);

  const fiiImage = PlaceHolderImages.find(img => img.id === 'feature-fii');
  const cryptoImage = PlaceHolderImages.find(img => img.id === 'feature-crypto');

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
      router.push('/login');
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
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />
      
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
        <section className="relative pt-20 md:pt-32 pb-20 md:pb-40 px-6 overflow-hidden min-h-[600px] md:min-h-[800px] flex items-center justify-center">
          <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-60 md:opacity-100">
            <EvilEye 
              eyeColor="#2563eb"
              intensity={1.5}
              pupilSize={0.6}
              irisWidth={0.25}
              glowIntensity={0.35}
              scale={0.8}
              noiseScale={1.0}
              pupilFollow={1.0}
              flameSpeed={1.0}
              backgroundColor="#000000"
            />
          </div>
          
          <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-flicker">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Omnisciente v5.6 Ativo</span>
            </div>
            
            <h2 className="text-4xl md:text-8xl font-headline font-bold text-white tracking-tighter leading-[0.9] max-w-5xl mx-auto uppercase">
              O Olho Onisciente da <br/>
              <span className="led-text-blue">
                <DecryptedText text="Nova Economia" />
              </span>
            </h2>
            
            <p className="text-base md:text-xl text-white/50 max-w-3xl mx-auto font-medium leading-relaxed px-4">
              Vantagem competitiva através da antecipação. O Nexus AI não apenas monitora, ele detecta cisnes negros e baleias on-chain antes que o mercado reaja.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 px-6">
              <Link href={user ? "/" : "/register"} className="w-full sm:w-auto">
                <Button className="w-full sm:h-16 px-10 rounded-2xl bg-primary text-background font-bold text-lg shadow-[0_0_50px_rgba(37,99,235,0.4)] hover:scale-105 transition-all group uppercase h-14">
                  {user ? "ACESSAR SISTEMA" : "INICIAR PROTOCOLO"}
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:h-16 px-10 rounded-2xl border border-white/10 text-white/60 font-bold hover:bg-white/5 uppercase h-14">
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

        <section id="investments" className="py-20 md:py-32 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1 text-xs font-bold uppercase tracking-widest">Domínio B3</Badge>
              <h3 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tight uppercase leading-[1.1]">Dominância em <br/><span className="led-text-blue">Renda Variável.</span></h3>
              <p className="text-white/50 text-lg leading-relaxed font-medium">O Nexus processa dados fundamentalistas de Fundos Imobiliários e Ações em tempo real, entregando o Veredito de Compra baseado em múltiplos e fluxo institucional.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-white/80 font-bold uppercase text-xs tracking-wider"><CheckCircle2 className="h-5 w-5 text-primary" /> Radar de Dividend Yield AM</li>
                <li className="flex items-center gap-3 text-white/80 font-bold uppercase text-xs tracking-wider"><CheckCircle2 className="h-5 w-5 text-primary" /> Telemetria de Vacância em FIIs</li>
                <li className="flex items-center gap-3 text-white/80 font-bold uppercase text-xs tracking-wider"><CheckCircle2 className="h-5 w-5 text-primary" /> Alvo de Preço-Justo Nexus</li>
              </ul>
            </div>
            <SpotlightCard className="aspect-square lg:aspect-video rounded-[2rem] md:rounded-[3rem] border-white/5 shadow-2xl overflow-hidden relative group">
              <img 
                src={fiiImage?.imageUrl} 
                alt="Nexus Analytics" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                data-ai-hint="financial trading"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080D18] via-transparent to-transparent" />
              <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 p-6 md:p-8 rounded-2xl md:rounded-3xl bg-black/40 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Sinal de Entrada PETR4</span>
                </div>
                <p className="text-xs md:text-sm text-white/80 font-medium italic">"Fluxo de baleias institucionais detectado em 38.45. Probabilidade de upside: 12%."</p>
              </div>
            </SpotlightCard>
          </div>
        </section>

        <section id="crypto" className="py-20 md:py-32 px-6 bg-white/[0.02] relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <SpotlightCard className="aspect-square rounded-[2rem] md:rounded-[3rem] border-white/5 shadow-2xl overflow-hidden relative group">
                <img 
                  src={cryptoImage?.imageUrl} 
                  alt="Crypto Whale Tracking" 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                  data-ai-hint="cryptocurrency whale"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#080D18] via-transparent to-transparent" />
                <div className="absolute top-6 md:top-10 left-6 md:left-10 bg-accent/20 border border-accent/40 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Whale Alert: BTC</span>
                </div>
              </SpotlightCard>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5 px-4 py-1 text-xs font-bold uppercase tracking-widest">On-Chain Sniper</Badge>
              <h3 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tight uppercase leading-[1.1]">Rastreio de <br/><span className="led-text-accent">Baleias Globais.</span></h3>
              <p className="text-white/50 text-lg leading-relaxed font-medium">Antecipe movimentos bruscos no BTC e ETH. O Nexus monitora transações acima de US$ 1M nas redes Ethereum e Bitcoin, identificando depósitos em exchanges antes do despejo.</p>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-2xl md:text-3xl font-headline font-bold text-white uppercase tracking-tighter">Realtime</div>
                  <p className="text-[8px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest">Monitoramento On-chain</p>
                </div>
                <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-2xl md:text-3xl font-headline font-bold text-white uppercase tracking-tighter">Alerts</div>
                  <p className="text-[8px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest">Push de Liquidez</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 md:py-32 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-16 relative z-10 text-center">
            <div className="space-y-4">
              <h3 className="text-4xl md:text-7xl font-headline font-bold text-white tracking-tight uppercase">Planos de <span className="led-text-blue">Combate.</span></h3>
              <p className="text-white/40 font-medium max-w-2xl mx-auto text-base md:text-lg uppercase tracking-widest">Escolha sua patente na rede de inteligência neural.</p>
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
                      <li className="flex items-start gap-3 text-xs text-white/60 font-medium leading-relaxed"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Registro manual de até 5 ativos</li>
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
