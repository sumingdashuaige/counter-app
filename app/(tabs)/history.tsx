import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ToolbarButtons } from '../../src/components/toolbar-buttons';
import { useApp } from '../../src/state/app-context';

interface FlatRecord {
  counterId: string;
  counterName: string;
  recordId: string;
  count: number;
  time: string;
}

export default function HistoryScreen() {
  const { counters, isDark, dispatch } = useApp();
  const params = useLocalSearchParams<{ cid?: string }>();
  const cid = typeof params.cid === 'string' ? params.cid : undefined;

  // 展平所有计数器的历史，按时间倒序（新→旧）
  const records = useMemo<FlatRecord[]>(() => {
    const flat: FlatRecord[] = [];
    for (const c of counters) {
      for (const h of c.history) {
        flat.push({ counterId: c.id, counterName: c.name, recordId: h.id, count: h.count, time: h.time });
      }
    }
    flat.sort((a, b) => (a.time < b.time ? 1 : -1));
    return cid ? flat.filter((r) => r.counterId === cid) : flat;
  }, [counters, cid]);

  const deleteRecord = useCallback(
    (counterId: string, recordId: string) => {
      dispatch({ type: 'removeRecord', id: counterId, recordId });
    },
    [dispatch]
  );

  const restoreRecord = useCallback(
    (counterId: string, recordId: string) => {
      dispatch({ type: 'restoreRecord', id: counterId, recordId });
      router.push(`/counter/${counterId}`);
    },
    [dispatch]
  );

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    // 非法日期直接返回原字符串，避免显示 NaN-NaN-NaN
    if (Number.isNaN(d.getTime())) return iso;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const bg = isDark ? '#111' : '#fff';
  const text = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1c1c1e' : '#f2f2f7';
  const subText = isDark ? '#999' : '#666';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Text style={[styles.title, { color: text }]}>历史记录</Text>

      <ToolbarButtons />

      <View style={[styles.warning, { backgroundColor: isDark ? '#332900' : '#fff3cd' }]}>
        <Text style={[styles.warningText, { color: isDark ? '#ffd60a' : '#856404' }]}>
          恢复数据将写回该计数器当前值，并删除这条记录
        </Text>
      </View>

      {records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: subText }]}>暂无记录</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.counterId + '_' + item.recordId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardCount, { color: text }]}>
                  {item.counterName}：{item.count}
                </Text>
                <Text style={[styles.cardTime, { color: subText }]}>{formatTime(item.time)}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#34c759' }]} onPress={() => restoreRecord(item.counterId, item.recordId)}>
                  <Text style={styles.actionBtnText}>恢复</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ff3b30' }]} onPress={() => deleteRecord(item.counterId, item.recordId)}>
                  <Text style={styles.actionBtnText}>删除</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  warning: { padding: 12, borderRadius: 8, marginBottom: 16 },
  warningText: { fontSize: 14, textAlign: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16 },
  list: { gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 10 },
  cardInfo: { flex: 1 },
  cardCount: { fontSize: 20, fontWeight: 'bold' },
  cardTime: { fontSize: 13, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
