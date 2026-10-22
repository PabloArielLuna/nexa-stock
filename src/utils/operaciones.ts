import { DatosGuardados, Producto, ProductoInput } from '../types/models';
import { skuDisponible, skuValido } from './sku';
import { generarId } from '../utils/formato';
import { motivoValido, registrarMovimiento } from '../domain/inventario/movimientos';

export function validarInput(p: ProductoInput, productos: Producto[] = [], exceptoId?: string): boolean {
  return (
    skuValido(p.sku) &&
    skuDisponible(p.sku, productos, exceptoId) &&
    p.nombre.trim().length >= 3 &&
    p.marca.trim().length > 0 &&
    Number.isFinite(p.costo) &&
    p.costo > 0 &&
    Number.isFinite(p.precio) &&
    p.precio >= p.costo &&
    (p.recargoPresupuesto === undefined ||
      (Number.isFinite(p.recargoPresupuesto) && p.recargoPresupuesto >= 0 && p.recargoPresupuesto <= 1000)) &&
    Number.isSafeInteger(p.stock) &&
    p.stock >= 0 &&
    p.stock <= 9999 &&
    Number.isSafeInteger(p.stockMinimo) &&
    p.stockMinimo >= 0 &&
    p.stockMinimo <= 9999
  );
}

/** Venta y descuento de stock son una sola transición indivisible. */
export function vender(estado: DatosGuardados, productoId: string, cantidad: number, precio: number) {
  const p = estado.productos.find((item) => item.id === productoId);
  if (
    !p ||
    !Number.isSafeInteger(cantidad) ||
    cantidad < 1 ||
    cantidad > p.stock ||
    !Number.isFinite(precio) ||
    precio <= 0
  )
    return null;
  const venta = {
    id: generarId(),
    productoId,
    productoNombre: p.nombre,
    cantidad,
    precioUnitario: precio,
    costoUnitario: p.costo,
    fecha: new Date().toISOString(),
  };
  return {
    venta,
    estado: registrarMovimiento(
      {
        ...estado,
        ventas: [venta, ...estado.ventas],
        productos: estado.productos.map((item) =>
          item.id === productoId ? { ...item, stock: item.stock - cantidad } : item,
        ),
      },
      p,
      'venta',
      p.stock,
      p.stock - cantidad,
      'Venta registrada',
      venta.id,
    ),
  };
}

export function anular(estado: DatosGuardados, ventaId: string, motivo: string): DatosGuardados {
  const venta = estado.ventas.find((v) => v.id === ventaId);
  if (!venta || venta.anulacion) return estado;
  if (!motivoValido(motivo)) throw new Error('Indicá el motivo de la anulación (3 a 200 caracteres).');
  const p = estado.productos.find((p) => p.id === venta.productoId);
  if (p && !Number.isSafeInteger(p.stock + venta.cantidad))
    throw new Error('El stock resultante supera el máximo admitido.');
  const actualizado: DatosGuardados = {
    ...estado,
    ventas: estado.ventas.map((v) =>
      v.id === ventaId
        ? {
            ...v,
            anulacion: { fecha: new Date().toISOString(), motivo: motivo.trim(), stockRestituido: !!p },
          }
        : v,
    ),
    productos: estado.productos.map((p) =>
      p.id === venta.productoId ? { ...p, stock: p.stock + venta.cantidad } : p,
    ),
  };
  return registrarMovimiento(
    actualizado,
    p ?? { id: venta.productoId, nombre: venta.productoNombre },
    'anulacion',
    p?.stock ?? 0,
    p ? p.stock + venta.cantidad : 0,
    motivo.trim(),
    venta.id,
  );
}
