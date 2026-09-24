import { Producto, Venta } from '../types/models';

/**
 * Datos de ejemplo para la primera vez que se abre la app
 * (y para la demo en la defensa). Las fechas se calculan
 * a partir de "hoy" para que el resumen del mes tenga datos.
 */

const haceDias = (dias: number, hora = 12): string => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(hora, 15, 0, 0);
  return d.toISOString();
};

const productos: Producto[] = [
  {
    id: 'p1',
    nombre: 'Redmi Buds 6 Active',
    marca: 'Xiaomi',
    categoria: 'auriculares',
    costo: 18000,
    precio: 29900,
    stock: 12,
    stockMinimo: 4,
    reacondicionado: false,
    fotoUri: null,
    creadoEn: haceDias(40),
  },
  {
    id: 'p2',
    nombre: 'WH-CH520',
    marca: 'Sony',
    categoria: 'auriculares',
    costo: 55000,
    precio: 84900,
    stock: 2,
    stockMinimo: 3,
    reacondicionado: false,
    fotoUri: null,
    creadoEn: haceDias(38),
  },
  {
    id: 'p3',
    nombre: 'Go 4',
    marca: 'JBL',
    categoria: 'parlantes',
    costo: 45000,
    precio: 69900,
    stock: 6,
    stockMinimo: 2,
    reacondicionado: false,
    fotoUri: null,
    creadoEn: haceDias(35),
  },
  {
    id: 'p4',
    nombre: 'Flip 6',
    marca: 'JBL',
    categoria: 'parlantes',
    costo: 120000,
    precio: 179000,
    stock: 0,
    stockMinimo: 1,
    reacondicionado: false,
    fotoUri: null,
    creadoEn: haceDias(35),
  },
  {
    id: 'p5',
    nombre: 'Redmi Watch 5 Active',
    marca: 'Xiaomi',
    categoria: 'smartwatches',
    costo: 42000,
    precio: 64900,
    stock: 5,
    stockMinimo: 2,
    reacondicionado: false,
    fotoUri: null,
    creadoEn: haceDias(30),
  },
  {
    id: 'p6',
    nombre: 'Smart Band 9',
    marca: 'Xiaomi',
    categoria: 'smartwatches',
    costo: 30000,
    precio: 47900,
    stock: 8,
    stockMinimo: 3,
    reacondicionado: false,
    fotoUri: null,
    creadoEn: haceDias(28),
  },
  {
    id: 'p7',
    nombre: 'Apple Watch SE',
    marca: 'Apple',
    categoria: 'smartwatches',
    costo: 210000,
    precio: 289000,
    stock: 1,
    stockMinimo: 1,
    reacondicionado: true,
    fotoUri: null,
    creadoEn: haceDias(20),
  },
  {
    id: 'p8',
    nombre: 'PowerCore 10000',
    marca: 'Anker',
    categoria: 'powerbanks',
    costo: 28000,
    precio: 44900,
    stock: 9,
    stockMinimo: 3,
    reacondicionado: false,
    fotoUri: null,
    creadoEn: haceDias(25),
  },
  {
    id: 'p9',
    nombre: 'Cargador USB-C 20W',
    marca: 'Samsung',
    categoria: 'cargadores',
    costo: 7500,
    precio: 14900,
    stock: 20,
    stockMinimo: 5,
    reacondicionado: false,
    fotoUri: null,
    creadoEn: haceDias(25),
  },
];

const ventas: Venta[] = [
  {
    id: 'v1',
    productoId: 'p1',
    productoNombre: 'Redmi Buds 6 Active',
    cantidad: 2,
    precioUnitario: 29900,
    costoUnitario: 18000,
    fecha: haceDias(0, 11),
  },
  {
    id: 'v2',
    productoId: 'p9',
    productoNombre: 'Cargador USB-C 20W',
    cantidad: 3,
    precioUnitario: 14000,
    costoUnitario: 7500,
    fecha: haceDias(1, 17),
  },
  {
    id: 'v3',
    productoId: 'p3',
    productoNombre: 'Go 4',
    cantidad: 1,
    precioUnitario: 69900,
    costoUnitario: 45000,
    fecha: haceDias(2, 19),
  },
  {
    id: 'v4',
    productoId: 'p4',
    productoNombre: 'Flip 6',
    cantidad: 1,
    precioUnitario: 175000,
    costoUnitario: 120000,
    fecha: haceDias(4, 16),
  },
  {
    id: 'v5',
    productoId: 'p5',
    productoNombre: 'Redmi Watch 5 Active',
    cantidad: 1,
    precioUnitario: 64900,
    costoUnitario: 42000,
    fecha: haceDias(6, 13),
  },
];

/** Devuelve copias nuevas cada vez, para no compartir referencias. */
export const crearDatosIniciales = () => ({
  productos: productos.map((p) => ({ ...p })),
  ventas: ventas.map((v) => ({ ...v })),
});
