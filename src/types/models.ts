/**
 * MODELOS DE DATOS (la "M" de MVVM).
 * Describen la forma de la información que maneja la app.
 */

/** Identificadores de categoría. Un union type: sólo acepta estos textos. */
import type { NegocioGuardado } from './negocio';
export type CategoriaId =
  'auriculares' | 'parlantes' | 'smartwatches' | 'powerbanks' | 'cargadores' | 'otros';

export type Producto = {
  id: string;
  sku?: string; // opcional solo para leer inventarios anteriores; obligatorio al crear o editar
  codigoQr?: string; // contenido de una etiqueta propia vinculada por el usuario
  nombre: string;
  marca: string;
  categoria: CategoriaId;
  costo: number; // lo que pagué al mayorista (por unidad)
  precio: number; // precio de venta al público (por unidad)
  recargoPresupuesto?: number; // porcentaje sobre costo; los productos anteriores usan 30%
  stock: number; // unidades disponibles
  stockMinimo: number; // debajo de este número se avisa "stock bajo"
  reacondicionado: boolean;
  fotoUri: string | null; // foto tomada con la cámara o elegida de la galería
  creadoEn: string; // fecha en formato ISO
};

/** Datos que completa el usuario al crear/editar (sin id ni fecha). */
export type ProductoInput = Omit<Producto, 'id' | 'creadoEn' | 'codigoQr'> & { sku: string };

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
  anulacion?: { fecha: string; motivo: string; stockRestituido: boolean };
};

export type Movimiento = {
  id: string;
  fecha: string;
  tipo: 'alta' | 'ajuste' | 'edicion' | 'baja' | 'venta' | 'anulacion';
  productoId: string;
  productoNombre: string;
  sku?: string;
  stockAntes: number;
  stockDespues: number;
  motivo: string;
  ventaId?: string;
  cambios?: {
    campo: string;
    antes: string | number | boolean | null;
    despues: string | number | boolean | null;
  }[];
};

export type EstadoStock = 'sin-stock' | 'bajo' | 'ok';

export type DatosGuardados = {
  productos: Producto[];
  ventas: Venta[];
  movimientos?: Movimiento[];
  negocio?: NegocioGuardado;
};
