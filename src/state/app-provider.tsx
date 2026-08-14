import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AppState as RNAppState, useColorScheme } from 'react-native';

import { isCounter } from '../lib/io';
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
  // 标记是否正在卸载：防抖 effect 的 cleanup 借此区分"重渲染清理"与"卸载清理"
  const isUnmountingRef = useRef(false);

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
              // 逐项校验，过滤非法条目
              const valid = parsed.filter(isCounter);
              dispatch({ type: 'importReplace', counters: valid });
            }
          } catch {
            // 数据损坏：清掉损坏的 key，再尝试迁移旧数据；迁移失败则保持空状态
            await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
            const migrated = migrateLegacy(legacyValue, legacyTitle, legacyHistory);
            if (migrated) {
              dispatch({ type: 'importReplace', counters: migrated.counters });
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated.counters));
              await AsyncStorage.multiRemove([LEGACY_VALUE_KEY, LEGACY_TITLE_KEY, LEGACY_HISTORY_KEY]);
            }
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

  // 卸载标记：声明在防抖 effect 之前，卸载时先置标记再走防抖 cleanup
  useEffect(() => {
    isUnmountingRef.current = false;
    return () => {
      isUnmountingRef.current = true;
    };
  }, []);

  // 防抖落盘：state 变化后 500ms 写一次；卸载时若还有未落盘变更立即补写，防止窗口内强杀丢数据
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
        // 真正卸载且防抖窗口未到：用 stateRef 读最新值立即落盘
        if (isUnmountingRef.current) {
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef.current.counters)).catch(() => {});
        }
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
