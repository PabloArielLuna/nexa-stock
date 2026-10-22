import { DatosGuardados } from '../../types/models';
import { validarDatos } from './esquema';

export const MAX_RESPALDO = 30_000_000;
export type CopiaInventario = {
  tipo: 'NEXA-INVENTARIO';
  version: 1 | 2;
  creadoEn: string;
  datos: DatosGuardados;
  imagenes: { referencia: string; contenido: string }[];
};
export const esRegistro = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
export const imagenValida = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0 && v.length <= 1_000_000 && /^[A-Za-z0-9+/]+={0,2}$/.test(v);

export function copiaValida(v: unknown): v is CopiaInventario {
  if (
    !esRegistro(v) ||
    v.tipo !== 'NEXA-INVENTARIO' ||
    (v.version !== 1 && v.version !== 2) ||
    typeof v.creadoEn !== 'string' ||
    !Number.isFinite(Date.parse(v.creadoEn)) ||
    !validarDatos(v.datos) ||
    !Array.isArray(v.imagenes) ||
    v.imagenes.length > 10001 ||
    (v.version === 2 && !v.datos.negocio)
  )
    return false;
  const referencias = new Set<string>();
  for (const i of v.imagenes) {
    if (
      !esRegistro(i) ||
      typeof i.referencia !== 'string' ||
      !/^nexa-foto:[a-z0-9]+:[a-z0-9]+$/i.test(i.referencia) ||
      !imagenValida(i.contenido) ||
      referencias.has(i.referencia)
    )
      return false;
    referencias.add(i.referencia);
  }
  const usadas = new Set(v.datos.productos.map((p) => p.fotoUri).filter((s): s is string => !!s));
  if (v.datos.negocio?.marca.logo) usadas.add(v.datos.negocio.marca.logo);
  return usadas.size === referencias.size && [...usadas].every((s) => referencias.has(s));
}
