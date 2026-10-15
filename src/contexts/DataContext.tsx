import React, { createContext, useContext, useSyncExternalStore } from 'react';
import type { DemoDatabase } from '../types/domain';
import { dataStore } from '../services';

const DataContext = createContext<DemoDatabase | null>(null);

export function DataProvider({ children }: {children: React.ReactNode;}) {
  const db = useSyncExternalStore(dataStore.subscribe, dataStore.getSnapshot);
  return <DataContext.Provider value={db}>{children}</DataContext.Provider>;
}

/** Read the current data snapshot. Writes go through `service` from services/index. */
export function useDb(): DemoDatabase {
  const db = useContext(DataContext);
  if (!db) throw new Error('useDb must be used inside DataProvider');
  return db;
}