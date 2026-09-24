import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { InventarioProvider } from './src/context/InventarioContext';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Punto de entrada "delgado" (Clase 12): sólo arma los proveedores
 * y delega la navegación en AppNavigator.
 *
 * - SafeAreaProvider: respeta el notch y la barra de gestos.
 * - InventarioProvider: estado global de productos y ventas (Context).
 */
const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <InventarioProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </InventarioProvider>
    </SafeAreaProvider>
  );
};

export default App;
