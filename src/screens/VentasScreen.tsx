import React, { useState } from 'react';
import MotivoModal from '../components/MotivoModal';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ChipFiltro from '../components/ChipFiltro';
import EstadoVacio from '../components/EstadoVacio';
import TarjetaVenta from '../components/TarjetaVenta';
import Encabezado from '../components/Encabezado';
import BotonPrimario from '../components/BotonPrimario';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VentasStackParamList } from '../types/navigation';
import { colors } from '../styles/colors';
import { globalStyles, spacing } from '../styles/global';
import { Venta } from '../types/models';
import { formatoPrecio } from '../utils/formato';
import { Periodo, useVentasViewModel } from '../viewmodels/useVentasViewModel';

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'mes', label: 'Este mes' },
  { id: 'todas', label: 'Todas' },
];

/** VISTA: historial de ventas con totales del período elegido. */
const VentasScreen: React.FC<NativeStackScreenProps<VentasStackParamList, 'ListaVentas'>> = ({
  navigation,
}) => {
  const vm = useVentasViewModel();
  const [ventaAAnular, setVentaAAnular] = useState<Venta | null>(null);

  const pedirAnular = (venta: Venta) => {
    setVentaAAnular(venta);
  };

  return (
    <View style={globalStyles.screen}>
      <MotivoModal
        visible={!!ventaAAnular}
        titulo="Anular venta"
        detalle={`La venta quedará en el historial con su motivo. Se devolverán ${ventaAAnular?.cantidad ?? 0} unidades si el producto sigue en tu inventario.`}
        onCancelar={() => setVentaAAnular(null)}
        onConfirmar={(motivo) => {
          if (ventaAAnular) vm.anularVenta(ventaAAnular.id, motivo);
        }}
      />
      <View style={styles.encabezado}>
        <Encabezado titulo="Cada venta cuenta." detalle="Tu actividad, con todos los números claros." />
        <BotonPrimario
          label="Crear presupuesto PDF"
          icono="document-text-outline"
          onPress={() => navigation.navigate('Presupuesto')}
        />
        <BotonPrimario
          label="Presupuestos guardados"
          variante="secundario"
          icono="archive-outline"
          onPress={() => navigation.navigate('PresupuestosGuardados')}
        />
        <View style={styles.chips}>
          {PERIODOS.map((p) => (
            <ChipFiltro
              key={p.id}
              label={p.label}
              activo={vm.periodo === p.id}
              onPress={() => vm.setPeriodo(p.id)}
            />
          ))}
        </View>

        {/* Tres columnas iguales con flex: 1 (Clase 10) */}
        <View style={[globalStyles.card, styles.totales]}>
          <Total etiqueta="Ingresos" valor={formatoPrecio(vm.ingresos)} />
          <View style={styles.separador} />
          <Total etiqueta="Ganancia" valor={formatoPrecio(vm.ganancia)} color={colors.success} />
          <View style={styles.separador} />
          <Total etiqueta="Unidades" valor={String(vm.unidades)} />
        </View>
      </View>

      <FlatList
        data={vm.ventasVisibles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TarjetaVenta venta={item} onAnular={() => pedirAnular(item)} />}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <EstadoVacio
            icono="receipt-outline"
            titulo="No hay ventas en este período"
            mensaje="Para registrar una venta, entrá a un producto del Inventario y tocá “Registrar venta”."
          />
        }
      />
    </View>
  );
};

type TotalProps = { etiqueta: string; valor: string; color?: string };

const Total: React.FC<TotalProps> = ({ etiqueta, valor, color = colors.text }) => (
  <View style={styles.total}>
    <Text style={styles.etiquetaTotal}>{etiqueta}</Text>
    <Text style={[styles.valorTotal, { color }]} numberOfLines={1} adjustsFontSizeToFit>
      {valor}
    </Text>
  </View>
);

export default VentasScreen;

const styles = StyleSheet.create({
  encabezado: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  chips: { flexDirection: 'row', gap: spacing.sm },
  totales: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  total: { flex: 1, alignItems: 'center', gap: 2 },
  separador: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  etiquetaTotal: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  valorTotal: { fontSize: 17, fontWeight: '800' },
  lista: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
});
