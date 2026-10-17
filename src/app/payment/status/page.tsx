'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { Loader2, ShieldCheck, XCircle, AlertCircle, ArrowRight, Home } from 'lucide-react';
import { useFirestore, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type CheckoutOrder = {
  userId: string;
  tier: 'PRO' | 'SOVEREIGN';
  status: string;
};

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const firestore = useFirestore();
  const { user } = useUser();
  const orderRef = useMemoFirebase(() => {
    if (!firestore || !user || !orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) return null;
    return doc(firestore, 'checkout_orders', orderId);
  }, [firestore, user, orderId]);
  const { data: order, error } = useDoc<CheckoutOrder>(orderRef);
  const paid = !!order && order.userId === user?.uid && order.status === 'paid';
  const failed = !!error || !orderId || searchParams.get('result') === 'failure' ||
    ['failed', 'rejected', 'cancelled', 'refunded', 'charged_back'].includes(order?.status || '');

  return (
    <div className="max-w-md w-full glass-panel border-white/10 rounded-[2.5rem] p-10 text-center space-y-8 shadow-2xl">
      {paid ? (
        <>
          <ShieldCheck className="h-14 w-14 text-emerald-400 mx-auto" />
          <h1 className="text-3xl font-headline font-bold text-white uppercase">Pagamento confirmado</h1>
          <p className="text-white/60 text-sm">Seu plano {order.tier} foi liberado após confirmação do Mercado Pago.</p>
          <Link href="/dashboard"><Button className="w-full h-14 gap-2">IR PARA O TERMINAL <ArrowRight className="h-4 w-4" /></Button></Link>
        </>
      ) : failed ? (
        <>
          <XCircle className="h-14 w-14 text-rose-400 mx-auto" />
          <h1 className="text-3xl font-headline font-bold text-white uppercase">Pagamento não confirmado</h1>
          <p className="text-white/60 text-sm">Seu plano não foi alterado. Se houve cobrança, contate o suporte com o comprovante.</p>
          <Link href="/"><Button variant="outline" className="w-full h-14 gap-2"><Home className="h-4 w-4" /> VOLTAR AO INÍCIO</Button></Link>
        </>
      ) : (
        <>
          <AlertCircle className="h-14 w-14 text-accent mx-auto" />
          <h1 className="text-3xl font-headline font-bold text-white uppercase">Aguardando confirmação</h1>
          <p className="text-white/60 text-sm">A liberação é automática depois que o Mercado Pago confirmar a transação. Esta página será atualizada quando o evento chegar.</p>
          <Link href="/dashboard"><Button variant="outline" className="w-full h-14">VOLTAR AO TERMINAL BÁSICO</Button></Link>
        </>
      )}
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Suspense fallback={<Loader2 className="h-12 w-12 text-primary animate-spin" />}>
        <PaymentStatusContent />
      </Suspense>
    </div>
  );
}
