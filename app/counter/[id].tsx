import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { confirmDialog } from '../../src/lib/dialogs';
import { useApp } from '../../src/state/app-context';

const STEPS = [1, 2, 5, 10];
const REPEAT_MS = 80;

export default function CounterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { counters, isDark, dispatch } = useApp();
  const counter = counters.find((c) => c.id === id);

  const [customStepVisible, setCustomStepVisible] = useState(false);
  const [customStepText, setCustomStepText] = useState('');
  const [addNumberVisible, setAddNumberVisible] = useState(false);
  const [addNumberText, setAddNumberText] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameText, setNameText] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scale = useSharedValue(1);

  const reduceMotion = useRef(
    Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  ).current;

  // 数值变化 → 缩放动画（一次）
  const prevValue = useRef(counter?.value ?? 0);
  useEffect(() => {
    if (!counter) return;
    if (prevValue.current !== counter.value && !reduceMotion) {
      scale.value = 0.85;
      scale.value = withTiming(1, { duration: 150 });
    }
    prevValue.current = counter.value;
  }, [counter?.value, reduceMotion, scale]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bump = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []);

  const applyDelta = useCallback(
    (delta: number) => {
      if (!counter) return;
      dispatch({ type: 'updateValue', id: counter.id, delta });
      bump();
    },
    [counter, dispatch, bump]
  );

  const startRepeat = useCallback(
    (delta: number) => {
      if (!counter) return;
      dispatch({ type: 'updateValue', id: counter.id, delta });
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'updateValue', id: counter.id, delta });
      }, REPEAT_MS);
    },
    [counter, dispatch]
  );

  const stopRepeat = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => stopRepeat, [stopRepeat]);

  // 点击标题进入编辑态（预填当前名称）
  const startEditName = useCallback(() => {
    if (!counter) return;
    setNameText(counter.name);
    setEditingName(true);
  }, [counter]);

  // 失焦/提交时保存重命名并退出编辑态（空名称不保存）
  const commitRename = useCallback(() => {
    const n = nameText.trim();
    if (n && counter && n !== counter.name) {
      dispatch({ type: 'renameCounter', id: counter.id, name: n });
    }
    setEditingName(false);
  }, [nameText, counter, dispatch]);

  // 清零直接执行并记入历史，不再二次确认
  const onClear = useCallback(() => {
    if (!counter || counter.value === 0) return;
    dispatch({ type: 'clearWithRecord', id: counter.id });
  }, [counter, dispatch]);

  // 删除计数器（二次确认，历史一并删除）
  const onDelete = useCallback(() => {
    if (!counter) return;
    confirmDialog(
      '删除计数器',
      `确定删除「${counter.name}」？该计数器的历史记录也会删除`,
      '删除',
      true,
      () => {
        dispatch({ type: 'removeCounter', id: counter.id });
        router.back();
      }
    );
  }, [counter, dispatch, router]);

  const confirmCustomStep = useCallback(() => {
    const n = Number(customStepText);
    if (n > 0 && Number.isFinite(n) && counter) {
      dispatch({ type: 'setStep', id: counter.id, step: n });
    }
    setCustomStepVisible(false);
    setCustomStepText('');
  }, [customStepText, counter, dispatch]);

  const confirmAddNumber = useCallback(() => {
    const n = Number(addNumberText);
    if (Number.isFinite(n) && n !== 0 && counter) {
      dispatch({ type: 'updateValue', id: counter.id, delta: n });
      bump();
    }
    setAddNumberVisible(false);
    setAddNumberText('');
  }, [addNumberText, counter, dispatch, bump]);

  if (!counter) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#111' : '#fff', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: isDark ? '#fff' : '#000' }}>计数器不存在</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>返回</Text></TouchableOpacity>
      </SafeAreaView>
    );
  }

  const bg = isDark ? '#111' : '#fff';
  const text = isDark ? '#fff' : '#000';
  const sub = isDark ? '#8e8e93' : '#6e6e73';
  const chipBg = isDark ? '#1c1c1e' : '#f2f2f7';
  const chipActive = isDark ? '#2c2c2e' : '#e5e5ea';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: text }]}>‹ 返回</Text>
        </TouchableOpacity>
        {editingName ? (
          <TextInput
            style={[styles.nameInput, { color: text }]}
            value={nameText}
            onChangeText={setNameText}
            autoFocus
            onBlur={commitRename}
            onSubmitEditing={commitRename}
            returnKeyType="done"
          />
        ) : (
          <TouchableOpacity style={styles.nameBtn} onPress={startEditName} activeOpacity={0.7}>
            <Text style={[styles.name, { color: text }]} numberOfLines={1}>{counter.name}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => router.push(`/history?cid=${counter.id}`)} style={styles.backBtn}>
          <Text style={[styles.backText, { color: text }]}>历史</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.display}>
        <Animated.Text
          style={[styles.value, { color: text, fontVariant: ['tabular-nums'] }, animStyle]}
          adjustsFontSizeToFit
          minimumFontScale={0.15}
          numberOfLines={1}
        >
          {counter.value}
        </Animated.Text>
      </View>

      <View style={styles.bigRow}>
        <TouchableOpacity
          style={[styles.bigBtn, { backgroundColor: '#5856d6' }]}
          onPress={() => applyDelta(-counter.step)}
          onLongPress={() => startRepeat(-counter.step)}
          onPressOut={stopRepeat}
          activeOpacity={0.7}
        >
          <Text style={styles.bigBtnText}>−{counter.step}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bigBtn, styles.plusBtn]}
          onPress={() => applyDelta(counter.step)}
          onLongPress={() => startRepeat(counter.step)}
          onPressOut={stopRepeat}
          activeOpacity={0.7}
        >
          <Text style={styles.bigBtnText}>+{counter.step}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chips}>
        {STEPS.map((s) => {
          const active = counter.step === s;
          return (
            <TouchableOpacity
              key={s}
              style={[styles.chip, { backgroundColor: active ? chipActive : chipBg, borderColor: active ? '#007aff' : 'transparent', borderWidth: 1 }]}
              onPress={() => dispatch({ type: 'setStep', id: counter.id, step: s })}
            >
              <Text style={[styles.chipText, { color: active ? '#007aff' : text }]}>{s}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={[styles.chip, { backgroundColor: chipBg }]} onPress={() => setCustomStepVisible(true)}>
          <Text style={[styles.chipText, { color: text }]}>自定义</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.chip, styles.addChip]} onPress={() => setAddNumberVisible(true)}>
          <Text style={styles.addChipText}>自定义 +</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dangerRow}>
        <TouchableOpacity style={styles.clearBtn} onPress={onClear} activeOpacity={0.7}>
          <Text style={styles.clearText}>清零并保存</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.7}>
          <Text style={styles.deleteText}>删除</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.watermark, { color: isDark ? '#333' : '#ddd' }]}>by：suming</Text>

      {/* 自定义步长弹窗 */}
      <Modal visible={customStepVisible} transparent animationType="fade" onRequestClose={() => setCustomStepVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: text }]}>自定义步长</Text>
            <TextInput
              style={[styles.modalInput, { color: text, borderColor: isDark ? '#3a3a3c' : '#c7c7cc' }]}
              value={customStepText}
              onChangeText={setCustomStepText}
              keyboardType="number-pad"
              placeholder="每次加减多少"
              placeholderTextColor={sub}
              autoFocus
              onSubmitEditing={confirmCustomStep}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: isDark ? '#2c2c2e' : '#e5e5ea' }]} onPress={() => setCustomStepVisible(false)}>
                <Text style={[styles.modalBtnText, { color: text }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalConfirm]} onPress={confirmCustomStep}>
                <Text style={styles.modalConfirmText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 自定义加数弹窗 */}
      <Modal visible={addNumberVisible} transparent animationType="fade" onRequestClose={() => setAddNumberVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modalBox, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: text }]}>自定义加数</Text>
            <TextInput
              style={[styles.modalInput, { color: text, borderColor: isDark ? '#3a3a3c' : '#c7c7cc' }]}
              value={addNumberText}
              onChangeText={setAddNumberText}
              keyboardType={Platform.OS === 'android' ? 'default' : 'numbers-and-punctuation'}
              placeholder="输入数字，负数表示减"
              placeholderTextColor={sub}
              autoFocus
              onSubmitEditing={confirmAddNumber}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: isDark ? '#2c2c2e' : '#e5e5ea' }]} onPress={() => setAddNumberVisible(false)}>
                <Text style={[styles.modalBtnText, { color: text }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalConfirm]} onPress={confirmAddNumber}>
                <Text style={styles.modalConfirmText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  backText: { fontSize: 16 },
  nameBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 8 },
  name: { fontSize: 22, fontWeight: '600', textAlign: 'center' },
  nameInput: { flex: 1, fontSize: 22, fontWeight: '600', textAlign: 'center', marginHorizontal: 8, paddingVertical: 0 },
  display: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  value: { fontSize: 140, fontWeight: 'bold' },
  bigRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 24, marginBottom: 24 },
  bigBtn: { flex: 1, paddingVertical: 26, borderRadius: 16, alignItems: 'center' },
  plusBtn: { backgroundColor: '#007aff' },
  bigBtnText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  chips: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap', paddingHorizontal: 16 },
  chip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20 },
  chipText: { fontSize: 15, fontWeight: '600' },
  addChip: { backgroundColor: '#007aff' },
  addChipText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  dangerRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 32 },
  clearBtn: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12, backgroundColor: '#ff3b30' },
  clearText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  deleteBtn: { paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12, borderWidth: 1, borderColor: '#ff3b30' },
  deleteText: { color: '#ff3b30', fontSize: 16, fontWeight: 'bold' },
  watermark: { position: 'absolute', bottom: 16, right: 24, fontSize: 12 },
  link: { color: '#007aff', fontSize: 16, marginTop: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 32 },
  modalBox: { borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 16, marginBottom: 16 },
  modalRow: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modalConfirm: { backgroundColor: '#007aff' },
  modalBtnText: { fontSize: 16, fontWeight: '600' },
  modalConfirmText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
