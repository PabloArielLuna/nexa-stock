import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EstadoStock } from '../types/models';
import { colors } from '../styles/colors';
import { radius } from '../styles/global';

type Props = {
  stock: number;
  estado: EstadoStock;
};

// Colores y textos según el estado del stock (renderizado condicional).
const ESTILO_POR_ESTADO: Record<EstadoStock, { fondo: string; texto: string }> = {
  ok: { fondo: colors.successLight, texto: colors.success },
  bajo: { fondo: colors.warningLight, texto: colors.warning },
  'sin-stock': { fondo: colors.errorLight, texto: colors.error },
};

/** Etiqueta de color con las unidades disponibles. */
const InsigniaStock: React.FC<Props> = ({ stock, estado }) => {
  const { fondo, texto } = ESTILO_POR_ESTADO[estado];
  const etiqueta = estado === 'sin-stock' ? 'Sin stock' : `${stock} ${stock === 1 ? 'unidad' : 'unidades'}`;

  return (
    <View style={[styles.insignia, { backgroundColor: fondo }]}>
      <View style={[styles.punto, { backgroundColor: texto }]} />
      <Text style={[styles.texto, { color: texto }]}>{etiqueta}</Text>
    </View>
  );
};

export default InsigniaStock;

const styles = StyleSheet.create({
  insignia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  punto: { width: 6, height: 6, borderRadius: 3 },
  texto: { fontSize: 12, fontWeight: '700' },
});
