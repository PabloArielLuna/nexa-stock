import React, { useState } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VentasStackParamList } from '../types/navigation';
import { useInventario } from '../context/InventarioContext';
import BarraBusqueda from '../components/BarraBusqueda';
import BotonPrimario from '../components/BotonPrimario';
import EstadoVacio from '../components/EstadoVacio';
import { formatoFecha, formatoPrecio } from '../utils/formato';
import { totalesPresupuesto } from '../utils/presupuestos';
import { globalStyles } from '../styles/global';
import { colors } from '../styles/colors';
import SeguimientoModal from '../components/SeguimientoModal';
import { useSeguimientoViewModel } from '../viewmodels/useSeguimientoViewModel';
export default function PresupuestosGuardadosScreen({
  navigation,
}: NativeStackScreenProps<VentasStackParamList, 'PresupuestosGuardados'>) {
  const { negocio } = useInventario();
  const seguimiento = useSeguimientoViewModel();
  const [busqueda, setBusqueda] = useState('');
  const datos = negocio.presupuestos.filter((p) =>
    `${p.numero} ${p.cliente} ${p.lineas.map((l) => l.sku ?? '').join(' ')}`
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase()),
  );
  return (
    <View style={globalStyles.screen}>
      <View style={{ padding: 20, gap: 16 }}>
        <Text style={s.title}>Presupuestos</Text>
        <BarraBusqueda
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por cliente, número o SKU"
        />
      </View>
      <FlatList
        data={datos}
        keyExtractor={(p) => p.numero}
        contentContainerStyle={globalStyles.scrollContent}
        ListEmptyComponent={
          <EstadoVacio
            icono="document-text-outline"
            titulo="Sin presupuestos guardados"
            mensaje="Al generar un PDF también se guarda una copia editable de la propuesta."
          />
        }
        renderItem={({ item }) => (
          <View style={globalStyles.card}>
            <Text style={s.name}>{item.cliente}</Text>
            <Text style={s.body}>
              {item.numero} · {formatoFecha(new Date(item.fecha))}
            </Text>
            <Text style={s.name}>{formatoPrecio(totalesPresupuesto(item).total)}</Text>
            <BotonPrimario
              label="Abrir propuesta"
              variante="secundario"
              onPress={() => navigation.push('Presupuesto', { numero: item.numero })}
            />
            <BotonPrimario
              label="Agendar seguimiento"
              variante="secundario"
              icono="calendar-outline"
              onPress={() => seguimiento.abrir(item.numero)}
            />
          </View>
        )}
      />
      <SeguimientoModal vm={seguimiento} />
    </View>
  );
}
const s = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  name: { color: colors.text, fontSize: 18, fontWeight: '600' },
  body: { color: colors.textMuted, lineHeight: 24 },
});
