import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DetalleProductoScreen from '../screens/DetalleProductoScreen';
import FormularioProductoScreen from '../screens/FormularioProductoScreen';
import ListaProductosScreen from '../screens/ListaProductosScreen';
import RegistrarVentaScreen from '../screens/RegistrarVentaScreen';
import EscanearScreen from '../screens/EscanearScreen';
import { colors } from '../styles/colors';
import { InventarioStackParamList } from '../types/navigation';
import { usePerfil } from '../context/PerfilContext';
import AccesoRequeridoScreen from '../screens/AccesoRequeridoScreen';
import NivelScreen from '../screens/NivelScreen';
import RespaldoScreen from '../screens/RespaldoScreen';
import MovimientosScreen from '../screens/MovimientosScreen';

const Stack = createNativeStackNavigator<InventarioStackParamList>();

/**
 * Stack anidado dentro de la pestaña "Inventario" (Clase 5, Paso 5):
 * Lista → Detalle → Formulario / Registrar venta, con el menú de abajo siempre visible.
 * No lleva NavigationContainer: hay uno solo, en AppNavigator.
 */
const InventarioStack: React.FC = () => {
  const { invitado } = usePerfil();
  return (
    <Stack.Navigator
      initialRouteName="ListaProductos"
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name="Movimientos"
        component={invitado ? AccesoRequeridoScreen : MovimientosScreen}
        options={{ title: 'Historial de movimientos' }}
      />
      <Stack.Screen
        name="ListaProductos"
        component={ListaProductosScreen}
        options={{ title: 'Inventario', headerShown: false }}
      />
      <Stack.Screen
        name="Escanear"
        component={EscanearScreen}
        options={{ title: 'Escanear producto', presentation: 'modal' }}
      />
      <Stack.Screen
        name="Nivel"
        component={invitado ? AccesoRequeridoScreen : NivelScreen}
        options={{ title: 'Nivel de estantería' }}
      />
      <Stack.Screen
        name="Respaldo"
        component={invitado ? AccesoRequeridoScreen : RespaldoScreen}
        options={{ title: 'Copia del inventario' }}
      />
      <Stack.Screen name="DetalleProducto" component={DetalleProductoScreen} options={{ title: 'Detalle' }} />
      <Stack.Screen
        name="FormularioProducto"
        component={invitado ? AccesoRequeridoScreen : FormularioProductoScreen}
        // Título dinámico según el parámetro (Clase 4, Paso 6)
        options={({ route }) => ({
          title: route.params?.productoId ? 'Editar producto' : 'Nuevo producto',
        })}
      />
      <Stack.Screen
        name="RegistrarVenta"
        component={invitado ? AccesoRequeridoScreen : RegistrarVentaScreen}
        options={{ title: 'Registrar venta' }}
      />
    </Stack.Navigator>
  );
};

export default InventarioStack;
