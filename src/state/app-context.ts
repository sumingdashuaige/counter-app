import { createContext, useContext } from 'react';
import { Action } from '../lib/reducer';
import { Counter, ThemeMode } from '../lib/types';

export interface AppState {
  counters: Counter[];
  loading: boolean;
  themeMode: ThemeMode;
  isDark: boolean;
}

export interface AppApi {
  dispatch: (action: Action) => void;
  setThemeMode: (mode: ThemeMode) => void;
  flush: () => void;
}

export const AppContext = createContext<(AppState & AppApi) | null>(null);

export function useApp(): AppState & AppApi {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
