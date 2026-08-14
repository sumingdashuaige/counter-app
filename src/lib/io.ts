import { Counter, ExportFile } from './types';

export function serializeExport(counters: Counter[]): string {
  const file: ExportFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    counters,
  };
  return JSON.stringify(file);
}

function isCounter(x: unknown): x is Counter {
  if (typeof x !== 'object' || x === null) return false;
  const c = x as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.value === 'number' &&
    typeof c.step === 'number' &&
    typeof c.createdAt === 'number' &&
    typeof c.lastUsedAt === 'number' &&
    Array.isArray(c.history) &&
    c.history.every((h) => {
      const r = h as Record<string, unknown>;
      return typeof r.id === 'string' && typeof r.count === 'number' && typeof r.time === 'string';
    })
  );
}

export function parseExportFile(text: string): ExportFile | null {
  try {
    const obj = JSON.parse(text) as ExportFile;
    if (obj.version !== 1) return null;
    if (!Array.isArray(obj.counters)) return null;
    if (!obj.counters.every(isCounter)) return null;
    return obj;
  } catch {
    return null;
  }
}
