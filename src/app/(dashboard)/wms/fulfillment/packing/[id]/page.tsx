'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, Circle, Tag } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { useWmsLookups } from '@/lib/wms/useLookups';
import { PACKAGE_STATUS } from '@/lib/wms/status';
import { packingService } from '@/lib/wms/services/packingService';
import type { PackageUnit } from '@/types';

const CARRIERS = ['Aramex', 'DHL Express', 'Emirates Post', 'Fetchr', 'SMSA Express'];

export default function PackageDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products } = useWmsLookups();
  const pkg = useWmsDbSelector((s) => s.packages.find((p) => p.id === id));
  const productMap = new Map(products.map((p) => [p.id, p]));
  const [carrier, setCarrier] = useState(CARRIERS[0]);

  if (!pkg) {
    return <div><PageHeader title="Package Not Found" /></div>;
  }

  const orderHref = pkg.orderType === 'b2b' ? `/wms/b2b/${pkg.orderId}` : `/b2c/${pkg.orderId}`;
  const v = pkg.verification;
  const readyToMarkPacked = v.skuVerified && v.quantityVerified && v.packageSelected && v.labelGenerated && pkg.status !== 'packed';

  function toggle(field: keyof PackageUnit['verification']) {
    packingService.setVerification(pkg!.id, field, !v[field]);
  }
  function handleGenerateLabel() {
    packingService.generateLabel(pkg!.id, carrier);
    toast.success(`Shipping label created via ${carrier}`);
  }
  function handleMarkPacked() {
    try {
      packingService.markPacked(pkg!.id);
      toast.success(`${pkg!.packageNumber} is ready to ship`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Cannot mark packed');
    }
  }

  const checks: { key: keyof PackageUnit['verification']; label: string }[] = [
    { key: 'skuVerified', label: 'SKU verified' },
    { key: 'quantityVerified', label: 'Quantity verified' },
    { key: 'packageSelected', label: 'Package selected' },
    { key: 'labelGenerated', label: 'Shipping label generated' },
  ];

  return (
    <div>
      <Link href="/wms/fulfillment/packing" className="mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Packing
      </Link>
      <PageHeader title={pkg.packageNumber} description={`${pkg.boxType.replace('_', ' ')} · ${pkg.weightKg}kg`}>
        <Badge variant={PACKAGE_STATUS.variant(pkg.status)}>{PACKAGE_STATUS.label(pkg.status)}</Badge>
      </PageHeader>
      <p className="mb-4 text-xs text-gray-400"><Link href={orderHref} className="text-[#2490ef] hover:underline">View order</Link></p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card><CardContent className="pt-4">
            <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Items in Package</h3>
            <ul className="space-y-1.5 text-sm">
              {pkg.items.map((i, idx) => (
                <li key={idx} className="flex items-center justify-between"><span className="text-gray-800">{productMap.get(i.productId)?.name}</span><span className="font-medium text-gray-900">× {i.qty}</span></li>
              ))}
            </ul>
          </CardContent></Card>

          <Card><CardContent className="pt-4">
            <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Packaging Verification</h3>
            <div className="space-y-2">
              {checks.map((c) => (
                <button key={c.key} onClick={() => c.key !== 'labelGenerated' && toggle(c.key)} disabled={c.key === 'labelGenerated'} className="flex w-full items-center gap-2 rounded-md border border-[#e5e2dc] px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">
                  {v[c.key] ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-gray-300" />}
                  {c.label}
                </button>
              ))}
            </div>

            {!v.labelGenerated ? (
              <div className="mt-3 flex items-center gap-2">
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>{CARRIERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                <Button size="sm" onClick={handleGenerateLabel}><Tag className="mr-1.5 h-3.5 w-3.5" />Generate Label</Button>
              </div>
            ) : null}

            <Button className="mt-4 w-full" disabled={!readyToMarkPacked} onClick={handleMarkPacked}>Mark Packed</Button>
          </CardContent></Card>
        </div>

        <Card><CardContent className="pt-4">
          <h3 className="mb-3 text-xs font-semibold uppercase text-gray-500">Shipping Label Preview</h3>
          {pkg.shippingLabel ? (
            <div className="rounded-md border-2 border-dashed border-gray-300 p-4 font-mono text-xs">
              <div className="mb-2 flex items-center justify-between border-b border-gray-200 pb-2"><span className="text-sm font-bold">{pkg.shippingLabel.carrier}</span><span>{pkg.packageNumber}</span></div>
              <div className="mb-2"><div className="text-[10px] text-gray-400">TRACKING NUMBER</div><div className="text-base font-bold tracking-wider">{pkg.shippingLabel.trackingNumber}</div></div>
              <div className="my-3 flex h-10 items-end gap-0.5">
                {Array.from({ length: 40 }).map((_, i) => <span key={i} style={{ height: `${20 + ((i * 37) % 20)}px` }} className="w-1 bg-gray-800" />)}
              </div>
              <div className="text-[10px] text-gray-400">WEIGHT</div>
              <div>{pkg.weightKg} kg · {pkg.dimensions.l}×{pkg.dimensions.w}×{pkg.dimensions.h} cm</div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Generate a shipping label to preview it here.</p>
          )}
        </CardContent></Card>
      </div>
    </div>
  );
}
