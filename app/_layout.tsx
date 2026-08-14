import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { DialogHost } from '../src/lib/dialogs';
import { AppProvider } from '../src/state/app-provider';
import { useApp } from '../src/state/app-context';

function RootNavigator() {
  const { isDark } = useApp();
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
