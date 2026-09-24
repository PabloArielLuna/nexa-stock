import { Errores, FormProducto, FormVenta } from '../types/formularios';

/**
 * Validaciones puras: reciben el formulario y devuelven los errores.
 * No guardan nada en estado: los errores son ESTADO DERIVADO (Clase 7),
 * se recalculan en cada render a partir de lo que escribió el usuario.
 */

const MAX_STOCK = 9999;

export const validarProducto = (
  form: FormProducto,
  nombresExistentes: string[] = [],
): Errores<FormProducto> => {
  const errores: Errores<FormProducto> = {};
  const nombre = form.nombre.trim();

  if (!nombre) errores.nombre = 'El nombre es obligatorio';
  else if (nombre.length < 3) errores.nombre = 'Usá al menos 3 caracteres';
  else if (nombresExistentes.some((n) => n.toLowerCase() === nombre.toLowerCase()))
    errores.nombre = 'Ya existe un producto con ese nombre';

  if (!form.marca.trim()) errores.marca = 'La marca es obligatoria';

  if (!form.categoria) errores.categoria = 'Elegí una categoría';

  const costo = Number(form.costo);
  const precio = Number(form.precio);

  if (!form.costo) errores.costo = 'Ingresá el costo';
  else if (costo <= 0) errores.costo = 'El costo debe ser mayor a 0';

  if (!form.precio) errores.precio = 'Ingresá el precio de venta';
  else if (precio <= 0) errores.precio = 'El precio debe ser mayor a 0';
  else if (form.costo && precio < costo) errores.precio = 'El precio no puede ser menor al costo';

  if (!form.stock) errores.stock = 'Ingresá el stock (puede ser 0)';
  else if (Number(form.stock) > MAX_STOCK) errores.stock = `Máximo ${MAX_STOCK} unidades`;

  if (!form.stockMinimo) errores.stockMinimo = 'Ingresá el stock mínimo';
  else if (Number(form.stockMinimo) > MAX_STOCK) errores.stockMinimo = `Máximo ${MAX_STOCK}`;

  return errores;
};

export const validarVenta = (form: FormVenta, stockDisponible: number): Errores<FormVenta> => {
  const errores: Errores<FormVenta> = {};
  const cantidad = Number(form.cantidad);

  if (!form.cantidad || cantidad < 1) errores.cantidad = 'La cantidad mínima es 1';
  else if (cantidad > stockDisponible)
    errores.cantidad = `Sólo hay ${stockDisponible} ${stockDisponible === 1 ? 'unidad' : 'unidades'} en stock`;

  if (!form.precio || Number(form.precio) <= 0) errores.precio = 'Ingresá el precio de venta';

  return errores;
};

/** true si el objeto de errores está vacío. */
export const sinErrores = <T>(errores: Errores<T>): boolean => Object.values(errores).every((e) => !e);
