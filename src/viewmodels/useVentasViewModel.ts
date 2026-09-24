import { useMemo, useState } from 'react';
import { useInventario } from '../context/InventarioContext';
import { esDelMesActual, gananciaVenta, totalVenta } from '../utils/calculos';

export type Periodo = 'hoy' | 'mes' | 'todas';

const esDeHoy = (fechaIso: string) => new Date(fechaIso).toDateString() === new Date().toDateString();

/** VIEWMODEL del historial de ventas, con filtro por período y totales. */
export const useVentasViewModel = () => {
  const { ventas, anularVenta } = useInventario();
  const [periodo, setPeriodo] = useState<Periodo>('mes');

  const ventasVisibles = useMemo(
    () =>
      ventas
        .filter((v) => {
          if (periodo === 'hoy') return esDeHoy(v.fecha);
          if (periodo === 'mes') return esDelMesActual(v.fecha);
          return true;
        })
        // la más reciente primero
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [ventas, periodo],
  );

  const ingresos = ventasVisibles.reduce((acc, v) => acc + totalVenta(v), 0);
  const ganancia = ventasVisibles.reduce((acc, v) => acc + gananciaVenta(v), 0);
  const unidades = ventasVisibles.reduce((acc, v) => acc + v.cantidad, 0);

  return { ventasVisibles, periodo, setPeriodo, ingresos, ganancia, unidades, anularVenta };
};
