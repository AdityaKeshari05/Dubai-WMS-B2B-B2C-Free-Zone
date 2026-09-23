import { wmsDb as db } from "./db";
import type { CycleCount, CycleCountLine } from "@/types";
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
      entityType: module as any,
      entityId,
      action,
      description,
      actor: "System",
      timestamp: new Date().toISOString(),
    });
  });
}

export const cycleCountService = {
  createSession(params: {
    warehouseId: string;
    zone?: string;
    assignedUser: string;
    countDate: string;
    productIds: string[];
  }): CycleCount {
    const state = db.getSnapshot();
    const lines: CycleCountLine[] = [];
    for (const productId of params.productIds) {
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
      countNumber: nextSequence("CC", state.cycleCounts.length + 1),
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
    logActivity("cycle_count", session.id, "create", `Cycle count ${session.countNumber} created with ${lines.length} line(s)`);
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
