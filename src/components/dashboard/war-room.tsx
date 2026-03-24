"use client"

import { MarketEntity } from "@/lib/types";
import { Globe, ShieldCheck, Landmark, Cpu, Building2, UserCircle2, ArrowRightLeft, Activity, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WarRoomProps {
  entities: MarketEntity[];
  onAnalyze?: (context: string) => void;
}

export function WarRoom({ entities, onAnalyze }: WarRoomProps) {
  const insightText = "Nexus identificou movimentos da BlackRock e do Governo Americano. Sinapses indicam acumulação tática em ativos de tecnologia.";

  return (
    <div className="bg-[#080D18]/90 border border-white/10 rounded-[3rem] p-8 h-[400px] flex flex-col shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/20 border border-accent/40 led-glow-accent">
            <Landmark className="h-4 w-4 text-accent" />
          </div>
          <div>
            <span className="text-[10px] font-headline font-bold uppercase tracking-[0.4em] text-accent block led-text-accent">
              WAR ROOM
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-1 hover:bg-white/5 rounded-full transition-colors">
                <Info className="h-3.5 w-3.5 text-white/20 hover:text-accent" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="glass-panel border-accent/30 w-80 p-6 rounded-3xl">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-accent uppercase tracking-widest">Manual Tático: War Room</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">O que é?</p>
                    <p className="text-xs text-white/80 leading-relaxed">Monitoramento de grandes players institucionais e soberanos (Governos, BlackRock, etc).</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">Para que serve?</p>
                    <p className="text-xs text-white/80 leading-relaxed">Entender quem está dominando a narrativa de capital e para onde as instituições estão alocando trilhões.</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">Como usar?</p>
                    <p className="text-xs text-white/80 leading-relaxed italic">Observe a concentração de poder para entender tendências de longo prazo e identificar riscos sistêmicos.</p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
            <Activity className="h-2 w-2 text-emerald-400 animate-pulse" />
            <span className="text-[7px] text-white/60 font-bold uppercase">LIVE</span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 z-10 pr-4">
        <div className="space-y-4">
          {entities.length > 0 ? (
            entities.map((entity) => {
              const Icon = entity.type === 'Government' ? Globe : 
                           entity.type === 'Institution' ? Building2 : 
                           entity.type === 'Exchange' ? ArrowRightLeft : UserCircle2;
              
              return (
                <div key={entity.id} className="relative group/entity cursor-pointer" onClick={() => onAnalyze?.(`${entity.name} (${entity.type})`)}>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 transition-all hover:border-accent/40">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-bold text-white tracking-tight">{entity.name}</h4>
                        <span className="text-[8px] text-accent font-bold uppercase">Sinapse: {entity.influenceScore}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-white">
                        US$ {(entity.currentBalanceUsd / 1000000000).toFixed(1)}B
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-40 space-y-4 opacity-30">
              <Cpu className="h-8 w-8 animate-scan" />
              <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Mapeando atores...</p>
            </div>
          )}
        </div>
        <ScrollBar className="bg-white/5" />
      </ScrollArea>

      <div 
        className="mt-6 p-4 rounded-2xl bg-accent/5 border border-accent/10 cursor-pointer hover:bg-accent/10 transition-all group/insight z-10"
        onClick={() => onAnalyze?.(insightText)}
      >
        <p className="text-[10px] text-white/60 leading-relaxed italic line-clamp-2">
          "{insightText}"
        </p>
      </div>
    </div>
  );
}
