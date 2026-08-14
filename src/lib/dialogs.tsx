import { useSyncExternalStore } from 'react';
import { Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useApp } from '../state/app-context';

export interface MenuItem {
  label: string;
  destructive?: boolean;
  onPress: () => void;
}

/**
 * 跨端对话框封装。
 * React Native Web 的 Alert.alert 是 no-op，web 端必须用 window.confirm / window.alert / 自建 Modal。
 * - confirmDialog：web 用 window.confirm，原生用 Alert.alert（取消 + 确认）
 * - showAlert：web 用 window.alert，原生用 Alert.alert
 * - showMenu：统一用 Modal 底部菜单（跨端一致，web 上 Alert 按钮列表不可用）
 */

export function confirmDialog(
  title: string,
  message: string,
  confirmText: string,
  destructive: boolean,
  onConfirm: () => void
): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: '取消', style: 'cancel' },
    { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}

export function showAlert(title: string, message: string): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(message ? `${title}\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

// ---- showMenu：Modal 底部菜单（模块级单例状态 + DialogHost 渲染） ----

interface MenuState {
  title: string;
  items: MenuItem[];
}

let menuState: MenuState | null = null;
const menuListeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  menuListeners.add(listener);
  return () => {
    menuListeners.delete(listener);
  };
}

function getSnapshot(): MenuState | null {
  return menuState;
}

function setMenu(next: MenuState | null): void {
  menuState = next;
  menuListeners.forEach((fn) => fn());
}

export function showMenu(title: string, items: MenuItem[]): void {
  setMenu({ title, items });
}

/** 挂在根布局 AppProvider 内一次，负责渲染 showMenu 打开的底部菜单 */
export function DialogHost() {
  const { isDark } = useApp();
  const menu = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const bg = isDark ? '#1c1c1e' : '#fff';
  const text = isDark ? '#fff' : '#000';
  const sub = isDark ? '#8e8e93' : '#6e6e73';
  const itemBg = isDark ? '#2c2c2e' : '#f2f2f7';
  const destructiveColor = '#ff3b30';

  const close = () => setMenu(null);

  return (
    <Modal visible={menu !== null} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={close} activeOpacity={1} />
        <View style={[styles.box, { backgroundColor: bg }]}>
          <Text style={[styles.title, { color: sub }]} numberOfLines={1}>
            {menu?.title ?? ''}
          </Text>
          {(menu?.items ?? []).map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.item, { backgroundColor: itemBg }]}
              activeOpacity={0.7}
              onPress={() => {
                close();
                item.onPress();
              }}
            >
              <Text style={[styles.itemText, { color: item.destructive ? destructiveColor : text }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.item, styles.cancelItem, { backgroundColor: itemBg }]}
            onPress={close}
            activeOpacity={0.7}
          >
            <Text style={[styles.itemText, { color: text }]}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  box: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  item: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
  cancelItem: { marginTop: 4, marginBottom: 0 },
  itemText: { fontSize: 16, fontWeight: '600' },
});
