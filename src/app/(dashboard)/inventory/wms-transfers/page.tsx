'use client';

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { useWmsDbSelector } from "@/lib/wms/useWmsDb";
import { useWmsLookups } from "@/lib/wms/useLookups";
import { formatDate } from "@/lib/utils";
import { TransferModal } from "@/components/wms/inventory/TransferModal";

export default function TransfersPage() {
  const movements = useWmsDbSelector((s) => s.movements).filter((m) => m.type === "transfer");
  const { products } = useWmsLookups();
  const locations = useWmsDbSelector((s) => s.locations);
  const [open, setOpen] = useState(false);

  const productMap = new Map(products.map(p => [p.id, p]));
  const locationMap = new Map(locations.map(l => [l.id, l]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Transfers"
        description="Movements between bins and warehouses"
      >
        <Button onClick={() => setOpen(true)}>
          <ArrowLeftRight className="mr-2 size-4" /> New Transfer
        </Button>
      </PageHeader>
      <DataTable
        data={movements}
        columns={[
          { key: "date", header: "Date", render: (m) => <span className="text-xs text-gray-500">{formatDate(m.createdAt)}</span> },
          { key: "product", header: "Product", render: (m) => <span className="font-medium text-gray-900">{productMap.get(m.productId)?.name ?? m.productId}</span> },
          { key: "from", header: "From", render: (m) => <span className="font-mono text-xs">{m.fromLocationId ? locationMap.get(m.fromLocationId)?.code : "-"}</span> },
          { key: "to", header: "To", render: (m) => <span className="font-mono text-xs">{m.toLocationId ? locationMap.get(m.toLocationId)?.code : "-"}</span> },
          { key: "qty", header: "Quantity", className: "text-right", render: (m) => m.quantity },
          { key: "reason", header: "Reason", render: (m) => <span className="text-xs text-gray-500">{m.reason ?? "-"}</span> },
        ]}
        emptyMessage="No transfers yet. Transfers you create will show up here."
      />
      <TransferModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
