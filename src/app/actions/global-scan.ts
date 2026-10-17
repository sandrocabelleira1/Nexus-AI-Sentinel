'use server';

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase-admin';
import { monitorGlobalEvents } from '@/ai/flows/global-intelligence-monitor';
import { runAutonomousWhisperScan } from '@/ai/flows/autonomous-whisper-engine';
import { runWhaleDiscovery } from '@/ai/flows/whale-discovery';
import { fetchGlobalMarketData } from '@/ai/flows/global-market-data-engine';

export async function runGlobalScan(idToken: string, tickers: string[]) {
  const app = getAdminApp();
  const identity = await getAuth(app).verifyIdToken(idToken);
  const db = getFirestore(app);
  const admin = await db.collection('admin_roles').doc(identity.uid).get();
  if (!admin.exists) throw new Error('Apenas administradores podem atualizar o feed global.');

  const lock = db.collection('system_state').doc('global_scan');
  const now = Date.now();
  const acquired = await db.runTransaction(async tx => {
    const snapshot = await tx.get(lock);
    if (now - Number(snapshot.data()?.startedAt || 0) < 300000) return false;
    tx.set(lock, { startedAt: now, startedBy: identity.uid });
    return true;
  });
  if (!acquired) return { updated: false };

  const safeTickers = (Array.isArray(tickers) ? tickers : [])
    .filter(ticker => typeof ticker === 'string' && /^[A-Z0-9.]{1,12}$/.test(ticker))
    .slice(0, 20);
  const results = await Promise.allSettled([
    monitorGlobalEvents({ context: 'VIGILÂNCIA GLOBAL - SINCRONIZAÇÃO ADMINISTRATIVA' }),
    runAutonomousWhisperScan(),
    runWhaleDiscovery(),
    fetchGlobalMarketData(safeTickers),
  ]);
  const value = <T,>(index: number): T | null =>
    results[index].status === 'fulfilled' ? (results[index] as PromiseFulfilledResult<T | null>).value : null;
  const alerts = value<Awaited<ReturnType<typeof monitorGlobalEvents>>>(0);
  const whispers = value<Awaited<ReturnType<typeof runAutonomousWhisperScan>>>(1);
  const whales = value<Awaited<ReturnType<typeof runWhaleDiscovery>>>(2);
  const prices = value<Awaited<ReturnType<typeof fetchGlobalMarketData>>>(3);
  const batch = db.batch();
  const timestamp = new Date().toISOString();
  for (const alert of alerts?.alerts?.slice(0, 50) || []) {
    batch.set(db.collection('global_intelligence_alerts').doc(), { ...alert, createdAt: timestamp });
  }
  for (const whisper of whispers?.detected_whispers?.slice(0, 50) || []) {
    batch.set(db.collection('autonomous_insights').doc(), { ...whisper, timestamp });
  }
  for (const whale of whales?.detected_whales?.slice(0, 50) || []) {
    batch.set(db.collection('whale_transactions').doc(), { ...whale, timestamp });
  }
  for (const asset of prices?.assets?.slice(0, 200) || []) {
    if (typeof asset.ticker === 'string' && /^[A-Z0-9.]{1,12}$/.test(asset.ticker)) {
      batch.set(db.collection('market_prices').doc(asset.ticker), { ...asset, id: asset.ticker, updatedAt: timestamp }, { merge: true });
    }
  }
  await batch.commit();
  await lock.update({ completedAt: timestamp });
  return { updated: true };
}
