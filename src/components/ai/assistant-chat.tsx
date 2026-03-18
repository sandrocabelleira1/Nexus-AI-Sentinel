
"use client"

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, Sparkles, Terminal, ShieldCheck } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { interactivePortfolioAssistant } from "@/ai/flows/interactive-portfolio-assistant";
import { UserAsset, DisplayMode, GlobalIntelligenceAlert } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantChatProps {
  assets: UserAsset[];
  displayMode: DisplayMode;
  externalOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialQuery?: string | null;
  latestAlert?: GlobalIntelligenceAlert | null;
}

export function AssistantChat({ assets, displayMode, externalOpen, onOpenChange, initialQuery, latestAlert }: AssistantChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Sou o Nexus. Monitoramento global ativo. Analisei seu portfólio e as tendências geopolíticas atuais. Qual sua prioridade estratégica?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastProcessedQuery, setLastProcessedQuery] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync with external open state
  useEffect(() => {
    if (externalOpen !== undefined) {
      setIsOpen(externalOpen);
    }
  }, [externalOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) onOpenChange(open);
  };

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);

    const alertContext = latestAlert 
      ? `ALERTA CRÍTICO ATUAL: ${latestAlert.title}. ANÁLISE NEXUS: ${latestAlert.causalityExplanation}. MARKET SIGNAL: ${latestAlert.marketAction}.`
      : "Monitoramento global em curso. Sem anomalias críticas imediatas no radar.";

    try {
      const result = await interactivePortfolioAssistant({
        message: text,
        userAssets: assets.map(a => ({ name: a.name, type: a.type, location: a.location })),
        globalEvents: alertContext,
        displayMode: displayMode
      });

      const responseText = displayMode === 'Essencial' 
        ? result?.display_modes?.essential?.text 
        : result?.display_modes?.full?.technical_analysis;

      setMessages(prev => [...prev, { role: 'assistant', content: responseText || "Análise completa. Minha recomendação tática é manter vigilância sobre os ativos citados." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Erro na conexão com o Core do Nexus. Tente novamente, estrategista." }]);
    } finally {
      setIsLoading(false);
    }
  }, [assets, displayMode, isLoading, latestAlert]);

  // Handle initial query from external source
  useEffect(() => {
    if (initialQuery && isOpen && initialQuery !== lastProcessedQuery) {
      handleSend(initialQuery);
      setLastProcessedQuery(initialQuery);
    }
  }, [initialQuery, isOpen, handleSend, lastProcessedQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 sm:w-[500px] h-[750px] max-h-[85vh] glass-panel rounded-[2.5rem] shadow-2xl border-primary/30 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-6 bg-primary/10 border-b border-primary/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary rounded-2xl led-glow-blue animate-pulse">
                <Terminal className="h-5 w-5 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-headline font-bold text-white led-text-blue uppercase tracking-widest">Nexus Strategist</h3>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Live Global Analysis</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleOpenChange(false)} className="hover:bg-primary/20 rounded-xl">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="space-y-6 pr-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-5 rounded-3xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-background font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                      : 'bg-white/5 border border-white/10 text-foreground font-medium'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 opacity-50">
                        <ShieldCheck className="h-3 w-3 text-primary" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Nexus Verified Response</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
            <ScrollBar className="bg-white/5" />
          </ScrollArea>

          <div className="p-6 border-t border-white/10 bg-black/40 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); setInput(""); }} className="flex gap-3">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Qual o impacto real da geopolítica hoje?"
                className="bg-white/5 border-white/10 focus-visible:ring-primary h-14 rounded-2xl text-sm px-6"
              />
              <Button type="submit" size="icon" disabled={isLoading} className="h-14 w-14 bg-primary hover:bg-primary/80 text-background rounded-2xl shadow-lg transition-all hover:scale-105">
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-[0.3em] text-center mt-4 opacity-40">
              Nexus AI Sentinel - Autonomous Intelligence Core v2.6
            </p>
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => handleOpenChange(true)}
          className="h-20 w-20 rounded-[2rem] bg-primary text-background shadow-[0_0_50px_rgba(37,99,235,0.5)] hover:scale-110 transition-all duration-500 led-glow-blue p-0"
        >
          <Sparkles className="h-9 w-9" />
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-accent rounded-full animate-ping" />
        </Button>
      )}
    </div>
  );
}
