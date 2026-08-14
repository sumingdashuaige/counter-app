import { newId } from './ids';
import { ClearRecord, Counter, CountersState } from './types';

interface LegacyRecord {
  id?: string;
  title?: string;
  count?: number;
  time?: string;
}

/**
 * 首次启动迁移旧版三个 key → counters_v2。
 * 返回 null 表示无旧数据。v1 是单计数器应用，全部历史记录直接并入该计数器（不做 title 过滤）。
 */
export function migrateLegacy(
  legacyValue: string | null,
  legacyTitle: string | null,
  legacyHistory: string | null
): CountersState | null {
  if (legacyValue === null && legacyHistory === null && legacyTitle === null) return null;

  const name = legacyTitle || '计数器';
  const now = Date.now();
  const legacyCount = legacyValue !== null ? Number(legacyValue) : NaN;
  const counter: Counter = {
    id: newId(),
    name,
    value: Number.isFinite(legacyCount) ? legacyCount : 0,
    step: 1,
    createdAt: now,
    lastUsedAt: now,
    history: [],
  };

  if (legacyHistory !== null) {
    try {
      const parsed = JSON.parse(legacyHistory) as LegacyRecord[];
      if (Array.isArray(parsed)) {
        counter.history = parsed
          .filter((r) => typeof r.count === 'number' && typeof r.time === 'string')
          .map((r): ClearRecord => ({ id: r.id || newId(), count: r.count as number, time: r.time as string }));
      }
    } catch {
      // 忽略损坏的历史
    }
  }

  return { counters: [counter] };
}
