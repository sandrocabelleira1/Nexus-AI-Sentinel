
"use client"

import { MarketEntity } from "@/lib/types";
import { Globe, ShieldCheck, Landmark, Cpu, Building2, UserCircle2, ArrowRightLeft, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface WarRoomProps {
  entities: MarketEntity[];
  onAnalyze?: (context: string) => void;
}

export function WarRoom({ entities, onAnalyze }: WarRoomProps) {
  const insightText = "Nexus identificou movimentos da BlackRock e do Governo Americano. Sinapses indicam acumulação tática em ativos de tecnologia e infraestrutura digital.";

  return (
    <div className="bg-[#080D18]/90 border border-white/10 rounded-[3rem] p-10 h-full flex flex-col shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-10 z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-accent/20 border border-accent/40 led-glow-accent">
            <Landmark className="h-5 w-5 text-accent" />
          </div>
          <div>
            <span className="text-[12px] font-headline font-bold uppercase tracking-[0.4em] text-accent led-text-accent block">
              WAR ROOM
            </span>
            <span className="text-[9px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Mapa de Entidades & Fluxo</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span className="text-[8px] text-white/60 font-bold uppercase">Ao Vivo</span>
        </div>
      </div>

      <div className="flex-1 space-y-8 z-10">
        {entities.length > 0 ? (
          <div className="grid gap-6">
            {entities.map((entity) => {
              const Icon = entity.type === 'Government' ? Globe : 
                           entity.type === 'Institution' ? Building2 : 
                           entity.type === 'Exchange' ? ArrowRightLeft : UserCircle2;
              
              return (
                <div key={entity.id} className="relative group/entity cursor-pointer" onClick={() => onAnalyze?.(`Movimentação de ${entity.name} (${entity.type})`)}>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 transition-all hover:border-accent/40 hover:bg-white/10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">{entity.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{entity.type}</span>
                          <div className="h-1 w-1 rounded-full bg-white/20" />
                          <span className="text-[9px] text-accent font-bold uppercase">Sinapse: {entity.influenceScore}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white mb-1">
                        US$ {(entity.currentBalanceUsd / 1000000000).toFixed(1)}B
                      </div>
                      <Badge variant="outline" className="text-[8px] border-emerald-500/30 text-emerald-400 font-bold uppercase">
                        {entity.lastAction}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Visual Connector Pulse */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent/40 rounded-full blur-[2px] opacity-0 group-hover/entity:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30">
            <Cpu className="h-12 w-12 animate-scan" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Identificando atores institucionais...</p>
          </div>
        )}
      </div>

      <div 
        className="mt-10 p-6 rounded-3xl bg-accent/5 border border-accent/10 cursor-pointer hover:bg-accent/10 transition-all group/insight"
        onClick={() => onAnalyze?.(insightText)}
      >
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span className="text-[10px] text-white font-bold uppercase tracking-widest">Soberania de Dados Ativa</span>
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed italic group-hover:text-white transition-colors">
          "{insightText}"
        </p>
        <div className="mt-3 text-[8px] text-accent font-bold uppercase tracking-widest opacity-0 group-hover/insight:opacity-100 transition-opacity flex items-center gap-1">
          <Activity className="h-2.5 w-2.5" /> Clique para Análise Profunda
        </div>
      </div>
    </div>
  );
}
