"use client"

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { interactivePortfolioAssistant } from "@/ai/flows/interactive-portfolio-assistant";
import { UserAsset, DisplayMode, GlobalIntelligenceAlert } from "@/lib/types";

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
    { role: 'assistant', content: "Olá, eu sou o Nexus. Como posso ajudar com seu patrimônio hoje? Analisei os ativos na sua Wallet e os últimos sinais globais." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      ? `ALERTA ATUAL: ${latestAlert.title}. DESCRIÇÃO: ${latestAlert.causalityExplanation}. AÇÃO SUGERIDA NO HUB: ${latestAlert.marketAction}.`
      : "O Sentinel Hub está monitorando o globo. Nenhuma anomalia crítica imediata fora do radar.";

    try {
      const result = await interactivePortfolioAssistant({
        message: text,
        userAssets: assets.map(a => ({ name: a.name, type: a.type, location: a.location })),
        globalEvents: alertContext,
        displayMode: displayMode
      });

      const responseText = displayMode === 'Essencial' 
        ? result.display_modes.essential.text 
        : result.display_modes.full.technical_analysis;

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Desculpe, tive um problema ao processar sua análise estratégica. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  }, [assets, displayMode, isLoading, latestAlert]);

  // Handle initial query from external source
  useEffect(() => {
    if (initialQuery && isOpen && messages.length === 1) {
      handleSend(initialQuery);
    }
  }, [initialQuery, isOpen, handleSend, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl border-primary/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 bg-primary/10 border-b border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <Bot className="h-5 w-5 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-headline font-bold">Nexus AI</h3>
                <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest">Análise Preditiva</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleOpenChange(false)} className="hover:bg-primary/20">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 h-[450px] p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-background font-medium' 
                      : 'bg-white/5 border border-white/5 text-foreground'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-white/5 bg-black/20">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input); setInput(""); }} className="flex gap-2">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="O que devo fazer com meu ouro hoje?"
                className="bg-white/5 border-white/10 focus-visible:ring-primary h-12 rounded-xl"
              />
              <Button type="submit" size="icon" disabled={isLoading} className="h-12 w-12 bg-primary hover:bg-primary/80 text-background rounded-xl">
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => handleOpenChange(true)}
          className="h-16 w-16 rounded-full bg-primary text-background shadow-lg hover:scale-110 transition-transform led-glow-blue p-0"
        >
          <Sparkles className="h-7 w-7" />
        </Button>
      )}
    </div>
  );
}
