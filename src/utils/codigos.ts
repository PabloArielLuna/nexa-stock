import { DatosGuardados, Producto } from '../types/models';
import { normalizarSku } from './sku';

export const codigoProducto = (id: string) => `nexa:producto:${id}`;
/** Nunca abre URLs arbitrarias ni ejecuta contenido leído por la cámara. */
export function buscarCodigo(texto: string, productos: Producto[]) {
  const codigo = texto.trim();
  if (codigo.startsWith('nexa:producto:')) {
    return productos.find((p) => p.id === codigo.slice(14));
  }
  // El ingreso manual prioriza el SKU; las etiquetas anteriores siguen funcionando.
  return (
    productos.find((p) => p.codigoQr === codigo) ??
    productos.find((p) => p.sku === normalizarSku(codigo)) ??
    productos.find((p) => p.id === codigo)
  );
}

export const qrPersonalValido = (codigo: unknown): codigo is string =>
  typeof codigo === 'string' &&
  codigo.length > 0 &&
  codigo.length <= 1024 &&
  codigo === codigo.trim() &&
  !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(codigo) &&
  !codigo.startsWith('nexa:producto:');

/** Vincula contenido opaco: no visita direcciones ni interpreta instrucciones del QR. */
export function asociarCodigoQr(
  datos: DatosGuardados,
  productoId: string,
  valor: string | null,
): DatosGuardados {
  const producto = datos.productos.find((p) => p.id === productoId);
  if (!producto) throw new Error('El producto ya no está en tu inventario.');
  const codigo = valor?.trim();
  if (valor !== null && !qrPersonalValido(codigo))
    throw new Error(
      'Usá tu propio QR, de hasta 1024 caracteres. Las etiquetas NEXA ya funcionan sin vincularlas.',
    );
  const otro =
    codigo &&
    datos.productos.find(
      (p) =>
        p.id !== productoId &&
        (p.codigoQr === codigo ||
          p.id === codigo ||
          (p.sku && normalizarSku(p.sku) === normalizarSku(codigo))),
    );
  if (otro) throw new Error(`Este QR ya identifica a ${otro.sku ?? otro.nombre}. Elegí otra etiqueta.`);
  return {
    ...datos,
    productos: datos.productos.map((p) => {
      if (p.id !== productoId) return p;
      const { codigoQr: anterior, ...resto } = p;
      return codigo ? { ...resto, codigoQr: codigo } : resto;
    }),
  };
}
