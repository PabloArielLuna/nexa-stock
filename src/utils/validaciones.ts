import { Errores, FormProducto, FormVenta } from '../types/formularios';
import { normalizarSku, skuValido } from './sku';

/**
 * Validaciones puras: reciben el formulario y devuelven los errores.
 * No guardan nada en estado: los errores son ESTADO DERIVADO (Clase 7),
 * se recalculan en cada render a partir de lo que escribió el usuario.
 */

const MAX_STOCK = 9999;

export const validarProducto = (
  form: FormProducto,
  nombresExistentes: string[] = [],
  skusExistentes: string[] = [],
): Errores<FormProducto> => {
  const errores: Errores<FormProducto> = {};
  const nombre = form.nombre.trim();
  const sku = normalizarSku(form.sku ?? '');
  if (!skuValido(sku)) errores.sku = 'Usá de 3 a 12 letras o números, sin espacios ni símbolos';
  else if (skusExistentes.some((s) => normalizarSku(s) === sku))
    errores.sku = 'Ya usás este SKU en otro producto';

  if (!nombre) errores.nombre = 'El nombre es obligatorio';
  else if (nombre.length < 3) errores.nombre = 'Usá al menos 3 caracteres';
  else if (nombresExistentes.some((n) => n.toLowerCase() === nombre.toLowerCase()))
    errores.nombre = 'Ya existe un producto con ese nombre';

  if (!form.marca.trim()) errores.marca = 'La marca es obligatoria';

  if (!form.categoria) errores.categoria = 'Elegí una categoría';

  const costo = Number(form.costo);
  const precio = Number(form.precio);
  if (
    form.recargoPresupuesto !== undefined &&
    (!form.recargoPresupuesto ||
      !Number.isFinite(Number(form.recargoPresupuesto)) ||
      Number(form.recargoPresupuesto) < 0 ||
      Number(form.recargoPresupuesto) > 1000)
  )
    errores.recargoPresupuesto = 'Usá un recargo entre 0 y 1000%';

  if (!form.costo) errores.costo = 'Ingresá el costo';
  else if (!Number.isFinite(costo) || costo <= 0) errores.costo = 'Ingresá un costo válido mayor a 0';

  if (!form.precio) errores.precio = 'Ingresá el precio de venta';
  else if (!Number.isFinite(precio) || precio <= 0) errores.precio = 'Ingresá un precio válido mayor a 0';
  else if (form.costo && precio < costo) errores.precio = 'El precio no puede ser menor al costo';

  if (!form.stock) errores.stock = 'Ingresá el stock (puede ser 0)';
  else if (!Number.isSafeInteger(Number(form.stock)) || Number(form.stock) < 0)
    errores.stock = 'Ingresá unidades enteras, desde 0';
  else if (Number(form.stock) > MAX_STOCK) errores.stock = `Máximo ${MAX_STOCK} unidades`;

  if (!form.stockMinimo) errores.stockMinimo = 'Ingresá el stock mínimo';
  else if (!Number.isSafeInteger(Number(form.stockMinimo)) || Number(form.stockMinimo) < 0)
    errores.stockMinimo = 'Ingresá unidades enteras, desde 0';
  else if (Number(form.stockMinimo) > MAX_STOCK) errores.stockMinimo = `Máximo ${MAX_STOCK}`;

  return errores;
};

export const validarVenta = (form: FormVenta, stockDisponible: number): Errores<FormVenta> => {
  const errores: Errores<FormVenta> = {};
  const cantidad = Number(form.cantidad);

  if (!form.cantidad || !Number.isSafeInteger(cantidad) || cantidad < 1)
    errores.cantidad = 'Ingresá una cantidad entera, desde 1';
  else if (cantidad > stockDisponible)
    errores.cantidad = `Sólo hay ${stockDisponible} ${stockDisponible === 1 ? 'unidad' : 'unidades'} en stock`;

  if (!form.precio || !Number.isFinite(Number(form.precio)) || Number(form.precio) <= 0)
    errores.precio = 'Ingresá un precio de venta válido';

  return errores;
};

/** true si el objeto de errores está vacío. */
export const sinErrores = <T>(errores: Errores<T>): boolean => Object.values(errores).every((e) => !e);
