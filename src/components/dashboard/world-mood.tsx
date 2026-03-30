
"use client"

import { Globe, Brain, Zap, Info } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { GlobalIntelligenceAlert, AutonomousInsight } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WorldMoodProps {
  latestAlert?: GlobalIntelligenceAlert | null;
  latestWhisper?: AutonomousInsight | null;
  onAnalyze?: (context: string) => void;
}

export function WorldMood({ latestAlert, latestWhisper, onAnalyze }: WorldMoodProps) {
  const [mood, setMood] = useState({ score: 77, label: 'OPORTUNISTA' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Otimização: Intervalo maior (15s) e score mais estável para evitar re-renders constantes
    const interval = setInterval(() => {
      setMood(prev => {
        const delta = (Math.random() * 4 - 2);
        const newScore = Math.min(100, Math.max(0, prev.score + delta));
        let label = 'ESTÁVEL';
        if (newScore > 85) label = 'EUFORIA';
        else if (newScore > 65) label = 'OPORTUNISTA';
        else if (newScore < 30) label = 'PÂNICO';
        else if (newScore < 50) label = 'CAUTELA';
        return { score: newScore, label };
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const dynamicInsight = useMemo(() => {
    if (latestAlert) return `Elo de Causalidade ativo via ${latestAlert.eventOrigin}.`;
    if (latestWhisper) return `Rumor "${latestWhisper.topic}" sob análise neural.`;
    return "Neural Sphere em vigilância silenciosa. Sem anomalias críticas.";
  }, [latestAlert, latestWhisper]);

  const radius = 60; 
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (mood.score / 100) * circumference;

  if (!mounted) return <div className="bg-[#080D18] rounded-[2rem] md:rounded-[3rem] h-full animate-pulse" />;

  return (
    <div className="bg-[#080D18]/95 border border-white/10 rounded-[2rem] md:rounded-[3rem] p-5 md:p-6 h-full flex flex-col relative overflow-hidden group shadow-2xl transition-all hover:border-primary/40">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/20 shadow-[0_0_15px_hsl(var(--primary))] animate-[bounce_6s_infinite] opacity-30" />
      
      <div className="flex items-center justify-between w-full mb-3 md:mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl border border-primary/50 bg-primary/10 led-glow-blue">
            <Brain className="h-3 w-3 text-primary animate-pulse" />
          </div>
          <span className="text-[8px] md:text-[9px] font-headline font-bold uppercase tracking-[0.2em] text-primary block led-text-blue">
            NEURAL SPHERE
          </span>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <Info className="h-3.5 w-3.5 text-white/20 hover:text-primary" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="glass-panel border-primary/30 w-72 p-5 rounded-3xl">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Neural Sphere</h4>
              <p className="text-[10px] text-white/80 leading-relaxed">Índice de sentimento global processado em tempo real.</p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-2 space-y-4 md:space-y-6">
          <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-1000">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <circle stroke="rgba(255,255,255,0.05)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
              <circle
                stroke="hsl(var(--primary))"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 2s ease-in-out' }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="flex items-start">
                <span className="text-2xl md:text-3xl font-headline font-bold text-white leading-none tracking-tighter led-text-blue">
                  {mood.score.toFixed(0)}
                </span>
                <span className="text-primary font-bold text-[8px] md:text-[10px] mt-0.5 ml-0.5">%</span>
              </div>
              <div className="mt-1 px-2 md:px-3 py-0.5 rounded-full bg-primary/10 border border-primary/30">
                <span className="text-[7px] md:text-[8px] font-bold text-primary tracking-[0.1em] uppercase">
                  {mood.label}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center w-full space-y-2 md:space-y-3 cursor-pointer" onClick={() => onAnalyze?.(`Análise neural: ${mood.label}`)}>
            <div className="flex items-center justify-center gap-1.5">
              <Zap className="h-2 w-2 text-primary animate-pulse" />
              <span className="text-[7px] md:text-[8px] text-muted-foreground font-bold tracking-[0.1em] uppercase">Ingestão Neural Ativa</span>
            </div>
            <p className="text-[10px] md:text-[11px] text-white/80 leading-relaxed font-medium px-2 italic line-clamp-2">
              {dynamicInsight}
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-4">
              <div className="text-center">
                <span className="text-[6px] md:text-[7px] text-muted-foreground uppercase font-bold tracking-widest block">Humor</span>
                <span className="text-emerald-400 font-bold text-[9px] md:text-[10px]">Positivo</span>
              </div>
              <div className="h-3 md:h-4 w-px bg-white/10" />
              <div className="text-center">
                <span className="text-[6px] md:text-[7px] text-muted-foreground uppercase font-bold tracking-widest block">Fluxo</span>
                <span className="text-primary font-bold text-[9px] md:text-[10px]">Acumulação</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -right-6 opacity-[0.05] pointer-events-none">
        <Globe size={80} className="text-white" />
      </div>
    </div>
  );
}
