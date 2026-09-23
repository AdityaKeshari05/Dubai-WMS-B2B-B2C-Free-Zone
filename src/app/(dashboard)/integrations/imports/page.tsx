'use client';

import { useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react';
import {
  Badge, Card, Field, PageHeader, PrimaryButton, Select, Table, Toast,
} from '@/components/wms/WmsUi';

type Row={row:number;reference:string;description:string;status:'Valid'|'Warning'};
const preview:Row[]=[
{row:1,reference:'SKU-10021',description:'Premium Dates 1kg',status:'Valid'},
{row:2,reference:'SKU-10022',description:'Arabic Coffee 500g',status:'Valid'},
{row:3,reference:'SKU-10023',description:'Missing UOM mapping',status:'Warning'},
];

export default function ImportsPage(){
 const[type,setType]=useState('Products / SKU');const[file,setFile]=useState<File|null>(null);const[step,setStep]=useState<1|2|3>(1);const[toast,setToast]=useState('');
 const next=()=>{if(step===1&&!file){setToast('Select a CSV or Excel file first');return;}if(step<3)setStep((step+1) as 2|3);else setToast('500 records imported successfully (demo)');};
 return <div className="space-y-5">
  <PageHeader title="Excel / CSV Import" description="Bulk upload master data and transactions from spreadsheet files." icon={Upload}/>
  <div className="grid gap-3 sm:grid-cols-3">{['1. Select File','2. Validate','3. Import'].map((x,i)=><div key={x} className={`rounded-lg border p-4 text-sm font-medium ${step===i+1?'border-[#2490ef] bg-[#eef6ff] text-[#1674c4]':'border-[#e5e2dc] bg-white text-[#7c8591]'}`}>{x}</div>)}</div>
  <Card title={step===1?'Choose import file':step===2?'Validation preview':'Ready to import'} description="Frontend-only import simulation">
   <div className="p-5">
    {step===1&&<div className="grid gap-4 md:grid-cols-2"><Field label="Import Type"><Select value={type} onChange={setType}><option>Products / SKU</option><option>Customers</option><option>Inventory</option><option>Orders</option><option>Locations</option></Select></Field><Field label="File"><input type="file" accept=".csv,.xlsx,.xls" onChange={e=>setFile(e.target.files?.[0]||null)} className="block h-9 w-full rounded-md border border-[#dcd8d1] bg-white px-3 py-1.5 text-sm"/></Field></div>}
    {step===2&&<Table headers={['Row','Reference','Description','Validation']} rows={preview.map(r=>[r.row,r.reference,r.description,<Badge key="b" tone={r.status==='Valid'?'green':'amber'}>{r.status}</Badge>])}/>}
    {step===3&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600"/><div><p className="text-sm font-semibold text-emerald-800">Validation complete</p><p className="mt-1 text-sm text-emerald-700">500 valid records, 1 warning. Import can proceed.</p></div></div></div>}
    <div className="mt-5 flex justify-end"><PrimaryButton onClick={next}>{step===1?'Continue':step===2?'Validate & Continue':'Import 500 Records'}</PrimaryButton></div>
   </div>
  </Card>
  {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
 </div>
}
