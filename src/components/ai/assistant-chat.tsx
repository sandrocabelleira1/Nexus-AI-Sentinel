
"use client"

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, Sparkles, Terminal, ShieldCheck } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { askPortfolioAssistant } from "@/app/actions/assistant";
import { useUser } from "@/firebase";
import { UserAsset, DisplayMode, GlobalIntelligenceAlert } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantChatProps {
  assets: UserAsset[];
  displayMode: DisplayMode;
  userName?: string | null;
  externalOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialQuery?: string | null;
  latestAlert?: GlobalIntelligenceAlert | null;
}

export function AssistantChat({ assets, displayMode, userName, externalOpen, onOpenChange, initialQuery, latestAlert }: AssistantChatProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastProcessedQuery, setLastProcessedQuery] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const name = userName || "Estrategista";
      setMessages([
        { 
          role: 'assistant', 
          content: `Saudações, Comandante ${name}. Posso ajudar a explorar os ativos da sua carteira. Confira os dados e as fontes antes de decidir. O que deseja analisar?` 
        }
      ]);
    }
  }, [userName, messages.length]);

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

    try {
      if (!user) throw new Error("Login necessário");
      const result = await askPortfolioAssistant(
        await user.getIdToken(),
        text,
        displayMode
      );

      const responseText = displayMode === 'Essencial' 
        ? result?.display_modes?.essential?.text 
        : result?.display_modes?.full?.technical_analysis;

      setMessages(prev => [...prev, { role: 'assistant', content: responseText || "Não consegui gerar uma análise confiável agora. Tente novamente mais tarde." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Não foi possível concluir a consulta. Verifique seu acesso ou tente mais tarde." }]);
    } finally {
      setIsLoading(false);
    }
  }, [displayMode, isLoading, user]);

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
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60]">
      {isOpen ? (
        <div className="fixed inset-4 md:inset-auto md:bottom-6 md:right-6 md:w-[500px] md:h-[750px] max-h-[90vh] glass-panel rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border-primary/30 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 md:p-6 bg-primary/10 border-b border-primary/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl led-glow-blue animate-pulse">
                <Terminal className="h-4 w-4 text-background" />
              </div>
              <div>
                <h3 className="text-xs font-headline font-bold text-white led-text-blue uppercase tracking-widest">Nexus Strategist</h3>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Global Analysis</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleOpenChange(false)} className="hover:bg-primary/20 rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar">
            <div className="space-y-4 md:space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-3.5 md:p-5 rounded-2xl md:rounded-3xl text-xs md:text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-background font-bold shadow-lg' 
                      : 'bg-white/5 border border-white/10 text-foreground font-medium'
                  }`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 opacity-50">
                        <ShieldCheck className="h-3 w-3 text-primary" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Resposta gerada por IA</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex gap-1.5">
                    <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1 w-1 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-4 md:p-6 border-t border-white/10 bg-black/40 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); setInput(""); }} className="flex gap-2">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Qual o impacto real hoje?"
                className="bg-white/5 border-white/10 focus-visible:ring-primary h-12 rounded-xl text-xs md:text-sm"
              />
              <Button type="submit" size="icon" disabled={isLoading} className="h-12 w-12 bg-primary text-background rounded-xl shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-[7px] text-muted-foreground font-bold uppercase tracking-[0.3em] text-center mt-3 opacity-40">
              Nexus AI Sentinel v2.6
            </p>
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => handleOpenChange(true)}
          className="h-14 w-14 md:h-20 md:w-20 rounded-2xl md:rounded-[2rem] bg-primary text-background shadow-2xl hover:scale-110 transition-all duration-500 led-glow-blue p-0"
        >
          <Sparkles className="h-6 w-6 md:h-9 md:w-9" />
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-ping" />
        </Button>
      )}
    </div>
  );
}
