"use client"

import { Globe, Activity, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * @fileOverview Componente WorldMood refinado com efeitos LED e animações de varredura.
 * Representa o sentimento do mercado global com alta fidelidade visual.
 */

export function WorldMood() {
  const [mood, setMood] = useState({ score: 74, label: 'OPORTUNISTA' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setMood(prev => {
        const delta = (Math.random() * 6 - 3);
        const newScore = Math.min(100, Math.max(0, prev.score + delta));
        let label = 'ESTÁVEL';
        if (newScore > 80) label = 'EUFÓRICO';
        else if (newScore > 65) label = 'OPORTUNISTA';
        else if (newScore < 35) label = 'MEDO';
        return { score: newScore, label };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const radius = 90;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (mood.score / 100) * circumference;

  if (!mounted) return <div className="bg-[#080D18] border border-white/5 rounded-[2.5rem] p-10 h-full min-h-[450px] animate-pulse" />;

  return (
    <div className="bg-[#080D18] border border-white/10 rounded-[2.5rem] p-10 h-full flex flex-col items-center justify-between relative overflow-hidden group shadow-2xl transition-all duration-500 hover:border-primary/30">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
      
      {/* Header do Card */}
      <div className="flex items-center justify-between w-full mb-8 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl border border-primary/40 bg-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <span className="text-[11px] font-headline font-bold uppercase tracking-[0.3em] text-primary/90 led-text-blue">
            NEXUS SENTIMENT
          </span>
        </div>
        <ShieldCheck className="h-4 w-4 text-emerald-500/50" />
      </div>
      
      {/* Medidor Radial Central com Efeitos LED */}
      <div className="relative flex items-center justify-center py-4 group-hover:scale-105 transition-transform duration-700">
        {/* Outer Rotating Scan Ring */}
        <div className="absolute inset-0 border border-primary/5 rounded-full animate-scan" style={{ borderStyle: 'dashed', borderWidth: '1px', margin: '-10px' }} />
        
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 drop-shadow-[0_0_20px_rgba(37,99,235,0.4)]"
        >
          <defs>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
            <filter id="ledGlow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Círculo de Fundo (Track) */}
          <circle
            stroke="rgba(255,255,255,0.03)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          
          {/* Círculo de Progresso LED */}
          <circle
            stroke="url(#glowGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            filter="url(#ledGlow)"
            className="text-primary transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        {/* Texto Central LED */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center transform rotate-0">
          <div className="flex items-start">
            <span className="text-7xl font-headline font-bold text-white leading-none tracking-tighter led-text-blue">
              {mood.score.toFixed(0)}
            </span>
            <span className="text-primary font-bold text-xs mt-2 ml-1">%</span>
          </div>
          <div className="mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
            <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">
              {mood.label}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="mt-10 text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
          <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Análise em Tempo Real</span>
        </div>
        <p className="text-[13px] text-white/70 leading-relaxed px-2 font-medium">
          Fluxo de capital migrando para <span className="text-primary font-bold">Ativos de Risco</span> e <span className="text-accent font-bold">IA</span>.
        </p>
      </div>

      {/* Efeito Visual de Fundo (Globo Girando) */}
      <div className="absolute -bottom-24 -right-24 opacity-[0.04] animate-scan pointer-events-none transition-opacity duration-1000 group-hover:opacity-[0.08]">
        <Globe size={320} className="text-white" />
      </div>
      
      {/* Corner LED Accents */}
      <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
      <div className="absolute bottom-4 left-4 h-1.5 w-1.5 rounded-full bg-accent/30 animate-pulse" />
    </div>
  );
}
