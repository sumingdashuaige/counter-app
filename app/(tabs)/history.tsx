import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useColorScheme } from '../../hooks/use-color-scheme';

const HISTORY_KEY = 'counter_history';

type Record = {
  id: string;
  count: number;
  time: string;
};

export default function HistoryScreen() {
  const [records, setRecords] = useState<Record[]>([]);
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (raw) {
          setRecords(JSON.parse(raw).reverse());
        } else {
          setRecords([]);
        }
      })();
    }, [])
  );

  const saveList = async (list: Record[]) => {
    // 存储时恢复为旧→新顺序（显示时是新→旧）
    const toSave = [...list].reverse();
    setRecords(list);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(toSave));
  };

  const deleteRecord = (id: string) => {
    saveList(records.filter((r) => r.id !== id));
  };

  const restoreRecord = async (record: Record) => {
    await AsyncStorage.setItem('counter_value', record.count.toString());
    deleteRecord(record.id);
    router.navigate('/(tabs)');
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch {
      return iso;
    }
  };

  const bg = isDark ? '#111' : '#fff';
  const text = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1c1c1e' : '#f2f2f7';
  const subText = isDark ? '#999' : '#666';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Text style={[styles.title, { color: text }]}>历史记录</Text>

      <View style={[styles.warning, { backgroundColor: isDark ? '#332900' : '#fff3cd' }]}>
        <Text style={[styles.warningText, { color: isDark ? '#ffd60a' : '#856404' }]}>
          恢复数据将丢失当前计数数据与该条记录
        </Text>
      </View>

      {records.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: subText }]}>暂无记录</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardCount, { color: text }]}>
                  计数: {item.count}
                </Text>
                <Text style={[styles.cardTime, { color: subText }]}>
                  {formatTime(item.time)}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#34c759' }]}
                  onPress={() => restoreRecord(item)}
                >
                  <Text style={styles.actionBtnText}>恢复</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#ff3b30' }]}
                  onPress={() => deleteRecord(item.id)}
                >
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
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  warning: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
  },
  cardInfo: {
    flex: 1,
  },
  cardCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardTime: {
    fontSize: 13,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
