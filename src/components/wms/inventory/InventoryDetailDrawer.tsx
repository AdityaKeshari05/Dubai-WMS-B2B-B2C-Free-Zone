'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, SlidersHorizontal, AlertTriangle } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useWmsDbSelector } from "@/lib/wms/useWmsDb";
import { TransferModal } from "./TransferModal";
import { AdjustStockModal } from "./AdjustStockModal";
import { MarkDamagedModal } from "./MarkDamagedModal";
import type { InventoryRow } from "./useInventory";

function daysUntil(dateString: string): number {
  const diff = new Date(dateString).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
}

export function InventoryDetailDrawer({ row, onClose }: { row: InventoryRow | null; onClose: () => void }) {
  const [modal, setModal] = useState<"transfer" | "adjust" | "damage" | null>(null);
  const movements = useWmsDbSelector((s) => s.movements).filter((m) => m.productId === row?.product.id).slice(0, 8);

  const batchDays = row?.batch ? daysUntil(row.batch.expiryDate) : null;

  return (
    <>
      <Drawer open={!!row} onOpenChange={(open) => { if (!open) onClose(); }}>
        {row && (
          <DrawerContent width="md">
            <DrawerHeader>
              <DrawerTitle>{row.product.name}</DrawerTitle>
              <DrawerDescription>{row.product.sku}</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <div className="mb-5 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setModal("transfer")}>
                  <ArrowLeftRight className="mr-2 size-3.5" /> Transfer
                </Button>
                <Button size="sm" variant="outline" onClick={() => setModal("adjust")}>
                  <SlidersHorizontal className="mr-2 size-3.5" /> Adjust Stock
                </Button>
                <Button size="sm" variant="outline" onClick={() => setModal("damage")}>
                  <AlertTriangle className="mr-2 size-3.5" /> Mark Damaged
                </Button>
                <Link href="/inventory/wms-history">
                  <Button size="sm" variant="ghost">View History</Button>
                </Link>
              </div>

              <section className="mb-5">
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Product Information</h3>
                <div className="grid grid-cols-2 gap-y-2 rounded-lg border border-gray-200 p-3 text-sm">
                  <span className="text-gray-500">Category</span>
                  <span className="text-gray-900">{row.product.category?.name ?? "-"}</span>
                  <span className="text-gray-500">UOM</span>
                  <span className="text-gray-900">{row.product.unit?.symbol ?? row.product.unit?.name ?? "-"}</span>
                  <span className="text-gray-500">Cost Price</span>
                  <span className="text-gray-900">{formatCurrency(row.product.costPrice)}</span>
                  <span className="text-gray-500">Sale Price</span>
                  <span className="text-gray-900">{formatCurrency(row.product.salePrice)}</span>
                </div>
              </section>

              <section className="mb-5">
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Warehouse & Location</h3>
                <div className="grid grid-cols-2 gap-y-2 rounded-lg border border-gray-200 p-3 text-sm">
                  <span className="text-gray-500">Warehouse</span>
                  <span className="text-gray-900">{row.warehouse.name}</span>
                  <span className="text-gray-500">Bin</span>
                  <span className="text-gray-900">{row.location.code} (Zone {row.location.zone})</span>
                  {row.batch ? (
                    <>
                      <span className="text-gray-500">Batch</span>
                      <span className="text-gray-900">{row.batch.batchNumber}</span>
                      <span className="text-gray-500">Expiry</span>
                      <span className="text-gray-900 flex items-center gap-1.5">
                        {row.batch.expiryDate}
                        {batchDays !== null && batchDays < 60 ? (
                          <Badge variant={batchDays < 0 ? "destructive" : "secondary"}>
                            {batchDays < 0 ? "Expired" : "Near Expiry"}
                          </Badge>
                        ) : null}
                      </span>
                    </>
                  ) : null}
                </div>
              </section>

              <section className="mb-5">
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Stock Breakdown</h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Physical", value: row.item.physicalQty, tone: "text-gray-900" },
                    { label: "Reserved", value: row.item.reservedQty, tone: "text-purple-600" },
                    { label: "Available", value: row.availableQty, tone: "text-green-600" },
                    { label: "Damaged", value: row.item.damagedQty, tone: "text-red-600" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-gray-200 p-2.5">
                      <div className={`text-lg font-semibold ${s.tone}`}>{s.value}</div>
                      <div className="text-[11px] text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">Recent Movements</h3>
                {movements.length === 0 ? (
                  <p className="text-sm text-gray-400">No movements recorded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {movements.map((m) => (
                      <li key={m.id} className="rounded-lg border border-gray-200 px-3 py-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize text-gray-800">{m.type.replace("_", " ")}</span>
                          <span className="text-gray-400">{formatDate(m.createdAt)}</span>
                        </div>
                        <div className="mt-0.5 text-gray-500">
                          Qty {m.quantity} {m.referenceLabel ? `· ${m.referenceLabel}` : ""} {m.reason ? `· ${m.reason}` : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </DrawerBody>
          </DrawerContent>
        )}
      </Drawer>

      <TransferModal open={modal === "transfer"} onOpenChange={(v) => setModal(v ? "transfer" : null)} presetRow={row} />
      <AdjustStockModal open={modal === "adjust"} onOpenChange={(v) => setModal(v ? "adjust" : null)} row={row} />
      <MarkDamagedModal open={modal === "damage"} onOpenChange={(v) => setModal(v ? "damage" : null)} row={row} />
    </>
  );
}
