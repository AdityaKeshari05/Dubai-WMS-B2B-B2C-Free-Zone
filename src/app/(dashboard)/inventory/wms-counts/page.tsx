'use client';

import { useState } from "react";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { useWmsDbSelector } from "@/lib/wms/useWmsDb";
import { useWmsLookups } from "@/lib/wms/useLookups";
import { formatDate } from "@/lib/utils";
import { NewCycleCountModal } from "@/components/wms/inventory/NewCycleCountModal";

const STATUS_TONE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  in_progress: "default",
  completed: "default",
  reconciled: "outline",
  cancelled: "destructive" };
const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  in_progress: "In Progress",
  completed: "Completed",
  reconciled: "Reconciled",
  cancelled: "Cancelled" };

export default function CycleCountsPage() {
  const counts = useWmsDbSelector((s) => s.cycleCounts);
  const { warehouses } = useWmsLookups();
  const [open, setOpen] = useState(false);

  const warehouseMap = new Map(warehouses.map(w => [w.id, w]));
  
  const sortedCounts = [...counts].reverse();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Counts"
        description="Cycle counts and full physical stock counts, with reconciliation"
      >
        <Button onClick={() => setOpen(true)}>
          <ClipboardCheck className="mr-2 size-4" /> New Count
        </Button>
      </PageHeader>
      <DataTable
        data={sortedCounts}
        columns={[
          { key: "countNumber", header: "Count #", render: (c) => <span className="font-medium text-gray-900">{c.countNumber}</span> },
          { key: "type", header: "Type", render: (c) => <Badge variant={c.countType === "physical" ? "purple" : "outline"}>{c.countType === "physical" ? "Physical" : "Cycle"}</Badge> },
          { key: "warehouse", header: "Warehouse", render: (c) => warehouseMap.get(c.warehouseId)?.name },
          { key: "zone", header: "Zone", render: (c) => c.zone ?? "All" },
          { key: "assigned", header: "Assigned", render: (c) => c.assignedUser },
          { key: "date", header: "Date", render: (c) => <span className="text-xs text-gray-500">{formatDate(c.countDate)}</span> },
          { key: "lines", header: "Lines", render: (c) => c.lines.length },
          { key: "status", header: "Status", render: (c) => <Badge variant={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge> },
          { key: "actions", header: "", render: (c) => (
            <Link href={`/inventory/wms-counts/${c.id}`}>
              <Button size="sm" variant="ghost">Open</Button>
            </Link>
          ) },
        ]}
        emptyMessage="No cycle counts yet. Create a count session to start reconciling stock."
      />
      <NewCycleCountModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
