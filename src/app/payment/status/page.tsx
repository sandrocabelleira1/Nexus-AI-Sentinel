
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, CheckCircle2, XCircle, ShieldCheck, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const firestore = useFirestore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState<'success' | 'failure' | 'pending' | null>(null);

  const paymentStatus = searchParams.get('status');
  const tier = searchParams.get('tier');
  const userId = searchParams.get('userId');

  useEffect(() => {
    if (paymentStatus === 'success' && tier && userId && firestore) {
      // Atualiza o tier do usuário no Firestore de forma não-bloqueante
      const userRef = doc(firestore, 'users', userId);
      setDocumentNonBlocking(userRef, {
        subscriptionTier: tier,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      setStatus('success');
      setIsProcessing(false);
    } else if (paymentStatus === 'failure') {
      setStatus('failure');
      setIsProcessing(false);
    } else if (paymentStatus === 'pending') {
      setStatus('pending');
      setIsProcessing(false);
    } else {
      // Fallback para carregamento ou erro inesperado
      const timer = setTimeout(() => setIsProcessing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, tier, userId, firestore]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-primary font-headline font-bold uppercase tracking-[0.3em] animate-pulse">Sincronizando Pagamento...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full glass-panel border-white/10 rounded-[2.5rem] p-10 text-center space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl">
      {status === 'success' ? (
        <>
          <div className="p-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 w-fit mx-auto led-glow-blue">
            <ShieldCheck className="h-12 w-12 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold text-white uppercase tracking-tighter">Patente Elevada</h1>
            <p className="text-white/60 font-medium">Sua conta foi atualizada para o nível <span className="text-primary font-bold">{tier}</span>. O Nexus agora opera com capacidade total para você.</p>
          </div>
          <Link href="/dashboard" className="block">
            <Button className="w-full h-14 bg-primary text-background font-bold rounded-xl gap-2 hover:scale-105 transition-all">
              IR PARA O TERMINAL <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </>
      ) : (
        <>
          <div className="p-4 rounded-full bg-rose-500/20 border border-rose-500/40 w-fit mx-auto">
            <XCircle className="h-12 w-12 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-bold text-white uppercase tracking-tighter">Erro no Processo</h1>
            <p className="text-white/60 font-medium">Não foi possível confirmar seu pagamento. Se o valor foi debitado, contate o suporte tático do Nexus.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/#pricing">
              <Button variant="outline" className="w-full h-14 border-white/10 text-white font-bold rounded-xl">TENTAR NOVAMENTE</Button>
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
          <p className="text-primary font-headline font-bold uppercase tracking-[0.3em]">Aguardando Dados...</p>
        </div>
      }>
        <PaymentStatusContent />
      </Suspense>
    </div>
  );
}
