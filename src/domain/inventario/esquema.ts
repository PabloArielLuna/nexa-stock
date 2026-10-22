import { DatosGuardados } from '../../types/models';
import { normalizarSku, skuValido } from '../../utils/sku';
import { qrPersonalValido } from '../../utils/codigos';
import { negocioValido } from './negocio';
import { motivoValido } from './movimientos';
const categorias = ['auriculares', 'parlantes', 'smartwatches', 'powerbanks', 'cargadores', 'otros'];
const registro = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object';
const positivo = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n > 0;
const entero = (n: unknown) => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
export function validarDatos(valor: unknown): valor is DatosGuardados {
  if (!registro(valor) || !Array.isArray(valor.productos) || !Array.isArray(valor.ventas)) return false;
  if (valor.productos.length > 10000 || valor.ventas.length > 100000) return false;
  if (valor.negocio !== undefined && !negocioValido(valor.negocio)) return false;
  if (
    valor.movimientos !== undefined &&
    (!Array.isArray(valor.movimientos) ||
      valor.movimientos.length > 200000 ||
      !valor.movimientos.every(
        (m) =>
          registro(m) &&
          typeof m.id === 'string' &&
          m.id.length > 0 &&
          m.id.length <= 100 &&
          typeof m.fecha === 'string' &&
          Number.isFinite(Date.parse(m.fecha)) &&
          typeof m.tipo === 'string' &&
          ['alta', 'ajuste', 'edicion', 'baja', 'venta', 'anulacion'].includes(m.tipo) &&
          typeof m.productoId === 'string' &&
          m.productoId.length > 0 &&
          m.productoId.length <= 100 &&
          typeof m.productoNombre === 'string' &&
          m.productoNombre.length > 0 &&
          m.productoNombre.length <= 100 &&
          (m.sku === undefined || skuValido(m.sku)) &&
          entero(m.stockAntes) &&
          entero(m.stockDespues) &&
          motivoValido(m.motivo) &&
          (m.ventaId === undefined ||
            (typeof m.ventaId === 'string' && m.ventaId.length > 0 && m.ventaId.length <= 100)) &&
          (m.cambios === undefined ||
            (Array.isArray(m.cambios) &&
              m.cambios.length <= 20 &&
              m.cambios.every(
                (c) =>
                  registro(c) &&
                  typeof c.campo === 'string' &&
                  c.campo.length <= 40 &&
                  [c.antes, c.despues].every(
                    (v) =>
                      v === null ||
                      typeof v === 'boolean' ||
                      (typeof v === 'string' && v.length <= 2048) ||
                      (typeof v === 'number' && Number.isFinite(v)),
                  ),
              ))),
      ) ||
      new Set(valor.movimientos.map((m) => m.id)).size !== valor.movimientos.length)
  )
    return false;
  const productos = valor.productos;
  const productosValidos = valor.productos.every(
    (p) =>
      registro(p) &&
      typeof p.id === 'string' &&
      p.id.length > 0 &&
      p.id.length <= 100 &&
      (p.sku === undefined || skuValido(p.sku)) &&
      (p.codigoQr === undefined || qrPersonalValido(p.codigoQr)) &&
      typeof p.nombre === 'string' &&
      p.nombre.trim().length >= 3 &&
      p.nombre.length <= 100 &&
      typeof p.marca === 'string' &&
      p.marca.trim().length > 0 &&
      p.marca.length <= 100 &&
      typeof p.categoria === 'string' &&
      categorias.includes(p.categoria) &&
      positivo(p.costo) &&
      positivo(p.precio) &&
      (p.recargoPresupuesto === undefined ||
        (typeof p.recargoPresupuesto === 'number' &&
          Number.isFinite(p.recargoPresupuesto) &&
          p.recargoPresupuesto >= 0 &&
          p.recargoPresupuesto <= 1000)) &&
      entero(p.stock) &&
      entero(p.stockMinimo) &&
      typeof p.reacondicionado === 'boolean' &&
      (p.fotoUri === null || typeof p.fotoUri === 'string') &&
      typeof p.creadoEn === 'string' &&
      Number.isFinite(Date.parse(p.creadoEn)),
  );
  const ventasValidas = valor.ventas.every(
    (v) =>
      registro(v) &&
      typeof v.id === 'string' &&
      v.id.length > 0 &&
      v.id.length <= 100 &&
      typeof v.productoId === 'string' &&
      v.productoId.length > 0 &&
      v.productoId.length <= 100 &&
      typeof v.productoNombre === 'string' &&
      v.productoNombre.length > 0 &&
      v.productoNombre.length <= 100 &&
      entero(v.cantidad) &&
      Number(v.cantidad) > 0 &&
      positivo(v.precioUnitario) &&
      positivo(v.costoUnitario) &&
      (v.anulacion === undefined ||
        (registro(v.anulacion) &&
          typeof v.anulacion.fecha === 'string' &&
          Number.isFinite(Date.parse(v.anulacion.fecha)) &&
          motivoValido(v.anulacion.motivo) &&
          typeof v.anulacion.stockRestituido === 'boolean')) &&
      typeof v.fecha === 'string' &&
      Number.isFinite(Date.parse(v.fecha)),
  );
  return (
    productosValidos &&
    !valor.productos.some(
      (p) =>
        p.codigoQr &&
        productos.some(
          (otro) =>
            otro.id !== p.id &&
            (otro.codigoQr === p.codigoQr ||
              otro.id === p.codigoQr ||
              (otro.sku && normalizarSku(otro.sku) === normalizarSku(p.codigoQr))),
        ),
    ) &&
    ventasValidas &&
    new Set(valor.productos.map((p) => p.id)).size === valor.productos.length &&
    new Set(valor.productos.filter((p) => p.sku !== undefined).map((p) => normalizarSku(p.sku))).size ===
      valor.productos.filter((p) => p.sku !== undefined).length &&
    new Set(valor.ventas.map((v) => v.id)).size === valor.ventas.length
  );
}
