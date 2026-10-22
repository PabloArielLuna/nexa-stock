import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radius, spacing } from '../styles/global';

type Props = {
  label: string;
  activo: boolean;
  onPress: () => void;
  icono?: keyof typeof Ionicons.glyphMap;
  color?: string; // color cuando está activo
};

/** "Pastilla" seleccionable para filtros y opciones (Clase 8, Ejercicio 5). */
const ChipFiltro: React.FC<Props> = ({ label, activo, onPress, icono, color = colors.primary }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.chip, activo && { backgroundColor: colors.primary, borderColor: colors.primary }]}
    accessibilityRole="button"
    accessibilityState={{ selected: activo }}
  >
    {icono && <Ionicons name={icono} size={15} color={activo ? colors.onPrimary : colors.textMuted} />}
    <Text style={[styles.texto, activo && styles.textoActivo]}>{label}</Text>
  </TouchableOpacity>
);

export default ChipFiltro;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  texto: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  textoActivo: { color: colors.onPrimary },
});
