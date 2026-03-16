"use client"

import { Globe, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export function WorldMood() {
  const [mood, setMood] = useState({ score: 72, trend: 'stable' });

  useEffect(() => {
    const interval = setInterval(() => {
      setMood(prev => ({
        score: Math.min(100, Math.max(0, prev.score + (Math.random() * 4 - 2))),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="glass-panel overflow-hidden relative border-primary/20">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Globe size={120} className="text-primary animate-pulse" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-headline flex items-center gap-2 tracking-wide uppercase text-muted-foreground">
          <Activity className="h-4 w-4 text-primary" />
          Índice de Sentimento Global
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="text-5xl font-headline font-bold text-primary">
            {mood.score.toFixed(0)}
            <span className="text-xl text-muted-foreground ml-1">/ 100</span>
          </div>
          <div className="flex items-center gap-1 text-sm pb-1">
            {mood.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
            <span className={mood.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}>
              {mood.trend === 'up' ? '+2.4%' : '-1.2%'}
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Nexus monitora mais de 10.000 nós, incluindo clima via satélite, canais diplomáticos e dados on-chain para determinar a estabilidade global.
        </p>
      </CardContent>
    </Card>
  );
}
