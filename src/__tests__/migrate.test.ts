import { migrateLegacy } from '../lib/migrate';
import { Counter } from '../lib/types';

test('returns null when no legacy keys exist', () => {
  expect(migrateLegacy(null, null, null)).toBeNull();
});

test('creates first counter from legacy value and title', () => {
  const result = migrateLegacy('42', '我的计数', null)!;
  expect(result.counters).toHaveLength(1);
  expect(result.counters[0].value).toBe(42);
  expect(result.counters[0].name).toBe('我的计数');
});

test('defaults title to 计数器', () => {
  const result = migrateLegacy('3', null, null)!;
  expect(result.counters[0].name).toBe('计数器');
});

test('migrates legacy history records with title match', () => {
  const legacyHistory = JSON.stringify([
    { id: 'h1', title: '我的计数', count: 9, time: '2026-01-01T00:00:00Z' },
    { id: 'h2', title: '另一个', count: 5, time: '2026-01-02T00:00:00Z' },
  ]);
  const result = migrateLegacy('42', '我的计数', legacyHistory)!;
  expect(result.counters[0].history).toHaveLength(1);
  expect(result.counters[0].history[0].count).toBe(9);
  expect(result.counters[0].history[0].id).toBe('h1');
});

test('ignores malformed legacy history', () => {
  const result = migrateLegacy('1', 'A', 'not json')!;
  expect(result.counters[0].history).toEqual([]);
});
