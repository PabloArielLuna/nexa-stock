import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PantallaCarga from '../components/PantallaCarga';
import { useInventario } from '../context/InventarioContext';
import { usePerfil } from '../context/PerfilContext';
import ResumenScreen from '../screens/ResumenScreen';
import VentasStack from './VentasStack';
import InicioScreen from '../screens/InicioScreen';
import InicioInvitadoScreen from '../screens/InicioInvitadoScreen';
import CuentaScreen from '../screens/CuentaScreen';
import { colors } from '../styles/colors';
import { RootTabParamList } from '../types/navigation';
import InventarioStack from './InventarioStack';

const Tab = createBottomTabNavigator<RootTabParamList>();
const tema = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};
const iconos: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Inicio: 'grid-outline',
  InventarioTab: 'cube-outline',
  Ventas: 'receipt-outline',
  Resumen: 'stats-chart-outline',
  Cuenta: 'person-circle-outline',
};
export default function AppNavigator() {
  const { cargando, errorCarga, errorGuardado, guardando, reintentarGuardado } = useInventario();
  const { salir, invitado } = usePerfil();
  if (cargando) return <PantallaCarga />;
  if (errorCarga)
    return (
      <SafeAreaView style={s.error}>
        <Text style={s.copy}>{errorCarga}</Text>
        <TouchableOpacity accessibilityRole="button" onPress={salir}>
          <Text style={s.link}>Volver al acceso</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={s.root} edges={['top', 'left', 'right']}>
      {invitado && (
        <View style={s.demo}>
          <Text style={s.demoText}>INVITADO · DATOS DE EJEMPLO · SOLO LECTURA</Text>
        </View>
      )}
      {guardando && (
        <Text accessibilityLiveRegion="polite" style={s.saving}>
          Guardando cambios…
        </Text>
      )}
      {errorGuardado && (
        <View style={s.banner}>
          <Text style={s.copy}>Cambios sin guardar.</Text>
          <TouchableOpacity accessibilityRole="button" onPress={reintentarGuardado}>
            <Text style={s.link}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}
      <NavigationContainer theme={tema}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textLight,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
            tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border, paddingTop: 8 },
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  paddingHorizontal: 13,
                  paddingVertical: 3,
                  borderRadius: 12,
                  backgroundColor: focused ? colors.accentLight : 'transparent',
                }}
              >
                <Ionicons name={iconos[route.name]} size={21} color={color} />
              </View>
            ),
          })}
        >
          <Tab.Screen name="Inicio" component={invitado ? InicioInvitadoScreen : InicioScreen} />
          <Tab.Screen
            name="InventarioTab"
            component={InventarioStack}
            options={{ tabBarLabel: invitado ? 'Catálogo' : 'Inventario' }}
          />
          {!invitado && <Tab.Screen name="Ventas" component={VentasStack} />}
          {!invitado && (
            <Tab.Screen name="Resumen" component={ResumenScreen} options={{ tabBarLabel: 'Análisis' }} />
          )}
          <Tab.Screen name="Cuenta" component={CuentaScreen} options={{ tabBarLabel: 'Mi espacio' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  demo: { padding: 9, backgroundColor: colors.primaryLight, alignItems: 'center' },
  demoText: { color: colors.primary, fontSize: 10, letterSpacing: 0.7 },
  saving: { color: colors.textMuted, padding: 8, fontSize: 11, textAlign: 'center' },
  error: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 24, gap: 20 },
  banner: {
    backgroundColor: colors.errorLight,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copy: { color: colors.text },
  link: { color: colors.primary, fontWeight: '700' },
});
