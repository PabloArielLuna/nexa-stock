import React, { createContext, useContext, useEffect, useState } from 'react';
import { crearDatosIniciales } from '../data/datosIniciales';
import { cargarDatos, guardarDatos } from '../services/almacenamiento';
import { Producto, ProductoInput, Venta } from '../types/models';
import { generarId } from '../utils/formato';

/**
 * ESTADO GLOBAL (Modelo) con Context API.
 *
 * Es la "única fuente de verdad" de productos y ventas. Las pantallas
 * no modifican los datos directamente: llaman a estas funciones.
 * Así, si registro una venta en una pantalla, el stock se actualiza
 * en todas las demás (lista, detalle, resumen) al mismo tiempo.
 *
 * Todos los cambios son inmutables: se crea un array nuevo con
 * map / filter / spread, nunca se modifica el anterior (Clase 8).
 */

type InventarioContextType = {
  productos: Producto[];
  ventas: Venta[];
  cargando: boolean;
  obtenerProducto: (id: string) => Producto | undefined;
  agregarProducto: (datos: ProductoInput) => Producto;
  actualizarProducto: (id: string, datos: ProductoInput) => void;
  eliminarProducto: (id: string) => void;
  registrarVenta: (productoId: string, cantidad: number, precioUnitario: number) => Venta | null;
  anularVenta: (ventaId: string) => void;
  restaurarDatosDeEjemplo: () => void;
};

const InventarioContext = createContext<InventarioContextType | null>(null);

type Props = { children: React.ReactNode };

export const InventarioProvider: React.FC<Props> = ({ children }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);

  // 1) Al abrir la app: leo lo guardado. Si no hay nada, cargo los datos de ejemplo.
  useEffect(() => {
    const iniciar = async () => {
      const guardados = await cargarDatos();
      const datos = guardados ?? crearDatosIniciales();
      setProductos(datos.productos);
      setVentas(datos.ventas);
      setCargando(false);
    };
    iniciar();
  }, []);

  // 2) Cada vez que cambian productos o ventas, lo guardo en el teléfono.
  //    (No guardo mientras carga, para no pisar los datos con arrays vacíos.)
  useEffect(() => {
    if (!cargando) guardarDatos({ productos, ventas });
  }, [productos, ventas, cargando]);

  const obtenerProducto = (id: string) => productos.find((p) => p.id === id);

  const agregarProducto = (datos: ProductoInput): Producto => {
    const nuevo: Producto = { ...datos, id: generarId(), creadoEn: new Date().toISOString() };
    setProductos((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const actualizarProducto = (id: string, datos: ProductoInput) => {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, ...datos } : p)));
  };

  const eliminarProducto = (id: string) => {
    // Las ventas del producto se conservan: guardan su propio nombre y precios.
    setProductos((prev) => prev.filter((p) => p.id !== id));
  };

  const registrarVenta = (productoId: string, cantidad: number, precioUnitario: number): Venta | null => {
    const producto = obtenerProducto(productoId);
    if (!producto || cantidad < 1 || cantidad > producto.stock) return null;

    const venta: Venta = {
      id: generarId(),
      productoId,
      productoNombre: producto.nombre,
      cantidad,
      precioUnitario,
      costoUnitario: producto.costo,
      fecha: new Date().toISOString(),
    };

    setVentas((prev) => [venta, ...prev]);
    // Descuento el stock vendido.
    setProductos((prev) => prev.map((p) => (p.id === productoId ? { ...p, stock: p.stock - cantidad } : p)));
    return venta;
  };

  const anularVenta = (ventaId: string) => {
    const venta = ventas.find((v) => v.id === ventaId);
    if (!venta) return;

    setVentas((prev) => prev.filter((v) => v.id !== ventaId));
    // Devuelvo las unidades al stock (si el producto todavía existe).
    setProductos((prev) =>
      prev.map((p) => (p.id === venta.productoId ? { ...p, stock: p.stock + venta.cantidad } : p)),
    );
  };

  const restaurarDatosDeEjemplo = () => {
    const datos = crearDatosIniciales();
    setProductos(datos.productos);
    setVentas(datos.ventas);
  };

  return (
    <InventarioContext.Provider
      value={{
        productos,
        ventas,
        cargando,
        obtenerProducto,
        agregarProducto,
        actualizarProducto,
        eliminarProducto,
        registrarVenta,
        anularVenta,
        restaurarDatosDeEjemplo,
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
};

/** Hook para leer el inventario desde cualquier ViewModel. */
export const useInventario = (): InventarioContextType => {
  const contexto = useContext(InventarioContext);
  if (!contexto) {
    throw new Error('useInventario debe usarse dentro de <InventarioProvider>');
  }
  return contexto;
};
