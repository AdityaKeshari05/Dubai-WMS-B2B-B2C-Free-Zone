'use client';

import { useMemo, useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import {
  Badge, Card, Field, Input, Modal, PageHeader, PrimaryButton, SearchInput, SecondaryButton, Select, Table, Toast, Toggle,
} from '@/components/wms/WmsUi';

type Store = { id:number; platform:string; name:string; domain:string; orders:boolean; inventory:boolean; status:'Connected'|'Disconnected' };
const seed:Store[]=[
  {id:1,platform:'Shopify',name:'Orus Retail UAE',domain:'orus-retail.myshopify.com',orders:true,inventory:true,status:'Connected'},
  {id:2,platform:'WooCommerce',name:'B2C Direct',domain:'shop.example.ae',orders:true,inventory:false,status:'Connected'},
];

export default function EcommercePage(){
  const[items,setItems]=useState(seed); const[search,setSearch]=useState(''); const[open,setOpen]=useState(false);
  const[platform,setPlatform]=useState('Shopify'); const[name,setName]=useState(''); const[domain,setDomain]=useState(''); const[toast,setToast]=useState('');
  const rows=useMemo(()=>items.filter(x=>!search||`${x.name} ${x.platform} ${x.domain}`.toLowerCase().includes(search.toLowerCase())),[items,search]);

  const add=()=>{if(!name.trim()||!domain.trim())return;setItems(p=>[...p,{id:Date.now(),platform,name:name.trim(),domain:domain.trim(),orders:true,inventory:true,status:'Connected'}]);setName('');setDomain('');setOpen(false);setToast('Store connected (demo)');};

  return <div className="space-y-5">
    <PageHeader title="E-Commerce Integration" description="Connect online stores and configure order/inventory synchronization." icon={ShoppingCart}
      action={<PrimaryButton onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/> Connect Store</PrimaryButton>} />
    <Card title="Connected stores" description="Manage storefront integrations" action={<div className="w-full sm:w-72"><SearchInput value={search} onChange={setSearch} placeholder="Search store or platform..."/></div>}>
      <Table headers={['Store','Platform','Domain','Order Sync','Inventory Sync','Status','Action']} rows={rows.map(r=>[
        <span key="n" className="font-medium text-[#1f2937]">{r.name}</span>,r.platform,r.domain,
        <Toggle key="o" checked={r.orders} onChange={v=>setItems(p=>p.map(x=>x.id===r.id?{...x,orders:v}:x))}/>,
        <Toggle key="i" checked={r.inventory} onChange={v=>setItems(p=>p.map(x=>x.id===r.id?{...x,inventory:v}:x))}/>,
        <Badge key="s" tone={r.status==='Connected'?'green':'gray'}>{r.status}</Badge>,
        <SecondaryButton key="a" onClick={()=>setItems(p=>p.map(x=>x.id===r.id?{...x,status:x.status==='Connected'?'Disconnected':'Connected'}:x))}>{r.status==='Connected'?'Disconnect':'Connect'}</SecondaryButton>
      ])}/>
    </Card>
    <Modal open={open} title="Connect e-commerce store" onClose={()=>setOpen(false)}
      footer={<><SecondaryButton onClick={()=>setOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={add}>Connect Store</PrimaryButton></>}>
      <div className="grid gap-4">
        <Field label="Platform"><Select value={platform} onChange={setPlatform}><option>Shopify</option><option>WooCommerce</option><option>Magento</option></Select></Field>
        <Field label="Store Name"><Input value={name} onChange={setName} placeholder="e.g. UAE Online Store"/></Field>
        <Field label="Store Domain"><Input value={domain} onChange={setDomain} placeholder="store.example.com"/></Field>
      </div>
    </Modal>
    {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
  </div>
}
