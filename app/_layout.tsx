import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { DialogHost } from '../src/lib/dialogs';
import { resolveRestoreRoute } from '../src/lib/restore-route';
import { AppProvider } from '../src/state/app-provider';
import { useApp } from '../src/state/app-context';

const LAST_ROUTE_KEY = 'last_route';

function RootNavigator() {
  const { isDark, loading, counters } = useApp();
  const pathname = usePathname();
  // 首次渲染的路径：用于区分"深链进入"与"正常启动"
  const initialPathRef = useRef(pathname);
  const restoredRef = useRef(false);

  // 记录当前页面：退出/关闭后重启可回到上次位置（首页 '/' 也记录，覆盖旧记录）
  useEffect(() => {
    if (loading) return;
    if (pathname) {
      AsyncStorage.setItem(LAST_ROUTE_KEY, pathname).catch(() => {});
    }
  }, [pathname, loading]);

  // 启动时恢复上次页面（数据加载完成后再跳，保证计数器已就绪）
  useEffect(() => {
    if (loading || restoredRef.current) return;
    restoredRef.current = true;
    (async () => {
      const last = await AsyncStorage.getItem(LAST_ROUTE_KEY);
      const target = resolveRestoreRoute(last, initialPathRef.current, counters.map((c) => c.id));
      if (target && target !== pathname) {
        // push 而非 replace：保留返回栈，全屏页能正常返回首页
        router.push(target as never);
      }
    })();
  }, [loading, counters, pathname]);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="counter/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
      <DialogHost />
    </AppProvider>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};
