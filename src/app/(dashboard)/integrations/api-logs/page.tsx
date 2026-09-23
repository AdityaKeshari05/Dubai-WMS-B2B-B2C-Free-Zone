'use client';

import { useMemo, useState } from 'react';
import { Activity, Eye } from 'lucide-react';
import {
  Badge, Card, Modal, PageHeader, SearchInput, Select, StatCard, Table,
} from '@/components/wms/WmsUi';

type Log={id:string;integration:string;method:'GET'|'POST'|'PUT';endpoint:string;code:number;time:string;duration:string;message:string};
const seed:Log[]=[
{id:'API-99101',integration:'Shopify',method:'POST',endpoint:'/orders/import',code:200,time:'10:18:24',duration:'284 ms',message:'42 orders imported successfully.'},
{id:'API-99102',integration:'DHL Express',method:'POST',endpoint:'/shipments/create',code:500,time:'10:17:55',duration:'912 ms',message:'Carrier service temporarily unavailable.'},
{id:'API-99103',integration:'SAP Business One',method:'GET',endpoint:'/inventory/balance',code:200,time:'10:16:41',duration:'431 ms',message:'Inventory sync completed.'},
{id:'API-99104',integration:'Webhook',method:'POST',endpoint:'/shipment.dispatched',code:404,time:'10:15:12',duration:'166 ms',message:'Callback URL returned 404.'},
];

export default function ApiLogsPage(){
 const[search,setSearch]=useState('');const[status,setStatus]=useState('All');const[method,setMethod]=useState('All');const[selected,setSelected]=useState<Log|null>(null);
 const rows=useMemo(()=>seed.filter(r=>{
  const okStatus=status==='All'||(status==='Success'?r.code<400:r.code>=400);
  const okMethod=method==='All'||r.method===method;
  const q=search.toLowerCase();
  return okStatus&&okMethod&&(!q||`${r.integration} ${r.endpoint} ${r.id}`.toLowerCase().includes(q));
 }),[search,status,method]);
 return <div className="space-y-5">
  <PageHeader title="API Logs" description="Track successful and failed API transactions." icon={Activity}/>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Requests Today" value="8,412" hint="All integrations" icon={Activity}/><StatCard label="Success Rate" value="98.6%" hint="Last 24 hours" icon={Activity}/><StatCard label="Avg Response" value="342 ms" hint="Across APIs" icon={Activity}/><StatCard label="Failures" value="17" hint="Needs review" icon={Activity}/></div>
  <Card title="Transaction log" description="Search and filter API activity" action={<div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"><div className="w-full sm:w-72"><SearchInput value={search} onChange={setSearch} placeholder="Search integration or endpoint..."/></div><div className="w-full sm:w-32"><Select value={status} onChange={setStatus}><option>All</option><option>Success</option><option>Failed</option></Select></div><div className="w-full sm:w-28"><Select value={method} onChange={setMethod}><option>All</option><option>GET</option><option>POST</option><option>PUT</option></Select></div></div>}>
   <Table headers={['Log ID','Integration','Method','Endpoint','Status','Time','Duration','']} rows={rows.map(r=>[
    <span key="id" className="font-medium text-[#1674c4]">{r.id}</span>,r.integration,<Badge key="m" tone={r.method==='GET'?'blue':'green'}>{r.method}</Badge>,<code key="e" className="text-xs">{r.endpoint}</code>,
    <Badge key="s" tone={r.code<400?'green':'red'}>{r.code}</Badge>,r.time,r.duration,
    <button key="v" onClick={()=>setSelected(r)} className="rounded-md p-1.5 text-[#7c8591] hover:bg-[#eef3f5]"><Eye className="h-4 w-4"/></button>
   ])}/>
  </Card>
  <Modal open={!!selected} title="API transaction details" onClose={()=>setSelected(null)}>{selected&&<div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2">{[['Integration',selected.integration],['Method',selected.method],['Endpoint',selected.endpoint],['Status Code',String(selected.code)],['Time',selected.time],['Duration',selected.duration]].map(([k,v])=><div key={k} className="rounded-md border border-[#e5e2dc] bg-[#fbfaf8] p-3"><p className="text-xs uppercase tracking-wide text-[#8a929d]">{k}</p><p className="mt-1 text-sm font-medium text-[#1f2937]">{v}</p></div>)}</div><div className="rounded-md border border-[#e5e2dc] p-3"><p className="text-xs uppercase tracking-wide text-[#8a929d]">Response / Message</p><p className="mt-2 text-sm text-[#4b5563]">{selected.message}</p></div></div>}</Modal>
 </div>
}
