import { Producto } from '../types/models';

export const normalizarSku = (sku: string) => sku.trim().toUpperCase();
export const skuValido = (sku: unknown): sku is string =>
  typeof sku === 'string' && /^[A-Z0-9]{3,12}$/.test(sku);
export const skuDisponible = (sku: string, productos: Producto[], exceptoId?: string) =>
  !productos.some(
    (p) =>
      p.id !== exceptoId &&
      ((p.sku && normalizarSku(p.sku) === normalizarSku(sku)) ||
        (p.codigoQr && normalizarSku(p.codigoQr) === normalizarSku(sku))),
  );
