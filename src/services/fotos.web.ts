import { guardarProtegido, leerProtegido } from './boveda';
import { generarId } from '../utils/formato';

const PREFIJO = 'nexa-foto:';
export function limpiarTemporal(uri: string) {
  if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
}
export async function protegerFoto(uri: string, perfilId: string, retirarOriginal = true): Promise<string> {
  if (uri.startsWith(PREFIJO)) return uri;
  if (!uri.startsWith('blob:') && !uri.startsWith('data:image/'))
    throw new Error('Elegí una imagen local del navegador.');
  const imagen = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('No pudimos abrir la imagen.'));
    i.src = uri;
  });
  const canvas = document.createElement('canvas');
  const ancho = Math.min(720, imagen.naturalWidth);
  canvas.width = ancho;
  canvas.height = Math.max(1, Math.round((imagen.naturalHeight * ancho) / imagen.naturalWidth));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar la imagen.');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);
  const contenido = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
  if (!contenido || contenido.length > 1_000_000) throw new Error('Elegí una imagen más pequeña.');
  const id = generarId();
  await guardarProtegido(`foto-${perfilId}-${id}`, { tipo: 'image/jpeg', contenido });
  if (retirarOriginal) limpiarTemporal(uri);
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
