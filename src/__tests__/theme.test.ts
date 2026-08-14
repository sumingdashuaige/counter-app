import { resolveIsDark, normalizeThemeMode } from '../lib/theme';

test('system mode follows system', () => {
  expect(resolveIsDark('system', 'dark')).toBe(true);
  expect(resolveIsDark('system', 'light')).toBe(false);
});

test('manual mode overrides system', () => {
  expect(resolveIsDark('dark', 'light')).toBe(true);
  expect(resolveIsDark('light', 'dark')).toBe(false);
});

test('normalizeThemeMode falls back to system', () => {
  expect(normalizeThemeMode('weird' as any)).toBe('system');
  expect(normalizeThemeMode('dark')).toBe('dark');
});
