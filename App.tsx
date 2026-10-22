import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { InventarioProvider } from './src/context/InventarioContext';
import AppNavigator from './src/navigation/AppNavigator';
import { PerfilProvider, usePerfil } from './src/context/PerfilContext';
import PerfilesScreen from './src/screens/PerfilesScreen';
import PantallaCarga from './src/components/PantallaCarga';
import BloqueoApp from './src/components/BloqueoApp';

function EspacioActual() {
  const { activo, listo } = usePerfil();
  if (!listo) return <PantallaCarga />;
  if (!activo) return <PerfilesScreen />;
  return (
    <InventarioProvider key={activo.id} perfilId={activo.id}>
      <BloqueoApp>
        <AppNavigator />
      </BloqueoApp>
    </InventarioProvider>
  );
}

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
      <PerfilProvider>
        <EspacioActual />
        <StatusBar style="light" />
      </PerfilProvider>
    </SafeAreaProvider>
  );
};

export default App;
