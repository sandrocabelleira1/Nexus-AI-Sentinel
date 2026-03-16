"use client"

import { Globe, Activity } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * @fileOverview Componente WorldMood que exibe o "sentimento" do mercado global.
 * Segue o design de medidor radial com animações suaves e tipografia Space Grotesk.
 */

export function WorldMood() {
  const [mood, setMood] = useState({ score: 74, label: 'OPORTUNISTA' });
  const [mounted, setMounted] = useState(false);

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
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Configurações do Círculo de Progresso
  const radius = 75;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (mood.score / 100) * circumference;

  if (!mounted) return <div className="bg-[#0B1221] border border-white/5 rounded-[2.5rem] p-10 h-full min-h-[400px]" />;

  return (
    <div className="bg-[#0B1221] border border-white/5 rounded-[2.5rem] p-10 h-full flex flex-col items-center justify-between relative overflow-hidden group shadow-2xl">
      {/* Header do Card */}
      <div className="flex items-center gap-3 self-start mb-6">
        <div className="p-2 rounded-full border border-primary/30 bg-primary/10">
          <Activity className="h-4 w-4 text-primary" />
        </div>
        <span className="text-[11px] font-headline font-bold uppercase tracking-[0.2em] text-blue-400/80">
          NEXUS MOOD
        </span>
      </div>
      
      {/* Medidor Radial Central */}
      <div className="relative flex items-center justify-center py-6 scale-110">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(37,99,235,0.2)]"
        >
          {/* Círculo de Fundo (Track) */}
          <circle
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Círculo de Progresso (Ativo) */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-primary transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        {/* Texto Central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center transform rotate-0">
          <span className="text-6xl font-headline font-bold text-white leading-none mb-1 tracking-tighter">
            {mood.score.toFixed(0)}
          </span>
          <span className="text-[10px] font-bold text-primary tracking-[0.25em] uppercase mt-1">
            {mood.label}
          </span>
        </div>
      </div>

      {/* Footer Text */}
      <div className="mt-8 text-center">
        <p className="text-[13px] text-muted-foreground leading-relaxed px-4 max-w-[240px] font-medium opacity-80 group-hover:opacity-100 transition-opacity">
          Sentimento global tende à acumulação em mercados emergentes e IA.
        </p>
      </div>

      {/* Efeito Visual de Fundo */}
      <div className="absolute -bottom-16 -right-16 opacity-[0.03] group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none">
        <Globe size={240} className="text-white" />
      </div>
    </div>
  );
}
