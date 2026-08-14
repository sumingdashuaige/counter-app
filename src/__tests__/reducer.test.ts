import { countersReducer, createCounter } from '../lib/reducer';
import { Counter } from '../lib/types';

function base(partial: Partial<Counter> = {}): Counter {
  return {
    id: 'c1', name: 'A', value: 10, step: 1,
    createdAt: 1, lastUsedAt: 1, history: [],
    ...partial,
  };
}

test('createCounter builds a counter with defaults', () => {
  const c = createCounter('俯卧撑');
  expect(c.name).toBe('俯卧撑');
  expect(c.value).toBe(0);
  expect(c.step).toBe(1);
  expect(c.history).toEqual([]);
  expect(c.id.length).toBeGreaterThan(0);
});

test('updateValue adds delta and touches lastUsedAt', () => {
  const s = { counters: [base()] };
  const next = countersReducer(s, { type: 'updateValue', id: 'c1', delta: 5 });
  expect(next.counters[0].value).toBe(15);
  expect(next.counters[0].lastUsedAt).toBeGreaterThan(1);
});

test('updateValue keeps lastUsedAt when delta is 0', () => {
  const s = { counters: [base({ lastUsedAt: 100 })] };
  const next = countersReducer(s, { type: 'updateValue', id: 'c1', delta: 0 });
  expect(next.counters[0].lastUsedAt).toBe(100);
});

test('setStep validates positive number', () => {
  const s = { counters: [base({ step: 1 })] };
  const next = countersReducer(s, { type: 'setStep', id: 'c1', step: 5 });
  expect(next.counters[0].step).toBe(5);
  expect(() => countersReducer(s, { type: 'setStep', id: 'c1', step: 0 })).toThrow();
  expect(() => countersReducer(s, { type: 'setStep', id: 'c1', step: Infinity })).toThrow();
  expect(() => countersReducer(s, { type: 'setStep', id: 'c1', step: NaN })).toThrow();
});

test('addCounter prepends new counter', () => {
  const s = { counters: [base()] };
  const next = countersReducer(s, { type: 'addCounter', counter: createCounter('B') });
  expect(next.counters).toHaveLength(2);
  expect(next.counters[0].name).toBe('B');
});

test('renameCounter updates name', () => {
  const s = { counters: [base()] };
  const next = countersReducer(s, { type: 'renameCounter', id: 'c1', name: '新名' });
  expect(next.counters[0].name).toBe('新名');
});

test('removeCounter deletes by id', () => {
  const s = { counters: [base(), base({ id: 'c2' })] };
  const next = countersReducer(s, { type: 'removeCounter', id: 'c1' });
  expect(next.counters.map((c) => c.id)).toEqual(['c2']);
});

test('duplicateCounter copies with new id and zeroed history', () => {
  const s = { counters: [base({ history: [{ id: 'h1', count: 5, time: 't' }] })] };
  const next = countersReducer(s, { type: 'duplicateCounter', id: 'c1' });
  expect(next.counters).toHaveLength(2);
  const copy = next.counters[0];
  expect(copy.id).not.toBe('c1');
  expect(copy.name).toBe('A');
  expect(copy.value).toBe(10);
  expect(copy.history).toEqual([]);
});

test('clearWithRecord pushes ClearRecord and zeroes value', () => {
  const s = { counters: [base({ value: 7 })] };
  const next = countersReducer(s, { type: 'clearWithRecord', id: 'c1' });
  const c = next.counters[0];
  expect(c.value).toBe(0);
  expect(c.history).toHaveLength(1);
  expect(c.history[0].count).toBe(7);
  expect(c.history[0].id.length).toBeGreaterThan(0);
});

test('clearWithRecord skips when value is 0', () => {
  const s = { counters: [base({ value: 0 })] };
  const next = countersReducer(s, { type: 'clearWithRecord', id: 'c1' });
  expect(next.counters[0].history).toHaveLength(0);
});

test('removeRecord deletes one history record', () => {
  const s = { counters: [base({ history: [{ id: 'h1', count: 1, time: 't' }, { id: 'h2', count: 2, time: 't' }] })] };
  const next = countersReducer(s, { type: 'removeRecord', id: 'c1', recordId: 'h1' });
  expect(next.counters[0].history.map((h) => h.id)).toEqual(['h2']);
});

test('restoreRecord sets value and removes the record', () => {
  const s = { counters: [base({ history: [{ id: 'h1', count: 42, time: 't' }] })] };
  const next = countersReducer(s, { type: 'restoreRecord', id: 'c1', recordId: 'h1' });
  expect(next.counters[0].value).toBe(42);
  expect(next.counters[0].history).toHaveLength(0);
});

test('importReplace replaces all counters', () => {
  const s = { counters: [base()] };
  const next = countersReducer(s, { type: 'importReplace', counters: [base({ id: 'x1', name: 'X' })] });
  expect(next.counters.map((c) => c.id)).toEqual(['x1']);
});

test('importMerge merges by id, new ids get fresh id', () => {
  const s = { counters: [base()] };
  const next = countersReducer(s, {
    type: 'importMerge',
    counters: [base({ id: 'c1', value: 99 }), base({ id: 'c2', name: 'New' })],
  });
  expect(next.counters).toHaveLength(2);
  expect(next.counters.find((c) => c.id === 'c1')!.value).toBe(99);
  const merged = next.counters.find((c) => c.name === 'New')!;
  expect(merged.id).not.toBe('c2');
});

test('importMerge preserves incoming order for new counters', () => {
  const s = { counters: [base()] };
  const next = countersReducer(s, {
    type: 'importMerge',
    counters: [
      base({ id: 'x1', name: 'First' }),
      base({ id: 'x2', name: 'Second' }),
    ],
  });
  const names = next.counters.map((c) => c.name);
  expect(names).toEqual(['First', 'Second', 'A']);
});

test('updateValue on missing id returns same state reference', () => {
  const s = { counters: [base()] };
  const next = countersReducer(s, { type: 'updateValue', id: 'missing', delta: 5 });
  expect(next).toBe(s);
});
