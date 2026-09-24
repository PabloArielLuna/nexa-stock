import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Producto } from '../types/models';
import { colors } from '../styles/colors';
import { globalStyles, spacing } from '../styles/global';
import { estadoStock } from '../utils/calculos';
import { obtenerCategoria } from '../utils/categorias';
import { formatoPrecio } from '../utils/formato';
import FotoProducto from './FotoProducto';
import InsigniaStock from './InsigniaStock';

type Props = {
  producto: Producto;
  onPress: () => void;
  onLongPress?: () => void;
};

/**
 * Tarjeta reutilizable de la lista (Clase 3): recibe el producto
 * completo como prop y no tiene estado propio.
 */
const TarjetaProducto: React.FC<Props> = ({ producto, onPress, onLongPress }) => {
  const categoria = obtenerCategoria(producto.categoria);

  return (
    <TouchableOpacity
      style={[globalStyles.card, styles.tarjeta]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${producto.nombre}, ${formatoPrecio(producto.precio)}`}
    >
      <FotoProducto uri={producto.fotoUri} categoria={producto.categoria} />

      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={1}>
          {producto.nombre}
        </Text>
        <Text style={styles.subtitulo} numberOfLines={1}>
          {producto.marca} · {categoria.nombre}
          {producto.reacondicionado && ' · Reacond.'}
        </Text>
        <InsigniaStock stock={producto.stock} estado={estadoStock(producto)} />
      </View>

      <View style={styles.derecha}>
        <Text style={styles.precio}>{formatoPrecio(producto.precio)}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );
};

export default TarjetaProducto;

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  info: { flex: 1, gap: 4 },
  nombre: { fontSize: 16, fontWeight: '700', color: colors.text },
  subtitulo: { fontSize: 13, color: colors.textMuted },
  derecha: { alignItems: 'flex-end', gap: spacing.sm },
  precio: { fontSize: 16, fontWeight: '800', color: colors.text },
});
