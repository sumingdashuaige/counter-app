import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppProvider } from '../state/app-provider';
import { useApp } from '../state/app-context';
import { LEGACY_VALUE_KEY, LEGACY_TITLE_KEY, LEGACY_HISTORY_KEY, STORAGE_KEY } from '../lib/types';

function Consumer() {
  const { counters, loading } = useApp();
  if (loading) return <Text>loading</Text>;
  return (
    <Text>
      {JSON.stringify(counters.map((c) => ({ name: c.name, value: c.value, history: c.history.length })))}
    </Text>
  );
}

async function renderApp() {
  return render(
    <AppProvider>
      <Consumer />
    </AppProvider>
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('迁移：有旧版三个 key 时生成计数器并保留旧 key', async () => {
  await AsyncStorage.setItem(LEGACY_VALUE_KEY, '42');
  await AsyncStorage.setItem(LEGACY_TITLE_KEY, '我的计数');
  await AsyncStorage.setItem(
    LEGACY_HISTORY_KEY,
    JSON.stringify([
      { id: 'h1', title: '我的计数', count: 9, time: '2026-01-01T00:00:00.000Z' },
      { id: 'h2', title: '另一个', count: 5, time: '2026-01-02T00:00:00.000Z' },
    ])
  );

  const { getByText } = await renderApp();

  await waitFor(() => {
    getByText('[{"name":"我的计数","value":42,"history":2}]');
  });

  // counters_v2 已写入
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  expect(raw).not.toBeNull();
  expect(JSON.parse(raw!)[0].value).toBe(42);

  // 旧 key 保留（兜底）
  expect(await AsyncStorage.getItem(LEGACY_VALUE_KEY)).toBe('42');
  expect(await AsyncStorage.getItem(LEGACY_TITLE_KEY)).toBe('我的计数');
});

test('迁移：无任何数据时创建默认计数器', async () => {
  const { getByText } = await renderApp();
  await waitFor(() => {
    getByText('[{"name":"计数器","value":0,"history":0}]');
  });
});

test('迁移：counters_v2 为空数组时也创建默认计数器', async () => {
  await AsyncStorage.setItem(STORAGE_KEY, '[]');
  const { getByText } = await renderApp();
  await waitFor(() => {
    getByText('[{"name":"计数器","value":0,"history":0}]');
  });
});

test('迁移：counters_v2 已有有效数据时保留', async () => {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([{ id: 'x1', name: '已有', value: 7, step: 1, createdAt: 1, lastUsedAt: 1, history: [] }])
  );
  const { getByText } = await renderApp();
  await waitFor(() => {
    getByText('[{"name":"已有","value":7,"history":0}]');
  });
});
