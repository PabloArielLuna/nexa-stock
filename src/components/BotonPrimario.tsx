import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radius, spacing } from '../styles/global';
import { feedback } from '../services/dispositivo';

type Variante = 'primario' | 'secundario' | 'peligro';

type Props = {
  label: string;
  onPress: () => void;
  variante?: Variante;
  icono?: keyof typeof Ionicons.glyphMap;
  cargando?: boolean;
  deshabilitado?: boolean;
  estilo?: ViewStyle;
};

/**
 * Botón reutilizable con TouchableOpacity (Clase 11).
 * - Baja la opacidad al tocarlo (feedback visual).
 * - Muestra un ActivityIndicator mientras "cargando" es true.
 * - Deshabilitado se ve más claro y no responde.
 */
const BotonPrimario: React.FC<Props> = ({
  label,
  onPress,
  variante = 'primario',
  icono,
  cargando = false,
  deshabilitado = false,
  estilo,
}) => {
  const colorTexto = variante === 'primario' ? colors.onPrimary : COLOR_TEXTO[variante];
  const inactivo = deshabilitado || cargando;

  return (
    <TouchableOpacity
      style={[styles.boton, styles[variante], inactivo && styles.deshabilitado, estilo]}
      onPress={() => {
        feedback();
        onPress();
      }}
      disabled={inactivo}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo }}
    >
      {cargando ? (
        <ActivityIndicator size="small" color={colorTexto} />
      ) : (
        <>
          {icono && <Ionicons name={icono} size={18} color={colorTexto} />}
          <Text style={[styles.texto, { color: colorTexto }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const COLOR_TEXTO: Record<Exclude<Variante, 'primario'>, string> = {
  secundario: colors.primary,
  peligro: colors.error,
};

export default BotonPrimario;

const styles = StyleSheet.create({
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  primario: { backgroundColor: colors.primary },
  secundario: { backgroundColor: colors.primaryLight },
  peligro: { backgroundColor: colors.errorLight },
  deshabilitado: { opacity: 0.45 },
  texto: { fontSize: 16, fontWeight: '700' },
});
