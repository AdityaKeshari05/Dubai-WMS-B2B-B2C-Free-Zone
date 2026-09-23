'use client';

import { useState } from 'react';
import { Landmark, RefreshCw } from 'lucide-react';
import {
  Card, Field, Input, PageHeader, PrimaryButton, Select, Toast, Toggle,
} from '@/components/wms/WmsUi';

export default function AccountingIntegrationPage(){
 const[provider,setProvider]=useState('QuickBooks Online');const[company,setCompany]=useState('Orus Trading LLC');const[invoices,setInvoices]=useState(true);const[payments,setPayments]=useState(true);const[tax,setTax]=useState(false);const[toast,setToast]=useState('');
 return <div className="space-y-5">
  <PageHeader title="Accounting Integration" description="Exchange relevant commercial and accounting information." icon={Landmark}
   action={<PrimaryButton onClick={()=>setToast('Accounting connection test successful (demo)')}><RefreshCw className="h-4 w-4"/> Test Connection</PrimaryButton>}/>
  <Card title="Accounting connection" description="Configure provider and company mapping">
   <div className="grid gap-4 p-5 md:grid-cols-2"><Field label="Provider"><Select value={provider} onChange={setProvider}><option>QuickBooks Online</option><option>Xero</option><option>Zoho Books</option><option>Custom Accounting API</option></Select></Field><Field label="Company / Entity"><Input value={company} onChange={setCompany}/></Field></div>
  </Card>
  <Card title="Data synchronization" description="Select commercial information to exchange">
   <div className="divide-y divide-[#f0eee9]">{[['Sales Invoices',invoices,setInvoices],['Payments',payments,setPayments],['Tax / VAT Details',tax,setTax]].map(([n,v,s])=><div key={String(n)} className="flex items-center justify-between px-5 py-4"><span className="text-sm font-medium text-[#1f2937]">{String(n)}</span><Toggle checked={Boolean(v)} onChange={s as (v:boolean)=>void}/></div>)}</div>
   <div className="flex justify-end border-t border-[#e5e2dc] px-5 py-4"><PrimaryButton onClick={()=>setToast('Accounting configuration saved locally')}>Save Configuration</PrimaryButton></div>
  </Card>
  {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
 </div>
}
