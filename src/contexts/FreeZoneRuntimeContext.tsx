'use client';

import { createContext, useContext, useState } from 'react';

export type FzWarehouse = { id: string; code: string; name: string; zone: string; type: string; customsCode: string; status: string; locations: number };
export type FzInbound = { id: string; type: 'FREE_ZONE_INBOUND'; ref: string; goods: string; sku: string; hsCode?: string; qty: number; uom: string; origin: string; carrier: string; bol: string; warehouse: string; location: string; arrival: string; docRef: string; status: string; createdAt: string };
export type FzTemporaryEntry = { id: string; type: string; ref: string; fields: Record<string, string>; createdAt: string };
type Runtime = { warehouses: FzWarehouse[]; inbounds: FzInbound[]; entries: FzTemporaryEntry[]; addEntry: (type: string, fields: Record<string, string>) => FzTemporaryEntry; deleteEntry: (id: string) => void; addWarehouse: (row: Omit<FzWarehouse, 'id'>) => boolean; addInbound: (row: Omit<FzInbound, 'id' | 'type' | 'createdAt'>) => boolean; updateInbound: (id: string, patch: Partial<FzInbound>) => void; deleteInbound: (id: string) => void };
const Context = createContext<Runtime | null>(null);
const initialWarehouses: FzWarehouse[] = [
  { id: 'sample-wh-1', code: 'JAFZA-01', name: 'JAFZA Main Store', zone: 'Jebel Ali FZ', type: 'Free Zone', customsCode: 'JAF-001', status: 'ACTIVE', locations: 24 },
  { id: 'sample-wh-2', code: 'DAFZA-01', name: 'DAFZA Bonded Bay', zone: 'Dubai Airport FZ', type: 'Bonded', customsCode: 'DAF-002', status: 'ACTIVE', locations: 12 },
  { id: 'sample-wh-3', code: 'DMCC-01', name: 'DMCC Secure Store', zone: 'DMCC', type: 'Free Zone', customsCode: 'DMC-003', status: 'ACTIVE', locations: 8 },
];
export function FreeZoneRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [inbounds, setInbounds] = useState<FzInbound[]>([]);
  const [entries, setEntries] = useState<FzTemporaryEntry[]>([]);
  const value: Runtime = {
    warehouses, inbounds, entries,
    addEntry: (type, fields) => {
      const prefix: Record<string, string> = { outbound: 'FZ-OUT', transfer: 'FZ-TR', mainland: 'FZ-ML', reexport: 'FZ-RE', customsReference: 'FZ-REF', document: 'FZ-DOC', dutyClassification: 'FZ-DUTY' };
      const refPrefix = prefix[type] || 'FZ-TMP';
      const firstNumber: Record<string, number> = { outbound: 32, transfer: 20, mainland: 23, reexport: 9 };
      let next = firstNumber[type] || 1;
      while (entries.some(entry => entry.type === type && entry.ref === `${refPrefix}-${String(next).padStart(4, '0')}`)) next += 1;
      const entry = { id: `temp-fz-${crypto.randomUUID()}`, type, ref: `${refPrefix}-${String(next).padStart(4, '0')}`, fields, createdAt: new Date().toISOString() };
      setEntries(prev => [...prev, entry]); return entry;
    },
    deleteEntry: id => setEntries(prev => prev.filter(entry => entry.id !== id)),
    addWarehouse: row => {
      if (warehouses.some(w => w.code.toLowerCase() === row.code.trim().toLowerCase())) return false;
      setWarehouses(prev => [...prev, { ...row, id: `temp-fz-wh-${crypto.randomUUID()}` }]); return true;
    },
    addInbound: row => {
      if (inbounds.some(i => i.ref.toLowerCase() === row.ref.trim().toLowerCase())) return false;
      setInbounds(prev => [...prev, { ...row, id: `temp-fz-${crypto.randomUUID()}`, type: 'FREE_ZONE_INBOUND', createdAt: new Date().toISOString() }]); return true;
    },
    updateInbound: (id, patch) => setInbounds(prev => prev.map(row => row.id === id ? { ...row, ...patch } : row)),
    deleteInbound: id => setInbounds(prev => prev.filter(row => row.id !== id)),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useFreeZoneRuntime() { const value = useContext(Context); if (!value) throw new Error('FreeZoneRuntimeProvider is missing'); return value; }
