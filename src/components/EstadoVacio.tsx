import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { spacing } from '../styles/global';

type Props = {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
  mensaje: string;
};

/** Mensaje para listas vacías (se usa como ListEmptyComponent, Clase 3). */
const EstadoVacio: React.FC<Props> = ({ icono, titulo, mensaje }) => (
  <View style={styles.contenedor}>
    <View style={styles.circulo}>
      <Ionicons name={icono} size={34} color={colors.primary} />
    </View>
    <Text style={styles.titulo}>{titulo}</Text>
    <Text style={styles.mensaje}>{mensaje}</Text>
  </View>
);

export default EstadoVacio;

const styles = StyleSheet.create({
  contenedor: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: spacing.xl, gap: spacing.sm },
  circulo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titulo: { fontSize: 17, fontWeight: '700', color: colors.text },
  mensaje: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
