import type { DatosGuardados, Movimiento, Producto, ProductoInput } from '../../types/models';
import { generarId } from '../../utils/formato';

export const motivoValido = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length >= 3 && v.trim().length <= 200;
export function registrarMovimiento(
  datos: DatosGuardados,
  producto: Pick<Producto, 'id' | 'nombre' | 'sku'>,
  tipo: Movimiento['tipo'],
  stockAntes: number,
  stockDespues: number,
  motivo: string,
  ventaId?: string,
  cambios?: Movimiento['cambios'],
): DatosGuardados {
  if (!motivoValido(motivo)) throw new Error('Indicá un motivo de 3 a 200 caracteres.');
  const movimiento: Movimiento = {
    id: generarId(),
    fecha: new Date().toISOString(),
    tipo,
    productoId: producto.id,
    productoNombre: producto.nombre,
    stockAntes,
    stockDespues,
    motivo: motivo.trim(),
    ...(producto.sku ? { sku: producto.sku } : {}),
    ...(ventaId ? { ventaId } : {}),
    ...(cambios?.length ? { cambios } : {}),
  };
  return { ...datos, movimientos: [movimiento, ...(datos.movimientos ?? [])] };
}
export function editarProducto(
  datos: DatosGuardados,
  id: string,
  input: ProductoInput,
  motivo?: string,
): DatosGuardados {
  const anterior = datos.productos.find((p) => p.id === id);
  if (!anterior) throw new Error('El producto ya no está disponible.');
  const ajustaStock = anterior.stock !== input.stock;
  if (ajustaStock && !motivoValido(motivo))
    throw new Error('Indicá por qué ajustás el stock (3 a 200 caracteres).');
  const campos = [
    'sku',
    'nombre',
    'marca',
    'categoria',
    'costo',
    'precio',
    'recargoPresupuesto',
    'stockMinimo',
    'reacondicionado',
    'fotoUri',
  ] as const;
  const cambios = campos
    .filter((campo) => anterior[campo] !== input[campo])
    .map((campo) => ({ campo, antes: anterior[campo] ?? null, despues: input[campo] ?? null }));
  if (!ajustaStock && !cambios.length) return datos;
  const nuevo = { ...anterior, ...input };
  return registrarMovimiento(
    { ...datos, productos: datos.productos.map((p) => (p.id === id ? nuevo : p)) },
    nuevo,
    ajustaStock ? 'ajuste' : 'edicion',
    anterior.stock,
    nuevo.stock,
    ajustaStock ? motivo! : 'Edición de la ficha del producto',
    undefined,
    cambios,
  );
}
export function darBajaProducto(datos: DatosGuardados, id: string, motivo: string): DatosGuardados {
  const producto = datos.productos.find((p) => p.id === id);
  if (!producto) return datos;
  return registrarMovimiento(
    { ...datos, productos: datos.productos.filter((p) => p.id !== id) },
    producto,
    'baja',
    producto.stock,
    0,
    motivo,
  );
}
