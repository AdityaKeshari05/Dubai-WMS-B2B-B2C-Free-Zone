'use client';
import { PackageCheck, Clock3, CheckCircle2, AlertTriangle, Boxes } from 'lucide-react';
import { OperationTaskPage } from '@/components/wms/OperationTaskPage';

const rows=[
{id:'RCV-000128',primary:'PO-2026-00124',secondary:'Gulf Trading LLC',warehouse:'Dubai Main Warehouse',qty:'12 / 18',status:'In Progress',extra:{Dock:'D-02','Expected Date':'23 Sep 2026'}},
{id:'RCV-000129',primary:'PO-2026-00125',secondary:'Emirates Supply Co.',warehouse:'Free Zone Warehouse',qty:'0 / 24',status:'Pending',extra:{Dock:'FZ-01','Expected Date':'23 Sep 2026'}},
{id:'RCV-000130',primary:'PO-2026-00126',secondary:'Al Noor Distribution',warehouse:'Dubai Main Warehouse',qty:'10 / 10',status:'Completed',extra:{Dock:'D-01','Expected Date':'22 Sep 2026'}},
{id:'RCV-000131',primary:'PO-2026-00127',secondary:'Global Foods FZE',warehouse:'Free Zone Warehouse',qty:'14 / 16',status:'Discrepancy',extra:{Dock:'FZ-03','Expected Date':'22 Sep 2026'}},
];
export default function Page(){return <OperationTaskPage title="Receiving" description="Receive incoming inventory against purchase orders and inbound shipments." icon={PackageCheck} actionLabel="New Receiving" formTitle="Create Receiving Task" initialRows={rows} primaryLabel="Purchase Order" secondaryLabel="Supplier" qtyLabel="Received / Expected" nextStatus="In Progress" nextActionLabel="Start Receiving" completeStatus="Completed" completeActionLabel="Complete Receipt" formFields={[
{key:'po',label:'Purchase Order',placeholder:'PO-2026-00132'},{key:'supplier',label:'Supplier',placeholder:'Supplier name'},{key:'warehouse',label:'Warehouse',type:'select',options:['Dubai Main Warehouse','Free Zone Warehouse']},{key:'expected',label:'Expected Quantity',type:'number',placeholder:'20'},{key:'dock',label:'Dock / Gate',placeholder:'D-01'},{key:'date',label:'Expected Date',placeholder:'24 Sep 2026'}
]} makeRow={(v,n)=>({id:`RCV-${String(131+n).padStart(6,'0')}`,primary:v.po,secondary:v.supplier,warehouse:v.warehouse,qty:`0 / ${v.expected}`,status:'Pending',extra:{Dock:v.dock,'Expected Date':v.date}})} stats={[{label:'Pending',value:'8',hint:'Awaiting receiving',icon:Clock3},{label:'In Progress',value:'4',hint:'Currently receiving',icon:Boxes},{label:'Completed Today',value:'19',hint:'Successfully received',icon:CheckCircle2},{label:'Discrepancies',value:'3',hint:'Require attention',icon:AlertTriangle}]}/>}
