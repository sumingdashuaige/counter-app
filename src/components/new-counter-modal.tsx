import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  isDark: boolean;
  /** 弹窗标题：新建时传"新建计数器"，编辑时传"重命名计数器" */
  title: string;
  /** 编辑模式预填的名称；新建模式不传 */
  initialName?: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export function NewCounterModal({ visible, isDark, title, initialName, onCancel, onConfirm }: Props) {
  const [name, setName] = useState('');
  const isEdit = initialName !== undefined;
  const bg = isDark ? '#1c1c1e' : '#fff';
  const text = isDark ? '#fff' : '#000';

  // 每次打开时按模式重置：编辑预填原名，新建清空
  useEffect(() => {
    if (visible) {
      setName(initialName ?? '');
    }
  }, [visible, initialName]);

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    onConfirm(n);
    setName('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: bg }]}>
          <Text style={[styles.title, { color: text }]}>{title}</Text>
          <TextInput
            style={[styles.input, { color: text, borderColor: isDark ? '#3a3a3c' : '#c7c7cc' }]}
            value={name}
            onChangeText={setName}
            placeholder={isEdit ? '计数器新名称' : '计数器名称'}
            placeholderTextColor={isDark ? '#8e8e93' : '#aeaeb2'}
            autoFocus
            onSubmitEditing={submit}
          />
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: isDark ? '#2c2c2e' : '#e5e5ea' }]}
              onPress={onCancel}
            >
              <Text style={[styles.btnText, { color: text }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.confirm, { opacity: name.trim() ? 1 : 0.4 }]}
              disabled={!name.trim()}
              onPress={submit}
            >
              <Text style={styles.confirmText}>{isEdit ? '保存' : '创建'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 32 },
  box: { borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 16, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  confirm: { backgroundColor: '#007aff' },
  btnText: { fontSize: 16, fontWeight: '600' },
  confirmText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
