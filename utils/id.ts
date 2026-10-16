/** Generates a locally-unique id for client-only mock records (chat messages, conversations, etc). */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
