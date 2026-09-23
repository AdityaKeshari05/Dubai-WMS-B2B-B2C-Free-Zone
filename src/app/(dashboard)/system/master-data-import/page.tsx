'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Upload } from 'lucide-react';
import {
  Badge, Card, Field, PageHeader, PrimaryButton, Select, Table, Toast,
} from '@/components/wms/WmsUi';

type Preview = { row:number; sku:string; name:string; warehouse:string; qty:number; status:'Valid'|'Warning' };

const preview:Preview[]=[
  {row:1,sku:'SKU-10021',name:'Premium Dates 1kg',warehouse:'Dubai Main',qty:120,status:'Valid'},
  {row:2,sku:'SKU-10022',name:'Arabic Coffee 500g',warehouse:'Free Zone',qty:84,status:'Valid'},
  {row:3,sku:'SKU-10023',name:'Gift Box XL',warehouse:'Dubai Main',qty:0,status:'Warning'},
];

export default function MasterDataImportPage(){
  const [type,setType]=useState('Products / SKU');
  const [file,setFile]=useState<File|null>(null);
  const [step,setStep]=useState<1|2|3>(1);
  const [toast,setToast]=useState('');

  const proceed=()=>{
    if(step===1 && !file){setToast('Choose a CSV or Excel file first'); return;}
    if(step<3) setStep((step+1) as 2|3);
    else setToast('498 records imported successfully (demo)');
  };

  return <div className="space-y-5">
    <PageHeader title="Master Data Import" description="Bulk upload warehouse master data using a guided frontend-only import flow." icon={Upload}/>
    <div className="grid gap-3 sm:grid-cols-3">
      {['1. Select File','2. Map & Validate','3. Import'].map((x,i)=><div key={x} className={`rounded-lg border p-4 text-sm font-medium ${step===i+1?'border-[#2490ef] bg-[#eef6ff] text-[#1674c4]':'border-[#e5e2dc] bg-white text-[#7c8591]'}`}>{x}</div>)}
    </div>
    <Card title={step===1?'Select import file':step===2?'Validate import':'Ready to import'} description={step===1?'Choose data type and upload CSV/XLSX':step===2?'Review preview and validation results':'Validation passed. Confirm the import.'}>
      <div className="p-5">
        {step===1&&<div className="grid gap-4 md:grid-cols-2">
          <Field label="Data Type"><Select value={type} onChange={setType}><option>Products / SKU</option><option>Customers</option><option>Suppliers</option><option>Opening Inventory</option><option>Warehouse Locations</option></Select></Field>
          <Field label="File"><input type="file" accept=".csv,.xlsx,.xls" onChange={e=>setFile(e.target.files?.[0]||null)} className="block h-9 w-full rounded-md border border-[#dcd8d1] bg-white px-3 py-1.5 text-sm text-[#4b5563]"/></Field>
        </div>}
        {step===2&&<Table headers={['Row','SKU','Name','Warehouse','Qty','Validation']} rows={preview.map(r=>[r.row,r.sku,r.name,r.warehouse,r.qty,<Badge key="b" tone={r.status==='Valid'?'green':'amber'}>{r.status}</Badge>])}/>}
        {step===3&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-600"/><div><p className="text-sm font-semibold text-emerald-800">Validation complete</p><p className="mt-1 text-sm text-emerald-700">498 valid records, 2 warnings. Demo import can proceed.</p></div></div></div>}
        <div className="mt-5 flex justify-end"><PrimaryButton onClick={proceed}>{step===1?'Continue':step===2?'Validate & Continue':'Import 498 Records'}</PrimaryButton></div>
      </div>
    </Card>
    {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}
  </div>
}
