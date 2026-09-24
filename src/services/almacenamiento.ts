import AsyncStorage from '@react-native-async-storage/async-storage';
import { Producto, Venta } from '../types/models';

/**
 * Persistencia local con AsyncStorage (valor agregado de la consigna).
 * AsyncStorage guarda texto: por eso convertimos a JSON al guardar
 * y lo parseamos al leer.
 */

const CLAVE = '@gadgetstock/datos-v1';

export type DatosGuardados = {
  productos: Producto[];
  ventas: Venta[];
};

export const cargarDatos = async (): Promise<DatosGuardados | null> => {
  try {
    const json = await AsyncStorage.getItem(CLAVE);
    return json ? (JSON.parse(json) as DatosGuardados) : null;
  } catch (error) {
    console.warn('No se pudieron leer los datos guardados', error);
    return null;
  }
};

export const guardarDatos = async (datos: DatosGuardados): Promise<void> => {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch (error) {
    console.warn('No se pudieron guardar los datos', error);
  }
};
