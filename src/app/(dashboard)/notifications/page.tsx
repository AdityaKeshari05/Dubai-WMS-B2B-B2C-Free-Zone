'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Bell, CheckCheck, ClipboardCheck, Package, ShoppingCart, Trash2, Truck } from 'lucide-react';
import { Badge, Card, Input, Modal, PageHeader, SecondaryButton, SearchInput, Select, StatCard, Toast } from '@/components/wms/WmsUi';

type Notice={id:number;type:'Inventory'|'Order'|'Picking'|'Receiving'|'Shipment';title:string;text:string;time:string;read:boolean;severity:'High'|'Medium'};
const seed:Notice[]=[
{id:1,type:'Inventory',title:'Low stock: Thermal Labels 4x6',text:'SKU-10441 has 34 units remaining; reorder point is 50.',time:'3 min ago',read:false,severity:'High'},
{id:2,type:'Order',title:'B2B order approaching SLA cutoff',text:'SO-B2B-1824 has not reached picking completion.',time:'8 min ago',read:false,severity:'Medium'},
{id:3,type:'Picking',title:'Picking exception reported',text:'Picker reported wrong SKU in bin A-03-14.',time:'14 min ago',read:false,severity:'High'},
{id:4,type:'Receiving',title:'Inbound appointment overdue',text:'ASN-00974 has not checked in for the scheduled dock slot.',time:'28 min ago',read:true,severity:'Medium'},
{id:5,type:'Shipment',title:'Courier label generation failed',text:'Shipment SHP-00918 returned a validation error from courier.',time:'41 min ago',read:true,severity:'High'},
];
const iconMap={Inventory:Package,Order:ShoppingCart,Picking:ClipboardCheck,Receiving:Truck,Shipment:Truck};

export default function NotificationsPage(){
 const [items,setItems]=useState(seed); const [search,setSearch]=useState(''); const [type,setType]=useState('All'); const [severity,setSeverity]=useState('All'); const [selected,setSelected]=useState<Notice|null>(null); const [toast,setToast]=useState('');
 const shown=useMemo(()=>items.filter(n=>(!search||`${n.title} ${n.text}`.toLowerCase().includes(search.toLowerCase()))&&(type==='All'||n.type===type)&&(severity==='All'||n.severity===severity)),[items,search,type,severity]);
 const update=(id:number,patch:Partial<Notice>)=>setItems(x=>x.map(n=>n.id===id?{...n,...patch}:n));
 return <div className="space-y-5">
  <PageHeader title="Notification Center" description="Actionable warehouse alerts and exceptions." icon={Bell} action={<SecondaryButton onClick={()=>{setItems(x=>x.map(n=>({...n,read:true})));setToast('All notifications marked as read.')}}><CheckCheck className="h-4 w-4"/>Mark all read</SecondaryButton>}/>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Unread" value={String(items.filter(n=>!n.read).length)} icon={Bell}/><StatCard label="High Priority" value={String(items.filter(n=>n.severity==='High').length)} icon={AlertTriangle}/><StatCard label="Inventory" value={String(items.filter(n=>n.type==='Inventory').length)} icon={Package}/><StatCard label="Operational" value={String(items.filter(n=>n.type!=='Inventory').length)} icon={Truck}/></div>
  <Card title="Alerts" description="Search, filter, open and manage notifications" action={<div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"><div className="w-full sm:w-72"><SearchInput value={search} onChange={setSearch} placeholder="Search alerts..."/></div><Select value={type} onChange={setType}><option>All</option><option>Inventory</option><option>Order</option><option>Picking</option><option>Receiving</option><option>Shipment</option></Select><Select value={severity} onChange={setSeverity}><option>All</option><option>High</option><option>Medium</option></Select></div>}>
   <div className="divide-y divide-[#f0eee9]">{shown.map(n=>{const Icon=iconMap[n.type];return <div key={n.id} className={`flex gap-4 p-5 ${!n.read?'bg-[#f8fbff]':''}`}><button className="flex min-w-0 flex-1 gap-4 text-left" onClick={()=>{update(n.id,{read:true});setSelected({...n,read:true});}}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#eef6ff]"><Icon className="h-5 w-5 text-[#2490ef]"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-[#1f2937]">{n.title}</p>{!n.read&&<span className="h-2 w-2 rounded-full bg-[#2490ef]"/>}<Badge tone={n.severity==='High'?'red':'amber'}>{n.severity}</Badge></div><p className="mt-1 text-sm text-[#7c8591]">{n.text}</p><p className="mt-2 text-xs text-[#9aa1aa]">{n.type} · {n.time}</p></div></button><button title="Dismiss" onClick={()=>{setItems(x=>x.filter(a=>a.id!==n.id));setToast('Notification dismissed.')}} className="self-start rounded-md p-2 text-[#9aa1aa] hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4"/></button></div>})}{shown.length===0&&<div className="p-10 text-center text-sm text-[#7c8591]">No notifications match these filters.</div>}</div>
  </Card>
  <Modal open={!!selected} title={selected?.title||''} description={selected?`${selected.type} alert · ${selected.time}`:''} onClose={()=>setSelected(null)}><div className="space-y-4"><p className="text-sm leading-6 text-[#4b5563]">{selected?.text}</p><div className="flex gap-2"><Badge tone={selected?.severity==='High'?'red':'amber'}>{selected?.severity}</Badge><Badge tone="green">Read</Badge></div></div></Modal>
  {toast&&<Toast message={toast} onClose={()=>setToast('')}/>} 
 </div>
}