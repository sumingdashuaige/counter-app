export interface ClearRecord {
  id: string;
  count: number;
  time: string; // ISO
}

export interface Counter {
  id: string;
  name: string;
  value: number;
  step: number;
  createdAt: number;
  lastUsedAt: number;
  history: ClearRecord[];
}

export interface CountersState {
  counters: Counter[];
}

export type ThemeMode = 'system' | 'light' | 'dark';

export const STORAGE_KEY = 'counters_v2';
export const THEME_KEY = 'theme_mode';
export const LEGACY_VALUE_KEY = 'counter_value';
export const LEGACY_TITLE_KEY = 'counter_title';
export const LEGACY_HISTORY_KEY = 'counter_history';

export interface ExportFile {
  version: 1;
  exportedAt: string;
  counters: Counter[];
}
