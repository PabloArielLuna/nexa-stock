import { CategoriaId } from './models';

/**
 * Estado de los formularios. Los números se guardan como texto
 * mientras el usuario escribe (así funciona TextInput) y se
 * convierten a number recién al guardar.
 */
export type FormProducto = {
  nombre: string;
  marca: string;
  categoria: CategoriaId | null;
  costo: string;
  precio: string;
  stock: string;
  stockMinimo: string;
  reacondicionado: boolean;
  fotoUri: string | null;
};

export type FormVenta = {
  cantidad: string;
  precio: string;
};

/** Un mensaje de error opcional por cada campo del formulario. */
export type Errores<T> = Partial<Record<keyof T, string>>;
