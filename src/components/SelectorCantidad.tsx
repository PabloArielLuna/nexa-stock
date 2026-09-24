import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radius, spacing } from '../styles/global';

type Props = {
  valor: number;
  onCambiar: (delta: number) => void; // recibe +1 o -1 (como modificar(delta) de la Clase 9)
  minimo: number;
  maximo: number;
};

/** Botones − / + para elegir una cantidad entre un mínimo y un máximo. */
const SelectorCantidad: React.FC<Props> = ({ valor, onCambiar, minimo, maximo }) => {
  const puedeRestar = valor > minimo;
  const puedeSumar = valor < maximo;

  return (
    <View style={styles.fila}>
      <TouchableOpacity
        style={[styles.boton, !puedeRestar && styles.botonInactivo]}
        onPress={() => onCambiar(-1)}
        disabled={!puedeRestar}
        accessibilityLabel="Restar uno"
      >
        <Ionicons name="remove" size={22} color={colors.primary} />
      </TouchableOpacity>

      <Text style={styles.valor}>{valor}</Text>

      <TouchableOpacity
        style={[styles.boton, !puedeSumar && styles.botonInactivo]}
        onPress={() => onCambiar(+1)}
        disabled={!puedeSumar}
        accessibilityLabel="Sumar uno"
      >
        <Ionicons name="add" size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default SelectorCantidad;

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  boton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonInactivo: { opacity: 0.35 },
  valor: { fontSize: 28, fontWeight: '800', color: colors.text, minWidth: 48, textAlign: 'center' },
});
