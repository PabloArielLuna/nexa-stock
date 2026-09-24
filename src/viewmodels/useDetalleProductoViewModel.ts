import { useInventario } from '../context/InventarioContext';
import { compartirProducto } from '../services/compartir';
import { estadoStock, gananciaUnitaria, margenPorcentaje } from '../utils/calculos';

/** VIEWMODEL del detalle: arma todos los datos calculados de un producto. */
export const useDetalleProductoViewModel = (productoId: string) => {
  const { obtenerProducto, ventas, eliminarProducto } = useInventario();
  const producto = obtenerProducto(productoId);

  // Si el producto se borró, la pantalla muestra un aviso (renderizado condicional).
  if (!producto) {
    return { producto: undefined } as const;
  }

  const ventasDelProducto = ventas.filter((v) => v.productoId === producto.id);
  const unidadesVendidas = ventasDelProducto.reduce((acc, v) => acc + v.cantidad, 0);

  return {
    producto,
    estado: estadoStock(producto),
    ganancia: gananciaUnitaria(producto),
    margen: margenPorcentaje(producto),
    valorEnStock: producto.stock * producto.costo,
    unidadesVendidas,
    puedeVender: producto.stock > 0,
    eliminar: () => eliminarProducto(producto.id),
    compartir: () => compartirProducto(producto),
  } as const;
};
