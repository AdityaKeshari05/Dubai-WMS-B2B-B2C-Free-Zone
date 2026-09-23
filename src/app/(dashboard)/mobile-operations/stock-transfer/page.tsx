'use client';
import { ArrowLeftRight, Clock3, CheckCircle2, AlertTriangle, Boxes } from 'lucide-react';
import { OperationTaskPage } from '@/components/wms/OperationTaskPage';
const rows=[
{id:'TRF-000411',primary:'SKU-10024',secondary:'BIN-A-01 → BIN-B-02',warehouse:'Dubai Main Warehouse',qty:'30',status:'Pending',extra:{From:'BIN-A-01',To:'BIN-B-02'}},
{id:'TRF-000412',primary:'SKU-10041',secondary:'FZ-B-14 → FZ-C-02',warehouse:'Free Zone Warehouse',qty:'16',status:'In Progress',extra:{From:'FZ-B-14',To:'FZ-C-02'}},
{id:'TRF-000413',primary:'SKU-10110',secondary:'BIN-C-08 → BIN-D-01',warehouse:'Dubai Main Warehouse',qty:'12',status:'Completed',extra:{From:'BIN-C-08',To:'BIN-D-01'}},
];
export default function Page(){return <OperationTaskPage title="Stock Transfer" description="Move inventory between bins and warehouse locations." icon={ArrowLeftRight} actionLabel="New Transfer" formTitle="Create Stock Transfer" initialRows={rows} primaryLabel="SKU" secondaryLabel="From → To" qtyLabel="Transfer Qty" nextStatus="In Progress" nextActionLabel="Start Transfer" completeStatus="Completed" completeActionLabel="Confirm Transfer" formFields={[
{key:'sku',label:'SKU',placeholder:'SKU-10050'},{key:'from',label:'From Bin',placeholder:'BIN-A-01'},{key:'to',label:'To Bin',placeholder:'BIN-B-02'},{key:'warehouse',label:'Warehouse',type:'select',options:['Dubai Main Warehouse','Free Zone Warehouse']},{key:'qty',label:'Quantity',type:'number',placeholder:'10'}
]} makeRow={(v,n)=>({id:`TRF-${String(413+n).padStart(6,'0')}`,primary:v.sku,secondary:`${v.from} → ${v.to}`,warehouse:v.warehouse,qty:v.qty,status:'Pending',extra:{From:v.from,To:v.to}})} stats={[{label:'Pending',value:'6',hint:'Awaiting transfer',icon:Clock3},{label:'In Progress',value:'3',hint:'Movement active',icon:Boxes},{label:'Completed Today',value:'14',hint:'Transfers closed',icon:CheckCircle2},{label:'Exceptions',value:'2',hint:'Needs review',icon:AlertTriangle}]}/>}
