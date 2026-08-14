import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import { CounterCard } from '../../src/components/counter-card';
import { NewCounterModal } from '../../src/components/new-counter-modal';
import { confirmDialog, showMenu } from '../../src/lib/dialogs';
import { createCounter } from '../../src/lib/reducer';
import { useApp } from '../../src/state/app-context';

type ModalState =
  | { kind: 'create' }
  | { kind: 'edit'; id: string; name: string }
  | null;

export default function HomeScreen() {
  const { counters, loading, isDark, dispatch } = useApp();
  const [modal, setModal] = useState<ModalState>(null);
  const { width } = useWindowDimensions();

  // 列数自适应：<360 一列，360–700 两列，>700 三列
  const numColumns = width < 360 ? 1 : width > 700 ? 3 : 2;

  // 最新 counters 存 ref，让 onLongPress 回调引用稳定（空依赖），避免 memo 卡片全量重渲染
  const countersRef = useRef(counters);
  countersRef.current = counters;

  // 最近使用置顶（lastUsedAt 降序）
  const sorted = useMemo(
    () => [...counters].sort((a, b) => b.lastUsedAt - a.lastUsedAt),
    [counters]
  );

  const isEdit = modal !== null && modal.kind === 'edit';

  const openCounter = useCallback((id: string) => {
    router.push(`/counter/${id}`);
  }, []);

  const onDelta = useCallback(
    (id: string, delta: number) => {
      dispatch({ type: 'updateValue', id, delta });
    },
    [dispatch]
  );

  // 长按菜单：重命名 / 复制 / 删除（删除二次确认，web 端用 window.confirm）
  const onLongPress = useCallback(
    (id: string) => {
      const c = countersRef.current.find((x) => x.id === id);
      if (!c) return;
      showMenu(c.name, [
        { label: '重命名', onPress: () => setModal({ kind: 'edit', id: c.id, name: c.name }) },
        { label: '复制', onPress: () => dispatch({ type: 'duplicateCounter', id }) },
        {
          label: '删除',
          destructive: true,
          onPress: () =>
            confirmDialog('删除计数器', `确定删除「${c.name}」？此操作不可恢复。`, '删除', true, () =>
              dispatch({ type: 'removeCounter', id })
            ),
        },
      ]);
    },
    [dispatch]
  );

  const handleConfirm = useCallback(
    (name: string) => {
      const n = name.trim();
      if (!n) return;
      if (isEdit) {
        dispatch({ type: 'renameCounter', id: modal.id, name: n });
      } else {
        dispatch({ type: 'addCounter', counter: createCounter(n) });
      }
      setModal(null);
    },
    [isEdit, modal, dispatch]
  );

  const bg = isDark ? '#111' : '#fff';
  const text = isDark ? '#fff' : '#000';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: text }]}>计数器</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal({ kind: 'create' })} activeOpacity={0.7}>
          <Text style={styles.addText}>+ 新建</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={{ color: text }}>加载中…</Text>
        </View>
      ) : sorted.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: isDark ? '#8e8e93' : '#aeaeb2' }]}>
            还没有计数器，点右上角"新建"开始
          </Text>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={sorted}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <CounterCard
              counter={item}
              isDark={isDark}
              onPress={openCounter}
              onLongPress={onLongPress}
              onMenu={onLongPress}
              onDelta={onDelta}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <NewCounterModal
        visible={modal !== null}
        title={isEdit ? '重命名计数器' : '新建计数器'}
        initialName={isEdit ? modal.name : undefined}
        isDark={isDark}
        onCancel={() => setModal(null)}
        onConfirm={handleConfirm}
      />

      <Text style={[styles.watermark, { color: isDark ? '#333' : '#ddd' }]}>by：suming</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  addBtn: {
    backgroundColor: '#007aff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15 },
  list: { padding: 6, paddingBottom: 24 },
  watermark: {
    position: 'absolute',
    bottom: 16,
    right: 24,
    fontSize: 12,
  },
});
