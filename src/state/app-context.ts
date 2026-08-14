import { createContext, useContext } from 'react';
import { Action } from '../lib/reducer';
import { Counter, ThemeMode } from '../lib/types';

export interface AppState {
  counters: Counter[];
  loading: boolean;
  themeMode: ThemeMode;
  isDark: boolean;
  /** 启动时从存储快照的上次页面（用于恢复，避免被路由记录写入竞态覆盖） */
  initialRoute: string | null;
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
