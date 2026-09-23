'use client';

import { useState } from 'react';
import { Building2, RefreshCw } from 'lucide-react';
import {
  Card, Field, Input, PageHeader, PrimaryButton, Select, Toast, Toggle,
} from '@/components/wms/WmsUi';

export default function ErpIntegrationPage(){
 const[provider,setProvider]=useState('SAP Business One'); const[url,setUrl]=useState('https://sap-demo.local/api');
 const[inventory,setInventory]=useState(true);const[po,setPo]=useState(true);const[so,setSo]=useState(true);const[toast,setToast]=useState('');
 return <div className="space-y-5">
  <PageHeader title="ERP Integration" description="Exchange inventory, purchase and sales order information with ERP systems." icon={Building2}
   action={<PrimaryButton onClick={()=>setToast('ERP test connection successful (demo)')}><RefreshCw className="h-4 w-4"/> Test Connection</PrimaryButton>}/>
  <Card title="Connection settings" description="Configure ERP endpoint and provider">
   <div className="grid gap-4 p-5 md:grid-cols-2">
    <Field label="ERP Provider"><Select value={provider} onChange={setProvider}><option>SAP Business One</option><option>Microsoft Dynamics</option><option>Oracle NetSuite</option><option>Custom ERP</option></Select></Field>
    <Field label="Base URL"><Input value={url} onChange={setUrl} placeholder="https://erp.example.com/api"/></Field>
   </div>
  </Card>
  <Card title="Synchronization scope" description="Choose which business objects are exchanged">
   <div className="divide-y divide-[#f0eee9]">
    {[['Inventory Balances',inventory,setInventory],['Purchase Orders',po,setPo],['Sales Orders',so,setSo]].map(([n,v,s])=><div key={String(n)} className="flex items-center justify-between px-5 py-4"><span className="text-sm font-medium text-[#1f2937]">{String(n)}</span><Toggle checked={Boolean(v)} onChange={s as (v:boolean)=>void}/></div>)}
   </div>
   <div className="flex justify-end border-t border-[#e5e2dc] px-5 py-4"><PrimaryButton onClick={()=>setToast('ERP configuration saved locally')}>Save Configuration</PrimaryButton></div>
  </Card>
  {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
 </div>
}
