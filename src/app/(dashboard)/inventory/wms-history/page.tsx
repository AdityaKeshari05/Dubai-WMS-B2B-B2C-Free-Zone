'use client';

import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { useWmsDbSelector } from "@/lib/wms/useWmsDb";
import { useWmsLookups } from "@/lib/wms/useLookups";
import { formatDate } from "@/lib/utils";

const TYPE_TONE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  transfer: "default",
  adjustment: "secondary",
  pick: "default",
  return: "default",
  damage: "destructive",
  reconciliation: "outline",
  receipt: "default" };

export default function InventoryHistoryPage() {
  const movements = useWmsDbSelector((s) => s.movements);
  const { products } = useWmsLookups();
  const locations = useWmsDbSelector((s) => s.locations);
  const [type, setType] = useState("all");

  const productMap = new Map(products.map(p => [p.id, p]));
  const locationMap = new Map(locations.map(l => [l.id, l]));

  const filtered = useMemo(() => movements.filter((m) => type === "all" || m.type === type), [movements, type]);

  const columns = [
    { key: "date", header: "Date", render: (m: any) => <span className="text-xs text-gray-500">{formatDate(m.createdAt)}</span> },
    { key: "type", header: "Type", render: (m: any) => <Badge variant={TYPE_TONE[m.type]} className="capitalize">{m.type}</Badge> },
    { key: "product", header: "Product", render: (m: any) => <span className="font-medium text-gray-900">{productMap.get(m.productId)?.name ?? m.productId}</span> },
    { key: "from", header: "From", render: (m: any) => <span className="font-mono text-xs">{m.fromLocationId ? locationMap.get(m.fromLocationId)?.code : "-"}</span> },
    { key: "to", header: "To", render: (m: any) => <span className="font-mono text-xs">{m.toLocationId ? locationMap.get(m.toLocationId)?.code : "-"}</span> },
    { key: "qty", header: "Quantity", className: "text-right", render: (m: any) => m.quantity },
    { key: "reference", header: "Reference", render: (m: any) => <span className="text-xs text-gray-500">{m.referenceLabel ?? m.reason ?? "-"}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory History" description="Full audit trail of every stock movement" />

      <div className="flex">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Movement Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Movement Types</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
            <SelectItem value="pick">Pick</SelectItem>
            <SelectItem value="return">Return</SelectItem>
            <SelectItem value="damage">Damage</SelectItem>
            <SelectItem value="reconciliation">Reconciliation</SelectItem>
            <SelectItem value="receipt">Receipt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No movements found. Inventory movements will appear here as they happen."
      />
    </div>
  );
}
