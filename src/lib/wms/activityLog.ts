import { wmsDb } from './db';
import { nextId } from './id';
import type { User } from '@/types';

function currentActorName(): string {
  if (typeof window === 'undefined') return 'System';
  try {
    const raw = window.localStorage.getItem('user');
    if (!raw) return 'System';
    const user = JSON.parse(raw) as User;
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  } catch {
    return 'System';
  }
}

export function logWmsActivity(entityType: string, entityId: string, action: string, description: string) {
  wmsDb.mutate((draft) => {
    draft.activityLogs.unshift({
      id: nextId('log'),
      entityType,
      entityId,
      action,
      description,
      actor: currentActorName(),
      timestamp: new Date().toISOString(),
    });
  });
}
