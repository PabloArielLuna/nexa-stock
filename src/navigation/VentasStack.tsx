import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VentasScreen from '../screens/VentasScreen';
import PresupuestoScreen from '../screens/PresupuestoScreen';
import MarcaScreen from '../screens/MarcaScreen';
import PresupuestosGuardadosScreen from '../screens/PresupuestosGuardadosScreen';
import AccesoRequeridoScreen from '../screens/AccesoRequeridoScreen';
import { usePerfil } from '../context/PerfilContext';
import { VentasStackParamList } from '../types/navigation';
import { colors } from '../styles/colors';
const Stack = createNativeStackNavigator<VentasStackParamList>();
export default function VentasStack() {
  const { invitado } = usePerfil();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name="ListaVentas"
        component={invitado ? AccesoRequeridoScreen : VentasScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Presupuesto"
        component={invitado ? AccesoRequeridoScreen : PresupuestoScreen}
        options={{ title: 'Crear presupuesto' }}
      />
      <Stack.Screen
        name="Marca"
        component={invitado ? AccesoRequeridoScreen : MarcaScreen}
        options={{ title: 'Mi marca' }}
      />
      <Stack.Screen
        name="PresupuestosGuardados"
        component={invitado ? AccesoRequeridoScreen : PresupuestosGuardadosScreen}
        options={{ title: 'Presupuestos guardados' }}
      />
    </Stack.Navigator>
  );
}
