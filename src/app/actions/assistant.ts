'use server';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase-admin';
import { interactivePortfolioAssistant } from '@/ai/flows/interactive-portfolio-assistant';
import type { DisplayMode } from '@/lib/types';

const DAILY_LIMIT = 5;
const MIN_INTERVAL_MS = 30_000;

export async function askPortfolioAssistant(idToken: string, message: string, displayMode: DisplayMode) {
  if (typeof idToken !== 'string' || !idToken || typeof message !== 'string' ||
      message.trim().length < 1 || message.length > 1000 ||
      !['Essencial', 'Completo'].includes(displayMode)) {
    throw new Error('Solicitação inválida.');
  }

  const app = getAdminApp();
  const identity = await getAuth(app).verifyIdToken(idToken);
  const db = getFirestore(app);
  const userRef = db.collection('users').doc(identity.uid);
  if (!(await userRef.get()).exists) throw new Error('Perfil não encontrado.');

  const day = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  const usageRef = db.collection('ai_usage').doc(identity.uid);
  await db.runTransaction(async tx => {
    const snapshot = await tx.get(usageRef);
    const usage = snapshot.data();
    const count = usage?.day === day ? Number(usage.count || 0) : 0;
    const lastAt = usage?.day === day ? Number(usage.lastAt || 0) : 0;
    if (count >= DAILY_LIMIT || now - lastAt < MIN_INTERVAL_MS) {
      throw new Error('Limite de consultas atingido. Tente novamente mais tarde.');
    }
    tx.set(usageRef, { day, count: count + 1, lastAt: now }, { merge: true });
  });

  const assetDocs = await userRef.collection('assets').limit(20).get();
  const userAssets = assetDocs.docs.map(doc => {
    const asset = doc.data();
    return {
      name: String(asset.name || '').slice(0, 80),
      type: String(asset.type || '').slice(0, 40),
      location: String(asset.location || '').slice(0, 100),
    };
  });

  return interactivePortfolioAssistant({
    message: message.trim(),
    userAssets,
    globalEvents: 'Nenhum evento global foi confirmado nesta solicitação.',
    displayMode,
  });
}
