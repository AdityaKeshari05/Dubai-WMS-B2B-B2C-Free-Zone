import { wmsDb as db } from "./db";
import type { CycleCount, CycleCountLine, StockCountType } from "@/types";
import { inventoryService } from "./inventoryService";

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

function nextSequence(prefix: string, index: number) {
  return `${prefix}-${index.toString().padStart(4, "0")}`;
}

function logActivity(module: string, entityId: string, action: string, description: string) {
  db.mutate((draft) => {
    draft.activityLogs.unshift({
      id: nextId("log"),
      entityType: module,
      entityId,
      action,
      description,
      actor: "System",
      timestamp: new Date().toISOString(),
    });
  });
}

export const cycleCountService = {
  // countType 'physical' is a full, warehouse-wide stock take (every
  // product/bin in scope, no manual product picking); 'cycle' counts only
  // the specific products the user selected. Both share the same session/
  // reconciliation machinery - only how the line list is built differs.
  createSession(params: {
    warehouseId: string;
    zone?: string;
    assignedUser: string;
    countDate: string;
    productIds: string[];
    countType?: StockCountType;
  }): CycleCount {
    const state = db.getSnapshot();
    const countType = params.countType ?? "cycle";
    const productIds =
      countType === "physical"
        ? Array.from(
            new Set(
              state.inventoryItems
                .filter((i) => i.warehouseId === params.warehouseId && (!params.zone || state.locations.find((l) => l.id === i.locationId)?.zone === params.zone))
                .map((i) => i.productId)
            )
          )
        : params.productIds;

    const lines: CycleCountLine[] = [];
    for (const productId of productIds) {
      const items = state.inventoryItems.filter(
        (i) =>
          i.productId === productId &&
          i.warehouseId === params.warehouseId &&
          (!params.zone || state.locations.find((l) => l.id === i.locationId)?.zone === params.zone)
      );
      for (const item of items) {
        lines.push({
          id: nextId("ccl"),
          productId,
          locationId: item.locationId,
          batchId: item.batchId,
          expectedQty: item.physicalQty,
          countedQty: null,
          status: "pending",
        });
      }
    }

    const session: CycleCount = {
      id: nextId("cc"),
      countNumber: nextSequence(countType === "physical" ? "PC" : "CC", state.cycleCounts.length + 1),
      countType,
      warehouseId: params.warehouseId,
      zone: params.zone,
      assignedUser: params.assignedUser,
      countDate: params.countDate,
      status: "draft",
      lines,
      createdAt: new Date().toISOString(),
    };

    db.mutate((draft) => {
      draft.cycleCounts.push(session);
    });
    logActivity("cycle_count", session.id, "create", `${countType === "physical" ? "Physical count" : "Cycle count"} ${session.countNumber} created with ${lines.length} line(s)`);
    return session;
  },

  enterCount(sessionId: string, lineId: string, countedQty: number) {
    db.mutate((draft) => {
      const session = draft.cycleCounts.find((c) => c.id === sessionId);
      if (!session) return;
      const line = session.lines.find((l) => l.id === lineId);
      if (!line) return;
      line.countedQty = countedQty;
      const diff = countedQty - line.expectedQty;
      line.status = diff === 0 ? "match" : diff > 0 ? "excess" : "shortage";
      if (session.status === "draft") session.status = "in_progress";
    });
  },

  markCompleted(sessionId: string) {
    db.mutate((draft) => {
      const session = draft.cycleCounts.find((c) => c.id === sessionId);
      if (session) session.status = "completed";
    });
  },

  applyReconciliation(sessionId: string) {
    const state = db.getSnapshot();
    const session = state.cycleCounts.find((c) => c.id === sessionId);
    if (!session) throw new Error("Cycle count not found");

    for (const line of session.lines) {
      if (line.countedQty !== null) {
        inventoryService.applyCycleCountLine(sessionId, line.id);
      }
    }

    db.mutate((draft) => {
      const target = draft.cycleCounts.find((c) => c.id === sessionId);
      if (target) target.status = "reconciled";
    });

    logActivity("cycle_count", sessionId, "reconcile", `Cycle count ${session.countNumber} reconciled against inventory`);
  },
};
