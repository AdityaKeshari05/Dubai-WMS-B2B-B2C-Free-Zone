'use client';
import { Archive, Clock3, CheckCircle2, AlertTriangle, Boxes } from 'lucide-react';
import { OperationTaskPage } from '@/components/wms/OperationTaskPage';
const rows=[
{id:'PUT-000231',primary:'SKU-10024',secondary:'Staging A → BIN-A-01',warehouse:'Dubai Main Warehouse',qty:'24',status:'Pending',extra:{Source:'Staging A','Suggested Bin':'BIN-A-01'}},
{id:'PUT-000232',primary:'SKU-10041',secondary:'Receiving → FZ-B-14',warehouse:'Free Zone Warehouse',qty:'12',status:'In Progress',extra:{Source:'Receiving','Suggested Bin':'FZ-B-14'}},
{id:'PUT-000233',primary:'SKU-10110',secondary:'Staging B → BIN-C-08',warehouse:'Dubai Main Warehouse',qty:'40',status:'Completed',extra:{Source:'Staging B','Suggested Bin':'BIN-C-08'}},
];
export default function Page(){return <OperationTaskPage title="Putaway" description="Move received inventory from staging into suggested warehouse bins." icon={Archive} actionLabel="Create Putaway" formTitle="Create Putaway Task" initialRows={rows} primaryLabel="SKU" secondaryLabel="Movement" qtyLabel="Qty" nextStatus="In Progress" nextActionLabel="Start Putaway" completeStatus="Completed" completeActionLabel="Confirm Putaway" formFields={[
{key:'sku',label:'SKU',placeholder:'SKU-10050'},{key:'source',label:'Source Location',placeholder:'Staging A'},{key:'destination',label:'Suggested / Destination Bin',placeholder:'BIN-A-05'},{key:'warehouse',label:'Warehouse',type:'select',options:['Dubai Main Warehouse','Free Zone Warehouse']},{key:'qty',label:'Quantity',type:'number',placeholder:'20'}
]} makeRow={(v,n)=>({id:`PUT-${String(233+n).padStart(6,'0')}`,primary:v.sku,secondary:`${v.source} → ${v.destination}`,warehouse:v.warehouse,qty:v.qty,status:'Pending',extra:{Source:v.source,'Suggested Bin':v.destination}})} stats={[{label:'Pending',value:'8',hint:'Awaiting putaway',icon:Clock3},{label:'In Progress',value:'4',hint:'Active tasks',icon:Boxes},{label:'Completed Today',value:'19',hint:'Bins confirmed',icon:CheckCircle2},{label:'Exceptions',value:'3',hint:'Location issues',icon:AlertTriangle}]}/>}
