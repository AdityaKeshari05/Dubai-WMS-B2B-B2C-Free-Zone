'use client';
import { Package, Plus, X, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { useWmsDbSelector } from '@/lib/wms/useWmsDb';
import { palletService } from '@/lib/wms/services/palletService';

export function PalletCartonBuilder({ orderId }: { orderId: string }) {
  const pallets = useWmsDbSelector((s) => s.pallets.filter((p) => p.orderId === orderId));
  const packages = useWmsDbSelector((s) => s.packages.filter((p) => p.orderId === orderId));
  const unassigned = packages.filter((p) => !p.palletId);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Pallets &amp; Cartons</h3>
        <Button size="sm" variant="outline" onClick={() => palletService.createPallet(orderId)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />Add Pallet
        </Button>
      </div>

      {pallets.length === 0 ? (
        <EmptyState icon={Layers} title="No pallets yet" description="Group cartons into pallets for bulk shipment handling." />
      ) : (
        <div className="space-y-3">
          {pallets.map((pallet) => (
            <div key={pallet.id} className="rounded-md border border-[#e5e2dc] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{pallet.palletNumber}</span>
                <Button size="sm" variant="ghost" onClick={() => palletService.deletePallet(pallet.id)}>Remove Pallet</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {pallet.cartonIds.map((cid) => {
                  const carton = packages.find((p) => p.id === cid);
                  if (!carton) return null;
                  return (
                    <span key={cid} className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      <Package className="h-3 w-3" /> {carton.packageNumber}
                      <button onClick={() => palletService.removeCarton(pallet.id, cid)} className="text-blue-400 hover:text-blue-700"><X className="h-3 w-3" /></button>
                    </span>
                  );
                })}
                {pallet.cartonIds.length === 0 ? <span className="text-xs text-gray-400">No cartons assigned</span> : null}
              </div>
              {unassigned.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {unassigned.map((pkg) => (
                    <button key={pkg.id} onClick={() => palletService.addCarton(pallet.id, pkg.id)} className="rounded-md border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600">
                      + {pkg.packageNumber}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
