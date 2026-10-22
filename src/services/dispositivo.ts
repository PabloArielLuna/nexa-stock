import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import Constants, { ExecutionEnvironment } from 'expo-constants';

export const etiquetaBiometria = Platform.OS === 'ios' ? 'Face ID' : 'huella o biometría';
export const iconoBiometria = Platform.OS === 'ios' ? 'scan-outline' : 'finger-print-outline';
export const limitacionBiometria =
  Platform.OS === 'web'
    ? 'La biometría está disponible en la app del celular.'
    : Platform.OS === 'ios' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient
      ? 'Face ID no está disponible dentro de Expo Go. Ingresá con tu PIN. Se puede probar en una compilación propia de NEXA.'
      : null;

/** Los efectos del dispositivo nunca interrumpen una operación de negocio. */
export function feedback(exito = false): void {
  if (Platform.OS === 'web') return;
  const efecto = exito
    ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    : Haptics.selectionAsync();
  void efecto.catch(() => undefined);
}

export async function autenticar(): Promise<boolean> {
  if (limitacionBiometria) throw new Error(limitacionBiometria);
  if (!(await LocalAuthentication.hasHardwareAsync()))
    throw new Error('Este dispositivo no tiene un sensor biométrico compatible. Usá tu PIN.');
  if (!(await LocalAuthentication.isEnrolledAsync()))
    throw new Error('Registrá tu huella o rostro en los ajustes del teléfono, o ingresá con tu PIN.');
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Desbloqueá NEXA',
    cancelLabel: 'Cancelar',
    fallbackLabel: 'Usar código del teléfono',
    biometricsSecurityLevel: 'strong',
  });
  return resultado.success;
}
