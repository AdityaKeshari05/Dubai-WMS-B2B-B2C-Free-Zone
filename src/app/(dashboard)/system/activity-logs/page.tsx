'use client';

import { useMemo, useState } from 'react';
import { Activity, Eye } from 'lucide-react';
import {
  Badge, Card, Modal, PageHeader, SearchInput, Select, StatCard, Table,
} from '@/components/wms/WmsUi';

type Log={id:string;source:string;module:string;activity:string;time:string;status:'Success'|'Warning'|'Failed';details:string};
const seed:Log[]=[
{id:'LOG-90018',source:'System',module:'Integrations',activity:'Courier tracking sync completed',time:'09:55',status:'Success',details:'126 shipment statuses synchronized.'},
{id:'LOG-90019',source:'Ahmed Khan',module:'Inventory',activity:'Stock adjustment submitted',time:'09:47',status:'Warning',details:'ADJ-0048 awaiting supervisor approval.'},
{id:'LOG-90020',source:'Webhook',module:'Integrations',activity:'order.created delivery failed',time:'09:42',status:'Failed',details:'Endpoint returned HTTP 500.'},
{id:'LOG-90021',source:'Sara Malik',module:'Orders',activity:'B2B order allocated',time:'09:31',status:'Success',details:'SO-B2B-1824 allocated to wave 91.'},
];

export default function ActivityLogsPage(){
 const[search,setSearch]=useState(''); const[status,setStatus]=useState('All'); const[selected,setSelected]=useState<Log|null>(null);
 const rows=useMemo(()=>seed.filter(r=>(status==='All'||r.status===status)&&(!search||`${r.source} ${r.module} ${r.activity}`.toLowerCase().includes(search.toLowerCase()))),[search,status]);
 return <div className="space-y-5">
  <PageHeader title="Activity Logs" description="Track system, user and integration activities." icon={Activity}/>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><StatCard label="Events Today" value="3,842" hint="All sources" icon={Activity}/><StatCard label="Warnings" value="14" hint="Needs review" icon={Activity}/><StatCard label="Failures" value="5" hint="Integrations & jobs" icon={Activity}/></div>
  <Card title="Activity stream" description="Search and filter system activity" action={<div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"><div className="w-full sm:w-72"><SearchInput value={search} onChange={setSearch} placeholder="Search source, module or activity..."/></div><div className="w-full sm:w-32"><Select value={status} onChange={setStatus}><option>All</option><option>Success</option><option>Warning</option><option>Failed</option></Select></div></div>}>
   <Table headers={['Log ID','Source','Module','Activity','Time','Status','']} rows={rows.map(r=>[<span key="id" className="font-medium text-[#1674c4]">{r.id}</span>,r.source,r.module,r.activity,r.time,<Badge key="s" tone={r.status==='Success'?'green':r.status==='Warning'?'amber':'red'}>{r.status}</Badge>,<button key="v" onClick={()=>setSelected(r)} className="rounded-md p-1.5 text-[#7c8591] hover:bg-[#eef3f5]"><Eye className="h-4 w-4"/></button>])}/>
  </Card>
  <Modal open={!!selected} title="Activity details" onClose={()=>setSelected(null)}>{selected&&<div className="space-y-3"><p className="text-sm text-[#4b5563]">{selected.details}</p><div className="rounded-md bg-[#fbfaf8] p-3 text-xs text-[#7c8591]">{selected.id} · {selected.module} · {selected.time}</div></div>}</Modal>
 </div>
}
