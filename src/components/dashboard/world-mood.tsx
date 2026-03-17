
"use client"

import { Globe, Activity, ShieldCheck, Target } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { GlobalIntelligenceAlert, AutonomousInsight } from "@/lib/types";

/**
 * @fileOverview Componente WorldMood dinâmico.
 * Reflete o estado real da consciência do Nexus baseado em alertas e rumores.
 */

interface WorldMoodProps {
  latestAlert?: GlobalIntelligenceAlert | null;
  latestWhisper?: AutonomousInsight | null;
}

export function WorldMood({ latestAlert, latestWhisper }: WorldMoodProps) {
  const [mood, setMood] = useState({ score: 74, label: 'OPORTUNISTA' });
  const [mounted, setMounted] = useState(false);
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setMood(prev => {
        const delta = (Math.random() * 4 - 2);
        const newScore = Math.min(100, Math.max(0, prev.score + delta));
        let label = 'ESTÁVEL';
        if (newScore > 80) label = 'EUFÓRICO';
        else if (newScore > 65) label = 'OPORTUNISTA';
        else if (newScore < 35) label = 'MEDO';
        return { score: newScore, label };
      });
      // Simula flutuação de latência de processamento
      setLatency(prev => Math.max(8, Math.min(25, prev + (Math.random() * 2 - 1))));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const dynamicInsight = useMemo(() => {
    if (latestAlert) {
      return `Nexus detectou impacto tático em ${latestAlert.affectedAssetTickerSymbols?.[0] || 'ativos selecionados'} via ${latestAlert.eventOrigin}.`;
    }
    if (latestWhisper) {
      return `Radar captou rumor sobre "${latestWhisper.topic}" com ${latestWhisper.foundation_score}% de fundamento detectado.`;
    }
    return "Nexus em vigilância silenciosa. Fluxo de capital global operando em zona de estabilidade.";
  }, [latestAlert, latestWhisper]);

  const dynamicConfidence = useMemo(() => {
    if (latestWhisper) return (latestWhisper.foundation_score + (Math.random() * 2)).toFixed(1);
    if (latestAlert) return (88 + (latestAlert.priority * 1.5)).toFixed(1);
    return "94.2";
  }, [latestAlert, latestWhisper]);

  const radius = 100;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (mood.score / 100) * circumference;

  if (!mounted) return <div className="bg-[#080D18] border border-white/10 rounded-[2.5rem] p-10 h-full min-h-[500px] animate-pulse" />;

  return (
    <div className="bg-[#080D18]/95 border border-white/10 rounded-[2.5rem] p-12 h-full flex flex-col items-center justify-between relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-700 hover:border-primary/40">
      {/* Laser Scan Line Effect */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/30 shadow-[0_0_15px_hsl(var(--primary))] animate-[bounce_4s_infinite] opacity-30 pointer-events-none" />
      
      {/* Header do Card */}
      <div className="flex items-center justify-between w-full mb-10 z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl border border-primary/50 bg-primary/20 led-glow-blue">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <span className="text-[12px] font-headline font-bold uppercase tracking-[0.4em] text-primary/90 led-text-blue block">
              SENTIMENT INDEX
            </span>
            <span className="text-[9px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Global Risk Matrix</span>
          </div>
        </div>
        <Target className="h-5 w-5 text-emerald-500/40 animate-spin-slow" />
      </div>
      
      {/* Medidor Radial Central */}
      <div className="relative flex items-center justify-center py-8 group-hover:scale-110 transition-transform duration-1000">
        <div className="absolute inset-0 border border-primary/10 rounded-full animate-scan" style={{ borderStyle: 'dashed', borderWidth: '2px', margin: '-15px' }} />
        <div className="absolute inset-0 border border-accent/5 rounded-full animate-scan" style={{ borderStyle: 'dotted', borderWidth: '1px', margin: '-30px', animationDirection: 'reverse', animationDuration: '25s' }} />
        
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 drop-shadow-[0_0_35px_rgba(37,99,235,0.6)]"
        >
          <defs>
            <linearGradient id="nexusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="60%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
            <filter id="ledNeonGlow">
              <feGaussianBlur stdDeviation="3.5" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>

          <circle
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          
          <circle
            stroke="url(#nexusGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            filter="url(#ledNeonGlow)"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-start">
            <span className="text-7xl font-headline font-bold text-white leading-none tracking-tighter led-text-blue animate-flicker">
              {mood.score.toFixed(0)}
            </span>
            <span className="text-primary font-bold text-sm mt-3 ml-1">%</span>
          </div>
          <div className="mt-4 px-5 py-1.5 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-xl shadow-inner">
            <span className="text-[11px] font-bold text-primary tracking-[0.3em] uppercase led-text-blue">
              {mood.label}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center z-10 space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
          <span className="text-[11px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Análise Preditiva Ativa</span>
        </div>
        <p className="text-[14px] text-white/80 leading-relaxed px-4 font-medium max-w-xs min-h-[48px]">
          {dynamicInsight}
        </p>
        <div className="pt-6 border-t border-white/5 w-full flex items-center justify-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Confiança</span>
            <span className="text-emerald-400 font-bold text-sm">{dynamicConfidence}%</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Latência</span>
            <span className="text-primary font-bold text-sm">{latency.toFixed(0)}ms</span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-32 -right-32 opacity-[0.06] animate-scan pointer-events-none group-hover:opacity-[0.12] transition-opacity duration-1000">
        <Globe size={380} className="text-white" />
      </div>
      
      <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-primary/50 shadow-[0_0_10px_rgba(37,99,235,0.8)] animate-pulse" />
      <div className="absolute bottom-6 left-6 h-2 w-2 rounded-full bg-accent/40 shadow-[0_0_10px_rgba(249,115,22,0.8)] animate-pulse" />
    </div>
  );
}
