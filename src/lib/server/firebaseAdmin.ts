import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import type { ServiceAccount as FirebaseServiceAccount } from 'firebase-admin/app';
import { env } from '$env/dynamic/private';

let app: App | undefined;
let db: Firestore | null = null;

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

function loadServiceAccount(): ServiceAccount | null {
  // Priority 1: Try .secrets directory first (for local development)
  const secretsPaths = [
    resolve('.secrets/serviceAccountKey.json'),
    resolve('.secrets/service-account.json')
  ];

  for (const secretsPath of secretsPaths) {
    try {
      if (existsSync(secretsPath)) {
        const sa: ServiceAccount = JSON.parse(readFileSync(secretsPath, 'utf8'));
        if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
          sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        return sa;
      }
    } catch (error) {
      // Continue to next path
    }
  }

  // Priority 2: Environment variable with file path
  const filePath = env.GOOGLE_APPLICATION_CREDENTIALS;
  if (filePath) {
    try {
      const abs = resolve(filePath);
      if (existsSync(abs)) {
        const sa: ServiceAccount = JSON.parse(readFileSync(abs, 'utf8'));
        if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
          sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        return sa;
      }
    } catch (error) {
      // Continue to next option
    }
  }
  
  // Priority 3: Environment variable with JSON string
  const jsonStr = env.FIREBASE_SERVICE_ACCOUNT || env.VITE_FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    try {
      const sa: ServiceAccount = JSON.parse(jsonStr);
      if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
        sa.private_key = sa.private_key.replace(/\\n/g, '\n');
      }
      return sa;
    } catch (error) {
      // Continue
    }
  }

  // Priority 4: Try root directory (legacy support)
  const rootPaths = [
    resolve('serviceAccountKey.json'),
    resolve('service-account.json')
  ];

  for (const rootPath of rootPaths) {
    try {
      if (existsSync(rootPath)) {
        const sa: ServiceAccount = JSON.parse(readFileSync(rootPath, 'utf8'));
        if (typeof sa.private_key === 'string' && sa.private_key.includes('\\n')) {
          sa.private_key = sa.private_key.replace(/\\n/g, '\n');
        }
        return sa;
      }
    } catch (error) {
      // Continue
    }
  }

  return null;
}

try {
  if (!getApps().length) {
    const sa = loadServiceAccount();
    if (sa) {
      app = initializeApp({
        credential: cert(sa as FirebaseServiceAccount),
        projectId: env.FIREBASE_PROJECT_ID || sa.project_id
      });
      db = getFirestore(app);
      console.log('[Firebase Admin] Initialized successfully');
    } else {
      console.warn('[Firebase Admin] No service account found. App will run without Firebase Admin SDK.');
      console.warn('[Firebase Admin] To enable: Place serviceAccountKey.json in .secrets/ directory or set GOOGLE_APPLICATION_CREDENTIALS env var');
      db = null;
    }
  } else {
    app = getApps()[0];
    db = getFirestore(app);
  }
} catch (e) {
  console.error('[Firebase Admin] Initialization error:', e);
  db = null;
  // Don't throw - allow app to continue without admin SDK
  // Server routes should check for null adminDB
}

export { db as adminDB };
