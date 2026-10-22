import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Venta } from '../types/models';
import { colors } from '../styles/colors';
import { globalStyles, radius, spacing } from '../styles/global';
import { gananciaVenta } from '../utils/calculos';
import { formatoFechaHora, formatoPrecio } from '../utils/formato';

type Props = {
  venta: Venta;
  onAnular: () => void;
};

/** Fila del historial de ventas, con botón para anularla. */
const TarjetaVenta: React.FC<Props> = ({ venta, onAnular }) => (
  <View style={[globalStyles.card, styles.tarjeta]}>
    <View style={styles.icono}>
      <Ionicons name="bag-check" size={22} color={colors.success} />
    </View>

    <View style={styles.info}>
      <Text style={styles.nombre} numberOfLines={1}>
        {venta.productoNombre}
      </Text>
      <Text style={styles.detalle}>
        {venta.cantidad} × {formatoPrecio(venta.precioUnitario)} · {formatoFechaHora(venta.fecha)}
      </Text>
      <Text style={styles.ganancia}>Ganancia {formatoPrecio(gananciaVenta(venta))}</Text>
      {venta.anulacion && (
        <Text style={[styles.detalle, { color: colors.error }]}>
          Anulada el {formatoFechaHora(venta.anulacion.fecha)} · {venta.anulacion.motivo}
          {!venta.anulacion.stockRestituido && '\nSin devolución de stock: el producto ya no existía.'}
        </Text>
      )}
    </View>

    <View style={styles.derecha}>
      <Text style={styles.total}>{formatoPrecio(venta.cantidad * venta.precioUnitario)}</Text>
      {!venta.anulacion && (
        <TouchableOpacity
          onPress={onAnular}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Anular venta de ${venta.productoNombre}`}
        >
          <Text style={styles.anular}>Anular</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default TarjetaVenta;

const styles = StyleSheet.create({
  tarjeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  icono: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { flex: 1, gap: 2 },
  nombre: { fontSize: 15, fontWeight: '700', color: colors.text },
  detalle: { fontSize: 12, color: colors.textMuted },
  ganancia: { fontSize: 12, color: colors.success, fontWeight: '600' },
  derecha: { alignItems: 'flex-end', gap: 6 },
  total: { fontSize: 16, fontWeight: '800', color: colors.text },
  anular: { fontSize: 13, color: colors.error, fontWeight: '600' },
});
