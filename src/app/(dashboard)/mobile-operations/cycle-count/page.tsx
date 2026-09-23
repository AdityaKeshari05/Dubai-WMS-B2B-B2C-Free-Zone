'use client';
import { ListChecks, Clock3, CheckCircle2, AlertTriangle, Boxes } from 'lucide-react';
import { OperationTaskPage } from '@/components/wms/OperationTaskPage';
const rows=[
{id:'CNT-000091',primary:'BIN-A-01',secondary:'SKU-10024',warehouse:'Dubai Main Warehouse',qty:'120',status:'Assigned',extra:{'System Qty':'120','Counted Qty':'—'}},
{id:'CNT-000092',primary:'FZ-B-14',secondary:'SKU-10041',warehouse:'Free Zone Warehouse',qty:'48',status:'In Progress',extra:{'System Qty':'48','Counted Qty':'—'}},
{id:'CNT-000093',primary:'BIN-C-08',secondary:'SKU-10110',warehouse:'Dubai Main Warehouse',qty:'95',status:'Discrepancy',extra:{'System Qty':'95','Counted Qty':'92'}},
];
export default function Page(){return <OperationTaskPage title="Cycle Count" description="Schedule bin counts and record stock-count discrepancies." icon={ListChecks} actionLabel="New Count" formTitle="Create Cycle Count" initialRows={rows} primaryLabel="Bin" secondaryLabel="SKU" qtyLabel="System Qty" nextStatus="In Progress" nextActionLabel="Start Count" completeStatus="Completed" completeActionLabel="Submit Count" formFields={[
{key:'bin',label:'Bin / Location',placeholder:'BIN-A-01'},{key:'sku',label:'SKU',placeholder:'SKU-10050'},{key:'warehouse',label:'Warehouse',type:'select',options:['Dubai Main Warehouse','Free Zone Warehouse']},{key:'systemQty',label:'System Quantity',type:'number',placeholder:'100'}
]} makeRow={(v,n)=>({id:`CNT-${String(93+n).padStart(6,'0')}`,primary:v.bin,secondary:v.sku,warehouse:v.warehouse,qty:v.systemQty,status:'Assigned',extra:{'System Qty':v.systemQty,'Counted Qty':'—'}})} stats={[{label:'Assigned',value:'8',hint:'Open counts',icon:Clock3},{label:'In Progress',value:'4',hint:'Counting now',icon:Boxes},{label:'Completed Today',value:'19',hint:'Submitted counts',icon:CheckCircle2},{label:'Discrepancies',value:'3',hint:'Needs reconciliation',icon:AlertTriangle}]}/>}
