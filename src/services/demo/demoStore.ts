import type { DemoDatabase } from '../../types/domain';
import { buildSeed, DB_VERSION } from '../../data/seed';

const STORAGE_KEY = 'jolliflow.demo.db';

const REQUIRED_ARRAYS: Array<keyof DemoDatabase> = [
'events', 'collaborators', 'tasks', 'guests', 'vendors', 'bookings', 'budgetCategories', 'budgetItems',
'transactions', 'giftItems', 'ticketTiers', 'ticketOrders', 'tickets', 'memories', 'activities', 'announcements'];


type Listener = () => void;

function isValidDatabase(value: unknown): value is DemoDatabase {
  if (!value || typeof value !== 'object') return false;
  const db = value as Record<string, unknown>;
  return db.version === DB_VERSION && REQUIRED_ARRAYS.every((key) => Array.isArray(db[key]));
}

function persist(db: DemoDatabase) {
  try {
    // Local object-URL memories cannot survive a refresh, so they are never persisted.
    const toSave: DemoDatabase = { ...db, memories: db.memories.filter((m) => !m.localOnly) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn('[JolliFlow demo] Could not persist demo data', err);
  }
}

let recoveredFromCorruption = false;

function load(): DemoDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidDatabase(parsed)) return parsed;
      recoveredFromCorruption = true;
      console.warn('[JolliFlow demo] Stored data was outdated or invalid. Reseeding.');
    }
  } catch (err) {
    recoveredFromCorruption = true;
    console.warn('[JolliFlow demo] Stored data was corrupted. Reseeding.', err);
  }
  const fresh = buildSeed();
  persist(fresh);
  return fresh;
}

let state: DemoDatabase = load();
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

if (typeof window !== 'undefined') {
  // Keep multiple tabs (e.g. planner + public page) in sync.
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    const localPreviews = state.memories.filter((m) => m.localOnly);
    const next = load();
    state = { ...next, memories: [...localPreviews, ...next.memories] };
    emit();
  });
}

export const demoStore = {
  getSnapshot(): DemoDatabase {
    return state;
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Apply a mutation to a copy of the database, persist and notify. */
  update<T>(mutate: (draft: DemoDatabase) => T): T {
    const draft = structuredClone(state);
    const result = mutate(draft);
    state = draft;
    persist(state);
    emit();
    return result;
  },
  reset() {
    state.memories.filter((m) => m.localOnly).forEach((m) => URL.revokeObjectURL(m.url));
    state = buildSeed();
    persist(state);
    emit();
  },
  wasRecovered(): boolean {
    return recoveredFromCorruption;
  }
};