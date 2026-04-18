
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
  options: { timeout: 10000 }
});

export async function createCheckoutPreference(tier: 'PRO' | 'SOVEREIGN', userId: string, userEmail?: string) {
  if (!ACCESS_TOKEN) {
    console.error('ERRO CRÍTICO: MP_ACCESS_TOKEN não configurado.');
    throw new Error('O sistema de pagamentos está em manutenção técnica. Tente novamente mais tarde.');
  }

  const preference = new Preference(client);
  
  // Calibração de Valores v25.0
  const price = tier === 'PRO' ? 19.90 : 59.90;
  const title = tier === 'PRO' ? 'NEXUS AI - PATENTE PRO' : 'NEXUS AI - PATENTE SOVEREIGN';

  try {
    const response = await preference.create({
      body: {
        items: [
          {
            id: `nexus-patent-${tier.toLowerCase()}`,
            title: title,
            quantity: 1,
            unit_price: price,
            currency_id: 'BRL',
            description: `Acesso total às ferramentas táticas de nível ${tier} do Nexus AI Sentinel.`
          },
        ],
        payer: {
          email: userEmail || undefined,
        },
        back_urls: {
          success: `${BASE_URL}/payment/status?status=success&tier=${tier}&userId=${userId}`,
          failure: `${BASE_URL}/payment/status?status=failure`,
          pending: `${BASE_URL}/payment/status?status=pending`,
        },
        auto_return: 'approved',
        external_reference: userId,
        statement_descriptor: 'NEXUS AI SENTINEL',
        metadata: {
          user_id: userId,
          requested_tier: tier,
          system_version: '5.6'
        }
      },
    });

    if (!response.init_point) {
      throw new Error('Falha ao gerar ponto de entrada do checkout.');
    }

    return { initPoint: response.init_point };
  } catch (error: any) {
    console.error('Erro ao criar preferência MP:', error);
    throw new Error('O Core do Nexus falhou ao processar a ordem de pagamento. Verifique sua conexão.');
  }
}
