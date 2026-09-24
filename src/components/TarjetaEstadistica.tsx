import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { globalStyles, radius, spacing } from '../styles/global';

type Props = {
  titulo: string;
  valor: string;
  icono: keyof typeof Ionicons.glyphMap;
  color: string;
  detalle?: string;
};

/** Tarjeta de indicador para la pantalla Resumen. */
const TarjetaEstadistica: React.FC<Props> = ({ titulo, valor, icono, color, detalle }) => (
  <View style={[globalStyles.card, styles.tarjeta]}>
    <View style={[styles.icono, { backgroundColor: `${color}1A` }]}>
      <Ionicons name={icono} size={18} color={color} />
    </View>
    <Text style={styles.titulo}>{titulo}</Text>
    <Text style={styles.valor} numberOfLines={1} adjustsFontSizeToFit>
      {valor}
    </Text>
    {detalle && <Text style={styles.detalle}>{detalle}</Text>}
  </View>
);

export default TarjetaEstadistica;

const styles = StyleSheet.create({
  // flexBasis 45% + flexGrow: dos tarjetas por fila que se adaptan al ancho (Clase 10)
  tarjeta: { flexGrow: 1, flexBasis: '45%', gap: 4, padding: spacing.md },
  icono: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  titulo: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  valor: { fontSize: 20, fontWeight: '800', color: colors.text },
  detalle: { fontSize: 12, color: colors.textMuted },
});
