'use client';

import { useMemo, useState } from 'react';
import { Plus, Workflow } from 'lucide-react';
import {
  Badge, Card, Field, Input, Modal, PageHeader, PrimaryButton, SearchInput, SecondaryButton, Select, Table, Toast, Toggle,
} from '@/components/wms/WmsUi';

type Status = { id: number; module: string; name: string; order: number; active: boolean };

const seed: Status[] = [
  { id:1,module:'Order',name:'Draft',order:1,active:true },
  { id:2,module:'Order',name:'Allocated',order:2,active:true },
  { id:3,module:'Order',name:'Picking',order:3,active:true },
  { id:4,module:'Order',name:'Packed',order:4,active:true },
  { id:5,module:'Order',name:'Dispatched',order:5,active:true },
  { id:6,module:'Inbound',name:'Expected',order:1,active:true },
  { id:7,module:'Inbound',name:'Receiving',order:2,active:true },
  { id:8,module:'Inbound',name:'Putaway',order:3,active:true },
];

export default function StatusesPage() {
  const [items,setItems]=useState(seed);
  const [search,setSearch]=useState('');
  const [module,setModule]=useState('All');
  const [open,setOpen]=useState(false);
  const [newModule,setNewModule]=useState('Order');
  const [name,setName]=useState('');
  const [toast,setToast]=useState('');

  const rows=useMemo(()=>items.filter(x=>(module==='All'||x.module===module)&&(!search||`${x.module} ${x.name}`.toLowerCase().includes(search.toLowerCase()))),[items,search,module]);

  const add=()=>{ if(!name.trim()) return; setItems(p=>[...p,{id:Date.now(),module:newModule,name:name.trim(),order:p.filter(x=>x.module===newModule).length+1,active:true}]); setName(''); setOpen(false); setToast('Status added'); };

  return <div className="space-y-5">
    <PageHeader title="Status Configuration" description="Configure operational statuses used by WMS workflows." icon={Workflow}
      action={<PrimaryButton onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/> Add Status</PrimaryButton>} />
    <Card title="Operational statuses" description="Search, filter and enable workflow statuses" action={
      <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
        <div className="w-full sm:w-64"><SearchInput value={search} onChange={setSearch} placeholder="Search status..." /></div>
        <div className="w-full sm:w-36"><Select value={module} onChange={setModule}><option>All</option><option>Order</option><option>Inbound</option></Select></div>
      </div>
    }>
      <Table headers={['Module','Status','Order','State','Enabled']} rows={rows.map(r=>[
        r.module,<span key="n" className="font-medium text-[#1f2937]">{r.name}</span>,r.order,
        <Badge key="b" tone={r.active?'green':'gray'}>{r.active?'Active':'Inactive'}</Badge>,
        <Toggle key="t" checked={r.active} onChange={v=>setItems(p=>p.map(x=>x.id===r.id?{...x,active:v}:x))}/>
      ])}/>
    </Card>
    <Modal open={open} title="Add status" onClose={()=>setOpen(false)} footer={<><SecondaryButton onClick={()=>setOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={add}>Add Status</PrimaryButton></>}>
      <div className="grid gap-4">
        <Field label="Module"><Select value={newModule} onChange={setNewModule}><option>Order</option><option>Inbound</option><option>Inventory</option><option>Shipment</option></Select></Field>
        <Field label="Status Name"><Input value={name} onChange={setName} placeholder="e.g. Quality Hold" /></Field>
      </div>
    </Modal>
    {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
  </div>
}
