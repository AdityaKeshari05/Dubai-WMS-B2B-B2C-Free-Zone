'use client';
import { Send, Clock3, CheckCircle2, AlertTriangle, Boxes } from 'lucide-react';
import { OperationTaskPage } from '@/components/wms/OperationTaskPage';
const rows=[
{id:'DSP-000098',primary:'SHP-2026-00421',secondary:'DHL Express',warehouse:'Dubai Main Warehouse',qty:'6',status:'Ready',extra:{Carrier:'DHL Express','Packages':'6','Vehicle':'DXB-4231'}},
{id:'DSP-000099',primary:'SHP-2026-00422',secondary:'Aramex',warehouse:'Free Zone Warehouse',qty:'4',status:'Verification',extra:{Carrier:'Aramex','Packages':'4','Vehicle':'FZ-7781'}},
{id:'DSP-000100',primary:'SHP-2026-00423',secondary:'FedEx',warehouse:'Dubai Main Warehouse',qty:'8',status:'Dispatched',extra:{Carrier:'FedEx','Packages':'8','Vehicle':'DXB-5110'}},
];
export default function Page(){return <OperationTaskPage title="Dispatch" description="Verify packages and shipment references before final dispatch." icon={Send} actionLabel="Verify Shipment" formTitle="Create Dispatch Verification" initialRows={rows} primaryLabel="Shipment" secondaryLabel="Carrier" qtyLabel="Packages" nextStatus="Verification" nextActionLabel="Start Verification" completeStatus="Dispatched" completeActionLabel="Confirm Dispatch" formFields={[
{key:'shipment',label:'Shipment ID',placeholder:'SHP-2026-00424'},{key:'carrier',label:'Carrier',type:'select',options:['DHL Express','Aramex','FedEx','Local Fleet']},{key:'warehouse',label:'Warehouse',type:'select',options:['Dubai Main Warehouse','Free Zone Warehouse']},{key:'packages',label:'Package Count',type:'number',placeholder:'5'},{key:'vehicle',label:'Vehicle / Loading Ref',placeholder:'DXB-0001'}
]} makeRow={(v,n)=>({id:`DSP-${String(100+n).padStart(6,'0')}`,primary:v.shipment,secondary:v.carrier,warehouse:v.warehouse,qty:v.packages,status:'Ready',extra:{Carrier:v.carrier,Packages:v.packages,Vehicle:v.vehicle}})} stats={[{label:'Ready',value:'15',hint:'Ready for verification',icon:Clock3},{label:'Verification',value:'6',hint:'Checks in progress',icon:Boxes},{label:'Dispatched Today',value:'31',hint:'Loaded successfully',icon:CheckCircle2},{label:'Exceptions',value:'2',hint:'Blocked shipments',icon:AlertTriangle}]}/>}
