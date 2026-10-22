export type MarcaNegocio = {
  nombre: string;
  contacto: string;
  direccion: string;
  pie: string;
  logo: string | null;
};
export type LineaPresupuesto = {
  sku?: string;
  productoId: string;
  nombre: string;
  cantidad: number;
  costo: number;
  recargo: number;
  precio: number;
};
export type Presupuesto = {
  numero: string;
  fecha: string;
  cliente: string;
  validez: number;
  descuento: number;
  notas: string;
  lineas: LineaPresupuesto[];
};
export type NegocioGuardado = {
  marca: MarcaNegocio;
  borrador: Presupuesto | null;
  presupuestos: Presupuesto[];
};
