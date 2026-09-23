'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { wmsDb, type WmsDatabase } from './db';

/** Hydrates the mock store from localStorage once on mount. Call this from
 * the top of the WMS layout, mirroring how the rest of the app boots. */
export function useWmsDbHydration() {
  useEffect(() => {
    wmsDb.hydrateFromStorage();
  }, []);
}

export function useWmsDb(): WmsDatabase {
  return useSyncExternalStore(wmsDb.subscribe, wmsDb.getSnapshot, wmsDb.getSnapshot);
}

export function useWmsDbSelector<T>(selector: (state: WmsDatabase) => T): T {
  // useSyncExternalStore requires getSnapshot to return a referentially
  // stable value between calls when nothing changed. wmsDb.getSnapshot()
  // satisfies that (same object until the next mutate()); running the
  // selector *inside* getSnapshot would not, since filter()/map() allocate a
  // new array every call and React would see that as a perpetual change.
  const state = useSyncExternalStore(wmsDb.subscribe, wmsDb.getSnapshot, wmsDb.getSnapshot);
  return selector(state);
}
