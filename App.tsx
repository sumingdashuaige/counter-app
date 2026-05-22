/**
 * Counter App - 安卓计数器应用
 * 使用 Expo 和 EAS Build 编译
 * 功能：显示计数、+1按钮（支持长按连加）、清零按钮、数据持久化
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

const STORAGE_KEY = 'counter_value';

export default function App() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 存放 setInterval 的返回值（React Native 里是 number）
  const intervalRef = useRef<number | null>(null);

  const isDarkMode = useColorScheme() === 'dark';

  // 应用启动时从本地存储读取计数值
  useEffect(() => {
    loadCountFromStorage();
  }, []);

  // 从 AsyncStorage 加载计数值
  const loadCountFromStorage = async () => {
    try {
      const savedCount = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedCount !== null) {
        setCount(parseInt(savedCount, 10));
      }
    } catch (error) {
      console.error('Failed to load count from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存计数值到 AsyncStorage
  const saveCountToStorage = async (newCount: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newCount.toString());
    } catch (error) {
      console.error('Failed to save count to storage:', error);
    }
  };

  // 单次 +1 处理函数
  const handleIncrement = async () => {
    const newCount = count + 1;
    setCount(newCount);
    await saveCountToStorage(newCount);
  };

  // 清零按钮处理函数
  const handleReset = async () => {
    setCount(0);
    await saveCountToStorage(0);
  };

  // 长按开始，启动定时器连续 +1
  const handleLongPressIncrement = () => {
    // 先立刻 +1 一次，让反馈更灵敏
    setCount(prev => {
      const newCount = prev + 1;
      saveCountToStorage(newCount);
      return newCount;
    });

    // 清除可能残留的旧定时器
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
    }

    // 每 100ms +1
    intervalRef.current = setInterval(() => {
      setCount(prev => {
        const newCount = prev + 1;
        saveCountToStorage(newCount);
        return newCount;
      });
    }, 100);
  };

  // 松手时停止定时器
  const handlePressOut = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  };

  const textColor = {
    color: isDarkMode ? '#ffffff' : '#000000',
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, textColor]}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.content}>
        {/* 标题 */}
        <Text style={[styles.title, textColor]}>计数器</Text>

        {/* 显示区域 */}
        <View style={styles.displayContainer}>
          <Text style={[styles.countDisplay, textColor]}>{count}</Text>
        </View>

        {/* 按钮区域 */}
        <View style={styles.buttonContainer}>
          {/* +1 按钮（支持长按连加） */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleIncrement}
            onLongPress={handleLongPressIncrement}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>+1</Text>
          </TouchableOpacity>

          {/* 清零按钮 */}
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>清零</Text>
          </TouchableOpacity>
        </View>

        {/* 底部信息 */}
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, textColor]}>
            计数已自动保存
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  countDisplay: {
    fontSize: 120,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
    gap: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});