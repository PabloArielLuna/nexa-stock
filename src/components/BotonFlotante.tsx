import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radius, spacing } from '../styles/global';

type Props = {
  label: string;
  icono: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

/**
 * Botón flotante (FAB) para la acción principal de la pantalla.
 * Es de los pocos casos donde se justifica position: 'absolute':
 * tiene que quedar fijo encima de la lista mientras se scrollea.
 */
const BotonFlotante: React.FC<Props> = ({ label, icono, onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8} accessibilityRole="button">
    <Ionicons name={icono} size={22} color={colors.onPrimary} />
    <Text style={styles.texto}>{label}</Text>
  </TouchableOpacity>
);

export default BotonFlotante;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  texto: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
});
