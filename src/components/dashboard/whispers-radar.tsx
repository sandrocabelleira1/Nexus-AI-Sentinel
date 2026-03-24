"use client"

import { AutonomousInsight } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Radio, Zap, AlertTriangle, ChevronRight, BrainCircuit, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WhispersRadarProps {
  insights: AutonomousInsight[];
  onAnalyze?: (context: string) => void;
}

export function WhispersRadar({ insights, onAnalyze }: WhispersRadarProps) {
  return (
    <div className="bg-[#080D18]/90 border border-white/10 rounded-[3rem] p-8 h-[400px] flex flex-col shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 led-glow-accent">
            <Radio className="h-4 w-4 text-orange-500 animate-pulse" />
          </div>
          <span className="text-[10px] font-headline font-bold uppercase tracking-[0.4em] text-orange-500 block led-text-accent">
            WHISPERS RADAR
          </span>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1 hover:bg-white/5 rounded-full transition-colors">
              <Info className="h-3.5 w-3.5 text-white/20 hover:text-orange-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="glass-panel border-orange-500/30 w-80 p-6 rounded-3xl">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-orange-500 uppercase tracking-widest">Manual Tático: Whispers Radar</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">O que é?</p>
                  <p className="text-xs text-white/80 leading-relaxed">Varredura de rumores, vazamentos governamentais e sinais fracos em fóruns técnicos.</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">O que verá?</p>
                  <p className="text-xs text-white/80 leading-relaxed">Tópicos especulativos com score de fundamentação (probabilidade de ser real).</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Como usar?</p>
                  <p className="text-xs text-white/80 leading-relaxed italic">Antecipe notícias oficiais ajustando posições antes que o rumor chegue à grande mídia.</p>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <ScrollArea className="flex-1 z-10 pr-4">
        <div className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight) => {
              const isHighPriority = insight.nexus_priority >= 4;
              
              return (
                <div 
                  key={insight.id} 
                  onClick={() => onAnalyze?.(`Analise o sussurro: ${insight.topic}. Impacto: ${insight.market_impact}`)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all hover:bg-white/10 cursor-pointer group/item",
                    isHighPriority ? "border-orange-500/30 bg-orange-500/5" : "border-white/5 bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className={cn("h-3 w-3", isHighPriority ? "text-orange-400" : "text-white/40")} />
                      <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Sinal: {insight.foundation_score}%</span>
                    </div>
                    <span className="text-[8px] text-white/20 font-bold">
                      {insight.timestamp ? formatDistanceToNow(new Date(insight.timestamp), { locale: ptBR, addSuffix: true }) : 'agora'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-2 leading-tight group-hover/item:text-orange-400 transition-colors">
                    {insight.topic}
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[7px] border-white/10 text-white/40 px-2 py-0">
                      {insight.market_impact}
                    </Badge>
                    <ChevronRight className="h-3 w-3 text-white/10 group-hover/item:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-40 opacity-20 space-y-4">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <span className="text-[8px] font-bold uppercase">VARREDURA DE RUMORES...</span>
            </div>
          )}
        </div>
        <ScrollBar className="bg-white/5" />
      </ScrollArea>
    </div>
  );
}
