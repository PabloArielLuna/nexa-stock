import type { MarcaNegocio, NegocioGuardado } from '../../types/negocio';
import type { DatosGuardados } from '../../types/models';
import { presupuestoValido } from '../../utils/presupuestos';
export const marcaVacia = (): MarcaNegocio => ({
  nombre: '',
  contacto: '',
  direccion: '',
  pie: 'Gracias por tu consulta.',
  logo: null,
});
export const negocioVacio = (): NegocioGuardado => ({
  marca: marcaVacia(),
  borrador: null,
  presupuestos: [],
});
export const esObjeto = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
export function marcaValida(v: unknown): v is MarcaNegocio {
  return (
    esObjeto(v) &&
    typeof v.nombre === 'string' &&
    v.nombre.length <= 60 &&
    (v.nombre === '' || v.nombre.trim().length >= 2) &&
    typeof v.contacto === 'string' &&
    v.contacto.length <= 120 &&
    typeof v.direccion === 'string' &&
    v.direccion.length <= 160 &&
    typeof v.pie === 'string' &&
    v.pie.length <= 180 &&
    (v.logo === null || (typeof v.logo === 'string' && /^nexa-foto:[a-z0-9]+:[a-z0-9]+$/i.test(v.logo)))
  );
}
export function negocioValido(v: unknown): v is NegocioGuardado {
  return (
    esObjeto(v) &&
    marcaValida(v.marca) &&
    (v.borrador === null || presupuestoValido(v.borrador)) &&
    Array.isArray(v.presupuestos) &&
    v.presupuestos.length <= 10000 &&
    v.presupuestos.every(presupuestoValido) &&
    new Set(v.presupuestos.map((p) => p.numero)).size === v.presupuestos.length
  );
}
export function perfilSinDatos(datos: DatosGuardados): boolean {
  const n = datos.negocio;
  return (
    !datos.productos.length &&
    !datos.ventas.length &&
    !datos.movimientos?.length &&
    (!n ||
      (!n.marca.nombre &&
        !n.marca.contacto &&
        !n.marca.direccion &&
        !n.marca.logo &&
        n.marca.pie === marcaVacia().pie &&
        !n.borrador &&
        !n.presupuestos.length))
  );
}
