import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { DatosGuardados } from '../types/models';
import { MAX_RESPALDO } from '../domain/inventario/respaldo';
import { limpiarTemporal } from './fotos';
import { crearCopiaInventario } from './respaldoDatos';

import { cifrarCopia } from './respaldoCripto';

export async function compartirCopia(datos: DatosGuardados, perfilId: string, clave: string) {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error('No está disponible el menú para guardar archivos.');
  const texto = await cifrarCopia(await crearCopiaInventario(datos, perfilId), clave);
  const archivo = new File(Paths.cache, `NEXA-inventario-${Date.now()}.nexa`);
  try {
    archivo.create();
    archivo.write(texto);
    await Sharing.shareAsync(archivo.uri, {
      mimeType: 'application/octet-stream',
      UTI: 'public.data',
      dialogTitle: 'Guardá tu copia cifrada fuera de NEXA',
    });
  } finally {
    try {
      limpiarTemporal(archivo.uri);
    } catch {
      /* El sistema puede retener el archivo mientras se comparte. */
    }
  }
}
export async function elegirCopia(): Promise<string | null> {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (resultado.canceled) return null;
  const asset = resultado.assets[0];
  try {
    const archivo = new File(asset.uri);
    if ((asset.size ?? archivo.size) > MAX_RESPALDO) throw new Error('La copia supera los 30 MB.');
    const texto = await archivo.text();
    if (texto.length > MAX_RESPALDO) throw new Error('La copia supera los 30 MB.');
    return texto;
  } finally {
    try {
      limpiarTemporal(asset.uri);
    } catch {
      /* No se elimina el original elegido. */
    }
  }
}
