import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

type Props = {
  titulo: string;
  valor: string;
  detalle: string;
  color: string;
  icono: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};
export default function MetricaPanel({ titulo, valor, detalle, color, icono, onPress }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${titulo}: ${valor}. ${detalle}`}
      onPress={onPress}
      style={s.card}
    >
      <View style={s.row}>
        <View style={[s.icon, { backgroundColor: `${color}18` }]}>
          <Ionicons name={icono} size={19} color={color} />
        </View>
        <Ionicons name="arrow-forward" size={14} color={colors.textLight} />
      </View>
      <Text style={[s.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {valor}
      </Text>
      <Text style={s.title}>{titulo}</Text>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 120,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  icon: { padding: 9, borderRadius: 12 },
  value: { fontSize: 29, fontWeight: '600', letterSpacing: -1, marginTop: 6 },
  title: { color: colors.text, fontSize: 13, fontWeight: '600' },
  detail: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
});
