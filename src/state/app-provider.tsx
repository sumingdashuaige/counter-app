import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AppState as RNAppState, useColorScheme } from 'react-native';

import { countersReducer } from '../lib/reducer';
import { migrateLegacy } from '../lib/migrate';
import { resolveIsDark } from '../lib/theme';
import { STORAGE_KEY, THEME_KEY, LEGACY_VALUE_KEY, LEGACY_TITLE_KEY, LEGACY_HISTORY_KEY, ThemeMode } from '../lib/types';
import { AppContext, AppApi, AppState } from './app-context';

const FLUSH_DEBOUNCE_MS = 500;

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(countersReducer, { counters: [] });
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const systemScheme = useColorScheme();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 启动：读 theme_mode + counters_v2，必要时迁移旧数据
  useEffect(() => {
    (async () => {
      try {
        const [rawTheme, rawCounters, legacyValue, legacyTitle, legacyHistory] = await Promise.all([
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(LEGACY_VALUE_KEY),
          AsyncStorage.getItem(LEGACY_TITLE_KEY),
          AsyncStorage.getItem(LEGACY_HISTORY_KEY),
        ]);
        setThemeModeState((rawTheme === 'light' || rawTheme === 'dark' ? rawTheme : 'system') as ThemeMode);

        if (rawCounters !== null) {
          try {
            const parsed = JSON.parse(rawCounters);
            if (Array.isArray(parsed)) {
              dispatch({ type: 'importReplace', counters: parsed });
            }
          } catch {
            // 损坏则尝试迁移
          }
        } else {
          const migrated = migrateLegacy(legacyValue, legacyTitle, legacyHistory);
          if (migrated) {
            dispatch({ type: 'importReplace', counters: migrated.counters });
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated.counters));
            await AsyncStorage.multiRemove([LEGACY_VALUE_KEY, LEGACY_TITLE_KEY, LEGACY_HISTORY_KEY]);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 防抖落盘：state 变化后 500ms 写一次；组件卸载时清定时器
  useEffect(() => {
    if (loading) return;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.counters)).catch(() => {});
    }, FLUSH_DEBOUNCE_MS);
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state, loading]);

  // 失焦（切后台/锁屏）强制落盘，防抖计时中的变更不丢
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (status) => {
      if (status !== 'active') {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current.counters)).catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);

  // 用 ref 存最新 state 供 AppState 监听读取
  const stateRef = useRef(state);
  stateRef.current = state;

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_KEY, mode).catch(() => {});
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current.counters)).catch(() => {});
  }, []);

  const value = useMemo<AppState & AppApi>(
    () => ({
      counters: state.counters,
      loading,
      themeMode,
      isDark: resolveIsDark(themeMode, systemScheme),
      dispatch,
      setThemeMode,
      flush,
    }),
    [state.counters, loading, themeMode, systemScheme, setThemeMode, flush]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
