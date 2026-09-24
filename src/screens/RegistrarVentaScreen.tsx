import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BotonPrimario from '../components/BotonPrimario';
import CampoTexto from '../components/CampoTexto';
import EstadoVacio from '../components/EstadoVacio';
import FilaDato from '../components/FilaDato';
import FotoProducto from '../components/FotoProducto';
import SelectorCantidad from '../components/SelectorCantidad';
import { colors } from '../styles/colors';
import { globalStyles, radius, spacing } from '../styles/global';
import { typography } from '../styles/typography';
import { InventarioStackParamList } from '../types/navigation';
import { avisar } from '../utils/dialogos';
import { formatoPrecio, soloNumeros } from '../utils/formato';
import { useRegistrarVentaViewModel } from '../viewmodels/useRegistrarVentaViewModel';

type Props = NativeStackScreenProps<InventarioStackParamList, 'RegistrarVenta'>;

/** VISTA: registrar la venta de un producto (descuenta stock al confirmar). */
const RegistrarVentaScreen: React.FC<Props> = ({ navigation, route }) => {
  const vm = useRegistrarVentaViewModel(route.params.productoId);

  if (!vm.producto) {
    return (
      <View style={globalStyles.screen}>
        <EstadoVacio
          icono="alert-circle-outline"
          titulo="Producto no encontrado"
          mensaje="Volvé al inventario."
        />
      </View>
    );
  }

  const { producto } = vm;

  const onConfirmar = () => {
    if (vm.confirmar()) {
      navigation.goBack();
      avisar(
        'Venta registrada',
        `Vendiste ${vm.cantidad} × ${producto.nombre} por ${formatoPrecio(vm.total)}. El stock ya se actualizó.`,
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={globalStyles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Producto que se vende */}
        <View style={[globalStyles.card, styles.producto]}>
          <FotoProducto uri={producto.fotoUri} categoria={producto.categoria} />
          <View style={styles.infoProducto}>
            <Text style={typography.h3}>{producto.nombre}</Text>
            <Text style={typography.small}>
              {producto.marca} · Disponibles: {vm.stockDisponible}
            </Text>
          </View>
        </View>

        {/* Cantidad */}
        <View style={[globalStyles.card, styles.seccion]}>
          <Text style={typography.label}>Cantidad</Text>
          <View style={styles.centro}>
            <SelectorCantidad
              valor={vm.cantidad}
              onCambiar={vm.cambiarCantidad}
              minimo={1}
              maximo={vm.stockDisponible}
            />
          </View>
          {vm.errores.cantidad && <Text style={styles.error}>{vm.errores.cantidad}</Text>}
        </View>

        {/* Precio (se puede ajustar si hago un descuento) */}
        <View style={[globalStyles.card, styles.seccion]}>
          <CampoTexto
            label="Precio por unidad"
            prefijo="$"
            value={vm.form.precio}
            onChangeText={(v) => vm.setField('precio', soloNumeros(v))}
            error={vm.errores.precio}
            ayuda={`Precio de lista: ${formatoPrecio(producto.precio)}`}
            keyboardType="number-pad"
            maxLength={9}
          />
          {vm.hayDescuento && !vm.vendeBajoCosto && (
            <Text style={styles.aviso}>Estás aplicando un descuento sobre el precio de lista.</Text>
          )}
          {vm.vendeBajoCosto && <Text style={styles.error}>Ojo: estás vendiendo por debajo del costo.</Text>}
        </View>

        {/* Totales calculados en vivo */}
        <View style={[globalStyles.card, styles.totales]}>
          <FilaDato etiqueta="Total a cobrar" valor={formatoPrecio(vm.total)} />
          <FilaDato
            etiqueta="Tu ganancia"
            valor={formatoPrecio(vm.ganancia)}
            colorValor={vm.ganancia >= 0 ? colors.success : colors.error}
          />
        </View>

        <BotonPrimario
          label="Confirmar venta"
          icono="checkmark-circle"
          deshabilitado={!vm.puedeConfirmar}
          onPress={onConfirmar}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegistrarVentaScreen;

const styles = StyleSheet.create({
  producto: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoProducto: { flex: 1, gap: 2 },
  seccion: { gap: spacing.md },
  centro: { alignItems: 'center' },
  error: { fontSize: 13, color: colors.error, fontWeight: '600' },
  aviso: { fontSize: 13, color: colors.warning, fontWeight: '600' },
  totales: { backgroundColor: colors.primaryLight, borderRadius: radius.lg },
});
