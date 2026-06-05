import type { Receipt } from './types';
import { getDefaultIsTaxable, getDefaultTaxRate } from './utils/tax';

const STORAGE_VERSION = 'v1';
const RECEIPTS_KEY_CURRENT = `zerocostreceipt:db:${STORAGE_VERSION}`;
const API_KEY_KEY_CURRENT = `zerocostreceipt:apikey:${STORAGE_VERSION}`;

// Legacy keys used before versioned storage was introduced.
const RECEIPTS_KEY_LEGACY = 'zerocostreceipt_db';
const API_KEY_KEY_LEGACY = 'zerocostreceipt_apikey';

const storageCache = new Map<string, string | null>();

function safeGetItem(key: string): string | null {
  if (storageCache.has(key)) {
    return storageCache.get(key) ?? null;
  }

  try {
    const value = localStorage.getItem(key);
    storageCache.set(key, value);
    return value;
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
    storageCache.set(key, value);
  } catch {
    // localStorage can fail in private mode or when quota is exceeded.
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key);
    storageCache.delete(key);
  } catch {
    // Ignore storage errors to keep UI resilient.
  }
}

function parseReceipts(raw: string | null): Receipt[] | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Receipt[]) : null;
  } catch {
    return null;
  }
}

export function loadReceipts(): Receipt[] | null {
  const current = parseReceipts(safeGetItem(RECEIPTS_KEY_CURRENT));
  if (current) {
    return migrateReceipts(current);
  }

  const legacy = parseReceipts(safeGetItem(RECEIPTS_KEY_LEGACY));
  if (legacy) {
    const migrated = migrateReceipts(legacy);
    saveReceipts(migrated);
    safeRemoveItem(RECEIPTS_KEY_LEGACY);
    return migrated;
  }

  return null;
}

export function saveReceipts(receipts: Receipt[]): void {
  safeSetItem(RECEIPTS_KEY_CURRENT, JSON.stringify(receipts));
}

export function loadCustomApiKey(): string {
  const current = safeGetItem(API_KEY_KEY_CURRENT);
  if (current) {
    return current;
  }

  const legacy = safeGetItem(API_KEY_KEY_LEGACY);
  if (legacy) {
    saveCustomApiKey(legacy);
    safeRemoveItem(API_KEY_KEY_LEGACY);
    return legacy;
  }

  return '';
}

export function saveCustomApiKey(key: string): void {
  safeSetItem(API_KEY_KEY_CURRENT, key);
}

export function clearCustomApiKey(): void {
  safeRemoveItem(API_KEY_KEY_CURRENT);
  safeRemoveItem(API_KEY_KEY_LEGACY);
}

function migrateReceipts(receipts: Receipt[]): Receipt[] {
  return receipts.map((r) => ({
    ...r,
    isTaxable: r.isTaxable ?? getDefaultIsTaxable(r.categoria_sugerida),
    taxRate: r.taxRate ?? getDefaultTaxRate(r.categoria_sugerida),
  }));
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (!event.key) {
      storageCache.clear();
      return;
    }

    storageCache.delete(event.key);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      storageCache.clear();
    }
  });
}
