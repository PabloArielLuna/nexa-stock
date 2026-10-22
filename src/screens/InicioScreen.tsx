import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';
import { useInicioViewModel } from '../viewmodels/useInicioViewModel';
import { usePerfil } from '../context/PerfilContext';
import Encabezado from '../components/Encabezado';
import FotoProducto from '../components/FotoProducto';
import { colors } from '../styles/colors';
import { formatoPrecio } from '../utils/formato';
import { totalVenta } from '../utils/calculos';
import MetricaPanel from '../components/MetricaPanel';
import BotonPrimario from '../components/BotonPrimario';

type Props = BottomTabScreenProps<RootTabParamList, 'Inicio'>;
export default function InicioScreen({ navigation }: Props) {
  const vm = useInicioViewModel();
  const { activo, invitado, salir } = usePerfil();
  const amplia = useWindowDimensions().width > 760;
  function nuevo() {
    if (invitado) {
      salir();
      return;
    }
    navigation.navigate('InventarioTab', { screen: 'FormularioProducto', params: {}, initial: false });
  }
  function abrirAnalisis() {
    if (invitado) salir();
    else navigation.navigate('Resumen');
  }
  function abrirVentas() {
    if (invitado) salir();
    else navigation.navigate('Ventas');
  }
  return (
    <ScrollView style={s.root} contentContainerStyle={s.page}>
      <Encabezado
        titulo={invitado ? 'Panel de ejemplo.' : 'Tu dashboard.'}
        detalle={
          invitado
            ? 'Datos ficticios para conocer NEXA. Tu información real siempre queda en tu sesión.'
            : `Hola, ${activo?.nombre}. Este es el pulso de tu negocio.`
        }
        accion={
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Abrir mi espacio"
            style={s.avatar}
            onPress={() => navigation.navigate('Cuenta')}
          >
            <Text style={s.avatarText}>{activo?.nombre.slice(0, 2).toUpperCase()}</Text>
          </TouchableOpacity>
        }
      />
      <View style={s.status}>
        <View style={s.dot} />
        <Text style={s.statusText}>
          {invitado ? 'DEMOSTRACIÓN · NO SON DATOS DE USUARIOS' : 'TU ESPACIO, EN ESTE DISPOSITIVO'}
        </Text>
      </View>
      <View style={[s.columns, amplia && s.wide]}>
        <LinearGradient
          colors={['#2457FF', '#1336BA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <View style={s.between}>
            <Text style={s.heroLabel}>INGRESOS DEL MES</Text>
            <Ionicons name="arrow-up-right-box-outline" size={24} color={colors.white} />
          </View>
          <Text style={s.amount} adjustsFontSizeToFit numberOfLines={1}>
            {formatoPrecio(vm.ingresosMes)}
          </Text>
          <Text style={s.heroSub}>{vm.cantidadVentasMes} operaciones · Hecho por vos.</Text>
          <View style={s.heroRule} />
          <View style={s.between}>
            <Text style={s.heroSub}>Ganancia del mes</Text>
            <Text style={s.heroProfit}>{formatoPrecio(vm.gananciaMes)}</Text>
          </View>
        </LinearGradient>
        <View style={s.metrics}>
          <MetricaPanel
            titulo="Ventas del mes"
            valor={String(vm.cantidadVentasMes)}
            detalle="Operaciones registradas"
            color={colors.cyan}
            icono="receipt-outline"
            onPress={abrirVentas}
          />
          <MetricaPanel
            titulo="Unidades en stock"
            valor={String(vm.unidadesEnStock)}
            detalle={`${vm.cantidadProductos} productos en catálogo`}
            color={colors.violet}
            icono="cube-outline"
            onPress={() => navigation.navigate('InventarioTab', { screen: 'ListaProductos' })}
          />
          <MetricaPanel
            titulo="Para reponer"
            valor={String(vm.paraReponer.length)}
            detalle={vm.paraReponer.length ? 'Productos bajo el mínimo' : 'Todo está al día'}
            color={colors.warning}
            icono="flash-outline"
            onPress={abrirAnalisis}
          />
          <MetricaPanel
            titulo="Margen del mes"
            valor={`${vm.ingresosMes ? Math.round((vm.gananciaMes / vm.ingresosMes) * 100) : 0}%`}
            detalle="Ganancia sobre ingresos"
            color={vm.gananciaMes < 0 ? colors.error : colors.accent}
            icono="trending-up-outline"
            onPress={abrirAnalisis}
          />
        </View>
      </View>
      <View style={s.card}>
        <View style={s.between}>
          <Text style={s.heading}>Cómo se reparte tu stock</Text>
          <Ionicons name="pie-chart-outline" size={23} color={colors.violet} />
        </View>
        <Text style={s.muted}>Unidades disponibles por categoría</Text>
        {vm.stockPorCategoria.length ? (
          <>
            <View style={s.distribution}>
              {vm.stockPorCategoria.map((cat) => (
                <View
                  key={cat.id}
                  style={{ flex: cat.unidades, backgroundColor: cat.color }}
                  accessibilityLabel={`${cat.nombre}: ${cat.unidades} unidades`}
                />
              ))}
            </View>
            <View style={s.legend}>
              {vm.stockPorCategoria.map((cat) => (
                <View key={cat.id} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: cat.color }]} />
                  <Text style={s.small}>
                    {cat.nombre} · {cat.unidades}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={s.muted}>Agregá productos para ver la distribución.</Text>
        )}
      </View>
      <View style={s.actions}>
        <TouchableOpacity
          accessibilityRole="button"
          style={s.action}
          onPress={() => navigation.navigate('InventarioTab', { screen: 'Escanear', initial: false })}
        >
          <Ionicons name="scan-outline" size={25} color={colors.primary} />
          <Text style={s.actionText}>Escanear</Text>
          <Text style={s.small}>Encontrá un producto</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={s.action} onPress={nuevo}>
          <Ionicons name="add-circle-outline" size={25} color={colors.primary} />
          <Text style={s.actionText}>Nuevo producto</Text>
          <Text style={s.small}>Hacé crecer tu catálogo</Text>
        </TouchableOpacity>
      </View>
      <BotonPrimario
        label={invitado ? 'Iniciar sesión para crear presupuestos' : 'Crear presupuesto PDF'}
        icono="document-text-outline"
        variante="secundario"
        onPress={() => {
          if (invitado) salir();
          else navigation.navigate('Ventas', { screen: 'Presupuesto', initial: false });
        }}
      />
      <View style={s.card}>
        <View style={s.between}>
          <View>
            <Text style={s.heading}>Una semana en movimiento</Text>
            <Text style={s.muted}>Ingresos · últimos 7 días</Text>
          </View>
          <Ionicons name="pulse-outline" size={24} color={colors.primary} />
        </View>
        <Text style={s.chartTotal}>{formatoPrecio(vm.ventasSemana)}</Text>
        <View style={s.chart}>
          {vm.dias.map((d, i) => (
            <View key={i} style={s.barColumn} accessibilityLabel={`Día ${i + 1}: ${formatoPrecio(d.total)}`}>
              <View style={s.barTrack}>
                <View
                  style={[
                    s.bar,
                    {
                      height: d.total ? `${Math.max(3, (d.total / vm.maximo) * 100)}%` : 2,
                      backgroundColor: i === 6 ? colors.accent : colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[s.small, i === 6 && { color: colors.accent }]}>
                {i === 6 ? 'HOY' : d.etiqueta}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={s.between}>
        <Text style={s.heading}>Tu próximo movimiento</Text>
        <TouchableOpacity accessibilityRole="button" onPress={abrirAnalisis}>
          <Text style={s.link}>Ver todo ↗</Text>
        </TouchableOpacity>
      </View>
      {vm.paraReponer.length ? (
        vm.paraReponer.slice(0, 2).map((p) => (
          <TouchableOpacity
            key={p.id}
            style={s.product}
            accessibilityRole="button"
            onPress={() =>
              navigation.navigate('InventarioTab', {
                screen: 'DetalleProducto',
                params: { productoId: p.id },
                initial: false,
              })
            }
          >
            <FotoProducto uri={p.fotoUri} categoria={p.categoria} tamanio={48} />
            <View style={s.grow}>
              <Text style={s.productName}>{p.nombre}</Text>
              <Text style={s.muted}>
                {p.stock === 0
                  ? 'Agotado · recuperá oportunidades'
                  : `${p.stock} disponibles · mínimo ${p.stockMinimo}`}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.warning} />
          </TouchableOpacity>
        ))
      ) : (
        <View style={s.card}>
          <Text style={s.muted}>
            {vm.cantidadProductos
              ? 'Tu stock está al día. Buen momento para vender.'
              : 'Tu espacio está listo. Agregá tu primer producto para empezar.'}
          </Text>
        </View>
      )}
      <View style={s.between}>
        <Text style={s.heading}>Últimos movimientos</Text>
        <TouchableOpacity accessibilityRole="button" onPress={abrirVentas}>
          <Text style={s.link}>Historial ↗</Text>
        </TouchableOpacity>
      </View>
      {vm.recientes.length ? (
        vm.recientes.map((v) => (
          <View key={v.id} style={s.sale}>
            <View style={s.saleIcon}>
              <Ionicons name="arrow-down-outline" size={18} color={colors.primary} />
            </View>
            <View style={s.grow}>
              <Text style={s.productName}>{v.productoNombre}</Text>
              <Text style={s.small}>
                {v.cantidad} unidad(es) · {new Date(v.fecha).toLocaleDateString('es-AR')}
              </Text>
            </View>
            <Text style={s.saleAmount}>{formatoPrecio(totalVenta(v))}</Text>
          </View>
        ))
      ) : (
        <Text style={s.muted}>Las ventas que registres van a aparecer acá.</Text>
      )}
      <Text style={s.footer}>NEXA · MENOS FRICCIÓN. MÁS NEGOCIO.</Text>
      {!invitado && (
        <BotonPrimario
          label="Herramienta: nivel de estantería"
          icono="speedometer-outline"
          variante="secundario"
          onPress={() => navigation.navigate('InventarioTab', { screen: 'Nivel', initial: false })}
        />
      )}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  page: { padding: 24, gap: 24, width: '100%', maxWidth: 1100, alignSelf: 'center', paddingBottom: 40 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 18,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  avatarText: { color: colors.primary, fontWeight: '700' },
  status: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  statusText: { fontSize: 10, letterSpacing: 1.6, color: colors.textMuted },
  columns: { gap: 14 },
  wide: { flexDirection: 'row' },
  hero: { flex: 1, padding: 25, borderRadius: 24, gap: 12, overflow: 'hidden' },
  heroLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, color: colors.white },
  amount: { fontSize: 46, fontWeight: '600', letterSpacing: -2, color: colors.white, marginTop: 14 },
  heroSub: { color: '#DFE7FF', fontSize: 13 },
  heroRule: { height: 1, backgroundColor: '#FFFFFF35', marginTop: 16 },
  heroProfit: { color: colors.white, fontSize: 18, fontWeight: '700' },
  metrics: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  distribution: {
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 3,
    marginVertical: 8,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  metric: {
    flex: 1,
    padding: 20,
    gap: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 125,
  },
  metricNumber: { color: colors.text, fontSize: 30, fontWeight: '600', letterSpacing: -1 },
  muted: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  small: { color: colors.textLight, fontSize: 11, lineHeight: 18 },
  between: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 9 },
  actionText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 22,
    gap: 12,
  },
  heading: { color: colors.text, fontSize: 17, fontWeight: '600', letterSpacing: -0.4 },
  chartTotal: { color: colors.text, fontSize: 28, fontWeight: '600' },
  chart: { flexDirection: 'row', height: 132, gap: 14, marginTop: 8 },
  barColumn: { flex: 1, alignItems: 'center', gap: 12 },
  barTrack: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 5, maxWidth: 64, alignSelf: 'center' },
  link: { color: colors.primary, fontSize: 12, paddingVertical: 12 },
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    marginTop: -10,
  },
  grow: { flex: 1 },
  productName: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  sale: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  saleIcon: { padding: 10, borderRadius: 14, backgroundColor: colors.primaryLight },
  saleAmount: { color: colors.text, fontWeight: '600', fontSize: 13 },
  footer: { color: colors.textLight, fontSize: 9, letterSpacing: 2, textAlign: 'center', marginTop: 16 },
});
