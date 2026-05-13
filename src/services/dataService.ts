
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { BazarLog, Bill, EducationExpense, Loan, Income } from '../types';

type StorageKey = 'incomes' | 'bazar_logs' | 'bills' | 'education_expenses' | 'loans';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const dataService = {
  subscribeToCollection: <T>(key: StorageKey, callback: (data: T[]) => void) => {
    if (!auth.currentUser) {
      callback([]);
      return () => {};
    }

    const q = query(
      collection(db, key), 
      where('userId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const item = { id: doc.id, ...doc.data() } as any;
          // Handle Firebase Timestamps
          if (item.date instanceof Timestamp) item.date = item.date.toDate();
          if (item.paidAt instanceof Timestamp) item.paidAt = item.paidAt.toDate();
          return item;
        });
        callback(data);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, key);
      }
    );

    return unsubscribe;
  },

  addDocument: async <T extends { id?: string }>(key: StorageKey, data: any) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    const payload = {
      ...data,
      userId: auth.currentUser.uid,
      createdAt: new Date(),
    };

    try {
      const docRef = await addDoc(collection(db, key), payload);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, key);
    }
  },

  updateDocument: async (key: StorageKey, id: string, data: any) => {
    try {
      const docRef = doc(db, key, id);
      await updateDoc(docRef, { ...data, updatedAt: new Date() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${key}/${id}`);
    }
  },

  deleteDocument: async (key: StorageKey, id: string) => {
    try {
      await deleteDoc(doc(db, key, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${key}/${id}`);
    }
  },

  // Backup & Restore for Firestore
  exportData: async () => {
    if (!auth.currentUser) return;
    const keys: StorageKey[] = ['incomes', 'bazar_logs', 'bills', 'education_expenses', 'loans'];
    const backup: Record<string, any> = {};
    
    try {
      for (const key of keys) {
        const q = query(collection(db, key), where('userId', '==', auth.currentUser.uid));
        const snapshot = await getDocs(q);
        backup[key] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      }
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `humaid_corner_cloud_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
    }
  },

  importData: async (jsonString: string) => {
    if (!auth.currentUser) return false;
    try {
      const backup = JSON.parse(jsonString);
      const keys: StorageKey[] = ['incomes', 'bazar_logs', 'bills', 'education_expenses', 'loans'];
      
      for (const key of keys) {
        if (backup[key] && Array.isArray(backup[key])) {
          for (const item of backup[key]) {
            // Remove existing ID and userId to avoid conflicts, then add new with current user context
            const { id, userId, ...rest } = item;
            await dataService.addDocument(key as StorageKey, rest);
          }
        }
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  // Auth & Language State (Still local or moved to Auth)
  getAuthState: () => {
    const state = localStorage.getItem('humaid_corner_auth_state');
    return state ? JSON.parse(state) : { authenticated: false, failedAttempts: 0, lastFailedTime: 0 };
  },

  saveAuthState: (state: any) => {
    localStorage.setItem('humaid_corner_auth_state', JSON.stringify(state));
  },

  getLanguage: () => {
    return localStorage.getItem('humaid_corner_lang') || 'en';
  },

  setLanguage: (lang: string) => {
    localStorage.setItem('humaid_corner_lang', lang);
    window.location.reload();
  }
};
