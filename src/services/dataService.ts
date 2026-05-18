import { BazarLog, Bill, EducationExpense, Loan, Income } from '../types';

type StorageKey = 'incomes' | 'bazar_logs' | 'bills' | 'education_expenses' | 'loans' | 'custom_bazar_items' | 'business_customers' | 'business_sales' | 'business_products' | 'activity_logs';

export const dataService = {
  // Simple state management via listeners
  listeners: {} as Record<string, ((data: any) => void)[]>,

  subscribeToCollection: <T>(key: StorageKey, callback: (data: T[]) => void) => {
    if (!dataService.listeners[key]) {
      dataService.listeners[key] = [];
    }
    dataService.listeners[key].push(callback);

    // Initial load
    const data = dataService.getRawCollection<T>(key);
    callback(data);

    // Return unsubscribe
    return () => {
      dataService.listeners[key] = dataService.listeners[key].filter((cb: any) => cb !== callback);
    };
  },

  getRawCollection: <T>(key: StorageKey): T[] => {
    const raw = localStorage.getItem(`humaid_corner_${key}`);
    if (!raw) return [];
    try {
      return JSON.parse(raw).map((item: any) => {
        // Convert date strings back to objects if they look like dates
        if (item.date && typeof item.date === 'string') item.date = new Date(item.date);
        if (item.createdAt && typeof item.createdAt === 'string') item.createdAt = new Date(item.createdAt);
        if (item.paidAt && typeof item.paidAt === 'string') item.paidAt = new Date(item.paidAt);
        if (item.timestamp && typeof item.timestamp === 'string') item.timestamp = new Date(item.timestamp);
        return item;
      });
    } catch (e) {
      console.error('Failed to parse storage', e);
      return [];
    }
  },

  saveCollection: <T>(key: StorageKey, data: T[]) => {
    localStorage.setItem(`humaid_corner_${key}`, JSON.stringify(data));
    // Notify listeners
    if (dataService.listeners && dataService.listeners[key]) {
      dataService.listeners[key].forEach((cb: any) => cb(data));
    }
  },

  addDocument: async <T extends { id?: string }>(key: StorageKey, data: T) => {
    const collection = dataService.getRawCollection<T>(key);
    const newDoc = { ...data, id: Date.now().toString() };
    collection.unshift(newDoc); // Add to beginning (desc)
    dataService.saveCollection(key, collection);
    return newDoc.id;
  },

  updateDocument: async (key: StorageKey, id: string, data: any) => {
    const collection = dataService.getRawCollection<any>(key);
    const index = collection.findIndex(item => item.id === id);
    if (index !== -1) {
      collection[index] = { ...collection[index], ...data };
      dataService.saveCollection(key, collection);
    }
  },

  deleteDocument: async (key: StorageKey, id: string) => {
    const collection = dataService.getRawCollection<any>(key);
    const filtered = collection.filter(item => item.id !== id);
    dataService.saveCollection(key, filtered);
  },

  logActivity: async (action: 'create' | 'update' | 'delete', module: string, details: string) => {
    const log = {
      id: Date.now().toString(),
      action,
      module,
      details,
      timestamp: new Date()
    };
    const logs = dataService.getRawCollection<any>('activity_logs');
    logs.unshift(log);
    dataService.saveCollection('activity_logs', logs.slice(0, 100)); // Keep last 100 logs
  },

  // Backup & Restore
  exportData: () => {
    const keys: StorageKey[] = ['incomes', 'bazar_logs', 'bills', 'education_expenses', 'loans', 'custom_bazar_items', 'business_customers', 'business_sales', 'business_products', 'activity_logs'];
    const backup: Record<string, any> = {};
    keys.forEach(k => {
      backup[k] = dataService.getRawCollection(k);
    });
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `humaid_corner_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData: (jsonString: string) => {
    try {
      const backup = JSON.parse(jsonString);
      const keys: StorageKey[] = ['incomes', 'bazar_logs', 'bills', 'education_expenses', 'loans', 'custom_bazar_items', 'business_customers', 'business_sales', 'business_products', 'activity_logs'];
      keys.forEach(k => {
        if (backup[k]) {
          dataService.saveCollection(k, backup[k]);
        }
      });
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  // Auth & Language State
  getAuthState: () => {
    const state = localStorage.getItem('humaid_corner_auth_state');
    return state ? JSON.parse(state) : { authenticated: false, failedAttempts: 0, lastFailedTime: 0 };
  },

  saveAuthState: (state: any) => {
    localStorage.setItem('humaid_corner_auth_state', JSON.stringify({
      ...state,
      lastAuthenticated: Date.now()
    }));
  },

  getLanguage: () => localStorage.getItem('humaid_corner_lang') || 'en',
  setLanguage: (lang: string) => localStorage.setItem('humaid_corner_lang', lang),
};
