"use client"

import { WhaleTransaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Waves, Ship, Radar, Zap, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WhaleFlowProps {
  transactions: WhaleTransaction[];
  onAnalyze?: (context: string) => void;
}

export function WhaleFlow({ transactions, onAnalyze }: WhaleFlowProps) {
  useEffect(() => {
    const criticalTx = transactions[0];
    if (criticalTx && criticalTx.amountUsd >= 1000000000) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 30, 100]);
      }
    }
  }, [transactions]);

  return (
    <div className="bg-[#080D18]/90 border border-white/10 rounded-[3rem] p-8 h-[400px] flex flex-col shadow-2xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20 border border-primary/40 led-glow-blue">
            <Waves className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <span className="text-[10px] font-headline font-bold uppercase tracking-[0.4em] text-primary block led-text-blue">
            WHALE FLOW
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-1 hover:bg-white/5 rounded-full transition-colors">
                <Info className="h-3.5 w-3.5 text-white/20 hover:text-primary" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="glass-panel border-primary/30 w-80 p-6 rounded-3xl">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Manual Tático: Whale Flow</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">O que é?</p>
                    <p className="text-xs text-white/80 leading-relaxed">Monitoramento on-chain de grandes transferências de capitais (Baleias).</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">Interpretando Sinais</p>
                    <p className="text-xs text-white/80 leading-relaxed">
                      - <span className="text-rose-400 font-bold">Depósito em Exchange</span>: Potencial venda massiva iminente.<br/>
                      - <span className="text-emerald-400 font-bold">Retirada de Exchange</span>: Acumulação e choque de oferta.
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase">Como usar?</p>
                    <p className="text-xs text-white/80 leading-relaxed italic">Siga o "Smart Money". Grandes movimentações de Baleias precedem mudanças bruscas de preço.</p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Radar className="h-4 w-4 text-emerald-500/40 animate-spin-slow" />
        </div>
      </div>

      <ScrollArea className="flex-1 z-10 pr-4">
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const isCritical = tx.amountUsd >= 1000000000;
              const isExchangeDeposit = tx.transactionType === 'exchange_deposit';
              
              return (
                <div 
                  key={tx.id} 
                  onClick={() => onAnalyze?.(`Baleia: ${tx.amount} ${tx.symbol}`)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all hover:bg-white/10 cursor-pointer relative",
                    isCritical ? "border-rose-500/30 bg-rose-500/5" : "border-white/5 bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={cn(
                      "text-[8px] font-bold uppercase px-2 py-0.5",
                      isExchangeDeposit ? "text-rose-400 border-rose-500/30" : "text-emerald-400 border-emerald-500/30"
                    )}>
                      {isExchangeDeposit ? 'LIQUIDAÇÃO' : 'ACUMULAÇÃO'}
                    </Badge>
                    <span className="text-[8px] text-white/40 font-bold">
                      {tx.timestamp ? formatDistanceToNow(new Date(tx.timestamp), { locale: ptBR, addSuffix: true }) : 'agora'}
                    </span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Ship className={cn("h-3 w-3", isCritical ? "text-rose-400" : "text-primary/60")} />
                        <h4 className="text-sm font-headline font-bold text-white">
                          {tx.amount.toLocaleString()} {tx.symbol}
                        </h4>
                      </div>
                    </div>
                    <div className={cn(
                      "text-[10px] font-bold flex items-center gap-1",
                      isExchangeDeposit ? "text-rose-400" : "text-emerald-400"
                    )}>
                      US$ {(tx.amountUsd / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-40 opacity-20 space-y-4">
              <Zap className="h-8 w-8 text-primary" />
              <span className="text-[8px] font-bold uppercase">SONAR ATIVO</span>
            </div>
          )}
        </div>
        <ScrollBar className="bg-white/5" />
      </ScrollArea>
    </div>
  );
}
