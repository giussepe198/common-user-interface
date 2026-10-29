/** Development-only console warning. Silent in browsers without a `process` global and in production. */
export function devWarn(message: string): void {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  if (!proc || proc.env?.NODE_ENV === 'production' || proc.env?.NODE_ENV === 'test') return;
   
  console.warn(`[ClinicalCUI] ${message}`);
}
