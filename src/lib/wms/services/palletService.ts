import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import type { Pallet } from '@/types';

// TODO(api): swap bodies for /wms/pallets once the backend exists.
export const palletService = {
  createPallet(orderId: string): Pallet {
    const state = wmsDb.getSnapshot();
    const pallet: Pallet = {
      id: nextId('plt'),
      palletNumber: nextSequence('PLT', state.pallets.length + 1),
      orderId,
      cartonIds: [],
      createdAt: new Date().toISOString(),
    };
    wmsDb.mutate((draft) => {
      draft.pallets.push(pallet);
    });
    return pallet;
  },

  addCarton(palletId: string, packageId: string) {
    wmsDb.mutate((draft) => {
      const pallet = draft.pallets.find((p) => p.id === palletId);
      const pkg = draft.packages.find((p) => p.id === packageId);
      if (!pallet || !pkg) return;
      if (!pallet.cartonIds.includes(packageId)) pallet.cartonIds.push(packageId);
      pkg.palletId = palletId;
    });
  },

  removeCarton(palletId: string, packageId: string) {
    wmsDb.mutate((draft) => {
      const pallet = draft.pallets.find((p) => p.id === palletId);
      const pkg = draft.packages.find((p) => p.id === packageId);
      if (pallet) pallet.cartonIds = pallet.cartonIds.filter((id) => id !== packageId);
      if (pkg) pkg.palletId = undefined;
    });
  },

  deletePallet(palletId: string) {
    wmsDb.mutate((draft) => {
      const pallet = draft.pallets.find((p) => p.id === palletId);
      if (pallet) {
        for (const cartonId of pallet.cartonIds) {
          const pkg = draft.packages.find((p) => p.id === cartonId);
          if (pkg) pkg.palletId = undefined;
        }
      }
      draft.pallets = draft.pallets.filter((p) => p.id !== palletId);
    });
    logWmsActivity('pallet', palletId, 'delete', 'Pallet removed');
  },
};
