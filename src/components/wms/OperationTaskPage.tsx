'use client';

import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { Eye, Filter, Plus, Search, Inbox } from 'lucide-react';
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s, i) => (
        <StatCard
          key={s.label}
          {...s}
          iconColor={i === 0 ? 'text-blue-600' : i === 1 ? 'text-purple-600' : i === 2 ? 'text-green-600' : 'text-orange-600'}
          iconBg={i === 0 ? 'bg-blue-50' : i === 1 ? 'bg-purple-50' : i === 2 ? 'bg-green-50' : 'bg-orange-50'}
        />
      ))}
    </div>
    <div className="mb-4 flex flex-wrap gap-2">
      <div className="w-full sm:w-72 relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa1aa]"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="h-9 w-full rounded-md border border-[#dcd8d1] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#2490ef] focus:ring-2 focus:ring-[#2490ef]/10"/></div>
      <div className="w-full sm:w-40 relative"><Select value={status} onChange={setStatus}><option>All</option>{statuses.map(s=><option key={s}>{s}</option>)}</Select></div>
    </div>
    <div className="overflow-hidden rounded-md border border-[#e5e2dc] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-[#fbfaf8]"><tr>{['ID',primaryLabel,secondaryLabel,'Warehouse',qtyLabel,'Status','Action'].map(h=><th key={h} className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#7c8591]">{h}</th>)}</tr></thead><tbody>
        {filtered.map(r=><tr key={r.id} onClick={()=>setSelected(r)} className="border-t border-[#f0eee9] hover:bg-[#fcfbfa] cursor-pointer"><td className="px-5 py-3.5 text-sm font-medium text-[#1674c4]">{r.id}</td><td className="px-5 py-3.5 text-sm text-[#1f2937]">{r.primary}</td><td className="px-5 py-3.5 text-sm text-[#4b5563]">{r.secondary}</td><td className="px-5 py-3.5 text-sm text-[#4b5563]">{r.warehouse}</td><td className="px-5 py-3.5 text-sm text-[#4b5563]">{r.qty}</td><td className="px-5 py-3.5"><StatusBadge status={r.status}/></td><td className="px-5 py-3.5"><button onClick={(e)=>{e.stopPropagation();setSelected(r);}} title="View Details" className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#7c8591] transition-colors hover:bg-[#f3f4f6] hover:text-[#1f2937]"><Eye className="h-4 w-4"/></button></td></tr>)}
        {filtered.length===0&&(
          <tr>
            <td colSpan={7}>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f8faf9]">
                  <Inbox className="h-6 w-6 text-[#9aa1aa]" />
                </div>
                <h3 className="text-sm font-medium text-[#1f2937]">No records found</h3>
                <p className="mt-1 text-sm text-[#7c8591]">Try adjusting your search or filter.</p>
              </div>
            </td>
          </tr>
        )}
      </tbody></table></div>
      <div className="border-t border-[#e5e2dc] px-5 py-3 text-xs text-[#7c8591]">Showing {filtered.length} of {rows.length} records</div>
    </div>

    <Modal open={createOpen} onClose={()=>setCreateOpen(false)} title={formTitle} description={`Creates a new ${title.toLowerCase()} record.`} footer={<><SecondaryButton onClick={()=>setCreateOpen(false)}>Cancel</SecondaryButton><PrimaryButton disabled={!requiredOk} onClick={create}>Create</PrimaryButton></>}>
      <div className="grid gap-4 sm:grid-cols-2">{formFields.map(f=><Field key={f.key} label={f.label}>{f.type==='select'?<Select value={values[f.key]||''} onChange={v=>setField(f.key,v)}><option value="">Select...</option>{f.options?.map(o=><option key={o}>{o}</option>)}</Select>:<Input type={f.type==='number'?'number':'text'} value={values[f.key]||''} onChange={v=>setField(f.key,v)} placeholder={f.placeholder}/>}</Field>)}</div>
    </Modal>

    <Modal open={!!selected} onClose={()=>setSelected(null)} title={selected?.id||'Task details'} description={`${title} task details and workflow actions.`} footer={selected?<>{nextStatus && selected.status!==nextStatus && selected.status!==completeStatus && <SecondaryButton onClick={()=>updateSelected(nextStatus)}>{nextActionLabel}</SecondaryButton>}{selected.status!==completeStatus&&<PrimaryButton onClick={()=>updateSelected(completeStatus)}>{completeActionLabel}</PrimaryButton>}</>:undefined}>
      {selected&&<div className="grid gap-4 sm:grid-cols-2"><Info label={primaryLabel} value={selected.primary}/><Info label={secondaryLabel} value={selected.secondary}/><Info label="Warehouse" value={selected.warehouse}/><Info label={qtyLabel} value={selected.qty}/><div><p className="text-xs text-[#8a929d]">Status</p><div className="mt-1"><StatusBadge status={selected.status}/></div></div>{Object.entries(selected.extra||{}).map(([k,v])=><Info key={k} label={k} value={v}/>)}</div>}
    </Modal>
    {toast&&<Toast message={toast} onClose={()=>setToast('')}/>} 
  </div>;
}

function Info({label,value}:{label:string;value:string}){return <div className="rounded-md border border-[#ece9e4] bg-[#fbfaf8] p-3"><p className="text-xs text-[#8a929d]">{label}</p><p className="mt-1 text-sm font-medium text-[#1f2937]">{value}</p></div>}
