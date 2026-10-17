import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel border-white/10 rounded-[2.5rem] p-10 text-center space-y-6">
        <AlertCircle className="h-14 w-14 text-amber-300 mx-auto" />
        <h1 className="text-2xl font-headline font-bold text-white uppercase">Assinaturas em preparação</h1>
        <p className="text-white/60 text-sm">
          Nenhum plano é liberado automaticamente por esta página. Se você realizou um pagamento,
          guarde o comprovante e entre em contato com o suporte para conferência.
        </p>
        <Link href="/"><Button variant="outline" className="w-full h-14">VOLTAR AO INÍCIO</Button></Link>
      </div>
    </div>
  );
}
