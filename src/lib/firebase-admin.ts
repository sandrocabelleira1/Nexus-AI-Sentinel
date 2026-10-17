import { getApp, getApps, initializeApp } from 'firebase-admin/app';

export function getAdminApp() {
  return getApps().length ? getApp() : initializeApp();
}
