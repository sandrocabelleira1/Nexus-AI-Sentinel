
"use client"

import { Globe, Activity, Target, Brain, Zap, Gauge } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { GlobalIntelligenceAlert, AutonomousInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Neural Sphere (Sentiment Index)
 * O "cérebro" visual que processa Humor Global e Fluxo de Capital.
 */

interface WorldMoodProps {
  latestAlert?: GlobalIntelligenceAlert | null;
  latestWhisper?: AutonomousInsight | null;
}

export function WorldMood({ latestAlert, latestWhisper }: WorldMoodProps) {
  const [mood, setMood] = useState({ score: 77, label: 'OPORTUNISTA' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setMood(prev => {
        const delta = (Math.random() * 2 - 1);
        const newScore = Math.min(100, Math.max(0, prev.score + delta));
        let label = 'ESTÁVEL';
        if (newScore > 85) label = 'EUFORIA';
        else if (newScore > 65) label = 'OPORTUNISTA';
        else if (newScore < 30) label = 'PÂNICO';
        else if (newScore < 50) label = 'CAUTELA';
        return { score: newScore, label };
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const dynamicInsight = useMemo(() => {
    if (latestAlert) return `Elo de Causalidade ativo via ${latestAlert.eventOrigin}.`;
    if (latestWhisper) return `Rumor "${latestWhisper.topic}" sob análise neural.`;
    return "Neural Sphere em vigilância silenciosa. Sem anomalias críticas.";
  }, [latestAlert, latestWhisper]);

  const radius = 90;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (mood.score / 100) * circumference;

  if (!mounted) return <div className="bg-[#080D18] rounded-[2.5rem] h-[450px] animate-pulse" />;

  return (
    <div className="bg-[#080D18]/95 border border-white/10 rounded-[2.5rem] p-8 h-full flex flex-col items-center justify-between relative overflow-hidden group shadow-2xl transition-all duration-700 hover:border-primary/40">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/20 shadow-[0_0_15px_hsl(var(--primary))] animate-[bounce_4s_infinite] opacity-30" />
      
      <div className="flex items-center justify-between w-full mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border border-primary/50 bg-primary/10 led-glow-blue">
            <Brain className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-headline font-bold uppercase tracking-[0.3em] text-primary block led-text-blue">
              NEURAL SPHERE
            </span>
            <span className="text-[8px] text-muted-foreground font-bold tracking-[0.1em] uppercase">Sentiment Index</span>
          </div>
        </div>
        <Gauge className="h-4 w-4 text-emerald-500/30" />
      </div>
      
      <div className="relative flex items-center justify-center py-4 group-hover:scale-105 transition-transform duration-1000">
        <div className="absolute inset-0 border border-primary/5 rounded-full animate-scan" style={{ borderStyle: 'dashed', borderWidth: '1px', margin: '-10px' }} />
        
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 drop-shadow-[0_0_25px_rgba(37,99,235,0.4)]">
          <circle stroke="rgba(255,255,255,0.05)" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle
            stroke="hsl(var(--primary))"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-start">
            <span className="text-5xl font-headline font-bold text-white leading-none tracking-tighter led-text-blue animate-flicker">
              {mood.score.toFixed(0)}
            </span>
            <span className="text-primary font-bold text-xs mt-2 ml-1">%</span>
          </div>
          <div className="mt-3 px-4 py-1 rounded-full bg-primary/10 border border-primary/30 shadow-inner">
            <span className="text-[9px] font-bold text-primary tracking-[0.2em] uppercase led-text-blue">
              {mood.label}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center z-10 w-full space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[9px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Processando Ingestão Neural</span>
        </div>
        <p className="text-[12px] text-white/80 leading-relaxed font-medium min-h-[36px]">
          {dynamicInsight}
        </p>
        <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-6">
          <div className="text-center">
            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest block">Humor NLP</span>
            <span className="text-emerald-400 font-bold text-xs">Positivo</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="text-center">
            <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest block">Fluxo</span>
            <span className="text-primary font-bold text-xs">Acumulação</span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-20 -right-20 opacity-[0.05] pointer-events-none">
        <Globe size={240} className="text-white" />
      </div>
    </div>
  );
}
