export function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function nextSequence(prefix: string, n: number, pad = 5): string {
  return `${prefix}-${String(n).padStart(pad, '0')}`;
}
