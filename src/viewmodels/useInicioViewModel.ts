import { useInventario } from '../context/InventarioContext';
import { useResumenViewModel } from './useResumenViewModel';
import { totalVenta } from '../utils/calculos';

export function useInicioViewModel() {
  const inventario = useInventario();
  const resumen = useResumenViewModel();
  const hoy = new Date();
  const dias = Array.from({ length: 7 }, (_, index) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 6 + index);
    const total = inventario.ventas
      .filter((v) => new Date(v.fecha).toDateString() === fecha.toDateString())
      .reduce((suma, v) => suma + totalVenta(v), 0);
    return { etiqueta: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'][fecha.getDay()], total };
  });
  return {
    ...resumen,
    dias,
    maximo: Math.max(1, ...dias.map((d) => d.total)),
    ventasSemana: dias.reduce((s, d) => s + d.total, 0),
    recientes: [...inventario.ventas].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 3),
  };
}
