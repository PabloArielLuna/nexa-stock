import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import PantallaCarga from '../components/PantallaCarga';
import { useInventario } from '../context/InventarioContext';
import ResumenScreen from '../screens/ResumenScreen';
import VentasScreen from '../screens/VentasScreen';
import { colors } from '../styles/colors';
import { RootTabParamList } from '../types/navigation';
import { estadoStock } from '../utils/calculos';
import InventarioStack from './InventarioStack';

const Tab = createBottomTabNavigator<RootTabParamList>();

// Tema de React Navigation con los colores de la app.
const tema = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.primary, background: colors.background },
};

/**
 * Navegación principal: menú inferior con 3 pestañas (Clase 5).
 * La pestaña Inventario contiene un Stack propio (InventarioStack).
 */
const AppNavigator: React.FC = () => {
  const { productos, cargando } = useInventario();

  // Mientras se leen los datos guardados, muestro un ActivityIndicator (Clase 11).
  if (cargando) return <PantallaCarga />;

  // Badge de la pestaña Resumen: cuántos productos hay que reponer.
  const paraReponer = productos.filter((p) => estadoStock(p) !== 'ok').length;

  return (
    <NavigationContainer theme={tema}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarLabelStyle: { fontWeight: '600' },
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          headerShadowVisible: false,
          // Ícono relleno si la pestaña está activa, contorno si no (Clase 5, Paso 3)
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            switch (route.name) {
              case 'InventarioTab':
                iconName = focused ? 'cube' : 'cube-outline';
                break;
              case 'Ventas':
                iconName = focused ? 'receipt' : 'receipt-outline';
                break;
              case 'Resumen':
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                break;
              default:
                iconName = 'help-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="InventarioTab"
          component={InventarioStack}
          // headerShown: false → evita el doble header; el título lo pone el Stack
          options={{ tabBarLabel: 'Inventario', headerShown: false }}
        />
        <Tab.Screen name="Ventas" component={VentasScreen} />
        <Tab.Screen
          name="Resumen"
          component={ResumenScreen}
          options={{
            tabBarBadge: paraReponer > 0 ? paraReponer : undefined,
            tabBarBadgeStyle: { backgroundColor: colors.warning },
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
