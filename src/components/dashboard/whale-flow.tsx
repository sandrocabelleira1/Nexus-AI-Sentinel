
"use client"

import { WhaleTransaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Waves, Ship, Radar, ArrowUpRight, ArrowDownRight, ShieldAlert, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface WhaleFlowProps {
  transactions: WhaleTransaction[];
}

export function WhaleFlow({ transactions }: WhaleFlowProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Sonar Sound Logic for Critical Transactions (> $1B)
    const criticalTx = transactions[0];
    if (criticalTx && criticalTx.amountUsd >= 1000000000) {
      // In a real app, we'd play a sonar beep here.
      console.log("[SONAR] Critical transaction detected: $1B+");
      if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 30, 100]);
      }
    }
  }, [transactions]);

  return (
    <div className="bg-[#080D18]/90 border border-white/10 rounded-[2.5rem] p-8 h-full flex flex-col shadow-2xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/40 led-glow-blue">
            <Waves className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-headline font-bold uppercase tracking-[0.4em] text-primary block led-text-blue">
              WHALE FLOW
            </span>
            <span className="text-[8px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Sentinela On-Chain</span>
          </div>
        </div>
        <Radar className="h-5 w-5 text-emerald-500/40 animate-spin-slow" />
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        {transactions.length > 0 ? (
          transactions.map((tx) => {
            const isCritical = tx.amountUsd >= 1000000000;
            const isExchangeDeposit = tx.transactionType === 'exchange_deposit';
            
            return (
              <div 
                key={tx.id} 
                className={cn(
                  "p-5 rounded-3xl border transition-all duration-500 hover:bg-white/5 relative group/item",
                  isCritical ? "border-rose-500/30 bg-rose-500/5 shadow-[0_0_30px_rgba(244,63,94,0.1)]" : "border-white/5 bg-white/5"
                )}
              >
                {isCritical && (
                  <div className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5",
                      isExchangeDeposit ? "text-rose-400 border-rose-500/30" : "text-emerald-400 border-emerald-500/30"
                    )}>
                      {isExchangeDeposit ? 'SINAL DE VENDA' : 'ACUMULAÇÃO'}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">{tx.blockchain}</span>
                  </div>
                  <span className="text-[9px] text-white/40 font-bold">{formatDistanceToNow(new Date(tx.timestamp), { locale: ptBR })}</span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Ship className={cn("h-4 w-4", isCritical ? "text-rose-400" : "text-primary/60")} />
                      <h4 className="text-lg font-headline font-bold text-white tracking-tight">
                        {tx.amount.toLocaleString()} {tx.symbol}
                      </h4>
                    </div>
                    <p className="text-[11px] text-white/60 font-medium">
                      {isExchangeDeposit ? 'Transferido para Exchange' : 'Movido para Wallet Fria'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-sm font-bold flex items-center gap-1 justify-end",
                      isExchangeDeposit ? "text-rose-400" : "text-emerald-400"
                    )}>
                      {isExchangeDeposit ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      US$ {(tx.amountUsd / 1000000).toFixed(1)}M
                    </div>
                    {isCritical && <span className="text-[8px] text-rose-500 font-bold uppercase tracking-tighter">MOVIMENTO INSTITUCIONAL CRÍTICO</span>}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 space-y-4">
            <Zap className="h-10 w-10 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Aguardando pulsos on-chain...</span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Sonar Ativo</span>
        </div>
        <ShieldAlert className="h-4 w-4 text-primary/30" />
      </div>
    </div>
  );
}
