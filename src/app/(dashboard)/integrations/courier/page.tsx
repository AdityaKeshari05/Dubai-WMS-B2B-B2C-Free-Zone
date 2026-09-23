'use client';

import { useMemo, useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import {
  Badge, Card, Field, Input, Modal, PageHeader, PrimaryButton, SearchInput, SecondaryButton, Select, Table, Toast, Toggle,
} from '@/components/wms/WmsUi';

type Carrier={id:number;name:string;service:string;tracking:boolean;status:'Connected'|'Disconnected'};
const seed:Carrier[]=[
{id:1,name:'DHL Express',service:'Express Worldwide',tracking:true,status:'Connected'},
{id:2,name:'Aramex',service:'Domestic Express',tracking:true,status:'Connected'},
{id:3,name:'Local Fleet',service:'Same Day',tracking:false,status:'Disconnected'},
];

export default function CourierPage(){
 const[items,setItems]=useState(seed);const[search,setSearch]=useState('');const[open,setOpen]=useState(false);const[name,setName]=useState('');const[service,setService]=useState('');const[toast,setToast]=useState('');
 const rows=useMemo(()=>items.filter(x=>!search||`${x.name} ${x.service}`.toLowerCase().includes(search.toLowerCase())),[items,search]);
 const add=()=>{if(!name.trim()||!service.trim())return;setItems(p=>[...p,{id:Date.now(),name:name.trim(),service:service.trim(),tracking:true,status:'Connected'}]);setName('');setService('');setOpen(false);setToast('Carrier added (demo)');};
 return <div className="space-y-5">
  <PageHeader title="Courier Integration" description="Send shipments to courier systems and receive tracking updates." icon={Truck} action={<PrimaryButton onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/> Add Carrier</PrimaryButton>}/>
  <Card title="Courier connections" description="Manage shipment and tracking integrations" action={<div className="w-full sm:w-72"><SearchInput value={search} onChange={setSearch} placeholder="Search carrier or service..."/></div>}>
   <Table headers={['Carrier','Service','Tracking Sync','Status','Action']} rows={rows.map(r=>[
    <span key="n" className="font-medium text-[#1f2937]">{r.name}</span>,r.service,
    <Toggle key="t" checked={r.tracking} onChange={v=>setItems(p=>p.map(x=>x.id===r.id?{...x,tracking:v}:x))}/>,
    <Badge key="b" tone={r.status==='Connected'?'green':'gray'}>{r.status}</Badge>,
    <SecondaryButton key="a" onClick={()=>setItems(p=>p.map(x=>x.id===r.id?{...x,status:x.status==='Connected'?'Disconnected':'Connected'}:x))}>{r.status==='Connected'?'Disconnect':'Connect'}</SecondaryButton>
   ])}/>
  </Card>
  <Modal open={open} title="Add courier" onClose={()=>setOpen(false)} footer={<><SecondaryButton onClick={()=>setOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={add}>Add Carrier</PrimaryButton></>}>
   <div className="grid gap-4"><Field label="Carrier Name"><Input value={name} onChange={setName} placeholder="e.g. FedEx"/></Field><Field label="Service"><Input value={service} onChange={setService} placeholder="e.g. International Priority"/></Field></div>
  </Modal>
  {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
 </div>
}
