"use client"

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CheckCircle2, AlertTriangle, Scale } from "lucide-react";
import { useFirestore, useUser, setDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function ConsentDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const consentRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid, "consents", "disclaimer");
  }, [firestore, user]);

  const { data: consentData, isLoading: isConsentLoading } = useDoc(consentRef);

  useEffect(() => {
    if (!isConsentLoading && !consentData && user) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [consentData, isConsentLoading, user]);

  const handleAccept = () => {
    if (!firestore || !user) return;
    
    setDocumentNonBlocking(doc(firestore, "users", user.uid, "consents", "disclaimer"), {
      userId: user.uid,
      consentType: "InvestmentDisclaimer",
      consentVersion: "1.0",
      agreedAt: new Date().toISOString(),
      status: "Accepted"
    }, { merge: true });
    
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="glass-panel border-accent/50 max-w-[600px] p-8 rounded-[2.5rem] shadow-[0_0_100px_rgba(249,115,22,0.2)]">
        <DialogHeader className="space-y-4">
          <div className="p-4 rounded-2xl bg-accent/20 border border-accent/40 led-glow-accent w-fit mx-auto">
            <ShieldAlert className="h-8 w-8 text-accent" />
          </div>
          <DialogTitle className="text-3xl font-headline font-bold text-white text-center tracking-tighter">
            ISENÇÃO DE RESPONSABILIDADE <span className="led-text-accent">LEGAL</span>
          </DialogTitle>
          <DialogDescription className="text-center text-white/60 font-medium text-sm">
            O Nexus AI Sentinel é um terminal de monitoramento e inteligência autônoma. Leia atentamente os termos abaixo antes de prosseguir.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
          <div className="flex gap-4 items-start">
            <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-1" />
            <p className="text-xs text-white/80 leading-relaxed">
              <strong>Responsabilidade do Usuário:</strong> Todas as informações fornecidas por este sistema são processadas por algoritmos de IA e podem conter imprecisões. O uso destas informações é de sua inteira responsabilidade.
            </p>
          </div>
          <div className="flex gap-4 items-start">
            <Scale className="h-5 w-5 text-accent shrink-0 mt-1" />
            <p className="text-xs text-white/80 leading-relaxed">
              <strong>Não é Conselho de Investimento:</strong> O Nexus AI não é um consultor financeiro. As recomendações geradas (BUY, SELL, WATCH) são baseadas em análises de sentimento e dados públicos, não constituindo oferta ou solicitação de compra e venda de ativos.
            </p>
          </div>
          <div className="flex gap-4 items-start">
            <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-1" />
            <p className="text-xs text-white/80 leading-relaxed">
              <strong>Isenção de Perdas:</strong> Os desenvolvedores e mantenedores do Nexus AI Sentinel não se responsabilizam por quaisquer perdas financeiras, diretas ou indiretas, decorrentes do uso das ferramentas ou informações aqui apresentadas.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-4 mt-8">
          <Button 
            onClick={handleAccept} 
            className="w-full h-16 bg-accent text-background font-bold text-lg rounded-xl shadow-lg hover:scale-[1.02] transition-all"
          >
            EU COMPREENDO E ACEITO OS RISCOS
          </Button>
          <p className="text-[10px] text-white/20 text-center font-bold uppercase tracking-widest">
            AO CLICAR, VOCÊ CONCORDA QUE É O ÚNICO RESPONSÁVEL POR SUAS DECISÕES FINANCEIRAS.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}