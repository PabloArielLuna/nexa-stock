import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { File, Paths } from 'expo-file-system';
import { guardarProtegido, leerProtegido } from './boveda';
import { generarId } from '../utils/formato';

const PREFIJO = 'nexa-foto:';
/** Solo se retiran archivos temporales del sandbox de la app, nunca la galería del usuario. */
export function limpiarTemporal(uri: string) {
  if (!uri.startsWith(Paths.cache.uri)) return;
  const archivo = new File(uri);
  if (archivo.exists) archivo.delete();
}
export async function protegerFoto(uri: string, perfilId: string, retirarOriginal = true): Promise<string> {
  if (uri.startsWith(PREFIJO)) return uri;
  if (!uri.startsWith('file://') && !uri.startsWith('data:image/'))
    throw new Error('Elegí una foto local del dispositivo.');
  const imagen = await manipulateAsync(uri, [{ resize: { width: 720 } }], {
    compress: 0.65,
    format: SaveFormat.JPEG,
    base64: true,
  });
  if (!imagen.base64 || imagen.base64.length > 1_000_000) {
    limpiarTemporal(imagen.uri);
    throw new Error('Elegí una imagen más pequeña para el producto.');
  }
  const id = generarId();
  await guardarProtegido(`foto-${perfilId}-${id}`, { tipo: 'image/jpeg', contenido: imagen.base64 });
  if (retirarOriginal || imagen.uri !== uri) limpiarTemporal(imagen.uri);
  if (retirarOriginal && uri !== imagen.uri) limpiarTemporal(uri);
  return `${PREFIJO}${perfilId}:${id}`;
}
export async function abrirFoto(uri: string, perfilId: string): Promise<string | null> {
  if (!uri.startsWith(PREFIJO)) return null;
  const partes = uri.slice(PREFIJO.length).split(':');
  if (partes.length !== 2 || partes[0] !== perfilId || !/^[a-z0-9]+$/i.test(partes[1])) return null;
  const dato = await leerProtegido(`foto-${perfilId}-${partes[1]}`);
  if (
    !dato ||
    typeof dato !== 'object' ||
    !('tipo' in dato) ||
    dato.tipo !== 'image/jpeg' ||
    !('contenido' in dato) ||
    typeof dato.contenido !== 'string'
  )
    throw new Error('La imagen protegida no es válida.');
  return `data:image/jpeg;base64,${dato.contenido}`;
}
