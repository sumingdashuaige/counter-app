import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Counter } from '../lib/types';

interface Props {
  counter: Counter;
  isDark: boolean;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
  onMenu: (id: string) => void;
  onDelta: (id: string, delta: number) => void;
}

function CounterCardBase({ counter, isDark, onPress, onLongPress, onMenu, onDelta }: Props) {
  const cardBg = isDark ? '#1c1c1e' : '#f2f2f7';
  const text = isDark ? '#fff' : '#000';
  const sub = isDark ? '#8e8e93' : '#6e6e73';

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <TouchableOpacity
        style={styles.main}
        onPress={() => onPress(counter.id)}
        onLongPress={() => onLongPress(counter.id)}
        delayLongPress={350}
        activeOpacity={0.7}
      >
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: sub }]} numberOfLines={1}>
            {counter.name}
          </Text>
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => onMenu(counter.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.6}
          >
            <Text style={[styles.moreText, { color: sub }]}>⋯</Text>
          </TouchableOpacity>
        </View>
        <Text
          style={[styles.value, { color: text, fontVariant: ['tabular-nums'] }]}
          adjustsFontSizeToFit
          minimumFontScale={0.35}
          numberOfLines={1}
        >
          {counter.value}
        </Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.minus, { backgroundColor: isDark ? '#2c2c2e' : '#e5e5ea' }]} onPress={() => onDelta(counter.id, -counter.step)} activeOpacity={0.7}>
          <Text style={[styles.actionText, { color: text }]}>−{counter.step}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.plus} onPress={() => onDelta(counter.id, counter.step)} activeOpacity={0.7}>
          <Text style={styles.plusText}>+{counter.step}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const CounterCard = memo(CounterCardBase);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    margin: 6,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 13,
    flex: 1,
  },
  moreBtn: {
    padding: 2,
    marginLeft: 6,
  },
  moreText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  value: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  minus: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  plus: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007aff',
  },
  actionText: { fontSize: 15, fontWeight: 'bold' },
  plusText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
});
