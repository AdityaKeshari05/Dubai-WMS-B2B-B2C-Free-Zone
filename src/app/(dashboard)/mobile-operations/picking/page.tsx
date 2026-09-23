'use client';
import { ClipboardCheck, Clock3, CheckCircle2, AlertTriangle, Boxes } from 'lucide-react';
import { OperationTaskPage } from '@/components/wms/OperationTaskPage';
const rows=[
{id:'PICK-000874',primary:'SO-2026-0088',secondary:'SKU-10024 · BIN-A-01',warehouse:'Dubai Main Warehouse',qty:'8',status:'Assigned',extra:{SKU:'SKU-10024',Bin:'BIN-A-01',Picker:'Ahmed Khan'}},
{id:'PICK-000875',primary:'SO-2026-0089',secondary:'SKU-10110 · BIN-C-08',warehouse:'Dubai Main Warehouse',qty:'15',status:'In Progress',extra:{SKU:'SKU-10110',Bin:'BIN-C-08',Picker:'Mohammed Ali'}},
{id:'PICK-000876',primary:'SO-2026-0090',secondary:'SKU-10041 · FZ-B-14',warehouse:'Free Zone Warehouse',qty:'4',status:'Exception',extra:{SKU:'SKU-10041',Bin:'FZ-B-14',Picker:'Rashid Noor'}},
];
export default function Page(){return <OperationTaskPage title="Picking" description="Create, assign and complete warehouse picking tasks." icon={ClipboardCheck} actionLabel="Create Pick Task" formTitle="Create Picking Task" initialRows={rows} primaryLabel="Sales Order" secondaryLabel="SKU / Bin" qtyLabel="Pick Qty" nextStatus="In Progress" nextActionLabel="Start Picking" completeStatus="Completed" completeActionLabel="Confirm Pick" formFields={[
{key:'order',label:'Sales Order',placeholder:'SO-2026-0091'},{key:'sku',label:'SKU',placeholder:'SKU-10050'},{key:'bin',label:'Source Bin',placeholder:'BIN-A-05'},{key:'warehouse',label:'Warehouse',type:'select',options:['Dubai Main Warehouse','Free Zone Warehouse']},{key:'qty',label:'Quantity',type:'number',placeholder:'10'},{key:'picker',label:'Assign Picker',type:'select',options:['Ahmed Khan','Mohammed Ali','Rashid Noor','Sara Malik']}
]} makeRow={(v,n)=>({id:`PICK-${String(876+n).padStart(6,'0')}`,primary:v.order,secondary:`${v.sku} · ${v.bin}`,warehouse:v.warehouse,qty:v.qty,status:'Assigned',extra:{SKU:v.sku,Bin:v.bin,Picker:v.picker}})} stats={[{label:'Assigned',value:'18',hint:'Waiting to start',icon:Clock3},{label:'In Progress',value:'7',hint:'Currently picking',icon:Boxes},{label:'Completed Today',value:'42',hint:'Orders picked',icon:CheckCircle2},{label:'Exceptions',value:'5',hint:'Short / damaged',icon:AlertTriangle}]}/>}
