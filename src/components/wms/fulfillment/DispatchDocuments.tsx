'use client';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Shipment, PackageUnit, Product } from '@/types';

export function DispatchDocuments({
  shipment,
  packages,
  productMap,
  customerName,
  orderNumber,
  address,
}: {
  shipment: Shipment;
  packages: PackageUnit[];
  productMap: Map<string, Product>;
  customerName: string;
  orderNumber: string;
  address: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center justify-between">
          <Tabs defaultValue="packing_slip">
            <TabsList>
              <TabsTrigger value="packing_slip">Packing Slip</TabsTrigger>
              <TabsTrigger value="dispatch_note">Dispatch Note</TabsTrigger>
              <TabsTrigger value="shipment_summary">Shipment Summary</TabsTrigger>
            </TabsList>
            <Button size="sm" variant="outline" className="ml-2" onClick={() => window.print()}>
              <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
            </Button>

            <TabsContent value="packing_slip">
              <DocumentShell shipment={shipment}>
                <h3 className="mb-3 text-center text-sm font-bold uppercase tracking-wide">Packing Slip</h3>
                <p className="mb-1">Order: <strong>{orderNumber}</strong></p>
                <p className="mb-3">Ship To: {address}</p>
                <table className="w-full border-collapse text-xs">
                  <thead><tr className="border-b border-gray-300"><th className="py-1 text-left">Product</th><th className="py-1 text-right">Qty</th></tr></thead>
                  <tbody>
                    {packages.flatMap((p) => p.items).map((i, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-1">{productMap.get(i.productId)?.name}</td>
                        <td className="py-1 text-right">{i.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DocumentShell>
            </TabsContent>

            <TabsContent value="dispatch_note">
              <DocumentShell shipment={shipment}>
                <h3 className="mb-3 text-center text-sm font-bold uppercase tracking-wide">Dispatch Note</h3>
                <p className="mb-1">Carrier: <strong>{shipment.carrier}</strong></p>
                <p className="mb-1">Tracking #: <strong>{shipment.trackingNumber}</strong></p>
                <p className="mb-1">Packages: {shipment.packageIds.length}</p>
                <p className="mb-3">Dispatched: {shipment.dispatchedAt ? formatDateTime(shipment.dispatchedAt) : 'Pending'}</p>
                <p className="text-xs text-gray-500">Received in good order by warehouse dispatch team. Signature: ___________________</p>
              </DocumentShell>
            </TabsContent>

            <TabsContent value="shipment_summary">
              <DocumentShell shipment={shipment}>
                <h3 className="mb-3 text-center text-sm font-bold uppercase tracking-wide">Shipment Summary</h3>
                <p className="mb-1">Order: <strong>{orderNumber}</strong></p>
                <p className="mb-1">Customer: {customerName}</p>
                <p className="mb-1">Carrier: {shipment.carrier} · {shipment.trackingNumber}</p>
                <p className="mb-3">Status: {shipment.status.replace('_', ' ')}</p>
                <ul className="list-disc pl-4 text-xs">
                  {packages.map((p) => <li key={p.id}>{p.packageNumber} — {p.boxType.replace('_', ' ')}, {p.weightKg}kg</li>)}
                </ul>
              </DocumentShell>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentShell({ shipment, children }: { shipment: Shipment; children: React.ReactNode }) {
  return (
    <div className="mx-auto mt-4 max-w-lg border border-gray-200 p-6 text-sm">
      <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
        <div className="text-base font-bold text-gray-900">Orus WMS</div>
        <div className="text-right text-xs text-gray-500">
          <div>{formatDate(shipment.createdAt)}</div>
          <div>{shipment.shipmentNumber}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
