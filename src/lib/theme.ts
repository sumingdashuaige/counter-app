import { ThemeMode } from './types';

export function normalizeThemeMode(raw: string | null): ThemeMode {
  return raw === 'light' || raw === 'dark' ? raw : 'system';
}

export function resolveIsDark(mode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined): boolean {
  if (mode === 'light') return false;
  if (mode === 'dark') return true;
  return systemScheme === 'dark';
}
