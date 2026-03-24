
"use client"

import React from "react";
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
  Database
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-nexus');
  const groundingImage = PlaceHolderImages.find(img => img.id === 'feature-grounding');

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
          <h1 className="font-headline font-bold text-xl led-text-blue tracking-tighter">NEXUS AI</h1>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-xs font-bold text-white/60 hover:text-primary transition-colors tracking-widest uppercase">Tecnologia</a>
          <a href="#security" className="text-xs font-bold text-white/60 hover:text-primary transition-colors tracking-widest uppercase">Segurança</a>
          <Link href="/">
            <Button variant="outline" className="border-primary/40 text-primary rounded-xl font-bold text-xs px-6">
              ACESSAR TERMINAL
            </Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-flicker">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Neural Grounding v5.5 Ativo</span>
            </div>
            
            <h2 className="text-5xl md:text-8xl font-headline font-bold text-white tracking-tighter leading-[0.9] max-w-5xl mx-auto">
              O Olho de Vidro da <span className="led-text-blue">Nova Economia.</span>
            </h2>
            
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
              Detecte "Cisnes Negros" e rumores de mercado antes que virem notícias oficiais. A única inteligência que navega na web em tempo real para proteger seu patrimônio.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/">
                <Button className="h-16 px-10 rounded-2xl bg-primary text-background font-bold text-lg shadow-[0_0_50px_rgba(37,99,235,0.4)] hover:scale-105 transition-all group">
                  INICIAR PROTOCOLO 
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="ghost" className="h-16 px-10 rounded-2xl border border-white/10 text-white/60 font-bold hover:bg-white/5">
                VER DEMONSTRAÇÃO
              </Button>
            </div>
          </div>

          {/* Floating UI Element Preview */}
          <div className="mt-24 max-w-6xl mx-auto relative group">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />
            <div className="relative glass-panel rounded-[3rem] border-white/20 p-4 md:p-8 shadow-2xl overflow-hidden aspect-video md:aspect-auto">
              <img 
                src={heroImage?.imageUrl} 
                alt="Nexus UI Preview" 
                className="w-full h-full object-cover rounded-[2rem] opacity-60 mix-blend-overlay"
                data-ai-hint={heroImage?.imageHint}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] text-center space-y-4">
                  <Radar className="h-12 w-12 text-primary mx-auto animate-pulse" />
                  <p className="text-xs font-bold text-primary uppercase tracking-[0.5em]">Vigilância Omnisciente Ativa</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 px-6 bg-[#080D18]/50">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-4">
              <h3 className="text-3xl md:text-5xl font-headline font-bold text-white tracking-tight">Capacidade de Resposta <span className="text-primary">Instantânea.</span></h3>
              <p className="text-white/40 font-medium">Arquitetura neural desenhada para o investidor de elite.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: BrainCircuit,
                  title: "Grounding Neural",
                  desc: "O Nexus não alucina. Ele navega no Google e em portais oficiais em tempo real para validar cada sinal antes de emitir um alerta.",
                  color: "blue"
                },
                {
                  icon: Radar,
                  title: "Whale Discovery",
                  desc: "Monitoramento on-chain de baleias (ETH, USDT, WBTC). Saiba para onde os grandes volumes estão se movendo agora.",
                  color: "orange"
                },
                {
                  icon: Zap,
                  title: "Whisper Radar",
                  desc: "Identifica rumores e 'vazamentos' governamentais em fóruns especializados antes da mídia convencional.",
                  color: "emerald"
                }
              ].map((f, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 space-y-6 hover:border-primary/40 transition-all group">
                  <div className={cn(
                    "p-4 rounded-2xl w-fit",
                    f.color === 'blue' ? 'bg-primary/20 text-primary' : 
                    f.color === 'orange' ? 'bg-accent/20 text-accent' : 'bg-emerald-500/20 text-emerald-400'
                  )}>
                    <f.icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">{f.title}</h4>
                  <p className="text-white/40 leading-relaxed font-medium">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deep Grounding Detail */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <Badge variant="outline" className="border-primary/40 text-primary px-4 py-1.5 rounded-xl font-bold tracking-widest">TECNOLOGIA PROPRIETÁRIA</Badge>
              <h3 className="text-4xl md:text-6xl font-headline font-bold text-white leading-tight">Chega de dados <span className="led-text-blue">estáticos e atrasados.</span></h3>
              <p className="text-lg text-white/50 leading-relaxed">
                Enquanto outros terminais dependem de APIs que levam minutos para atualizar, o Nexus usa o **Navegador Neural**. Ele visita sites como Clube FII, Status Invest e Bloomberg para capturar a informação no segundo em que ela é publicada.
              </p>
              <ul className="space-y-4">
                {[
                  "Monitoramento de Greves e Infraestrutura",
                  "Cálculo de Dividendos em Tempo Real",
                  "Análise de Vacância Física de FIIs",
                  "Detecção de Cisnes Negros Geopolíticos"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-bold text-sm">
                    <ShieldCheck className="h-5 w-5 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
               <div className="glass-panel border-white/20 rounded-[3rem] p-2 relative overflow-hidden shadow-2xl">
                 <img 
                    src={groundingImage?.imageUrl} 
                    alt="Neural Grounding" 
                    className="rounded-[2.5rem] opacity-40 grayscale"
                    data-ai-hint={groundingImage?.imageHint}
                 />
                 <div className="absolute bottom-10 left-10 right-10 bg-[#080D18]/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                       <Database className="h-4 w-4 text-primary" />
                       <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Fonte de Dados Validada</span>
                    </div>
                    <p className="text-xs text-white italic">"Nexus detectou ataque no Golfo Pérsico via Grounding em 4 segundos após indexação no Google News."</p>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-32 px-6">
          <div className="max-w-4xl mx-auto bg-primary/5 border border-primary/20 rounded-[4rem] p-12 md:p-20 text-center space-y-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10">
               <Lock className="h-40 w-40 text-primary" />
             </div>
             <h3 className="text-3xl md:text-5xl font-headline font-bold text-white">Privacidade de <span className="text-primary">Nível Militar.</span></h3>
             <p className="text-white/50 text-lg max-w-2xl mx-auto font-medium">
               Suas chaves de API e dados de portfólio são criptografados e armazenados em infraestrutura isolada. O Nexus opera como seu estrategista privado, não como um coletor de dados.
             </p>
             <div className="flex flex-wrap items-center justify-center gap-8">
               <div className="flex items-center gap-3">
                 <ShieldAlert className="h-6 w-6 text-primary" />
                 <span className="text-xs font-bold text-white uppercase tracking-widest">AES-256 Encrypted</span>
               </div>
               <div className="flex items-center gap-3">
                 <Activity className="h-6 w-6 text-primary" />
                 <span className="text-xs font-bold text-white uppercase tracking-widest">Auditado Mensalmente</span>
               </div>
             </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 px-6 text-center space-y-12">
           <h2 className="text-5xl md:text-7xl font-headline font-bold text-white tracking-tighter">Pronto para assumir o <span className="led-text-blue">Comando?</span></h2>
           <Link href="/">
             <Button className="h-20 px-12 rounded-[2.5rem] bg-primary text-background font-bold text-2xl shadow-[0_0_80px_rgba(37,99,235,0.6)] hover:scale-105 transition-all">
               ENTRAR NO TERMINAL AGORA
             </Button>
           </Link>
           <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.5em]">Nexus AI Sentinel - Autonomous Intelligence Core v5.5</p>
        </section>
      </main>

      <footer className="py-10 border-t border-white/10 px-6 text-center">
        <p className="text-[10px] text-white/40 font-medium">&copy; 2026 Nexus AI Sentinel. Todos os direitos reservados. Inteligência para o novo mundo.</p>
      </footer>
    </div>
  );
}

function Badge({ className, variant, ...props }: any) {
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", className)} {...props} />
  )
}
