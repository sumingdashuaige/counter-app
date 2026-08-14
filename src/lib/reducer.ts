import { newId } from './ids';
import { ClearRecord, Counter, CountersState } from './types';

export function createCounter(name: string): Counter {
  const now = Date.now();
  return {
    id: newId(),
    name,
    value: 0,
    step: 1,
    createdAt: now,
    lastUsedAt: now,
    history: [],
  };
}

export type Action =
  | { type: 'updateValue'; id: string; delta: number }
  | { type: 'setStep'; id: string; step: number }
  | { type: 'addCounter'; counter: Counter }
  | { type: 'renameCounter'; id: string; name: string }
  | { type: 'removeCounter'; id: string }
  | { type: 'duplicateCounter'; id: string }
  | { type: 'clearWithRecord'; id: string }
  | { type: 'removeRecord'; id: string; recordId: string }
  | { type: 'restoreRecord'; id: string; recordId: string }
  | { type: 'importReplace'; counters: Counter[] }
  | { type: 'importMerge'; counters: Counter[] }
  | { type: 'reorder'; orderedIds: string[] }
  | { type: 'moveCounter'; id: string; direction: 'up' | 'down' };

function patchCounter(state: CountersState, id: string, fn: (c: Counter) => Counter): CountersState {
  if (!state.counters.some((c) => c.id === id)) return state;
  return {
    counters: state.counters.map((c) => (c.id === id ? fn(c) : c)),
  };
}

function touch(c: Counter): Counter {
  return { ...c, lastUsedAt: Date.now() };
}

export function countersReducer(state: CountersState, action: Action): CountersState {
  switch (action.type) {
    case 'updateValue': {
      if (action.delta === 0) return state;
      return patchCounter(state, action.id, (c) => touch({ ...c, value: c.value + action.delta }));
    }
    case 'setStep': {
      if (!Number.isFinite(action.step) || action.step <= 0) throw new Error('step must be positive');
      return patchCounter(state, action.id, (c) => ({ ...c, step: action.step }));
    }
    case 'addCounter':
      return { counters: [action.counter, ...state.counters] };
    case 'renameCounter':
      return patchCounter(state, action.id, (c) => ({ ...c, name: action.name }));
    case 'removeCounter':
      return { counters: state.counters.filter((c) => c.id !== action.id) };
    case 'duplicateCounter': {
      const src = state.counters.find((c) => c.id === action.id);
      if (!src) return state;
      const copy: Counter = { ...src, id: newId(), createdAt: Date.now(), lastUsedAt: Date.now(), history: [] };
      return { counters: [copy, ...state.counters] };
    }
    case 'clearWithRecord': {
      return patchCounter(state, action.id, (c) => {
        if (c.value === 0) return c;
        const record: ClearRecord = { id: newId(), count: c.value, time: new Date().toISOString() };
        return touch({ ...c, value: 0, history: [...c.history, record] });
      });
    }
    case 'removeRecord':
      return patchCounter(state, action.id, (c) => ({ ...c, history: c.history.filter((h) => h.id !== action.recordId) }));
    case 'restoreRecord': {
      return patchCounter(state, action.id, (c) => {
        const rec = c.history.find((h) => h.id === action.recordId);
        if (!rec) return c;
        return touch({ ...c, value: rec.count, history: c.history.filter((h) => h.id !== action.recordId) });
      });
    }
    case 'importReplace':
      return { counters: [...action.counters] };
    case 'importMerge': {
      const merged = [...state.counters];
      const fresh: Counter[] = [];
      for (const incoming of action.counters) {
        const idx = merged.findIndex((c) => c.id === incoming.id);
        if (idx >= 0) {
          merged[idx] = incoming;
        } else {
          fresh.push({ ...incoming, id: newId() });
        }
      }
      merged.unshift(...fresh);
      return { counters: merged };
    }
    case 'reorder': {
      // 手动排序：orderedIds 决定新顺序；缺失任何 id 则视为非法输入，保持原顺序
      const byId = new Map(state.counters.map((c) => [c.id, c]));
      const next = action.orderedIds
        .map((id) => byId.get(id))
        .filter((c): c is Counter => c !== undefined);
      if (next.length === state.counters.length) return { counters: next };
      return state;
    }
    case 'moveCounter': {
      // 上移/下移：边界处（已在首位/末位）或 id 不存在时保持不变
      const idx = state.counters.findIndex((c) => c.id === action.id);
      if (idx < 0) return state;
      const target = action.direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= state.counters.length) return state;
      const next = [...state.counters];
      const [item] = next.splice(idx, 1);
      next.splice(target, 0, item);
      return { counters: next };
    }
  }
}
