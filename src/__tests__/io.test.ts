import { parseExportFile, serializeExport } from '../lib/io';
import { Counter } from '../lib/types';

const counter: Counter = {
  id: 'c1', name: 'A', value: 3, step: 2,
  createdAt: 1, lastUsedAt: 1,
  history: [{ id: 'h1', count: 3, time: 't' }],
};

test('serializeExport produces versioned JSON string', () => {
  const json = serializeExport([counter]);
  const obj = JSON.parse(json);
  expect(obj.version).toBe(1);
  expect(obj.counters).toHaveLength(1);
  expect(obj.exportedAt).toBeTruthy();
});

test('parseExportFile accepts valid file', () => {
  const obj = parseExportFile(serializeExport([counter]));
  expect(obj).not.toBeNull();
  expect(obj!.counters[0].value).toBe(3);
});

test('parseExportFile rejects bad version', () => {
  const obj = parseExportFile(JSON.stringify({ version: 99, counters: [] }));
  expect(obj).toBeNull();
});

test('parseExportFile rejects missing counters', () => {
  expect(parseExportFile(JSON.stringify({ version: 1 }))).toBeNull();
});

test('parseExportFile rejects non-numeric value', () => {
  const bad = JSON.stringify({ version: 1, counters: [{ ...counter, value: 'x' }] });
  expect(parseExportFile(bad)).toBeNull();
});

test('parseExportFile rejects malformed json', () => {
  expect(parseExportFile('not json')).toBeNull();
});
