import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import FotoProducto from '../components/FotoProducto';
import InsigniaStock from '../components/InsigniaStock';
import TarjetaEstadistica from '../components/TarjetaEstadistica';
import Encabezado from '../components/Encabezado';
import { colors } from '../styles/colors';
import { globalStyles, radius, spacing } from '../styles/global';
import { typography } from '../styles/typography';
import { RootTabParamList } from '../types/navigation';
import { estadoStock } from '../utils/calculos';
import { formatoPrecio } from '../utils/formato';
import { useResumenViewModel } from '../viewmodels/useResumenViewModel';

type Props = BottomTabScreenProps<RootTabParamList, 'Resumen'>;

/** VISTA: tablero con los números del negocio. */
const ResumenScreen: React.FC<Props> = ({ navigation }) => {
  const vm = useResumenViewModel();

  // Navegar a una pantalla del Stack que vive en OTRA pestaña (navegadores anidados, Clase 5).
  const abrirProducto = (productoId: string) => {
    navigation.navigate('InventarioTab', {
      screen: 'DetalleProducto',
      params: { productoId },
      initial: false, // deja la lista debajo, para que "atrás" vuelva al inventario
    });
  };

  return (
    <ScrollView style={globalStyles.screen} contentContainerStyle={globalStyles.scrollContent}>
      <Encabezado titulo="Resumen" />

      {/* Grilla de indicadores: flexWrap + flexBasis 45% = 2 columnas */}
      <View style={styles.grilla}>
        <TarjetaEstadistica
          titulo="Ventas del mes"
          valor={formatoPrecio(vm.ingresosMes)}
          detalle={`${vm.cantidadVentasMes} operaciones`}
          icono="trending-up"
          color={colors.primary}
        />
        <TarjetaEstadistica
          titulo="Ganancia del mes"
          valor={formatoPrecio(vm.gananciaMes)}
          detalle="Ventas − costo"
          icono="cash-outline"
          color={colors.success}
        />
        <TarjetaEstadistica
          titulo="Invertido en stock"
          valor={formatoPrecio(vm.valorACosto)}
          detalle={`${vm.unidadesEnStock} unidades`}
          icono="cube-outline"
          color="#0EA5E9"
        />
        <TarjetaEstadistica
          titulo="Ganancia potencial"
          valor={formatoPrecio(vm.gananciaPotencial)}
          detalle="Si vendés todo el stock"
          icono="sparkles-outline"
          color={colors.warning}
        />
      </View>

      {/* Barras de stock por categoría, hechas sólo con Flexbox */}
      <View style={[globalStyles.card, styles.seccion]}>
        <Text style={typography.h3}>Stock por categoría</Text>
        {vm.stockPorCategoria.length === 0 && <Text style={typography.small}>No hay unidades en stock.</Text>}
        {vm.stockPorCategoria.map((cat) => (
          <View key={cat.id} style={styles.filaBarra}>
            <Ionicons name={cat.icono} size={16} color={cat.color} />
            <Text style={styles.nombreBarra} numberOfLines={1}>
              {cat.nombre}
            </Text>
            <View style={styles.pista}>
              <View
                style={[
                  styles.relleno,
                  { width: `${(cat.unidades / vm.maximoCategoria) * 100}%`, backgroundColor: cat.color },
                ]}
              />
            </View>
            <Text style={styles.unidadesBarra}>{cat.unidades}</Text>
          </View>
        ))}
      </View>

      {/* Productos para reponer */}
      <View style={[globalStyles.card, styles.seccion]}>
        <Text style={typography.h3}>Para reponer</Text>
        {vm.paraReponer.length === 0 ? (
          <Text style={typography.small}>¡Todo en orden! Ningún producto está por debajo del mínimo.</Text>
        ) : (
          vm.paraReponer.map((p) => (
            <TouchableOpacity key={p.id} style={styles.filaReponer} onPress={() => abrirProducto(p.id)}>
              <FotoProducto uri={p.fotoUri} categoria={p.categoria} tamanio={40} />
              <View style={styles.infoReponer}>
                <Text style={styles.nombreReponer} numberOfLines={1}>
                  {p.nombre}
                </Text>
                <Text style={typography.small}>Mínimo: {p.stockMinimo} u.</Text>
              </View>
              <InsigniaStock stock={p.stock} estado={estadoStock(p)} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default ResumenScreen;

const styles = StyleSheet.create({
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  seccion: { gap: spacing.md },
  filaBarra: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  nombreBarra: { width: 96, fontSize: 13, color: colors.text },
  pista: {
    flex: 1,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  relleno: { height: '100%', borderRadius: radius.pill },
  unidadesBarra: { width: 28, textAlign: 'right', fontSize: 13, fontWeight: '700', color: colors.text },
  filaReponer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoReponer: { flex: 1 },
  nombreReponer: { fontSize: 15, fontWeight: '600', color: colors.text },
});
