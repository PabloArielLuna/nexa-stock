import React, { useState } from 'react';
import MotivoModal from '../components/MotivoModal';
import EtiquetaProducto from '../components/EtiquetaProducto';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BotonPrimario from '../components/BotonPrimario';
import EstadoVacio from '../components/EstadoVacio';
import FilaDato from '../components/FilaDato';
import FotoProducto from '../components/FotoProducto';
import InsigniaStock from '../components/InsigniaStock';
import { colors } from '../styles/colors';
import { globalStyles, radius, spacing } from '../styles/global';
import { typography } from '../styles/typography';
import { InventarioStackParamList } from '../types/navigation';
import { obtenerCategoria } from '../utils/categorias';
import { avisar, confirmar } from '../utils/dialogos';
import { useInventario } from '../context/InventarioContext';
import { formatoPrecio } from '../utils/formato';
import { useDetalleProductoViewModel } from '../viewmodels/useDetalleProductoViewModel';
import { usePerfil } from '../context/PerfilContext';

type Props = NativeStackScreenProps<InventarioStackParamList, 'DetalleProducto'>;

/** VISTA: ficha completa de un producto y sus acciones. */
const DetalleProductoScreen: React.FC<Props> = ({ navigation, route }) => {
  // Recibo sólo el id por parámetro (Clase 6) y el ViewModel busca el resto.
  const { productoId } = route.params;
  const vm = useDetalleProductoViewModel(productoId);
  const { invitado, salir } = usePerfil();
  const { vincularQr } = useInventario();
  const [eliminando, setEliminando] = useState(false);

  // Renderizado condicional: el producto pudo haber sido eliminado.
  if (!vm.producto) {
    return (
      <View style={[globalStyles.screen, styles.noEncontrado]}>
        <EstadoVacio
          icono="alert-circle-outline"
          titulo="Producto no encontrado"
          mensaje="Puede que lo hayas eliminado."
        />
        <BotonPrimario label="Volver al inventario" onPress={() => navigation.popToTop()} />
      </View>
    );
  }

  const { producto } = vm;
  const categoria = obtenerCategoria(producto.categoria);

  const pedirEliminar = () => {
    setEliminando(true);
  };

  return (
    <ScrollView style={globalStyles.screen} contentContainerStyle={globalStyles.scrollContent}>
      <MotivoModal
        visible={eliminando}
        titulo="Dar de baja el producto"
        detalle="El producto sale del catálogo, pero conserva sus ventas y movimientos."
        onCancelar={() => setEliminando(false)}
        onConfirmar={(motivo) => {
          vm.eliminar(motivo);
          navigation.goBack();
        }}
      />
      {/* Cabecera con foto, nombre y precio */}
      <View style={[globalStyles.card, styles.cabecera]}>
        <FotoProducto uri={producto.fotoUri} categoria={producto.categoria} tamanio={112} />
        <Text style={[typography.h2, styles.centrado]}>{producto.nombre}</Text>
        <Text style={typography.small}>SKU: {producto.sku ?? 'Pendiente de asignar'}</Text>
        <Text style={typography.small}>
          {producto.marca} · {categoria.nombre}
        </Text>
        <View style={styles.insignias}>
          <InsigniaStock stock={producto.stock} estado={vm.estado} />
          {producto.reacondicionado && (
            <View style={styles.etiqueta}>
              <Text style={styles.textoEtiqueta}>Reacondicionado</Text>
            </View>
          )}
        </View>
        <Text style={styles.precio}>{formatoPrecio(producto.precio)}</Text>
      </View>

      {/* Números del producto */}
      {!invitado && (
        <View style={globalStyles.card}>
          <Text style={[typography.h3, styles.tituloSeccion]}>Números</Text>
          <FilaDato etiqueta="Costo por unidad" valor={formatoPrecio(producto.costo)} />
          <FilaDato
            etiqueta="Ganancia por unidad"
            valor={`${formatoPrecio(vm.ganancia)} (${vm.margen}%)`}
            colorValor={colors.success}
          />
          <FilaDato etiqueta="Stock mínimo" valor={`${producto.stockMinimo} u.`} />
          <FilaDato etiqueta="Capital invertido en stock" valor={formatoPrecio(vm.valorEnStock)} />
          <FilaDato etiqueta="Unidades vendidas" valor={String(vm.unidadesVendidas)} />
        </View>
      )}

      <EtiquetaProducto id={producto.id} nombre={producto.nombre} sku={producto.sku} />
      {!invitado && (
        <View style={[globalStyles.card, { gap: 16 }]}>
          <Text style={typography.h3}>Tus etiquetas impresas</Text>
          <Text style={typography.small}>
            {producto.codigoQr
              ? 'Tenés un QR propio vinculado. Al leerlo desde NEXA verás el precio y stock actuales.'
              : '¿Ya mandaste a hacer tus QR? Vinculá la etiqueta de este producto para encontrarlo al escanearla.'}
          </Text>
          <BotonPrimario
            label={producto.codigoQr ? 'Reemplazar mi QR' : 'Vincular mi QR'}
            icono="scan-outline"
            variante="secundario"
            onPress={() => navigation.navigate('Escanear', { vincularProductoId: producto.id })}
          />
          {!!producto.codigoQr && (
            <BotonPrimario
              label="Desvincular mi QR"
              variante="secundario"
              onPress={() =>
                confirmar({
                  titulo: 'Desvincular etiqueta',
                  mensaje: 'Tu producto se conserva. Esta etiqueta propia dejará de encontrarlo en NEXA.',
                  textoConfirmar: 'Desvincular',
                  onConfirmar: () => {
                    try {
                      vincularQr(producto.id, null);
                    } catch {
                      avisar('No se pudo desvincular', 'Volvé a abrir tu inventario e intentá de nuevo.');
                    }
                  },
                })
              }
            />
          )}
        </View>
      )}
      {/* Acciones */}
      {invitado ? (
        <View style={styles.acciones}>
          <Text style={typography.small}>Iniciá sesión para gestionar tus productos y ventas.</Text>
          <BotonPrimario label="Crear mi espacio o ingresar" onPress={salir} />
        </View>
      ) : (
        <View style={styles.acciones}>
          <BotonPrimario
            label={vm.puedeVender ? 'Registrar venta' : 'Sin stock para vender'}
            icono="cart"
            deshabilitado={!vm.puedeVender}
            onPress={() => navigation.navigate('RegistrarVenta', { productoId: producto.id })}
          />
          <View style={styles.filaBotones}>
            <BotonPrimario
              label="Editar"
              icono="create-outline"
              variante="secundario"
              estilo={styles.botonMitad}
              onPress={() => navigation.navigate('FormularioProducto', { productoId: producto.id })}
            />
            <BotonPrimario
              label="Compartir"
              icono="share-social-outline"
              variante="secundario"
              estilo={styles.botonMitad}
              onPress={vm.compartir}
            />
          </View>
          <BotonPrimario
            label="Eliminar producto"
            icono="trash-outline"
            variante="peligro"
            onPress={pedirEliminar}
          />
        </View>
      )}
    </ScrollView>
  );
};

export default DetalleProductoScreen;

const styles = StyleSheet.create({
  noEncontrado: { padding: spacing.lg, justifyContent: 'center' },
  cabecera: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  centrado: { textAlign: 'center' },
  insignias: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  etiqueta: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
  },
  textoEtiqueta: { fontSize: 12, fontWeight: '700', color: colors.primary },
  precio: { fontSize: 30, fontWeight: '800', color: colors.primary, marginTop: spacing.xs },
  tituloSeccion: { marginBottom: spacing.xs },
  acciones: { gap: spacing.md },
  filaBotones: { flexDirection: 'row', gap: spacing.md },
  botonMitad: { flex: 1 },
});
