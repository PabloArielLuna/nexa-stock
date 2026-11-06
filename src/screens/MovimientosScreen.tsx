import React, { useState } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useInventario } from '../context/InventarioContext';
import BarraBusqueda from '../components/BarraBusqueda';
import EstadoVacio from '../components/EstadoVacio';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/global';
import { formatoFechaHora } from '../utils/formato';
import type { Movimiento } from '../types/models';
const etiquetas: Record<Movimiento['tipo'], string> = {
  alta: 'Alta inicial',
  ajuste: 'Ajuste de stock',
  edicion: 'Edición de ficha',
  baja: 'Baja de producto',
  venta: 'Venta',
  anulacion: 'Anulación de venta',
};
const campos: Record<string, string> = {
  sku: 'SKU',
  nombre: 'Nombre',
  marca: 'Marca',
  categoria: 'Categoría',
  costo: 'Costo',
  precio: 'Precio',
  recargoPresupuesto: 'Recargo del presupuesto',
  stockMinimo: 'Stock mínimo',
  reacondicionado: 'Reacondicionado',
};
const mostrarValor = (v: string | number | boolean | null) =>
  v === null ? '—' : typeof v === 'boolean' ? (v ? 'Sí' : 'No') : String(v);
export default function MovimientosScreen() {
  const { movimientos = [] } = useInventario();
  const [busqueda, setBusqueda] = useState('');
  const datos = movimientos.filter((m) =>
    `${m.sku ?? ''} ${m.productoNombre} ${m.motivo}`.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );
  return (
    <View style={globalStyles.screen}>
      <View style={{ padding: 20, gap: 14 }}>
        <Text style={s.title}>Movimientos</Text>
        <BarraBusqueda
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por SKU, producto o motivo"
        />
      </View>
      <FlatList
        data={datos}
        keyExtractor={(m) => m.id}
        contentContainerStyle={globalStyles.scrollContent}
        ListEmptyComponent={
          <EstadoVacio
            icono="time-outline"
            titulo="Todavía no hay movimientos"
            mensaje="Las altas, ajustes, ventas, anulaciones y bajas se registrarán desde ahora."
          />
        }
        renderItem={({ item: m }) => (
          <View style={globalStyles.card}>
            <Text style={s.tag}>
              {etiquetas[m.tipo]} · {formatoFechaHora(m.fecha)}
            </Text>
            <Text style={s.name}>
              {m.sku ? `${m.sku} · ` : ''}
              {m.productoNombre}
            </Text>
            <Text style={s.stock}>
              Stock: {m.stockAntes} → {m.stockDespues} ({m.stockDespues - m.stockAntes > 0 ? '+' : ''}
              {m.stockDespues - m.stockAntes})
            </Text>
            <Text style={s.body}>{m.motivo}</Text>
            {m.ventaId && (
              <Text selectable style={s.body}>
                Venta: {m.ventaId}
              </Text>
            )}
            {m.cambios?.map((c) => (
              <Text key={c.campo} style={s.body}>
                {c.campo === 'fotoUri'
                  ? 'Foto actualizada'
                  : `${campos[c.campo] ?? c.campo}: ${mostrarValor(c.antes)} → ${mostrarValor(c.despues)}`}
              </Text>
            ))}
          </View>
        )}
      />
    </View>
  );
}
const s = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  tag: { color: colors.cyan, fontSize: 12, lineHeight: 22 },
  name: { color: colors.text, fontSize: 17, fontWeight: '600' },
  stock: { color: colors.accent, lineHeight: 24, fontWeight: '600' },
  body: { color: colors.textMuted, lineHeight: 22 },
});
