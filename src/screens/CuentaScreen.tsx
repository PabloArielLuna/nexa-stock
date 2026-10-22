import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import BotonPrimario from '../components/BotonPrimario';
import { useBloqueo } from '../components/BloqueoApp';
import { usePerfil } from '../context/PerfilContext';
import { useInventario } from '../context/InventarioContext';
import { avisar, confirmar } from '../utils/dialogos';
import { colors } from '../styles/colors';
import { etiquetaBiometria, iconoBiometria, limitacionBiometria } from '../services/dispositivo';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';

export default function CuentaScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { activo, invitado, salir } = usePerfil();
  const {
    productos,
    ventas,
    historialVentas,
    movimientos = [],
    negocio,
    guardando,
    errorGuardado,
    restaurarDatosDeEjemplo,
  } = useInventario();
  const bloqueo = useBloqueo();
  function cerrar() {
    if (guardando || errorGuardado) {
      avisar('Cambios pendientes', 'Esperá a que termine el guardado o reintentá desde el aviso superior.');
      return;
    }
    confirmar({
      titulo: invitado ? 'Salir de la demo' : 'Cerrar sesión',
      mensaje: invitado
        ? 'Los cambios de esta demo se descartan.'
        : 'Tu inventario queda cifrado en este dispositivo. Vas a necesitar tu PIN para volver a entrar.',
      textoConfirmar: 'Salir',
      onConfirmar: salir,
    });
  }
  return (
    <ScrollView style={s.root} contentContainerStyle={s.page}>
      <Encabezado titulo="Tu espacio." detalle="El control también está en los detalles." />
      <View style={s.card}>
        <View style={s.icon}>
          <Ionicons name={invitado ? 'compass-outline' : 'person-outline'} size={28} color={colors.primary} />
        </View>
        <Text style={s.name}>{activo?.nombre}</Text>
        <Text style={s.muted}>{invitado ? 'MODO INVITADO · DEMOSTRACIÓN' : 'SESIÓN LOCAL INICIADA'}</Text>
        <View style={s.line} />
        <Text style={s.body}>
          {invitado
            ? 'Explorá un catálogo de ejemplo en modo lectura. Iniciá sesión en el celular para administrar tu negocio.'
            : 'Tus productos y ventas pertenecen a este usuario y se conservan al cerrar la app.'}
        </Text>
        <Text style={s.body}>
          {productos.length} productos{!invitado && ` · ${ventas.length} ventas`}
        </Text>
      </View>
      {!invitado && (
        <View style={s.card}>
          <Ionicons name={iconoBiometria} size={30} color={colors.primary} />
          <Text style={s.heading}>Un toque más de privacidad</Text>
          <Text style={s.body}>
            Ingresá con {etiquetaBiometria} y protegé tu espacio al volver del segundo plano. Tu PIN sigue
            disponible como alternativa.
          </Text>
          <BotonPrimario
            variante="secundario"
            label={bloqueo.habilitado ? 'Desactivar acceso biométrico' : `Activar ${etiquetaBiometria}`}
            deshabilitado={!!limitacionBiometria && !bloqueo.habilitado}
            onPress={() => {
              void bloqueo.cambiar().then((resultado) => {
                if (!resultado.ok) avisar('Acceso biométrico', resultado.error ?? 'Ingresá con tu PIN.');
              });
            }}
          />
          {!!limitacionBiometria && <Text style={s.body}>{limitacionBiometria}</Text>}
        </View>
      )}
      <View style={s.card}>
        <Ionicons name="phone-portrait-outline" size={28} color={colors.primary} />
        <Text style={s.heading}>Primero, tu dispositivo</Text>
        <Text style={s.body}>
          NEXA funciona sin conexión. El inventario y las credenciales se guardan cifrados en el celular; la
          clave se protege con el sistema del teléfono. No se sincronizan entre teléfonos ni se recuperan al
          desinstalar la app si no exportaste una copia del inventario.
        </Text>
      </View>
      {!invitado && (
        <View style={s.card}>
          <Ionicons name="shield-checkmark-outline" size={28} color={colors.accent} />
          <Text style={s.heading}>Seguridad por defecto</Text>
          <Text style={s.body}>
            Bloqueo con PIN al volver del segundo plano. Costos y ventas visibles solo con sesión iniciada.
            Los intentos fallidos se conservan aunque cierres la app.
          </Text>
          <Text style={s.body}>
            {bloqueo.capturaProtegida
              ? 'Protección de capturas activada en este dispositivo.'
              : 'La protección de capturas requiere soporte del sistema y debe verificarse en el celular.'}
          </Text>
        </View>
      )}
      {!invitado &&
        !productos.length &&
        !historialVentas.length &&
        !movimientos.length &&
        !negocio.marca.nombre &&
        !negocio.borrador &&
        !negocio.presupuestos.length && (
          <BotonPrimario
            label="Cargar inventario de ejemplo"
            deshabilitado={guardando || errorGuardado}
            variante="secundario"
            icono="flask-outline"
            onPress={() =>
              confirmar({
                titulo: 'Cargar ejemplos en este perfil vacío',
                mensaje:
                  'Se agregarán productos y ventas ficticios para conocer la app. Para tus datos reales, usá otro perfil vacío.',
                textoConfirmar: 'Cargar ejemplos',
                onConfirmar: restaurarDatosDeEjemplo,
              })
            }
          />
        )}
      {!invitado && (
        <>
          <BotonPrimario
            label="Historial de movimientos"
            icono="time-outline"
            variante="secundario"
            onPress={() => navigation.navigate('InventarioTab', { screen: 'Movimientos', initial: false })}
          />
          <BotonPrimario
            label="Copia y recuperación del inventario"
            icono="save-outline"
            variante="secundario"
            onPress={() => navigation.navigate('InventarioTab', { screen: 'Respaldo', initial: false })}
          />
          <BotonPrimario
            label="Mi marca y membrete"
            icono="color-palette-outline"
            variante="secundario"
            onPress={() => navigation.navigate('Ventas', { screen: 'Marca', initial: false })}
          />
          <BotonPrimario
            label="Nivel de estantería"
            icono="speedometer-outline"
            variante="secundario"
            onPress={() => navigation.navigate('InventarioTab', { screen: 'Nivel', initial: false })}
          />
        </>
      )}
      <BotonPrimario
        label={invitado ? 'Salir y crear mi espacio' : 'Cerrar sesión'}
        icono="log-out-outline"
        variante="secundario"
        deshabilitado={guardando || errorGuardado}
        onPress={cerrar}
      />
      <Text style={s.footer}>NEXA 2.0 · INVENTARIO CON INTENCIÓN</Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  page: { padding: 24, gap: 24, maxWidth: 700, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    padding: 24,
    gap: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { backgroundColor: colors.primaryLight, padding: 16, alignSelf: 'flex-start', borderRadius: 20 },
  name: { color: colors.text, fontSize: 28, fontWeight: '600' },
  muted: { color: colors.textLight, fontSize: 11, lineHeight: 19, letterSpacing: 1 },
  line: { height: 1, backgroundColor: colors.border },
  body: { color: colors.textMuted, fontSize: 14, lineHeight: 23 },
  heading: { color: colors.text, fontSize: 20, fontWeight: '600' },
  footer: { color: colors.textLight, fontSize: 10, letterSpacing: 2, textAlign: 'center' },
});
