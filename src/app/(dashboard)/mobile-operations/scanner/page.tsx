'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Keyboard, ScanLine, XCircle } from 'lucide-react';
import { Card, PageHeader, PrimaryButton, SecondaryButton, Toast } from '@/components/wms/WmsUi';

export default function ScannerPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [toast, setToast] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  const scan = () => {
    const normalized = code.trim();
    setResult(normalized ? 'success' : 'error');
    if (normalized) setToast(`Barcode ${normalized} scanned.`);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API is not supported in this browser.');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(()=>{}); } });
    } catch (e) {
      setCameraError(e instanceof Error ? e.message : 'Camera permission was denied.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null; setCameraOn(false);
  };

  const simulateCameraScan = () => {
    setCode('SKU-10024'); setResult('success'); setToast('Camera scan simulated: SKU-10024');
  };

  return <div className="space-y-5">
    <PageHeader title="Barcode Scanner" description="Scan SKU, bin, pallet and shipment barcodes using camera or manual entry." icon={ScanLine}/>
    <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <Card title="Camera scanner" description="Camera preview works in supported browsers; barcode recognition is simulated for this frontend demo.">
        <div className="p-5">
          <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[#cfd8df] bg-[#111827]">
            {cameraOn ? <><video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full object-cover"/><div className="pointer-events-none absolute inset-[18%] rounded-lg border-2 border-[#2490ef] shadow-[0_0_0_9999px_rgba(0,0,0,.25)]"/><div className="absolute bottom-3 rounded bg-black/60 px-3 py-1 text-xs text-white">Align barcode inside the frame</div></> : <div className="text-center text-white"><Camera className="mx-auto h-12 w-12 text-[#2490ef]"/><p className="mt-3 text-sm font-medium">Camera is off</p><p className="mt-1 text-xs text-gray-400">Start camera to show a live preview.</p></div>}
          </div>
          {cameraError && <p className="mt-2 text-xs text-red-600">{cameraError}</p>}
          <div className="mt-4 flex flex-wrap gap-2">{!cameraOn?<PrimaryButton onClick={startCamera}><Camera className="h-4 w-4"/>Start Camera</PrimaryButton>:<><SecondaryButton onClick={stopCamera}>Stop Camera</SecondaryButton><PrimaryButton onClick={simulateCameraScan}><ScanLine className="h-4 w-4"/>Simulate Scan</PrimaryButton></>}</div>

          <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-[#ece9e4]"/><span className="text-xs text-[#8a929d]">OR ENTER MANUALLY</span><div className="h-px flex-1 bg-[#ece9e4]"/></div>
          <div className="flex gap-2"><div className="relative flex-1"><Keyboard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa1aa]"/><input value={code} onChange={e=>{setCode(e.target.value);setResult('idle')}} onKeyDown={e=>{if(e.key==='Enter')scan()}} placeholder="SKU-10024 / BIN-A-01 / SHP-2026-00421" className="h-10 w-full rounded-md border border-[#dcd8d1] pl-9 pr-3 text-sm outline-none focus:border-[#2490ef]"/></div><PrimaryButton onClick={scan}>Scan</PrimaryButton></div>
        </div>
      </Card>

      <Card title="Scan result" description="Mock lookup result for the scanned code.">
        <div className="p-5">
          {result==='idle'&&<div className="py-12 text-center"><ScanLine className="mx-auto h-9 w-9 text-[#b7bdc5]"/><p className="mt-3 text-sm text-[#8a929d]">No barcode scanned yet.</p></div>}
          {result==='success'&&<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><CheckCircle2 className="h-5 w-5 text-emerald-600"/><p className="mt-2 text-sm font-medium text-emerald-800">Barcode found</p><dl className="mt-4 space-y-3 text-sm"><Result label="Code" value={code}/><Result label="Type" value={code.startsWith('BIN')?'Location':code.startsWith('SHP')?'Shipment':'SKU'}/><Result label="Description" value="Demo warehouse record"/><Result label="Location" value="BIN-A-01"/><Result label="Available" value="120 units"/></dl></div>}
          {result==='error'&&<div className="rounded-lg border border-red-200 bg-red-50 p-4"><XCircle className="h-5 w-5 text-red-600"/><p className="mt-2 text-sm font-medium text-red-800">Enter or scan a barcode first.</p></div>}
        </div>
      </Card>
    </div>
    {toast&&<Toast message={toast} onClose={()=>setToast('')}/>} 
  </div>;
}
function Result({label,value}:{label:string;value:string}){return <div className="flex justify-between gap-3 border-b border-emerald-100 pb-2 last:border-0"><dt className="text-[#7c8591]">{label}</dt><dd className="text-right font-medium text-[#1f2937]">{value}</dd></div>}
