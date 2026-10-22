import { EstadoStock, Producto, Venta } from '../types/models';

/**
 * Reglas de negocio puras: reciben datos y devuelven resultados,
 * sin tocar estado ni pantalla. Fáciles de probar y de explicar.
 */

export const gananciaUnitaria = (p: Pick<Producto, 'costo' | 'precio'>): number => p.precio - p.costo;

/** Recargo sobre costo, distinto del margen sobre el precio de venta. */
export const precioConRecargo = (costo: number, porcentaje: number): number =>
  Math.round(costo * (1 + porcentaje / 100));

/** Margen sobre el precio de venta, en %. */
export const margenPorcentaje = (p: Pick<Producto, 'costo' | 'precio'>): number =>
  p.precio > 0 ? Math.round(((p.precio - p.costo) / p.precio) * 100) : 0;

export const estadoStock = (p: Pick<Producto, 'stock' | 'stockMinimo'>): EstadoStock => {
  if (p.stock === 0) return 'sin-stock';
  if (p.stock <= p.stockMinimo) return 'bajo';
  return 'ok';
};

export const totalVenta = (v: Venta): number => (v.anulacion ? 0 : v.cantidad * v.precioUnitario);

export const gananciaVenta = (v: Venta): number =>
  v.anulacion ? 0 : v.cantidad * (v.precioUnitario - v.costoUnitario);

/** ¿La fecha ISO cae en el mes y año actuales? */
export const esDelMesActual = (fechaIso: string, hoy: Date = new Date()): boolean => {
  const f = new Date(fechaIso);
  return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
};
