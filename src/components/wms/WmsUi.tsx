'use client';

import type { ElementType, ReactNode } from 'react';
import { Search, X } from 'lucide-react';

export function PageHeader({ title, description, icon: Icon, action }: { title: string; description: string; icon: ElementType; action?: ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div className="flex items-center gap-2"><Icon className="h-5 w-5 text-[#2490ef]"/><h1 className="text-xl font-semibold text-[#1f2937]">{title}</h1></div>
      <p className="mt-1 text-sm text-[#7c8591]">{description}</p>
    </div>{action}
  </div>;
}

export function PrimaryButton({ children, onClick, type='button', disabled=false }: { children: ReactNode; onClick?: ()=>void; type?: 'button'|'submit'; disabled?: boolean }) {
  return <button disabled={disabled} type={type} onClick={onClick} className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#2490ef] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#1674c4] disabled:cursor-not-allowed disabled:opacity-50">{children}</button>;
}
export function SecondaryButton({ children, onClick, disabled=false }: { children: ReactNode; onClick?: ()=>void; disabled?: boolean }) {
  return <button disabled={disabled} type="button" onClick={onClick} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#dcd8d1] bg-white px-3 text-sm font-medium text-[#4b5563] hover:bg-[#f7f8f9] disabled:cursor-not-allowed disabled:opacity-50">{children}</button>;
}

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon: ElementType }) {
  return <div className="rounded-lg border border-[#e5e2dc] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-[#7c8591]">{label}</p><p className="mt-2 text-2xl font-semibold text-[#1f2937]">{value}</p>{hint&&<p className="mt-1 text-xs text-[#8a929d]">{hint}</p>}</div><div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef6ff]"><Icon className="h-4 w-4 text-[#2490ef]"/></div></div></div>;
}

export function Card({ title, description, children, className='' , action}: { title?: string; description?: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return <section className={`rounded-lg border border-[#e5e2dc] bg-white shadow-sm ${className}`}>{(title||description||action)&&<div className="flex flex-col gap-3 border-b border-[#e5e2dc] px-5 py-4 md:flex-row md:items-start md:justify-between"><div className="min-w-0">{title&&<h2 className="text-base font-semibold text-[#1f2937]">{title}</h2>}{description&&<p className="mt-0.5 text-sm text-[#7c8591]">{description}</p>}</div>{action&&<div className="w-full shrink-0 md:w-auto">{action}</div>}</div>}{children}</section>;
}

export function Badge({ children, tone='blue' }: { children: ReactNode; tone?: 'blue'|'green'|'amber'|'red'|'gray'|'violet' }) {
  const map={blue:'border-[#d7e8f8] bg-[#eef6ff] text-[#1674c4]',green:'border-emerald-200 bg-emerald-50 text-emerald-700',amber:'border-amber-200 bg-amber-50 text-amber-700',red:'border-red-200 bg-red-50 text-red-700',gray:'border-gray-200 bg-gray-50 text-gray-600',violet:'border-violet-200 bg-violet-50 text-violet-700'};
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${map[tone]}`}>{children}</span>;
}

export function StatusBadge({ children, status }: { children?: ReactNode; status?: string | null }) {
  const text = String(status ?? children ?? 'Unknown');
  const value = text.toLowerCase();
  let tone: 'blue'|'green'|'amber'|'red'|'gray'|'violet' = 'gray';
  if (['completed','dispatched','active','ready','verified','resolved','approved'].some(v=>value.includes(v))) tone='green';
  else if (['pending','assigned','waiting','scheduled'].some(v=>value.includes(v))) tone='amber';
  else if (['progress','verification','counting','receiving','picking'].some(v=>value.includes(v))) tone='blue';
  else if (['error','failed','exception','discrepancy','blocked','rejected'].some(v=>value.includes(v))) tone='red';
  else if (['hold','quarantine'].some(v=>value.includes(v))) tone='violet';
  return <Badge tone={tone}>{text}</Badge>;
}

export function Progress({ value, label, right }: { value:number; label?:string; right?:string }) {
  return <div>{(label||right)&&<div className="mb-1.5 flex items-center justify-between text-xs"><span className="text-[#4b5563]">{label}</span><span className="text-[#7c8591]">{right??`${value}%`}</span></div>}<div className="h-2 overflow-hidden rounded-full bg-[#edf0f2]"><div className="h-full rounded-full bg-[#2490ef]" style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div></div>;
}

export function Input({ placeholder, value, onChange, type='text' }: { placeholder?:string; value?:string; onChange?:(v:string)=>void; type?:string }) {
  return <input type={type} value={value ?? ''} onChange={e=>onChange?.(e.target.value)} placeholder={placeholder} className="h-9 w-full rounded-md border border-[#dcd8d1] bg-white px-3 text-sm text-[#1f2937] outline-none placeholder:text-[#9aa1aa] focus:border-[#2490ef] focus:ring-2 focus:ring-[#2490ef]/10"/>;
}

export function SearchInput({ value, onChange, placeholder='Search...' }: { value:string; onChange:(v:string)=>void; placeholder?:string }) {
  return <div className="relative w-full">
    <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#9aa1aa]"/>
    <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="h-9 w-full rounded-md border border-[#dcd8d1] bg-white pl-10 pr-3 text-sm text-[#1f2937] outline-none placeholder:text-[#9aa1aa] focus:border-[#2490ef] focus:ring-2 focus:ring-[#2490ef]/10"/>
  </div>;
}

export function Select({ value, onChange, children }: { value?:string; onChange?:(v:string)=>void; children:ReactNode }) {
  return <select value={value} onChange={e=>onChange?.(e.target.value)} className="h-9 w-full rounded-md border border-[#dcd8d1] bg-white px-3 text-sm text-[#4b5563] outline-none focus:border-[#2490ef] focus:ring-2 focus:ring-[#2490ef]/10">{children}</select>;
}

export function Field({ label, children }: { label:string; children:ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-[#374151]">{label}</span>{children}</label>;
}

export function Modal({ open, title, description, onClose, children, footer }: { open:boolean; title:string; description?:string; onClose:()=>void; children:ReactNode; footer?:ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onMouseDown={onClose}>
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#e5e2dc] bg-white shadow-xl" onMouseDown={e=>e.stopPropagation()}>
      <div className="flex items-start justify-between border-b border-[#e5e2dc] px-5 py-4"><div><h3 className="text-base font-semibold text-[#1f2937]">{title}</h3>{description&&<p className="mt-1 text-sm text-[#7c8591]">{description}</p>}</div><button onClick={onClose} className="rounded-md p-1.5 text-[#7c8591] hover:bg-[#eef3f5]"><X className="h-4 w-4"/></button></div>
      <div className="p-5">{children}</div>
      {footer&&<div className="flex justify-end gap-2 border-t border-[#e5e2dc] px-5 py-4">{footer}</div>}
    </div>
  </div>;
}

export function Toast({ message, onClose }: { message:string; onClose:()=>void }) {
  return <div className="fixed bottom-5 right-5 z-[110] flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm text-[#1f2937] shadow-lg"><span className="h-2 w-2 rounded-full bg-emerald-500"/><span>{message}</span><button onClick={onClose} className="ml-2 text-[#8a929d]">×</button></div>;
}

export function Table({ headers, rows }: { headers:string[]; rows:ReactNode[][] }) {
  return <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-[#fbfaf8]"><tr>{headers.map(h=><th key={h} className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#7c8591]">{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i} className="border-t border-[#f0eee9] hover:bg-[#fcfbfa]">{r.map((c,j)=><td key={j} className="whitespace-nowrap px-5 py-3.5 text-sm text-[#4b5563]">{c}</td>)}</tr>)}</tbody></table></div>;
}

export function MiniBars({ values }: { values:number[] }) {
  return <div className="flex h-48 items-end gap-2 rounded-lg bg-[#fbfaf8] p-4">{values.map((v,i)=><div key={i} className="flex-1 rounded-t bg-[#2490ef]/80" style={{height:`${v}%`}}/>)}</div>;
}

export function Toggle({ checked, onChange }: { checked:boolean; onChange:(v:boolean)=>void }) {
  return <button type="button" onClick={()=>onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked?'bg-[#2490ef]':'bg-[#d8dde3]'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked?'left-[22px]':'left-0.5'}`}/></button>;
}
