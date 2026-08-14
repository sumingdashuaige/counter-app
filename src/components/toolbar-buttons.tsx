import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { showAlert, showMenu } from '../lib/dialogs';
import { serializeExport } from '../lib/io';
import { parseExportFile } from '../lib/io';
import { exportJsonToFile, pickJsonFile } from '../lib/platform-io';
import { useApp } from '../state/app-context';

function nextTheme(mode: 'system' | 'light' | 'dark'): 'system' | 'light' | 'dark' {
  return mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system';
}

const THEME_LABEL = { system: '自动', light: '浅色', dark: '深色' } as const;

export function ToolbarButtons() {
  const { counters, themeMode, setThemeMode, dispatch } = useApp();

  const onExport = async () => {
    const filename = `counters-${new Date().toISOString().slice(0, 10)}.json`;
    try {
      await exportJsonToFile(filename, serializeExport(counters));
    } catch (e) {
      showAlert('导出失败', String(e));
    }
  };

  const onImport = async () => {
    try {
      const text = await pickJsonFile();
      if (text === null) return;
      const parsed = parseExportFile(text);
      if (!parsed) {
        showAlert('导入失败', '文件格式不正确');
        return;
      }
      showMenu(`导入方式（共 ${parsed.counters.length} 个计数器）`, [
        { label: '合并', onPress: () => dispatch({ type: 'importMerge', counters: parsed.counters }) },
        {
          label: '替换',
          destructive: true,
          onPress: () => dispatch({ type: 'importReplace', counters: parsed.counters }),
        },
      ]);
    } catch (e) {
      showAlert('导入失败', String(e));
    }
  };

  const onTheme = () => setThemeMode(nextTheme(themeMode));

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.btn} onPress={onTheme}>
        <Text style={styles.btnText}>主题:{THEME_LABEL[themeMode]}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onExport}>
        <Text style={styles.btnText}>导出</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onImport}>
        <Text style={styles.btnText}>导入</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 12 },
  btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#007aff' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
