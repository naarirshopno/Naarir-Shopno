import { doc, getDoc, getDocs, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

export interface HealthCheckStep {
  name: string;
  bengaliName: string;
  ok: boolean;
  message: string;
  latencyMs?: number;
  count?: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error';
  checkedAt: string;
  latencyMs: number;
  steps: HealthCheckStep[];
  config: {
    projectId: string;
    databaseId: string;
    authDomain: string;
    appId: string;
  };
  errors: string[];
}

/**
 * Runs a comprehensive real-time diagnostic health check on Firebase Firestore.
 * Verifies configuration, connectivity, collection reads, and write permissions.
 */
export async function runFirestoreHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const steps: HealthCheckStep[] = [];

  const configInfo = {
    projectId: firebaseConfig.projectId || 'Unknown',
    databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
    authDomain: firebaseConfig.authDomain || '',
    appId: firebaseConfig.appId || '',
  };

  console.group('%c[Firebase Health Check] শুরু হচ্ছে...', 'color: #e11d48; font-weight: bold;');
  console.log('Project ID:', configInfo.projectId);
  console.log('Database ID:', configInfo.databaseId);

  // 1. Config Check
  const isConfigValid = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey && firebaseConfig.firestoreDatabaseId);
  steps.push({
    name: 'config',
    bengaliName: 'ফায়ারবেস কনফিগারেশন বৈধতা',
    ok: isConfigValid,
    message: isConfigValid 
      ? `প্রজেক্ট (${configInfo.projectId}) ও ডাটাবেস আইডি কনফিগারেশন সঠিক আছে` 
      : 'ফায়ারবেস কনফিগারেশনে কিছু ফিল্ড অনুপস্থিত!',
  });

  // 2. Settings Document Check
  let settingsOk = false;
  let settingsLatency = 0;
  try {
    const t0 = Date.now();
    const setSnap = await getDoc(doc(db, 'settings', 'general'));
    settingsLatency = Date.now() - t0;
    settingsOk = true;
    const exists = setSnap.exists();
    steps.push({
      name: 'settings',
      bengaliName: 'শপ সেটিংস কালেকশন (settings/general)',
      ok: true,
      latencyMs: settingsLatency,
      message: exists 
        ? `সেটিংস সফলভাবে লোড হয়েছে (${settingsLatency}ms)` 
        : 'সেটিংস ডকুমেন্ট এখনও তৈরি হয়নি (ডিফল্ট সেটিংস ব্যবহার হচ্ছে)',
    });
  } catch (err: any) {
    const msg = err?.message || String(err);
    errors.push(`Settings Read Error: ${msg}`);
    steps.push({
      name: 'settings',
      bengaliName: 'শপ সেটিংস কালেকশন (settings/general)',
      ok: false,
      message: `সেটিংস লোড করতে ব্যর্থ: ${msg}`,
    });
  }

  // 3. Products Collection Check
  let productsOk = false;
  try {
    const t0 = Date.now();
    const prodSnap = await getDocs(collection(db, 'products'));
    const latency = Date.now() - t0;
    productsOk = true;
    steps.push({
      name: 'products',
      bengaliName: 'প্রোডাক্ট ডাটাবেস কালেকশন (products)',
      ok: true,
      count: prodSnap.size,
      latencyMs: latency,
      message: `প্রোডাক্ট কালেকশন সক্রিয়। মোট ক্লাউড প্রোডাক্ট: ${prodSnap.size} টি (${latency}ms)`,
    });
  } catch (err: any) {
    const msg = err?.message || String(err);
    errors.push(`Products Read Error: ${msg}`);
    steps.push({
      name: 'products',
      bengaliName: 'প্রোডাক্ট ডাটাবেস কালেকশন (products)',
      ok: false,
      message: `প্রোডাক্ট কালেকশন এক্সেস ব্যর্থ: ${msg}`,
    });
  }

  // 4. Orders Collection Check
  let ordersOk = false;
  try {
    const t0 = Date.now();
    const ordSnap = await getDocs(collection(db, 'orders'));
    const latency = Date.now() - t0;
    ordersOk = true;
    steps.push({
      name: 'orders',
      bengaliName: 'কাস্টমার অর্ডার কালেকশন (orders)',
      ok: true,
      count: ordSnap.size,
      latencyMs: latency,
      message: `অর্ডার ডাটাবেস সক্রিয়। মোট ক্লাউড অর্ডার: ${ordSnap.size} টি (${latency}ms)`,
    });
  } catch (err: any) {
    const msg = err?.message || String(err);
    errors.push(`Orders Read Error: ${msg}`);
    steps.push({
      name: 'orders',
      bengaliName: 'কাস্টমার অর্ডার কালেকশন (orders)',
      ok: false,
      message: `অর্ডার কালেকশন এক্সেস ব্যর্থ: ${msg}`,
    });
  }

  // 5. Messages Collection Check
  try {
    const t0 = Date.now();
    const msgSnap = await getDocs(collection(db, 'messages'));
    const latency = Date.now() - t0;
    steps.push({
      name: 'messages',
      bengaliName: 'হেল্পডেস্ক ও মেসেজ কালেকশন (messages)',
      ok: true,
      count: msgSnap.size,
      latencyMs: latency,
      message: `মেসেজ কালেকশন সক্রিয়। মোট বার্তা: ${msgSnap.size} টি (${latency}ms)`,
    });
  } catch (err: any) {
    const msg = err?.message || String(err);
    errors.push(`Messages Read Error: ${msg}`);
    steps.push({
      name: 'messages',
      bengaliName: 'হেল্পডেস্ক ও মেসেজ কালেকশন (messages)',
      ok: false,
      message: `মেসেজ কালেকশন এক্সেস ব্যর্থ: ${msg}`,
    });
  }

  // 6. Write and Delete Ping Permission Test
  try {
    const t0 = Date.now();
    const pingId = `health_ping_${Date.now()}`;
    const pingDoc = doc(db, 'settings', pingId);
    await setDoc(pingDoc, { ping: true, time: new Date().toISOString() });
    await deleteDoc(pingDoc);
    const latency = Date.now() - t0;
    steps.push({
      name: 'write_permission',
      bengaliName: 'ডাটাবেস রাইট ও পারমিশন পরীক্ষা (Write/Delete Ping)',
      ok: true,
      latencyMs: latency,
      message: `ক্লাউড ডাটাবেসে তথ্য লিখা ও মোছার অনুমতি সম্পূর্ণ সক্রিয় (${latency}ms)`,
    });
  } catch (err: any) {
    const msg = err?.message || String(err);
    errors.push(`Write Permission Error: ${msg}`);
    steps.push({
      name: 'write_permission',
      bengaliName: 'ডাটাবেস রাইট ও পারমিশন পরীক্ষা (Write/Delete Ping)',
      ok: false,
      message: `ডাটাবেস রাইট পারমিশন সীমাবদ্ধ বা বন্ধ: ${msg}`,
    });
  }

  const totalLatency = Date.now() - startTime;
  let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';
  if (errors.length > 0) {
    overallStatus = (settingsOk || productsOk || ordersOk) ? 'warning' : 'error';
  }

  const result: HealthCheckResult = {
    status: overallStatus,
    checkedAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    latencyMs: totalLatency,
    steps,
    config: configInfo,
    errors,
  };

  if (overallStatus === 'healthy') {
    console.log('%c[Firebase Health Check] 🟢 ডাটাবেস সম্পূর্ণ স্বাস্থ্যকর ও সক্রিয়!', 'color: #10b981; font-weight: bold;', result);
  } else if (overallStatus === 'warning') {
    console.warn('[Firebase Health Check] 🟡 কিছু কালেকশনে সতর্কতা পাওয়া গেছে:', result);
  } else {
    console.error('[Firebase Health Check] 🔴 ফায়ারবেস কানেকশন এরর:', result);
  }
  console.groupEnd();

  return result;
}
