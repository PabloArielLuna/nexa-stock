import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../types/navigation';
import Encabezado from '../components/Encabezado';
import BotonPrimario from '../components/BotonPrimario';
import Ayuda from '../components/Ayuda';
import { useBloqueo } from '../components/BloqueoApp';
import { usePerfil } from '../context/PerfilContext';
import { useInventario } from '../context/InventarioContext';
import { avisar, confirmar } from '../utils/dialogos';
import { colors } from '../styles/colors';
import { etiquetaBiometria, limitacionBiometria } from '../services/dispositivo';
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
  const vacio =
    !productos.length &&
    !historialVentas.length &&
    !movimientos.length &&
    !negocio.marca.nombre &&
    !negocio.borrador &&
    !negocio.presupuestos.length;
  function cerrar() {
    if (guardando || errorGuardado) {
      avisar('Cambios pendientes', 'Esperá el guardado o reintentá desde el aviso superior.');
      return;
    }
    if (invitado) {
      salir();
      return;
    }
    confirmar({
      titulo: 'Cerrar sesión',
      mensaje: 'Tus datos quedan guardados. Necesitás tu PIN para volver a ingresar.',
      textoConfirmar: 'Salir',
      onConfirmar: salir,
    });
  }
  return (
    <ScrollView style={s.root} contentContainerStyle={s.page}>
      <Encabezado
        titulo="Mi cuenta"
        accion={
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={invitado ? 'Ingresar' : 'Cerrar sesión'}
            onPress={cerrar}
            style={s.exit}
          >
            <Ionicons name="log-out-outline" color={colors.primary} size={21} />
            <Text style={s.exitText}>{invitado ? 'Ingresar' : 'Salir'}</Text>
          </TouchableOpacity>
        }
      />
      <View style={s.card}>
        <Text style={s.name}>{activo?.nombre}</Text>
        <Text style={s.body}>
          {invitado
            ? 'Catálogo de ejemplo'
            : `Cuenta local · ${Platform.OS === 'web' ? 'Este navegador' : 'Este dispositivo'}`}
        </Text>
        <Text style={s.body}>
          {productos.length} productos{!invitado && ` · ${ventas.length} ventas`}
        </Text>
      </View>
      {!invitado && (
        <>
          <BotonPrimario
            label="Mi marca y membrete"
            icono="color-palette-outline"
            variante="secundario"
            onPress={() => navigation.navigate('Ventas', { screen: 'Marca', initial: false })}
          />
          <BotonPrimario
            label="Historial de movimientos"
            icono="time-outline"
            variante="secundario"
            onPress={() => navigation.navigate('InventarioTab', { screen: 'Movimientos', initial: false })}
          />
          <BotonPrimario
            label="Copias de seguridad"
            icono="save-outline"
            variante="secundario"
            onPress={() => navigation.navigate('InventarioTab', { screen: 'Respaldo', initial: false })}
          />
          <BotonPrimario
            label="Nivel de estantería"
            icono="speedometer-outline"
            variante="secundario"
            onPress={() => navigation.navigate('InventarioTab', { screen: 'Nivel', initial: false })}
          />
          {Platform.OS !== 'web' && (
            <BotonPrimario
              label={bloqueo.habilitado ? 'Desactivar biometría' : `Activar ${etiquetaBiometria}`}
              icono="finger-print-outline"
              variante="secundario"
              onPress={() => {
                if (limitacionBiometria && !bloqueo.habilitado) {
                  avisar('Biometría', limitacionBiometria);
                  return;
                }
                void bloqueo.cambiar().then((r) => {
                  if (!r.ok) avisar('Biometría', r.error ?? 'Ingresá con tu PIN.');
                });
              }}
            />
          )}
          {vacio && (
            <BotonPrimario
              label="Cargar datos de ejemplo"
              icono="flask-outline"
              variante="secundario"
              deshabilitado={guardando || errorGuardado}
              onPress={() =>
                confirmar({
                  titulo: 'Cargar ejemplos',
                  mensaje: 'Se agregarán productos y ventas ficticios a este perfil vacío.',
                  textoConfirmar: 'Cargar',
                  onConfirmar: restaurarDatosDeEjemplo,
                })
              }
            />
          )}
        </>
      )}
      <Ayuda
        titulo="Privacidad y almacenamiento"
        label="Privacidad y almacenamiento"
        mensaje={
          Platform.OS === 'web'
            ? 'Tus datos se cifran y guardan en este navegador. La clave se almacena en IndexedDB como una clave no exportable de Web Crypto. No es una cuenta de servidor: no se sincroniza con otros equipos. Borrar los datos del sitio puede eliminar el acceso. Exportá una copia .nexa para conservar tu inventario. El navegador no ofrece las mismas protecciones que SecureStore en el teléfono.'
            : 'Tus datos se cifran en este dispositivo y la clave se guarda en SecureStore. No se sincronizan con otros teléfonos. Exportá una copia .nexa antes de desinstalar. El PIN bloquea la sesión al volver del segundo plano. La protección de capturas depende del sistema.'
        }
      />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  page: { padding: 20, gap: 14, maxWidth: 680, width: '100%', alignSelf: 'center', paddingBottom: 28 },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { color: colors.text, fontSize: 23, fontWeight: '700' },
  body: { color: colors.textMuted, fontSize: 13 },
  exit: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 8 },
  exitText: { color: colors.primary, fontSize: 13 },
});
