import { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Mapa de rutas tipado (Clases 4, 5 y 6).
 * Cada clave es una pantalla y su valor, los parámetros que recibe.
 * Entre pantallas sólo viaja el id: los datos completos se leen del Context
 * (así nunca se muestra una copia vieja del producto).
 */

/** Stack anidado adentro de la pestaña Inventario (Clase 5, Paso 5). */
export type InventarioStackParamList = {
  ListaProductos: undefined;
  DetalleProducto: { productoId: string };
  FormularioProducto: { productoId?: string }; // opcional: sin id = alta, con id = edición
  RegistrarVenta: { productoId: string };
  Escanear: { vincularProductoId: string } | undefined;
  Nivel: undefined;
  Respaldo: undefined;
  Movimientos: undefined;
};

/** Pestañas del menú inferior. */
export type RootTabParamList = {
  Inicio: undefined;
  Cuenta: undefined;
  // NavigatorScreenParams permite navegar desde otra pestaña a una pantalla del stack
  InventarioTab: NavigatorScreenParams<InventarioStackParamList> | undefined;
  Ventas: NavigatorScreenParams<VentasStackParamList> | undefined;
  Resumen: undefined;
};

export type VentasStackParamList = {
  ListaVentas: undefined;
  Presupuesto: { numero?: string } | undefined;
  Marca: undefined;
  PresupuestosGuardados: undefined;
};
