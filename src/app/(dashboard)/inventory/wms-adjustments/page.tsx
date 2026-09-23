'use client';

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { useWmsDbSelector } from "@/lib/wms/useWmsDb";
import { useWmsLookups } from "@/lib/wms/useLookups";
import { formatDate } from "@/lib/utils";
import { NewAdjustmentModal } from "@/components/wms/inventory/NewAdjustmentModal";

export default function AdjustmentsPage() {
  const adjustments = useWmsDbSelector((s) => s.adjustments);
  const { products, warehouses } = useWmsLookups();
  const locations = useWmsDbSelector((s) => s.locations);
  const [open, setOpen] = useState(false);

  const productMap = new Map(products.map(p => [p.id, p]));
  const warehouseMap = new Map(warehouses.map(w => [w.id, w]));
  const locationMap = new Map(locations.map(l => [l.id, l]));

  const columns = [
    { key: "date", header: "Date", render: (a: any) => <span className="text-xs text-gray-500">{formatDate(a.createdAt)}</span> },
    { key: "product", header: "Product", render: (a: any) => <span className="font-medium text-gray-900">{productMap.get(a.productId)?.name ?? a.productId}</span> },
    { key: "location", header: "Warehouse / Bin", render: (a: any) => <span className="text-xs">{warehouseMap.get(a.warehouseId)?.name} · {locationMap.get(a.locationId)?.code}</span> },
    { key: "type", header: "Type", render: (a: any) => <Badge variant={a.type === "increase" ? "default" : "destructive"} className={a.type === "increase" ? "bg-green-600 hover:bg-green-700" : ""}>{a.type === "increase" ? "Increase" : "Decrease"}</Badge> },
    { key: "qty", header: "Quantity", className: "text-right", render: (a: any) => a.quantity },
    { key: "reason", header: "Reason", render: (a: any) => <span className="text-xs text-gray-500">{a.reason}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Adjustments"
        description="Manual corrections to physical stock quantities"
        children={
          <Button onClick={() => setOpen(true)}>
            <SlidersHorizontal className="mr-2 size-4" /> New Adjustment
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={adjustments}
        emptyMessage="No adjustments yet. Stock adjustments you apply will show up here."
      />
      <NewAdjustmentModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
