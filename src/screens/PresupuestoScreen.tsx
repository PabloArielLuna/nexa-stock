import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VentasStackParamList } from '../types/navigation';
import { usePresupuestoViewModel } from '../viewmodels/usePresupuestoViewModel';
import CampoTexto from '../components/CampoTexto';
import BarraBusqueda from '../components/BarraBusqueda';
import BotonPrimario from '../components/BotonPrimario';
import PantallaCarga from '../components/PantallaCarga';
import { formatoPrecio, soloNumeros } from '../utils/formato';
import { avisar, confirmar } from '../utils/dialogos';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/global';
import { precioConRecargo } from '../utils/calculos';
export default function PresupuestoScreen({
  navigation,
  route,
}: NativeStackScreenProps<VentasStackParamList, 'Presupuesto'>) {
  const vm = usePresupuestoViewModel(route.params?.numero);
  if (vm.cargando) return <PantallaCarga />;
  return (
    <KeyboardAvoidingView
      style={globalStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={globalStyles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Propuestas que venden.</Text>
        <Text style={s.body}>{vm.form.numero} · El presupuesto no descuenta stock.</Text>
        <BotonPrimario
          label="Configurar membrete y logo"
          variante="secundario"
          icono="color-palette-outline"
          onPress={() => navigation.navigate('Marca')}
        />
        <BotonPrimario
          label="Presupuestos guardados"
          variante="secundario"
          icono="archive-outline"
          onPress={() => navigation.navigate('PresupuestosGuardados')}
        />
        <View style={[globalStyles.card, s.fields]}>
          <CampoTexto
            label="Cliente *"
            value={vm.form.cliente}
            maxLength={80}
            placeholder="Nombre o razón social"
            onChangeText={(v) => vm.setForm((f) => ({ ...f, cliente: v }))}
          />
          <View style={s.row}>
            <CampoTexto
              label="Validez (1–90 días)"
              value={String(vm.form.validez || '')}
              keyboardType="number-pad"
              maxLength={2}
              onChangeText={(v) => vm.setForm((f) => ({ ...f, validez: Number(soloNumeros(v)) }))}
            />
            <CampoTexto
              label="Descuento (0–100 %)"
              value={String(vm.form.descuento)}
              keyboardType="number-pad"
              maxLength={3}
              onChangeText={(v) => vm.setForm((f) => ({ ...f, descuento: Number(soloNumeros(v)) }))}
            />
          </View>
        </View>
        <Text style={s.heading}>1. Elegí los productos</Text>
        <BarraBusqueda
          value={vm.busqueda}
          onChangeText={vm.setBusqueda}
          placeholder="Buscar por SKU o producto"
        />
        <View style={globalStyles.card}>
          {vm.disponibles.length ? (
            vm.disponibles.map((p) => (
              <TouchableOpacity
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`Agregar ${p.nombre}`}
                style={s.pick}
                onPress={() => vm.agregar(p)}
              >
                <View style={s.grow}>
                  <Text style={s.name}>{p.nombre}</Text>
                  <Text style={s.body}>SKU: {p.sku ?? 'Pendiente de asignar'}</Text>
                  <Text style={s.body}>
                    Costo {formatoPrecio(p.costo)} · Recargo {p.recargoPresupuesto ?? 30}%
                  </Text>
                </View>
                <Ionicons name="add-circle-outline" color={colors.primary} size={25} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={s.body}>No hay productos para agregar. Cargalos primero en Inventario.</Text>
          )}
        </View>
        <Text style={s.heading}>2. Ajustá tu propuesta</Text>
        {!vm.form.lineas.length && (
          <Text style={s.body}>Agregá al menos un producto. Máximo 30 por presupuesto.</Text>
        )}
        {vm.form.lineas.map((l) => (
          <View key={l.productoId} style={[globalStyles.card, s.fields]}>
            <View style={s.row}>
              <Text style={[s.name, s.grow]}>{l.nombre}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Quitar ${l.nombre}`}
                onPress={() =>
                  vm.setForm((f) => ({ ...f, lineas: f.lineas.filter((x) => x.productoId !== l.productoId) }))
                }
              >
                <Ionicons name="close-circle-outline" color={colors.error} size={24} />
              </TouchableOpacity>
            </View>
            <Text style={s.body}>SKU: {l.sku ?? 'Pendiente de asignar'}</Text>
            <View style={s.row}>
              <CampoTexto
                label="Cantidad"
                value={String(l.cantidad || '')}
                maxLength={4}
                keyboardType="number-pad"
                onChangeText={(v) =>
                  vm.setForm((f) => ({
                    ...f,
                    lineas: f.lineas.map((x) =>
                      x.productoId === l.productoId ? { ...x, cantidad: Number(soloNumeros(v)) } : x,
                    ),
                  }))
                }
              />
              <CampoTexto
                label="Recargo sobre costo (%)"
                value={String(l.recargo)}
                maxLength={4}
                keyboardType="number-pad"
                onChangeText={(v) =>
                  vm.setForm((f) => ({
                    ...f,
                    lineas: f.lineas.map((x) =>
                      x.productoId === l.productoId
                        ? {
                            ...x,
                            recargo: Number(soloNumeros(v)),
                            precio: precioConRecargo(x.costo, Number(soloNumeros(v))),
                          }
                        : x,
                    ),
                  }))
                }
              />
            </View>
            <Text style={s.body}>
              Costo interno: {formatoPrecio(l.costo)} + {l.recargo}%{'\n'}Precio para el cliente:{' '}
              {formatoPrecio(l.precio)} por unidad.
            </Text>
            <Text style={s.lineTotal}>{formatoPrecio(l.precio * l.cantidad)}</Text>
          </View>
        ))}
        <View style={[globalStyles.card, s.fields]}>
          <CampoTexto
            label="Observaciones"
            value={vm.form.notas}
            maxLength={500}
            placeholder="Entrega, condiciones o medios de pago"
            onChangeText={(v) => vm.setForm((f) => ({ ...f, notas: v }))}
          />
          <Text style={s.body}>
            Subtotal: {formatoPrecio(vm.totales.subtotal)}
            {'\n'}Descuento: {formatoPrecio(vm.totales.descuento)}
          </Text>
          <Text style={s.total}>Total ARS {formatoPrecio(vm.totales.total)}</Text>
        </View>
        {!!vm.error && (
          <Text accessibilityRole="alert" style={s.error}>
            {vm.error}
          </Text>
        )}
        <BotonPrimario
          label="Generar y compartir PDF"
          icono="document-text-outline"
          cargando={vm.ocupado}
          deshabilitado={!vm.puedeGuardar}
          onPress={() => void vm.guardar(true)}
        />
        <BotonPrimario
          label="Guardar borrador"
          variante="secundario"
          icono="save-outline"
          deshabilitado={!vm.puedeGuardar || vm.ocupado}
          onPress={() => {
            void vm.guardar(false).then((ok) => {
              if (ok) avisar('Borrador guardado', 'Podés retomarlo desde tu perfil en este dispositivo.');
            });
          }}
        />
        <Text style={s.caption}>
          Al compartir, el PDF queda fuera de la protección de NEXA. Elegí el destino desde el menú del
          teléfono. El cliente ve los precios finales, nunca tus costos ni recargos internos.
        </Text>
        <BotonPrimario
          label="Empezar otro presupuesto"
          variante="secundario"
          deshabilitado={vm.ocupado}
          onPress={() =>
            confirmar({
              titulo: 'Nuevo presupuesto',
              mensaje:
                'Se limpia el formulario actual. El borrador guardado se reemplaza cuando vuelvas a guardar o exportar.',
              textoConfirmar: 'Empezar',
              onConfirmar: vm.nuevo,
            })
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  title: { fontSize: 30, fontWeight: '700', color: colors.text, letterSpacing: -1 },
  body: { fontSize: 13, lineHeight: 21, color: colors.textMuted },
  fields: { gap: 18 },
  row: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  heading: { fontSize: 20, color: colors.text, fontWeight: '600' },
  pick: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  grow: { flex: 1 },
  name: { color: colors.text, fontSize: 15, fontWeight: '600' },
  lineTotal: { color: colors.cyan, fontSize: 18, fontWeight: '700', textAlign: 'right' },
  total: { color: colors.accent, fontSize: 25, fontWeight: '700' },
  error: { color: colors.error, lineHeight: 22 },
  caption: { color: colors.textMuted, fontSize: 12, lineHeight: 20 },
});
