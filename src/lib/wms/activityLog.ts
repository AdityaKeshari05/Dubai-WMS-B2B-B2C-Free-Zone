import { wmsDb } from './db';
import { nextId } from './id';
export function logWmsActivity(entityType: string, entityId: string, action: string, description: string) {
  wmsDb.mutate((draft) => {
    draft.activityLogs.unshift({
      id: nextId('log'),
      entityType,
      entityId,
      action,
      description,
      actor: 'System',
      timestamp: new Date().toISOString(),
    });
  });
}
