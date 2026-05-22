import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useColorScheme } from '../../hooks/use-color-scheme';

const STORAGE_KEY = 'counter_value';

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          setCount(parseInt(saved, 10));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (value: number) => {
    setCount(value);
    await AsyncStorage.setItem(STORAGE_KEY, value.toString());
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>加载中…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#111' : '#fff' },
      ]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
        计数器
      </Text>

      <Text style={[styles.count, { color: isDark ? '#fff' : '#000' }]}>
        {count}
      </Text>

      <View style={styles.row}>
  {/* -1 */}
  <TouchableOpacity
    style={[styles.btn, { backgroundColor: '#5856d6' }]}
    onPress={() => save(count - 1)}
  >
    <Text style={styles.btnText}>-1</Text>
  </TouchableOpacity>

  {/* +1 */}
  <TouchableOpacity
    style={styles.btn}
    onPress={() => save(count + 1)}
  >
    <Text style={styles.btnText}>+1</Text>
  </TouchableOpacity>

  {/* 清零 */}
  <TouchableOpacity
    style={[styles.btn, { backgroundColor: '#ff3b30' }]}
    onPress={() => save(0)}
  >
    <Text style={styles.btnText}>清零</Text>
  </TouchableOpacity>
</View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  count: {
    fontSize: 96,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  btn: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
