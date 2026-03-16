
"use client"

import React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const glossary: Record<string, string> = {
  "BUY": "Recomendação de COMPRA: Expectativa de valorização tática baseada em fundamentos ou fluxo de capital.",
  "SELL": "Recomendação de VENDA: Sugestão de liquidação para proteção de patrimônio ou realização de lucro iminente.",
  "HOLD": "Recomendação de MANTER: O ativo está em zona de equilíbrio. Sugere-se manter a posição atual.",
  "WATCH": "Recomendação de OBSERVAR: Ativo em radar. Aguardando gatilho geopolítico ou volume para nova ordem.",
  "IBOV": "Índice Bovespa: O principal indicador de desempenho das ações negociadas na B3.",
  "FII": "Fundo de Investimento Imobiliário: Condomínio de investidores que aplicam em ativos do setor imobiliário.",
  "TICKER": "Código único que identifica um ativo na bolsa de valores (ex: VALE3, BTC).",
  "CAUSALIDADE": "Relação lógica de causa e efeito entre um evento (ex: novo decreto) e o preço de um ativo.",
  "CISNE NEGRO": "Evento raro, imprevisível e de impacto massivo que o Nexus busca detectar antecipadamente.",
  "YIELD": "Rendimento gerado por um investimento em relação ao seu preço atual.",
  "DIVIDENDOS": "Parcela do lucro de uma empresa distribuída periodicamente aos seus acionistas.",
  "GEOPOLÍTICA": "Estudo de como o poder e a geografia influenciam as relações internacionais e os mercados.",
  "LIQUIDEZ": "Facilidade com que um ativo pode ser convertido em dinheiro sem perda significativa de valor.",
  "VOLATILIDADE": "Medida de variação do preço de um ativo em um determinado período de tempo.",
}

interface FinancialTermProps {
  term: string
  children?: React.ReactNode
  className?: string
}

export function FinancialTerm({ term, children, className }: FinancialTermProps) {
  const normalizedTerm = term.toUpperCase().trim()
  const definition = glossary[normalizedTerm]

  if (!definition) return <span className={className}>{children || term}</span>

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={cn(
            "cursor-help border-b border-dotted border-primary/50 hover:text-primary transition-colors",
            className
          )}>
            {children || term}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-[#0D1525] border border-primary/30 p-4 max-w-xs shadow-2xl rounded-xl">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{normalizedTerm}</p>
          <p className="text-[11px] leading-relaxed text-white/90 font-medium">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
