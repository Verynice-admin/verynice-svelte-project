// No-op Firestore stub used when VITE_FIREBASE_DISABLED=1

export const getFirestore = (): null => null;
export const connectFirestoreEmulator = (): void => {};

export const doc = (...args: unknown[]): { __type: string; args: unknown[] } => ({
  __type: 'docRef',
  args
});
export const collection = (...args: unknown[]): { __type: string; args: unknown[] } => ({
  __type: 'colRef',
  args
});

export const query = (...args: unknown[]): { __type: string; args: unknown[] } => ({
  __type: 'query',
  args
});
export const where = (...args: unknown[]): { __type: string; args: unknown[] } => ({
  __type: 'where',
  args
});
export const orderBy = (...args: unknown[]): { __type: string; args: unknown[] } => ({
  __type: 'orderBy',
  args
});
export const limit = (n: number): { __type: string; n: number } => ({ __type: 'limit', n });

export const getDoc = async (): Promise<{
  exists: () => boolean;
  data: () => Record<string, unknown>;
}> => ({ exists: () => false, data: () => ({}) });
export const getDocs = async (): Promise<{ empty: boolean; docs: unknown[] }> => ({
  empty: true,
  docs: []
});

export const setDoc = async (): Promise<void> => {};
export const addDoc = async (): Promise<{ id: string }> => ({ id: 'stub' });
export const updateDoc = async (): Promise<void> => {};
export const deleteDoc = async (): Promise<void> => {};

export const onSnapshot = (): (() => void) => () => {}; // returns unsubscribe noop

// FieldValue-like helpers (return recognizable placeholders)
export const serverTimestamp = (): { __fv: string } => ({ __fv: 'serverTimestamp' });
export const increment = (n = 1): { __fv: string; n: number } => ({ __fv: 'increment', n });
export const arrayUnion = (...vals: unknown[]): { __fv: string; vals: unknown[] } => ({
  __fv: 'arrayUnion',
  vals
});
export const arrayRemove = (...vals: unknown[]): { __fv: string; vals: unknown[] } => ({
  __fv: 'arrayRemove',
  vals
});

export const Timestamp = {
  now: (): Date => new Date(),
  fromDate: (d: Date): Date => d
};





















































