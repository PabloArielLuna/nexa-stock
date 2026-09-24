import { useInventario } from '../context/InventarioContext';
import { esDelMesActual, estadoStock, gananciaVenta, totalVenta } from '../utils/calculos';
import { CATEGORIAS } from '../utils/categorias';

/** VIEWMODEL del tablero: todos los indicadores del negocio. */
export const useResumenViewModel = () => {
  const { productos, ventas, restaurarDatosDeEjemplo } = useInventario();

  // Todo es estado derivado: se recalcula en cada render a partir de productos y ventas.
  // --- Inventario ---
  const unidadesEnStock = productos.reduce((acc, p) => acc + p.stock, 0);
  const valorACosto = productos.reduce((acc, p) => acc + p.stock * p.costo, 0);
  const valorAVenta = productos.reduce((acc, p) => acc + p.stock * p.precio, 0);

  // --- Ventas del mes ---
  const ventasDelMes = ventas.filter((v) => esDelMesActual(v.fecha));
  const ingresosMes = ventasDelMes.reduce((acc, v) => acc + totalVenta(v), 0);
  const gananciaMes = ventasDelMes.reduce((acc, v) => acc + gananciaVenta(v), 0);

  // --- Stock por categoría (para las barras) ---
  const stockPorCategoria = CATEGORIAS.map((cat) => ({
    ...cat,
    unidades: productos.filter((p) => p.categoria === cat.id).reduce((acc, p) => acc + p.stock, 0),
  })).filter((c) => c.unidades > 0);
  const maximoCategoria = Math.max(1, ...stockPorCategoria.map((c) => c.unidades));

  // --- Productos para reponer: primero los sin stock ---
  const paraReponer = productos.filter((p) => estadoStock(p) !== 'ok').sort((a, b) => a.stock - b.stock);

  return {
    cantidadProductos: productos.length,
    unidadesEnStock,
    valorACosto,
    gananciaPotencial: valorAVenta - valorACosto,
    cantidadVentasMes: ventasDelMes.length,
    ingresosMes,
    gananciaMes,
    stockPorCategoria,
    maximoCategoria,
    paraReponer,
    restaurarDatosDeEjemplo,
  };
};
