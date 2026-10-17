import { createHmac, timingSafeEqual } from 'node:crypto';
import { getFirestore } from 'firebase-admin/firestore';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getAdminApp } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

function isValidSignature(request: Request, paymentId: string, secret: string) {
  const signature = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const parts = Object.fromEntries(signature.split(',').map(part => part.trim().split('=', 2)));
  const ts = parts.ts;
  const received = parts.v1;
  if (!ts || !received || !/^\d+$/.test(ts) || !/^[0-9a-f]{64}$/i.test(received) || !requestId) {
    return false;
  }
  // Mercado Pago signs data.id from the query string, not the JSON body.
  const manifest = `id:${paymentId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest();
  const supplied = Buffer.from(received, 'hex');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!secret || !accessToken) return new Response('Webhook não configurado', { status: 503 });

  const url = new URL(request.url);
  const paymentId = url.searchParams.get('data.id');
  if (!paymentId || !/^\d{1,30}$/.test(paymentId)) {
    return new Response('Identificador inválido', { status: 400 });
  }
  if (!isValidSignature(request, paymentId, secret)) {
    return new Response('Assinatura inválida', { status: 401 });
  }

  try {
    const body = await request.json();
    if (body.type !== 'payment' || String(body.data?.id) !== paymentId) {
      return new Response('Evento inválido', { status: 400 });
    }
    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
    const payment = await new Payment(client).get({ id: paymentId });
    const orderId = payment.external_reference;
    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return new Response('Ordem não identificada', { status: 200 });
    }

    const db = getFirestore(getAdminApp());
    const orderRef = db.collection('checkout_orders').doc(orderId);
    await db.runTransaction(async tx => {
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) return;
      const order = orderSnap.data()!;
      if (order.paymentId && order.paymentId !== paymentId) return;
      if (order.currency !== 'BRL' || payment.currency_id !== 'BRL' ||
          Number(payment.transaction_amount) !== order.amount ||
          !['PRO', 'SOVEREIGN'].includes(order.tier) ||
          !/^[A-Za-z0-9_-]{1,128}$/.test(order.userId)) return;

      const userRef = db.collection('users').doc(order.userId);
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) return;

      if (payment.status === 'approved') {
        if (order.status === 'paid') return;
        tx.update(orderRef, { status: 'paid', paymentId, paidAt: new Date().toISOString() });
        tx.update(userRef, {
          subscriptionTier: order.tier,
          activeOrderId: orderId,
          updatedAt: new Date().toISOString(),
        });
      } else if (payment.status === 'refunded' || payment.status === 'charged_back') {
        tx.update(orderRef, { status: payment.status, paymentId, updatedAt: new Date().toISOString() });
        if (userSnap.data()?.activeOrderId === orderId) {
          tx.update(userRef, {
            subscriptionTier: 'SENTINEL',
            activeOrderId: null,
            updatedAt: new Date().toISOString(),
          });
        }
      } else if (order.status !== 'paid') {
        tx.update(orderRef, {
          status: payment.status || 'pending',
          paymentId,
          updatedAt: new Date().toISOString(),
        });
      }
    });
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Falha no webhook do Mercado Pago:', error);
    return new Response('Falha temporária', { status: 500 });
  }
}
