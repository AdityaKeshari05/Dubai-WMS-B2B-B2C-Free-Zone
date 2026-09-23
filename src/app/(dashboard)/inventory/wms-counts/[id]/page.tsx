'use client';

import { use, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useWmsDbSelector } from "@/lib/wms/useWmsDb";
import { useWmsLookups } from "@/lib/wms/useLookups";
import { cycleCountService } from "@/lib/wms/cycleCountService";
import toast from "react-hot-toast";
import Link from "next/link";

const LINE_TONE: Record<string, "default" | "secondary" | "destructive" | "outline"> = { 
  pending: "secondary", 
  match: "default", 
  shortage: "destructive", 
  excess: "default" 
};

export default function CycleCountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const count = useWmsDbSelector((s) => s.cycleCounts).find((c) => c.id === id);
  const { products, warehouses } = useWmsLookups();
  const locations = useWmsDbSelector((s) => s.locations);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const productMap = new Map(products.map(p => [p.id, p]));
  const locationMap = new Map(locations.map(l => [l.id, l]));
  const warehouseMap = new Map(warehouses.map(w => [w.id, w]));

  if (!count) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cycle Count" />
        <p className="text-sm text-gray-500">Count session not found.</p>
      </div>
    );
  }

  const allCounted = count.lines.every((l) => l.countedQty !== null);
  const diffSummary = count.lines.reduce(
    (acc, l) => {
      if (l.status === "shortage") acc.shortage++;
      if (l.status === "excess") acc.excess++;
      if (l.status === "match") acc.match++;
      return acc;
    },
    { shortage: 0, excess: 0, match: 0 }
  );

  function handleApply() {
    cycleCountService.applyReconciliation(count!.id);
    toast.success("Inventory quantities have been updated.");
    setConfirmOpen(false);
  }

  const columns = [
    { key: "sku", header: "SKU", render: (line: any) => <span className="font-mono text-xs text-gray-500">{productMap.get(line.productId)?.sku}</span> },
    { key: "product", header: "Product", render: (line: any) => <span className="font-medium text-gray-900">{productMap.get(line.productId)?.name}</span> },
    { key: "bin", header: "Bin", render: (line: any) => <span className="font-mono text-xs">{locationMap.get(line.locationId)?.code}</span> },
    { key: "expected", header: "Expected", className: "text-right", render: (line: any) => line.expectedQty },
    { key: "counted", header: "Counted", className: "text-right", render: (line: any) => (
      <input
        type="number"
        min={0}
        disabled={count.status === "reconciled"}
        defaultValue={line.countedQty ?? ""}
        onBlur={(e) => {
          const val = e.target.value === "" ? null : Number(e.target.value);
          if (val !== null) cycleCountService.enterCount(count.id, line.id, val);
        }}
        className="w-20 rounded-md border border-gray-300 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
        placeholder="-"
      />
    )},
    { key: "diff", header: "Difference", className: "text-right", render: (line: any) => {
      const diff = line.countedQty === null ? null : line.countedQty - line.expectedQty;
      return <span className={`font-medium ${diff && diff < 0 ? "text-red-600" : diff && diff > 0 ? "text-amber-600" : "text-gray-500"}`}>
        {diff === null ? "-" : diff > 0 ? `+${diff}` : diff}
      </span>;
    }},
    { key: "status", header: "Status", render: (line: any) => <Badge variant={LINE_TONE[line.status as keyof typeof LINE_TONE]} className="capitalize">{line.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <Link href="/inventory/wms-counts" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="size-3.5" /> Back to Cycle Counts
      </Link>
      
      <PageHeader
        title={count.countNumber}
        description={`${warehouseMap.get(count.warehouseId)?.name} ${count.zone ? `· Zone ${count.zone}` : ""} · Assigned to ${count.assignedUser}`}
        children={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">{count.status}</Badge>
            {count.status !== "reconciled" ? (
              <Button
                disabled={!allCounted}
                onClick={() => {
                  if (count.status !== "completed") cycleCountService.markCompleted(count.id);
                  setConfirmOpen(true);
                }}
              >
                <CheckCircle2 className="mr-2 size-4" /> Apply Reconciliation
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="flex gap-4 text-sm">
        <span className="text-gray-500">Match: <span className="font-semibold text-green-600">{diffSummary.match}</span></span>
        <span className="text-gray-500">Shortage: <span className="font-semibold text-red-600">{diffSummary.shortage}</span></span>
        <span className="text-gray-500">Excess: <span className="font-semibold text-amber-600">{diffSummary.excess}</span></span>
      </div>

      <DataTable
        columns={columns}
        data={count.lines}
        emptyMessage="No lines found in this count session."
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Reconciliation</DialogTitle>
            <DialogDescription>
              This will update physical inventory quantities to match the counted values and record a reconciliation movement for each difference.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleApply}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
