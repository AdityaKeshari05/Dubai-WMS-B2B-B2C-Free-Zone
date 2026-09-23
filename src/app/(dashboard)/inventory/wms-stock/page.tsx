'use client';

import { useMemo, useState } from "react";
import { ArrowLeftRight, Building2, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { useInventoryRows } from "@/components/wms/inventory/useInventory";
import { useWmsLookups } from "@/lib/wms/useLookups";
import { InventoryStatsBar } from "@/components/wms/inventory/InventoryStatsBar";
import { InventoryDetailDrawer } from "@/components/wms/inventory/InventoryDetailDrawer";
import { TransferModal } from "@/components/wms/inventory/TransferModal";
import type { InventoryRow } from "@/components/wms/inventory/useInventory";

const STOCK_STATE_TONE: Record<InventoryRow["stockState"], "default" | "secondary" | "destructive" | "outline"> = {
  in_stock: "default",
  low_stock: "secondary",
  out_of_stock: "destructive",
  damaged: "destructive",
};
const STOCK_STATE_LABEL: Record<InventoryRow["stockState"], string> = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  damaged: "Damaged",
};

export default function InventoryStockPage() {
  const rows = useInventoryRows();
  const { warehouses } = useWmsLookups();

  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState<false | "stock" | "warehouse">(false);

  const selected = selectedId ? (rows.find((r) => r.item.id === selectedId) ?? null) : null;

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (warehouseId !== "all" && r.warehouse.id !== warehouseId) return false;
      if (status !== "all" && r.stockState !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.product.sku.toLowerCase().includes(q) && !r.product.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [rows, warehouseId, status, search]);

  const tableData = filtered.map(r => ({ ...r, id: r.item.id }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="WMS Stock"
        description="Monitor stock across warehouses, bins and inventory states"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTransferOpen("stock")}>
            <ArrowLeftRight className="mr-2 size-4" /> Stock Transfer
          </Button>
          <Button variant="outline" onClick={() => setTransferOpen("warehouse")}>
            <Building2 className="mr-2 size-4" /> Warehouse Transfer
          </Button>
        </div>
      </PageHeader>

      <InventoryStatsBar />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search by SKU or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={warehouseId} onValueChange={setWarehouseId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Warehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Stock States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock States</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="damaged">Damaged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={tableData}
        keyField="id"
        columns={[
          { key: "sku", header: "SKU", render: (r) => <span className="font-mono text-xs text-gray-500">{r.product.sku}</span> },
          { key: "product", header: "Product", render: (r) => <span className="font-medium text-gray-900">{r.product.name}</span> },
          { key: "warehouse", header: "Warehouse", render: (r) => r.warehouse.name },
          { key: "bin", header: "Bin", render: (r) => <span className="font-mono text-xs">{r.location.code}</span> },
          { key: "batch", header: "Batch", render: (r) => <span className="text-xs text-gray-500">{r.batch?.batchNumber ?? "-"}</span> },
          { key: "physical", header: "Physical", className: "text-right", render: (r) => r.item.physicalQty },
          { key: "reserved", header: "Reserved", className: "text-right", render: (r) => r.item.reservedQty },
          { key: "available", header: "Available", className: "text-right", render: (r) => <span className="font-medium text-gray-900">{r.availableQty}</span> },
          { key: "damaged", header: "Damaged", className: "text-right", render: (r) => r.item.damagedQty },
          { key: "status", header: "Status", render: (r) => <Badge variant={STOCK_STATE_TONE[r.stockState]}>{STOCK_STATE_LABEL[r.stockState]}</Badge> },
          { key: "actions", header: "Actions", render: (r) => <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedId(r.item.id); }}>View</Button> },
        ]}
        emptyMessage="No inventory found. Try adjusting your filters or search term."
        onRowClick={(r) => setSelectedId(r.item.id)}
      />

      <InventoryDetailDrawer row={selected} onClose={() => setSelectedId(null)} />
      <TransferModal
        open={!!transferOpen}
        onOpenChange={(v) => setTransferOpen(v ? transferOpen : false)}
        warehouseScope={transferOpen === "warehouse" ? "cross_warehouse" : undefined}
      />
    </div>
  );
}
