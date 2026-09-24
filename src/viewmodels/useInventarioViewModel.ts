import { useMemo, useState } from 'react';
import { useInventario } from '../context/InventarioContext';
import { CategoriaId, Producto } from '../types/models';
import { estadoStock } from '../utils/calculos';

/** 'todas' + las categorías: el filtro sólo acepta estos valores. */
export type FiltroCategoria = CategoriaId | 'todas';

/** Quita tildes y pasa a minúsculas: "Auriculáres" → "auriculares". */
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * VIEWMODEL de la lista de productos.
 * La pantalla no sabe cómo se filtra ni se ordena: le pide a este hook
 * la lista ya lista para mostrar y las funciones para cambiar los filtros.
 */
export const useInventarioViewModel = () => {
  const { productos, eliminarProducto } = useInventario();

  // Estado propio de esta pantalla (no hace falta que sea global)
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<FiltroCategoria>('todas');

  // Estado derivado: se recalcula sólo si cambian productos, búsqueda o filtro.
  const productosVisibles = useMemo<Producto[]>(() => {
    const texto = normalizar(busqueda.trim());
    return productos
      .filter((p) => filtro === 'todas' || p.categoria === filtro)
      .filter((p) => !texto || normalizar(`${p.nombre} ${p.marca}`).includes(texto))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [productos, busqueda, filtro]);

  const totalUnidades = productos.reduce((acc, p) => acc + p.stock, 0);
  const cantidadConAlerta = productos.filter((p) => estadoStock(p) !== 'ok').length;
  const hayFiltrosActivos = busqueda.trim() !== '' || filtro !== 'todas';

  return {
    productosVisibles,
    totalProductos: productos.length,
    totalUnidades,
    cantidadConAlerta,
    busqueda,
    setBusqueda,
    filtro,
    setFiltro,
    hayFiltrosActivos,
    eliminarProducto,
  };
};
