import { wmsDb } from '../db';
import { nextId, nextSequence } from '../id';
import { logWmsActivity } from '../activityLog';
import type { Wave } from '@/types';

// TODO(api): swap bodies for /wms/waves once the backend exists.
export const waveService = {
  createWave(params: {
    name: string;
    warehouseId: string;
    zone?: string;
    priority: Wave['priority'];
    cutoffTime: string;
    orderIds: string[];
  }): Wave {
    const state = wmsDb.getSnapshot();
    const wave: Wave = {
      id: nextId('wave'),
      waveNumber: nextSequence('WAVE', state.waves.length + 1),
      name: params.name,
      warehouseId: params.warehouseId,
      zone: params.zone,
      priority: params.priority,
      cutoffTime: params.cutoffTime,
      orderIds: params.orderIds,
      status: 'planning',
      createdAt: new Date().toISOString(),
    };

    wmsDb.mutate((draft) => {
      draft.waves.push(wave);
      for (const orderId of params.orderIds) {
        const order = draft.b2cOrders.find((o) => o.id === orderId);
        if (order) order.waveId = wave.id;
      }
    });
    logWmsActivity('wave', wave.id, 'create', `Wave ${wave.waveNumber} created with ${params.orderIds.length} order(s)`);
    return wave;
  },

  release(waveId: string) {
    wmsDb.mutate((draft) => {
      const wave = draft.waves.find((w) => w.id === waveId);
      if (wave) wave.status = 'released';
    });
    logWmsActivity('wave', waveId, 'release', 'Wave released for picking');
  },
};
