'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeftRight, Clock3, FileText, PackageCheck, UserCheck, Users, Warehouse } from 'lucide-react';
import { AnalyticsHeader, Badge, DataTable, ExportButton, Panel, SearchField, SelectField } from '@/components/wms/analytics/AnalyticsUi';

type ReportId='stock-aging'|'inventory-movement'|'pick-performance'|'order-fulfillment'|'warehouse-utilization'|'exceptions'|'client-reports';
type ReportDef={id:ReportId;name:string;description:string;icon:any};
const reports:ReportDef[]=[
  {id:'stock-aging',name:'Stock Aging',description:'How long inventory has remained in storage.',icon:Clock3},
  {id:'inventory-movement',name:'Inventory Movement',description:'Complete SKU movement history across locations.',icon:ArrowLeftRight},
  {id:'pick-performance',name:'Pick Performance',description:'Picker productivity, speed and accuracy.',icon:UserCheck},
  {id:'order-fulfillment',name:'Order Fulfillment',description:'Fulfilment cycle time, SLA and delays.',icon:PackageCheck},
  {id:'warehouse-utilization',name:'Warehouse Utilization',description:'Storage occupancy by warehouse and zone.',icon:Warehouse},
  {id:'exceptions',name:'Exception Report',description:'Shortages, damages, discrepancies and failed operations.',icon:AlertTriangle},
  {id:'client-reports',name:'Customer / Client',description:'3PL client-specific operational summaries.',icon:Users},
];

const data:Record<ReportId,Record<string,string|number>[]>= {
  'stock-aging': [
    {SKU:'SKU-10082',Product:'Wireless Scanner',Warehouse:'Dubai Main Warehouse',OnHand:84,AgeBucket:'0–30 days',DaysStored:18},
    {SKU:'SKU-10441',Product:'Thermal Labels 4x6',Warehouse:'Free Zone Warehouse',OnHand:340,AgeBucket:'31–60 days',DaysStored:46},
    {SKU:'SKU-11207',Product:'Carton - Medium',Warehouse:'Overflow Storage',OnHand:112,AgeBucket:'90+ days',DaysStored:127},
  ],
  'inventory-movement': [
    {Reference:'MOV-00881',SKU:'SKU-10082',Movement:'Bin Transfer',From:'A-01-02',To:'PICK-01',Quantity:12,Date:'23 Sep 2026'},
    {Reference:'MOV-00882',SKU:'SKU-10441',Movement:'Putaway',From:'STAGE-02',To:'FZ-B-04',Quantity:50,Date:'23 Sep 2026'},
    {Reference:'MOV-00883',SKU:'SKU-11207',Movement:'Adjustment',From:'OVR-03',To:'OVR-03',Quantity:-3,Date:'22 Sep 2026'},
  ],
  'pick-performance': [
    {Picker:'Ahmed Khan',Warehouse:'Dubai Main Warehouse',Tasks:46,Units:382,Accuracy:'99.4%',AvgTime:'4m 12s'},
    {Picker:'Sara Malik',Warehouse:'Dubai Main Warehouse',Tasks:41,Units:344,Accuracy:'98.9%',AvgTime:'4m 38s'},
    {Picker:'Omar Noor',Warehouse:'Free Zone Warehouse',Tasks:35,Units:291,Accuracy:'99.7%',AvgTime:'4m 05s'},
  ],
  'order-fulfillment': [
    {Order:'SO-01882',Channel:'B2C',Warehouse:'Dubai Main Warehouse',Created:'09:10',Dispatched:'10:28',CycleTime:'1h 18m',SLA:'Within SLA'},
    {Order:'SO-B2B-1821',Channel:'B2B',Warehouse:'Dubai Main Warehouse',Created:'08:40',Dispatched:'11:05',CycleTime:'2h 25m',SLA:'Within SLA'},
    {Order:'SO-01891',Channel:'B2C',Warehouse:'Free Zone Warehouse',Created:'09:30',Dispatched:'—',CycleTime:'3h 10m',SLA:'Delayed'},
  ],
  'warehouse-utilization': [
    {Warehouse:'Dubai Main Warehouse',Zone:'Bulk Storage',Capacity:10000,Used:7800,Utilization:'78%',Available:2200},
    {Warehouse:'Free Zone Warehouse',Zone:'Bonded Storage',Capacity:5000,Used:3150,Utilization:'63%',Available:1850},
    {Warehouse:'Overflow Storage',Zone:'General',Capacity:2000,Used:820,Utilization:'41%',Available:1180},
  ],
  'exceptions': [
    {Reference:'EXC-00391',Type:'Picking shortage',Warehouse:'Dubai Main Warehouse',Severity:'High',Owner:'Supervisor A',Status:'Open'},
    {Reference:'EXC-00392',Type:'Damaged inbound',Warehouse:'Free Zone Warehouse',Severity:'Critical',Owner:'Sara Malik',Status:'Blocked'},
    {Reference:'EXC-00393',Type:'Stock discrepancy',Warehouse:'Dubai Main Warehouse',Severity:'Medium',Owner:'Inventory Team',Status:'Review'},
  ],
  'client-reports': [
    {Client:'Retail Group LLC',Orders:184,InboundUnits:4200,OutboundUnits:3870,StorageUnits:11240,SLA:'98.2%'},
    {Client:'Metro Trading',Orders:96,InboundUnits:2180,OutboundUnits:1960,StorageUnits:6420,SLA:'96.7%'},
    {Client:'Gulf Wholesale',Orders:73,InboundUnits:1760,OutboundUnits:1420,StorageUnits:5180,SLA:'93.4%'},
  ],
};

export default function ReportsPage(){
  const[active,setActive]=useState<ReportId>('stock-aging');
  const[search,setSearch]=useState('');
  const[warehouse,setWarehouse]=useState('All Warehouses');
  const[range,setRange]=useState('Last 30 days');
  const activeDef=reports.find(r=>r.id===active)!;
  const availableWarehouses=['All Warehouses','Dubai Main Warehouse','Free Zone Warehouse','Overflow Storage'];
  const filtered=useMemo(()=>data[active].filter(row=>{
    const query=search.toLowerCase();
    const text=Object.values(row).join(' ').toLowerCase();
    const rowWarehouse=String(row.Warehouse ?? '');
    return (!query||text.includes(query)) && (warehouse==='All Warehouses'||!rowWarehouse||rowWarehouse===warehouse);
  }),[active,search,warehouse]);
  const columns=filtered.length?Object.keys(filtered[0]):Object.keys(data[active][0]??{});
  return <div className="space-y-5">
    <AnalyticsHeader title="WMS Reports" description="Open operational reports, filter data and export the current view." icon={FileText}>
      <SelectField value={range} onChange={setRange}><option>Today</option><option>Last 7 days</option><option>Last 30 days</option><option>This quarter</option></SelectField>
      <SelectField value={warehouse} onChange={setWarehouse}>{availableWarehouses.map(w=><option key={w}>{w}</option>)}</SelectField>
      <ExportButton filename={activeDef.id} rows={filtered}/>
    </AnalyticsHeader>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {reports.map(report=>{const Icon=report.icon;const selected=report.id===active;return <button key={report.id} type="button" onClick={()=>{setActive(report.id);setSearch('')}} className={`rounded-lg border p-4 text-left shadow-sm transition ${selected?'border-[#2490ef] bg-[#eef6ff]':'border-[#e5e2dc] bg-white hover:border-[#cddceb]'}`}><Icon className={`h-5 w-5 ${selected?'text-[#2490ef]':'text-[#7c8591]'}`}/><p className="mt-3 text-sm font-semibold text-[#1f2937]">{report.name}</p></button>})}
    </div>

    <Panel title={activeDef.name} description={`${activeDef.description} · ${range}`} action={<div className="w-72"><SearchField value={search} onChange={setSearch} placeholder="Search current report..."/></div>}>
      <DataTable rows={filtered} rowKey={(row)=>String(row[columns[0]] ?? JSON.stringify(row))} columns={columns.map(column=>({label:column,render:(row: Record<string, string | number>)=>{
        const value=row[column];
        if(column==='SLA' && (value==='Delayed'||value==='Within SLA')) return <Badge tone={value==='Delayed'?'red':'green'}>{String(value)}</Badge>;
        if(column==='Severity') return <Badge tone={value==='Critical'?'red':value==='High'?'amber':'blue'}>{String(value)}</Badge>;
        if(column==='Status') return <Badge tone={value==='Blocked'?'red':value==='Open'?'amber':'blue'}>{String(value)}</Badge>;
        return String(value);
      }}))}/>
      <div className="flex flex-col gap-2 border-t border-[#e5e2dc] px-5 py-3 text-xs text-[#7c8591] sm:flex-row sm:items-center sm:justify-between"><span>{filtered.length} record{filtered.length===1?'':'s'} shown</span><span>Filters: {range} · {warehouse}</span></div>
    </Panel>
  </div>;
}
