import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DetalleProductoScreen from '../screens/DetalleProductoScreen';
import FormularioProductoScreen from '../screens/FormularioProductoScreen';
import ListaProductosScreen from '../screens/ListaProductosScreen';
import RegistrarVentaScreen from '../screens/RegistrarVentaScreen';
import { colors } from '../styles/colors';
import { InventarioStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<InventarioStackParamList>();

/**
 * Stack anidado dentro de la pestaña "Inventario" (Clase 5, Paso 5):
 * Lista → Detalle → Formulario / Registrar venta, con el menú de abajo siempre visible.
 * No lleva NavigationContainer: hay uno solo, en AppNavigator.
 */
const InventarioStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.primary,
      headerTitleStyle: { color: colors.text, fontWeight: '700' },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: colors.background },
      headerBackButtonDisplayMode: 'minimal',
    }}
  >
    <Stack.Screen name="ListaProductos" component={ListaProductosScreen} options={{ title: 'Inventario' }} />
    <Stack.Screen name="DetalleProducto" component={DetalleProductoScreen} options={{ title: 'Detalle' }} />
    <Stack.Screen
      name="FormularioProducto"
      component={FormularioProductoScreen}
      // Título dinámico según el parámetro (Clase 4, Paso 6)
      options={({ route }) => ({
        title: route.params?.productoId ? 'Editar producto' : 'Nuevo producto',
      })}
    />
    <Stack.Screen
      name="RegistrarVenta"
      component={RegistrarVentaScreen}
      options={{ title: 'Registrar venta' }}
    />
  </Stack.Navigator>
);

export default InventarioStack;
