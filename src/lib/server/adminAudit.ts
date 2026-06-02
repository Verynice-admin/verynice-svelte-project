import { dev } from '$app/environment';
import { adminDB } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export type AuditAction = 'access' | 'action' | 'rejected';

interface AuditEntry {
  uid: string;
  path: string;
  ip: string;
  action: AuditAction;
  detail?: string;
}

/**
 * Writes one row to the adminAuditLog collection.
 * Never throws — audit failures must never break the admin flow.
 * Skipped in dev to avoid polluting the production log.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  if (dev || !adminDB) return;
  try {
    await adminDB.collection('adminAuditLog').add({
      ...entry,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch {
    // intentionally silent
  }
}

/**
 * Returns the newest N audit log entries, newest first.
 */
export async function readAuditLog(limit = 100): Promise<
  (AuditEntry & { id: string; timestamp: string | null })[]
> {
  if (!adminDB) return [];
  try {
    const snap = await adminDB
      .collection('adminAuditLog')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id:        doc.id,
        uid:       d.uid ?? '',
        path:      d.path ?? '',
        ip:        d.ip ?? '',
        action:    (d.action ?? 'access') as AuditAction,
        detail:    d.detail ?? undefined,
        timestamp: d.timestamp?.toDate?.()?.toISOString() ?? null,
      };
    });
  } catch {
    return [];
  }
}
