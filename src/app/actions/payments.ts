'use server';

import { randomUUID } from 'node:crypto';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getAdminApp } from '@/lib/firebase-admin';

const PRICES = { PRO: 19.90, SOVEREIGN: 59.90 } as const;

function getBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_BASE_URL;
  if (!raw) throw new Error('Endereço público do aplicativo não configurado.');
  const url = new URL(raw);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error('O checkout exige um endereço HTTPS.');
  }
  return url.origin;
}

export async function createCheckoutPreference(tier: 'PRO' | 'SOVEREIGN', idToken: string) {
  if (tier !== 'PRO' && tier !== 'SOVEREIGN') throw new Error('Plano inválido.');
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error('Pagamentos temporariamente indisponíveis.');
  if (!idToken) throw new Error('Faça login antes de iniciar o pagamento.');

  const app = getAdminApp();
  const identity = await getAuth(app).verifyIdToken(idToken);
  if (identity.firebase.sign_in_provider === 'anonymous' || !identity.email) {
    throw new Error('Entre com uma conta de e-mail para contratar um plano.');
  }

  const db = getFirestore(app);
  const orderId = randomUUID();
  const orderRef = db.collection('checkout_orders').doc(orderId);
  const baseUrl = getBaseUrl();
  await orderRef.create({
    userId: identity.uid,
    tier,
    amount: PRICES[tier],
    currency: 'BRL',
    status: 'created',
    createdAt: new Date().toISOString(),
  });

  try {
    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
    const response = await new Preference(client).create({
      body: {
        items: [{
          id: `nexus-patent-${tier.toLowerCase()}`,
          title: `NEXUS AI - PATENTE ${tier}`,
          quantity: 1,
          unit_price: PRICES[tier],
          currency_id: 'BRL',
        }],
        payer: { email: identity.email },
        back_urls: {
          success: `${baseUrl}/payment/status?orderId=${orderId}`,
          failure: `${baseUrl}/payment/status?orderId=${orderId}&result=failure`,
          pending: `${baseUrl}/payment/status?orderId=${orderId}`,
        },
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        auto_return: 'approved',
        external_reference: orderId,
        statement_descriptor: 'NEXUS AI SENTINEL',
        metadata: { user_id: identity.uid, requested_tier: tier, order_id: orderId },
      },
    });
    if (!response.id || !response.init_point) throw new Error('Preferência incompleta.');
    await db.runTransaction(async tx => {
      const snapshot = await tx.get(orderRef);
      if (snapshot.data()?.status === 'created') {
        tx.update(orderRef, { preferenceId: response.id, status: 'pending' });
      }
    });
    return { initPoint: response.init_point };
  } catch (error) {
    await db.runTransaction(async tx => {
      const snapshot = await tx.get(orderRef);
      if (snapshot.data()?.status === 'created') tx.update(orderRef, { status: 'failed' });
    });
    console.error('Falha ao iniciar checkout:', error);
    throw new Error('Não foi possível iniciar o pagamento. Tente novamente.');
  }
}
