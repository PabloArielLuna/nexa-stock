/**
 * MODELOS DE DATOS (la "M" de MVVM).
 * Describen la forma de la información que maneja la app.
 */

/** Identificadores de categoría. Un union type: sólo acepta estos textos. */
export type CategoriaId =
  'auriculares' | 'parlantes' | 'smartwatches' | 'powerbanks' | 'cargadores' | 'otros';

export type Producto = {
  id: string;
  nombre: string;
  marca: string;
  categoria: CategoriaId;
  costo: number; // lo que pagué al mayorista (por unidad)
  precio: number; // precio de venta al público (por unidad)
  stock: number; // unidades disponibles
  stockMinimo: number; // debajo de este número se avisa "stock bajo"
  reacondicionado: boolean;
  fotoUri: string | null; // foto tomada con la cámara o elegida de la galería
  creadoEn: string; // fecha en formato ISO
};

/** Datos que completa el usuario al crear/editar (sin id ni fecha). */
export type ProductoInput = Omit<Producto, 'id' | 'creadoEn'>;

export type Venta = {
  id: string;
  productoId: string;
  // Se guarda una "foto" del producto al momento de vender:
  // si después cambia el precio o se borra el producto, la venta no se altera.
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  costoUnitario: number;
  fecha: string; // ISO
};

export type EstadoStock = 'sin-stock' | 'bajo' | 'ok';
