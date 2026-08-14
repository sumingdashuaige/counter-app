import { resolveRestoreRoute } from '../lib/restore-route';

test('no last route -> no restore', () => {
  expect(resolveRestoreRoute(null, '/', ['c1'])).toBeNull();
  expect(resolveRestoreRoute('/', '/', ['c1'])).toBeNull();
});

test('deep link entry is respected (no restore override)', () => {
  expect(resolveRestoreRoute('/counter/c1', '/counter/c1', ['c1'])).toBeNull();
  expect(resolveRestoreRoute('/history', '/history', ['c1'])).toBeNull();
});

test('restores history page', () => {
  expect(resolveRestoreRoute('/history', '/', ['c1'])).toBe('/history');
});

test('restores existing counter page', () => {
  expect(resolveRestoreRoute('/counter/c1', '/', ['c1', 'c2'])).toBe('/counter/c1');
});

test('restores to home when counter no longer exists', () => {
  expect(resolveRestoreRoute('/counter/deleted', '/', ['c1'])).toBe('/');
});

test('ignores unknown routes', () => {
  expect(resolveRestoreRoute('/foo', '/', ['c1'])).toBeNull();
});
