import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BarraBusqueda from '../components/BarraBusqueda';
import BotonFlotante from '../components/BotonFlotante';
import ChipFiltro from '../components/ChipFiltro';
import EstadoVacio from '../components/EstadoVacio';
import TarjetaProducto from '../components/TarjetaProducto';
import { colors } from '../styles/colors';
import { globalStyles, spacing } from '../styles/global';
import { InventarioStackParamList } from '../types/navigation';
import { Producto } from '../types/models';
import { CATEGORIAS } from '../utils/categorias';
import { confirmar } from '../utils/dialogos';
import { useInventarioViewModel } from '../viewmodels/useInventarioViewModel';

type Props = NativeStackScreenProps<InventarioStackParamList, 'ListaProductos'>;

/**
 * VISTA: listado del inventario con búsqueda, filtro por categoría y FlatList.
 * No tiene lógica de negocio: todo lo que muestra sale del ViewModel.
 */
const ListaProductosScreen: React.FC<Props> = ({ navigation }) => {
  const vm = useInventarioViewModel();

  const pedirEliminar = (producto: Producto) => {
    confirmar({
      titulo: 'Eliminar producto',
      mensaje: `¿Seguro que querés eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
      destructivo: true,
      onConfirmar: () => vm.eliminarProducto(producto.id),
    });
  };

  return (
    <View style={globalStyles.screen}>
      <View style={styles.encabezado}>
        <Text style={styles.resumen}>
          {vm.totalProductos} productos · {vm.totalUnidades} unidades
          {vm.cantidadConAlerta > 0 && (
            <Text style={styles.alerta}> · {vm.cantidadConAlerta} para reponer</Text>
          )}
        </Text>

        <BarraBusqueda
          value={vm.busqueda}
          onChangeText={vm.setBusqueda}
          placeholder="Buscar por nombre o marca"
        />

        {/* Filtros por categoría: se scrollean de costado */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <ChipFiltro label="Todas" activo={vm.filtro === 'todas'} onPress={() => vm.setFiltro('todas')} />
          {CATEGORIAS.map((cat) => (
            <ChipFiltro
              key={cat.id}
              label={cat.nombre}
              icono={cat.icono}
              color={cat.color}
              activo={vm.filtro === cat.id}
              onPress={() => vm.setFiltro(cat.id)}
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={vm.productosVisibles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TarjetaProducto
            producto={item}
            onPress={() => navigation.navigate('DetalleProducto', { productoId: item.id })}
            onLongPress={() => pedirEliminar(item)}
          />
        )}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          vm.hayFiltrosActivos ? (
            <EstadoVacio
              icono="search"
              titulo="Sin resultados"
              mensaje="No hay productos que coincidan con la búsqueda o el filtro elegido."
            />
          ) : (
            <EstadoVacio
              icono="cube-outline"
              titulo="Tu inventario está vacío"
              mensaje={'Tocá "Nuevo" para cargar tu primer producto.'}
            />
          )
        }
        ListFooterComponent={
          vm.productosVisibles.length > 0 ? (
            <Text style={styles.pista}>Mantené presionado un producto para eliminarlo</Text>
          ) : null
        }
      />

      <BotonFlotante
        label="Nuevo"
        icono="add"
        onPress={() => navigation.navigate('FormularioProducto', {})}
      />
    </View>
  );
};

export default ListaProductosScreen;

const styles = StyleSheet.create({
  encabezado: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  resumen: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  alerta: { color: colors.warning, fontWeight: '700' },
  chips: { gap: spacing.sm, paddingBottom: spacing.xs },
  lista: { padding: spacing.lg, paddingBottom: 110, gap: spacing.md },
  pista: { textAlign: 'center', color: colors.textLight, fontSize: 12, marginTop: spacing.sm },
});
