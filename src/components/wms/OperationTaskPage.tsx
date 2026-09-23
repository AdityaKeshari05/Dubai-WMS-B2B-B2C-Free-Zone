'use client';

import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { Eye, Filter, Plus, Search } from 'lucide-react';
import { Card, Field, Input, Modal, PageHeader, PrimaryButton, SecondaryButton, Select, StatCard, StatusBadge, Toast } from './WmsUi';

export type OperationRow = {
  id: string;
  primary: string;
  secondary: string;
  warehouse: string;
  qty: string;
  status: string;
  extra?: Record<string, string>;
};

type FormField = { key:string; label:string; placeholder?:string; type?:'text'|'number'|'select'; options?:string[] };

export function OperationTaskPage({
  title, description, icon, initialRows, stats, primaryLabel='Reference', secondaryLabel='Details', qtyLabel='Qty',
  actionLabel, formTitle, formFields, makeRow, nextStatus, nextActionLabel='Start Task', completeStatus='Completed', completeActionLabel='Complete',
}: {
  title:string; description:string; icon:ElementType; initialRows:OperationRow[];
  stats:{label:string;value:string;hint?:string;icon:ElementType}[];
  primaryLabel?:string; secondaryLabel?:string; qtyLabel?:string;
  actionLabel:string; formTitle:string; formFields:FormField[];
  makeRow:(values:Record<string,string>, sequence:number)=>OperationRow;
  nextStatus?:string; nextActionLabel?:string; completeStatus?:string; completeActionLabel?:string;
}) {
  const [rows,setRows]=useState(initialRows);
  const [search,setSearch]=useState('');
  const [status,setStatus]=useState('All');
  const [createOpen,setCreateOpen]=useState(false);
  const [selected,setSelected]=useState<OperationRow|null>(null);
  const [values,setValues]=useState<Record<string,string>>({});
  const [toast,setToast]=useState('');

  const statuses=Array.from(new Set(rows.map(r=>r.status)));
  const filtered=useMemo(()=>rows.filter(r=>{
    const q=search.trim().toLowerCase();
    const match=!q || [r.id,r.primary,r.secondary,r.warehouse,r.qty,r.status,...Object.values(r.extra||{})].some(v=>String(v).toLowerCase().includes(q));
    return match && (status==='All'||r.status===status);
  }),[rows,search,status]);

  const setField=(k:string,v:string)=>setValues(x=>({...x,[k]:v}));
  const requiredOk=formFields.every(f=>(values[f.key]||'').trim());
  const create=()=>{
    if(!requiredOk)return;
    const row=makeRow(values,rows.length+1);
    setRows(x=>[row,...x]); setValues({}); setCreateOpen(false); setToast(`${row.id} created successfully.`);
  };
  const updateSelected=(newStatus:string)=>{
    if(!selected)return;
    setRows(rs=>rs.map(r=>r.id===selected.id?{...r,status:newStatus}:r));
    setSelected(s=>s?{...s,status:newStatus}:s); setToast(`${selected.id} moved to ${newStatus}.`);
  };

  return <div className="space-y-5">
    <PageHeader title={title} description={description} icon={icon} action={<PrimaryButton onClick={()=>setCreateOpen(true)}><Plus className="h-4 w-4"/>{actionLabel}</PrimaryButton>}/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(s=><StatCard key={s.label}{...s}/>)}</div>
    <Card>
      <div className="flex flex-col gap-3 border-b border-[#e5e2dc] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa1aa]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="h-9 w-full rounded-md border border-[#dcd8d1] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#2490ef] focus:ring-2 focus:ring-[#2490ef]/10"/></div>
        <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-[#7c8591]"/><Select value={status} onChange={setStatus}><option>All</option>{statuses.map(s=><option key={s}>{s}</option>)}</Select></div>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-[#fbfaf8]"><tr>{['ID',primaryLabel,secondaryLabel,'Warehouse',qtyLabel,'Status','Action'].map(h=><th key={h} className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#7c8591]">{h}</th>)}</tr></thead><tbody>
        {filtered.map(r=><tr key={r.id} className="border-t border-[#f0eee9] hover:bg-[#fcfbfa]"><td className="px-5 py-3.5 text-sm font-medium text-[#1674c4]">{r.id}</td><td className="px-5 py-3.5 text-sm text-[#1f2937]">{r.primary}</td><td className="px-5 py-3.5 text-sm text-[#4b5563]">{r.secondary}</td><td className="px-5 py-3.5 text-sm text-[#4b5563]">{r.warehouse}</td><td className="px-5 py-3.5 text-sm text-[#4b5563]">{r.qty}</td><td className="px-5 py-3.5"><StatusBadge status={r.status}/></td><td className="px-5 py-3.5"><button onClick={()=>setSelected(r)} className="inline-flex items-center gap-1 rounded-md border border-[#dcd8d1] px-2.5 py-1.5 text-xs font-medium text-[#4b5563] hover:bg-[#f7f8f9]"><Eye className="h-3.5 w-3.5"/>View</button></td></tr>)}
        {filtered.length===0&&<tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-[#8a929d]">No records match your search/filter.</td></tr>}
      </tbody></table></div>
      <div className="border-t border-[#e5e2dc] px-5 py-3 text-xs text-[#7c8591]">Showing {filtered.length} of {rows.length} records</div>
    </Card>

    <Modal open={createOpen} onClose={()=>setCreateOpen(false)} title={formTitle} description={`Frontend-only demo: creates a local ${title.toLowerCase()} record.`} footer={<><SecondaryButton onClick={()=>setCreateOpen(false)}>Cancel</SecondaryButton><PrimaryButton disabled={!requiredOk} onClick={create}>Create</PrimaryButton></>}>
      <div className="grid gap-4 sm:grid-cols-2">{formFields.map(f=><Field key={f.key} label={f.label}>{f.type==='select'?<Select value={values[f.key]||''} onChange={v=>setField(f.key,v)}><option value="">Select...</option>{f.options?.map(o=><option key={o}>{o}</option>)}</Select>:<Input type={f.type==='number'?'number':'text'} value={values[f.key]||''} onChange={v=>setField(f.key,v)} placeholder={f.placeholder}/>}</Field>)}</div>
    </Modal>

    <Modal open={!!selected} onClose={()=>setSelected(null)} title={selected?.id||'Task details'} description={`${title} task details and mock workflow actions.`} footer={selected?<>{nextStatus && selected.status!==nextStatus && selected.status!==completeStatus && <SecondaryButton onClick={()=>updateSelected(nextStatus)}>{nextActionLabel}</SecondaryButton>}{selected.status!==completeStatus&&<PrimaryButton onClick={()=>updateSelected(completeStatus)}>{completeActionLabel}</PrimaryButton>}</>:undefined}>
      {selected&&<div className="grid gap-4 sm:grid-cols-2"><Info label={primaryLabel} value={selected.primary}/><Info label={secondaryLabel} value={selected.secondary}/><Info label="Warehouse" value={selected.warehouse}/><Info label={qtyLabel} value={selected.qty}/><div><p className="text-xs text-[#8a929d]">Status</p><div className="mt-1"><StatusBadge status={selected.status}/></div></div>{Object.entries(selected.extra||{}).map(([k,v])=><Info key={k} label={k} value={v}/>)}</div>}
    </Modal>
    {toast&&<Toast message={toast} onClose={()=>setToast('')}/>} 
  </div>;
}

function Info({label,value}:{label:string;value:string}){return <div className="rounded-md border border-[#ece9e4] bg-[#fbfaf8] p-3"><p className="text-xs text-[#8a929d]">{label}</p><p className="mt-1 text-sm font-medium text-[#1f2937]">{value}</p></div>}
