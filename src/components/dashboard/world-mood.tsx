"use client"

import { Globe, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useEffect, useState } from "react";

export function WorldMood() {
  const [mood, setMood] = useState({ score: 74, label: 'OPORTUNISTA' });

  useEffect(() => {
    const interval = setInterval(() => {
      setMood(prev => {
        const newScore = Math.min(100, Math.max(0, prev.score + (Math.random() * 2 - 1)));
        let label = 'ESTÁVEL';
        if (newScore > 80) label = 'EUFÓRICO';
        else if (newScore > 70) label = 'OPORTUNISTA';
        else if (newScore < 30) label = 'MEDO';
        return { score: newScore, label };
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (mood.score / 100) * circumference;

  return (
    <div className="bg-[#0B1221] border border-white/5 rounded-[2rem] p-8 h-full flex flex-col items-center justify-between relative overflow-hidden group">
      <div className="flex items-center gap-2 text-[10px] font-headline font-bold uppercase tracking-widest text-muted-foreground self-start mb-4">
        <Activity className="h-3 w-3 text-primary" /> Nexus Mood
      </div>
      
      <div className="relative flex items-center justify-center py-4">
        <svg className="h-48 w-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center transform rotate-0">
          <span className="text-5xl font-headline font-bold text-white leading-none mb-1">
            {mood.score.toFixed(0)}
          </span>
          <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">
            {mood.label}
          </span>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground leading-relaxed mt-4 px-2">
        Sentimento global tende à acumulação em mercados emergentes e IA.
      </p>

      <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
        <Globe size={180} />
      </div>
    </div>
  );
}