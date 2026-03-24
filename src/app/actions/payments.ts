
'use server';

import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * @fileOverview Ação de servidor para integrar com Mercado Pago.
 * Gera preferências de pagamento para os planos PRO e SOVEREIGN.
 */

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

const client = new MercadoPagoConfig({ 
  accessToken: ACCESS_TOKEN,
  options: { timeout: 5000 }
});

export async function createCheckoutPreference(tier: 'PRO' | 'SOVEREIGN', userId: string) {
  if (!ACCESS_TOKEN) {
    throw new Error('Mercado Pago Access Token não configurado no servidor.');
  }

  const preference = new Preference(client);
  const price = tier === 'PRO' ? 19.90 : 59.90;
  const title = tier === 'PRO' ? 'Nexus AI - Patente PRO' : 'Nexus AI - Patente SOVEREIGN';

  try {
    const response = await preference.create({
      body: {
        items: [
          {
            id: `nexus-${tier.toLowerCase()}`,
            title: title,
            quantity: 1,
            unit_price: price,
            currency_id: 'BRL',
          },
        ],
        back_urls: {
          success: `${BASE_URL}/payment/status?status=success&tier=${tier}&userId=${userId}`,
          failure: `${BASE_URL}/payment/status?status=failure`,
          pending: `${BASE_URL}/payment/status?status=pending`,
        },
        auto_return: 'approved',
        external_reference: userId,
        statement_descriptor: 'NEXUS AI SENTINEL',
      },
    });

    return { initPoint: response.init_point };
  } catch (error: any) {
    console.error('Erro ao criar preferência MP:', error);
    throw new Error('Falha ao gerar link de pagamento. Tente novamente.');
  }
}
