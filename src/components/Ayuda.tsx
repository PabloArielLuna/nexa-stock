import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { avisar } from '../utils/dialogos';
import { colors } from '../styles/colors';
export default function Ayuda({
  titulo,
  mensaje,
  label = 'Ayuda',
}: {
  titulo: string;
  mensaje: string;
  label?: string;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      style={s.button}
      onPress={() => avisar(titulo, mensaje)}
    >
      <Ionicons name="information-circle-outline" color={colors.textMuted} size={18} />
      <Text style={s.text}>{label}</Text>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  button: { minHeight: 36, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6 },
  text: { color: colors.textMuted, fontSize: 12 },
});
