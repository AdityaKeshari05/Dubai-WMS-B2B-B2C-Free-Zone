'use client';

import { useMemo, useState } from 'react';
import { Plus, Send, Trash2, Webhook } from 'lucide-react';
import {
  Badge, Card, Field, Input, Modal, PageHeader, PrimaryButton, SearchInput, SecondaryButton, Select, Table, Toast, Toggle,
} from '@/components/wms/WmsUi';

type Hook={id:number;event:string;url:string;active:boolean;last:'Success'|'Failed'|'Never'};
const seed:Hook[]=[
{id:1,event:'order.created',url:'https://client.example.com/hooks/orders',active:true,last:'Success'},
{id:2,event:'inventory.updated',url:'https://erp.example.com/hooks/inventory',active:true,last:'Success'},
{id:3,event:'shipment.dispatched',url:'https://client.example.com/hooks/shipments',active:false,last:'Failed'},
];

export default function WebhooksPage(){
 const[items,setItems]=useState(seed);const[search,setSearch]=useState('');const[open,setOpen]=useState(false);const[event,setEvent]=useState('order.created');const[url,setUrl]=useState('');const[toast,setToast]=useState('');
 const rows=useMemo(()=>items.filter(x=>!search||`${x.event} ${x.url}`.toLowerCase().includes(search.toLowerCase())),[items,search]);
 const add=()=>{if(!url.trim())return;setItems(p=>[...p,{id:Date.now(),event,url:url.trim(),active:true,last:'Never'}]);setUrl('');setOpen(false);setToast('Webhook added');};
 const test=(id:number)=>{setItems(p=>p.map(x=>x.id===id?{...x,last:'Success'}:x));setToast('Test webhook delivered successfully (demo)');};
 return <div className="space-y-5">
  <PageHeader title="Webhooks" description="Send real-time WMS events to external systems." icon={Webhook} action={<PrimaryButton onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/> Add Webhook</PrimaryButton>}/>
  <Card title="Webhook endpoints" description="Search, test and manage event subscriptions" action={<div className="w-full sm:w-72"><SearchInput value={search} onChange={setSearch} placeholder="Search event or URL..."/></div>}>
   <Table headers={['Event','Endpoint','Enabled','Last Delivery','Actions']} rows={rows.map(r=>[
    <code key="e" className="text-xs font-medium text-[#1674c4]">{r.event}</code>,r.url,
    <Toggle key="t" checked={r.active} onChange={v=>setItems(p=>p.map(x=>x.id===r.id?{...x,active:v}:x))}/>,
    <Badge key="b" tone={r.last==='Success'?'green':r.last==='Failed'?'red':'gray'}>{r.last}</Badge>,
    <div key="a" className="flex gap-2"><SecondaryButton onClick={()=>test(r.id)}><Send className="h-4 w-4"/> Test</SecondaryButton><SecondaryButton onClick={()=>setItems(p=>p.filter(x=>x.id!==r.id))}><Trash2 className="h-4 w-4"/></SecondaryButton></div>
   ])}/>
  </Card>
  <Modal open={open} title="Add webhook" onClose={()=>setOpen(false)} footer={<><SecondaryButton onClick={()=>setOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={add}>Save Webhook</PrimaryButton></>}>
   <div className="grid gap-4"><Field label="Event"><Select value={event} onChange={setEvent}><option>order.created</option><option>inventory.updated</option><option>shipment.dispatched</option><option>receiving.completed</option></Select></Field><Field label="Callback URL"><Input value={url} onChange={setUrl} placeholder="https://example.com/webhook"/></Field></div>
  </Modal>
  {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
 </div>
}
