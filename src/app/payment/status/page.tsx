
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, CheckCircle2, XCircle, ShieldCheck, ArrowRight, Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState<'success' | 'failure' | 'pending' | null>(null);

  const paymentStatus = searchParams.get('status');
  const tier = searchParams.get('tier');
  const userId = searchParams.get('userId');

  useEffect(() => {
    let mounted = true;

    async function processPayment() {
      if (paymentStatus === 'success' && tier && userId && firestore) {
        try {
          // Atualiza a patente do estrategista no Core do Nexus
          const userRef = doc(firestore, 'users', userId);
          setDocumentNonBlocking(userRef, {
            subscriptionTier: tier,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          
          if (mounted) {
            setStatus('success');
            setIsProcessing(false);
          }
        } catch (e) {
          console.error("Erro ao salvar nova patente:", e);
          if (mounted) {
            setStatus('failure');
            setIsProcessing(false);
          }
        }
      } else if (paymentStatus === 'failure') {
        if (mounted) {
          setStatus('failure');
          setIsProcessing(false);
        }
      } else if (paymentStatus === 'pending') {
        if (mounted) {
          setStatus('pending');
          setIsProcessing(false);
        }
      } else {
        // Redirecionamento de segurança se não houver dados
        const timer = setTimeout(() => {
          if (mounted) setIsProcessing(false);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }

    processPayment();
    return () => { mounted = false; };
  }, [paymentStatus, tier, userId, firestore]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-primary font-headline font-bold uppercase tracking-[0.4em] animate-pulse">Sincronizando Ordem...</p>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Protocolo de Elevação de Patente Ativo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full glass-panel border-white/10 rounded-[2.5rem] p-10 text-center space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      {status === 'success' ? (
        <>
          <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 w-fit mx-auto led-glow-blue relative">
            <ShieldCheck className="h-14 w-14 text-emerald-400" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-headline font-bold text-white uppercase tracking-tighter">Patente Elevada</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
               <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{tier} LEVEL ACTIVE</span>
            </div>
            <p className="text-white/60 font-medium text-sm leading-relaxed">
              O Core do Nexus reconheceu sua nova autoridade. Suas ferramentas táticas de nível <span className="text-primary font-bold">{tier}</span> já estão desbloqueadas.
            </p>
          </div>
          <Link href="/dashboard" className="block pt-4">
            <Button className="w-full h-16 bg-primary text-background font-bold text-lg rounded-2xl gap-3 shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:scale-105 transition-all group">
              IR PARA O TERMINAL <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </>
      ) : status === 'pending' ? (
        <>
          <div className="p-5 rounded-3xl bg-accent/10 border border-accent/30 w-fit mx-auto">
            <AlertCircle className="h-14 w-14 text-accent" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-headline font-bold text-white uppercase tracking-tighter">Pagamento Pendente</h1>
            <p className="text-white/60 font-medium text-sm leading-relaxed">
              O processador de pagamentos está aguardando a compensação. Assim que for confirmado, sua patente será elevada automaticamente.
            </p>
          </div>
          <Link href="/dashboard" className="block pt-4">
            <Button variant="outline" className="w-full h-16 border-white/10 text-white font-bold rounded-2xl">
              VOLTAR AO TERMINAL BÁSICO
            </Button>
          </Link>
        </>
      ) : (
        <>
          <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 w-fit mx-auto">
            <XCircle className="h-14 w-14 text-rose-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-headline font-bold text-white uppercase tracking-tighter">Operação Falhou</h1>
            <p className="text-white/60 font-medium text-sm leading-relaxed">
              Não foi possível processar sua elevação de patente. Se o valor foi debitado, entre em contato com o suporte tático.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Link href="/#pricing">
              <Button className="w-full h-14 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10">
                TENTAR NOVAMENTE
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full h-14 text-white/40 hover:text-white font-bold gap-2">
                <Home className="h-4 w-4" /> VOLTAR AO INÍCIO
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center space-y-6">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-primary font-headline font-bold uppercase tracking-[0.3em]">Carregando Sistema...</p>
        </div>
      }>
        <PaymentStatusContent />
      </Suspense>
    </div>
  );
}
