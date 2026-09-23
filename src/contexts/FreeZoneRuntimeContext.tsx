'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type FzWarehouse = { id: string; code: string; name: string; zone: string; type: string; customsCode: string; status: string; locations: number; address?: string; officer?: string };
export type FzInbound = { id: string; type: 'FREE_ZONE_INBOUND'; ref: string; goods: string; sku: string; hsCode?: string; qty: number; uom: string; origin: string; exportCountry?: string; carrier: string; bol: string; flight?: string; warehouse: string; location: string; arrival: string; expectedClearance?: string; docRef: string; customsRef?: string; status: string; estimatedValue?: number; netWeight?: number; createdAt: string };
export type FzTemporaryEntry = { id: string; type: string; ref: string; fields: Record<string, string>; createdAt: string };
export type FzAuditEvent = { id: string; action: string; ref: string; user: string; warehouse: string; details: string; type: string; createdAt: string };
type Runtime = { warehouses: FzWarehouse[]; inbounds: FzInbound[]; entries: FzTemporaryEntry[]; auditEvents: FzAuditEvent[]; customsCounts: Record<string, number>; setCustomsCount: (key: string, qty: number) => void; addEntry: (type: string, fields: Record<string, string>) => FzTemporaryEntry; updateEntry: (id: string, fields: Record<string, string>) => void; deleteEntry: (id: string) => void; addWarehouse: (row: Omit<FzWarehouse, 'id'>) => boolean; updateWarehouse: (id: string, patch: Partial<FzWarehouse>) => void; deleteWarehouse: (id: string) => void; addInbound: (row: Omit<FzInbound, 'id' | 'type' | 'createdAt'>) => boolean; updateInbound: (id: string, patch: Partial<FzInbound>) => void; deleteInbound: (id: string) => void };
const Context = createContext<Runtime | null>(null);
const STORAGE_KEY = 'orus.free-zone.runtime.v1';
const initialWarehouses: FzWarehouse[] = [
  { id: 'sample-wh-1', code: 'JAFZA-01', name: 'JAFZA Main Store', zone: 'Jebel Ali FZ', type: 'Free Zone', customsCode: 'JAF-001', status: 'ACTIVE', locations: 24 },
  { id: 'sample-wh-2', code: 'DAFZA-01', name: 'DAFZA Bonded Bay', zone: 'Dubai Airport FZ', type: 'Bonded', customsCode: 'DAF-002', status: 'ACTIVE', locations: 12 },
  { id: 'sample-wh-3', code: 'DMCC-01', name: 'DMCC Secure Store', zone: 'DMCC', type: 'Free Zone', customsCode: 'DMC-003', status: 'ACTIVE', locations: 8 },
];
export function FreeZoneRuntimeProvider({ children }: { children: React.ReactNode }) {
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [inbounds, setInbounds] = useState<FzInbound[]>([]);
  const [entries, setEntries] = useState<FzTemporaryEntry[]>([]);
  const [auditEvents, setAuditEvents] = useState<FzAuditEvent[]>([]);
  const [customsCounts, setCustomsCounts] = useState<Record<string, number>>({});
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Pick<Runtime, 'warehouses' | 'inbounds' | 'entries' | 'auditEvents' | 'customsCounts'>>;
        if (Array.isArray(parsed.warehouses)) setWarehouses(parsed.warehouses);
        if (Array.isArray(parsed.inbounds)) setInbounds(parsed.inbounds);
        if (Array.isArray(parsed.entries)) setEntries(parsed.entries);
        if (Array.isArray(parsed.auditEvents)) setAuditEvents(parsed.auditEvents);
        if (parsed.customsCounts && typeof parsed.customsCounts === 'object') setCustomsCounts(parsed.customsCounts as Record<string, number>);
      }
    } catch (error) {
      console.error('Unable to load Free Zone browser data.', error);
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ warehouses, inbounds, entries, auditEvents, customsCounts }));
    } catch (error) {
      console.error('Unable to save Free Zone browser data.', error);
      window.dispatchEvent(new CustomEvent('free-zone-storage-error'));
    }
  }, [warehouses, inbounds, entries, auditEvents, customsCounts, storageReady]);

  const logAudit = (event: Omit<FzAuditEvent, 'id' | 'createdAt' | 'user'>) => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setAuditEvents(prev => [{ ...event, id: `fz-audit-${id}`, user: 'Current User', createdAt: new Date().toISOString() }, ...prev]);
  };

  const value: Runtime = {
    warehouses, inbounds, entries, auditEvents, customsCounts,
    setCustomsCount: (key, qty) => setCustomsCounts(prev => ({ ...prev, [key]: qty })),
    addEntry: (type, fields) => {
      const prefix: Record<string, string> = { outbound: 'FZ-OUT', transfer: 'FZ-TR', mainland: 'FZ-ML', reexport: 'FZ-RE', customsReference: 'FZ-REF', document: 'FZ-DOC', dutyClassification: 'FZ-DUTY' };
      const refPrefix = prefix[type] || 'FZ-TMP';
      const firstNumber: Record<string, number> = { outbound: 32, transfer: 20, mainland: 23, reexport: 9 };
      let next = firstNumber[type] || 1;
      while (entries.some(entry => entry.type === type && entry.ref === `${refPrefix}-${String(next).padStart(4, '0')}`)) next += 1;
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const entry = { id: `temp-fz-${id}`, type, ref: `${refPrefix}-${String(next).padStart(4, '0')}`, fields, createdAt: new Date().toISOString() };
      setEntries(prev => [...prev, entry]);
      const typeLabel: Record<string, string> = { outbound: 'Outbound', transfer: 'FZ Transfer', mainland: 'FZ to Mainland', reexport: 'Re-Export', customsReference: 'Customs Reference', document: 'Document Uploaded', dutyClassification: 'Duty Classification', reconciliation: 'Reconciliation Completed' };
      logAudit({ action: `${typeLabel[type] || type} Recorded`, ref: entry.ref, type: type === 'reconciliation' ? 'RECONCILIATION' : type.toUpperCase(), warehouse: fields.warehouse || fields.source || '—', details: fields.goods || fields.name || fields.description || `${fields.checked || ''} checked · ${fields.matched || ''} matched · ${fields.variances || ''} variances` });
      return entry;
    },
    updateEntry: (id, fields) => {
      const current = entries.find(entry => entry.id === id);
      if (!current) return;
      const changes = Object.entries(fields).filter(([key, value]) => current.fields[key] !== value);
      if (changes.length) logAudit({ action: fields.status ? 'Status Updated' : 'Workflow Updated', ref: current.ref, type: fields.status ? 'STATUS_CHANGE' : 'WORKFLOW', warehouse: current.fields.warehouse || current.fields.source || current.fields.destination || '—', details: changes.map(([key, value]) => `${key}: ${current.fields[key] || '—'} → ${value}`).join(' · ') });
      setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, fields: { ...entry.fields, ...fields } } : entry));
    },
    deleteEntry: id => {
      const current = entries.find(entry => entry.id === id);
      if (current) logAudit({ action: 'Free Zone Record Deleted', ref: current.ref, type: 'RECORD_CHANGE', warehouse: current.fields.warehouse || current.fields.source || '—', details: current.fields.goods || current.fields.name || current.fields.description || current.type });
      setEntries(prev => prev.filter(entry => entry.id !== id));
    },
    addWarehouse: row => {
      if (warehouses.some(w => w.code.toLowerCase() === row.code.trim().toLowerCase())) return false;
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setWarehouses(prev => [...prev, { ...row, id: `temp-fz-wh-${id}` }]);
      logAudit({ action: 'Warehouse Added', ref: row.code, type: 'WAREHOUSE', warehouse: row.code, details: `${row.name} · ${row.zone} · ${row.locations} locations` });
      return true;
    },
    updateWarehouse: (id, patch) => {
      const current = warehouses.find(row => row.id === id);
      if (current) logAudit({ action: 'Warehouse Updated', ref: current.code, type: 'WAREHOUSE', warehouse: current.code, details: patch.name || current.name });
      setWarehouses(prev => prev.map(row => row.id === id ? { ...row, ...patch } : row));
    },
    deleteWarehouse: id => {
      const current = warehouses.find(row => row.id === id);
      if (current) logAudit({ action: 'Warehouse Deleted', ref: current.code, type: 'WAREHOUSE', warehouse: current.code, details: current.name });
      setWarehouses(prev => prev.filter(row => row.id !== id));
    },
    addInbound: row => {
      if (inbounds.some(i => i.ref.toLowerCase() === row.ref.trim().toLowerCase())) return false;
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const created = { ...row, id: `temp-fz-${id}`, type: 'FREE_ZONE_INBOUND' as const, createdAt: new Date().toISOString() };
      setInbounds(prev => [...prev, created]);
      logAudit({ action: 'Inbound Recorded', ref: created.ref, type: 'INBOUND', warehouse: created.warehouse, details: `${created.goods} · ${created.qty} ${created.uom} · ${created.docRef}` });
      return true;
    },
    updateInbound: (id, patch) => {
      const current = inbounds.find(row => row.id === id);
      if (current) logAudit({ action: 'Inbound Updated', ref: current.ref, type: 'INBOUND', warehouse: current.warehouse, details: patch.status && patch.status !== current.status ? `Status: ${current.status} → ${patch.status}` : current.goods });
      setInbounds(prev => prev.map(row => row.id === id ? { ...row, ...patch } : row));
    },
    deleteInbound: id => {
      const current = inbounds.find(row => row.id === id);
      if (current) logAudit({ action: 'Inbound Deleted', ref: current.ref, type: 'INBOUND', warehouse: current.warehouse, details: `${current.goods} · ${current.qty} ${current.uom}` });
      setInbounds(prev => prev.filter(row => row.id !== id));
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useFreeZoneRuntime() { const value = useContext(Context); if (!value) throw new Error('FreeZoneRuntimeProvider is missing'); return value; }
