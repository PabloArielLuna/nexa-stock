import * as ImagePicker from 'expo-image-picker';
import { protegerFoto } from './fotos';

/**
 * Interacción nativa con la cámara y la galería (expo-image-picker).
 * Cada función pide el permiso, abre la cámara o la galería y
 * devuelve la ruta (uri) de la foto, o null si el usuario cancela.
 */

const OPCIONES: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true, // recorte cuadrado
  aspect: [1, 1],
  quality: 0.6, // comprime para no ocupar tanto espacio
};

export type ResultadoFoto = { ok: true; uri: string } | { ok: false; motivo: 'cancelado' | 'sin-permiso' };

export const tomarFoto = async (perfilId: string): Promise<ResultadoFoto> => {
  const permiso = await ImagePicker.requestCameraPermissionsAsync();
  if (!permiso.granted) return { ok: false, motivo: 'sin-permiso' };

  const resultado = await ImagePicker.launchCameraAsync(OPCIONES);
  if (resultado.canceled) return { ok: false, motivo: 'cancelado' };
  return { ok: true, uri: await protegerFoto(resultado.assets[0].uri, perfilId) };
};

export const elegirDeGaleria = async (perfilId: string, esLogo = false): Promise<ResultadoFoto> => {
  const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permiso.granted) return { ok: false, motivo: 'sin-permiso' };

  const resultado = await ImagePicker.launchImageLibraryAsync({ ...OPCIONES, allowsEditing: !esLogo });
  if (resultado.canceled) return { ok: false, motivo: 'cancelado' };
  return { ok: true, uri: await protegerFoto(resultado.assets[0].uri, perfilId) };
};
