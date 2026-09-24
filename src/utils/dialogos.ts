import { Alert, Platform } from 'react-native';

/**
 * Envoltorios de Alert (Clase 11).
 * En el teléfono usan el cartel nativo; en la versión web (tecla "w")
 * Alert.alert no hace nada, así que se usa window.confirm / window.alert.
 */

type OpcionesConfirmar = {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  destructivo?: boolean;
  onConfirmar: () => void;
};

export const confirmar = ({
  titulo,
  mensaje,
  textoConfirmar,
  destructivo = false,
  onConfirmar,
}: OpcionesConfirmar): void => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${mensaje}`)) onConfirmar();
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoConfirmar, style: destructivo ? 'destructive' : 'default', onPress: onConfirmar },
  ]);
};

export const avisar = (titulo: string, mensaje: string): void => {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
};
