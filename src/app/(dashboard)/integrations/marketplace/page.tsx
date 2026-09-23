'use client';

import { useMemo, useState } from 'react';
import { Plus, Store } from 'lucide-react';
import {
  Badge, Card, Field, Input, Modal, PageHeader, PrimaryButton, SearchInput, SecondaryButton, Select, Table, Toast, Toggle,
} from '@/components/wms/WmsUi';

type Account={id:number;marketplace:string;account:string;region:string;orders:boolean;status:'Connected'|'Paused'};
const seed:Account[]=[
{id:1,marketplace:'Amazon',account:'Amazon UAE',region:'UAE',orders:true,status:'Connected'},
{id:2,marketplace:'Noon',account:'Noon Seller',region:'UAE',orders:true,status:'Connected'},
];

export default function MarketplacePage(){
 const[items,setItems]=useState(seed);const[search,setSearch]=useState('');const[open,setOpen]=useState(false);const[marketplace,setMarketplace]=useState('Amazon');const[account,setAccount]=useState('');const[region,setRegion]=useState('UAE');const[toast,setToast]=useState('');
 const rows=useMemo(()=>items.filter(x=>!search||`${x.marketplace} ${x.account} ${x.region}`.toLowerCase().includes(search.toLowerCase())),[items,search]);
 const add=()=>{if(!account.trim())return;setItems(p=>[...p,{id:Date.now(),marketplace,account:account.trim(),region,orders:true,status:'Connected'}]);setAccount('');setOpen(false);setToast('Marketplace account connected (demo)');};
 return <div className="space-y-5">
  <PageHeader title="Marketplace Integration" description="Import orders from supported marketplace accounts." icon={Store} action={<PrimaryButton onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/> Add Account</PrimaryButton>}/>
  <Card title="Marketplace accounts" description="Manage connected seller accounts" action={<div className="w-full sm:w-72"><SearchInput value={search} onChange={setSearch} placeholder="Search marketplace or account..."/></div>}>
   <Table headers={['Marketplace','Account','Region','Order Import','Status','Action']} rows={rows.map(r=>[
    r.marketplace,<span key="a" className="font-medium text-[#1f2937]">{r.account}</span>,r.region,
    <Toggle key="t" checked={r.orders} onChange={v=>setItems(p=>p.map(x=>x.id===r.id?{...x,orders:v}:x))}/>,
    <Badge key="b" tone={r.status==='Connected'?'green':'amber'}>{r.status}</Badge>,
    <SecondaryButton key="x" onClick={()=>setItems(p=>p.map(x=>x.id===r.id?{...x,status:x.status==='Connected'?'Paused':'Connected'}:x))}>{r.status==='Connected'?'Pause':'Resume'}</SecondaryButton>
   ])}/>
  </Card>
  <Modal open={open} title="Add marketplace account" onClose={()=>setOpen(false)} footer={<><SecondaryButton onClick={()=>setOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={add}>Connect Account</PrimaryButton></>}>
   <div className="grid gap-4"><Field label="Marketplace"><Select value={marketplace} onChange={setMarketplace}><option>Amazon</option><option>Noon</option><option>eBay</option></Select></Field><Field label="Account Name"><Input value={account} onChange={setAccount} placeholder="Seller account name"/></Field><Field label="Region"><Select value={region} onChange={setRegion}><option>UAE</option><option>Saudi Arabia</option><option>Global</option></Select></Field></div>
  </Modal>
  {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
 </div>
}
