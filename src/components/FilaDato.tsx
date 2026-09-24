import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/global';

type Props = {
  etiqueta: string;
  valor: string;
  colorValor?: string;
};

/** Par "etiqueta — valor" alineado a los costados (space-between, Clase 2). */
const FilaDato: React.FC<Props> = ({ etiqueta, valor, colorValor = colors.text }) => (
  <View style={styles.fila}>
    <Text style={styles.etiqueta}>{etiqueta}</Text>
    <Text style={[styles.valor, { color: colorValor }]}>{valor}</Text>
  </View>
);

export default FilaDato;

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  etiqueta: { fontSize: 14, color: colors.textMuted },
  valor: { fontSize: 15, fontWeight: '700' },
});
