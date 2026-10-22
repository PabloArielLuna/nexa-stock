import { useRef, useState } from 'react';
import { usePerfil } from '../context/PerfilContext';
import { useInventario } from '../context/InventarioContext';

import { exportarPresupuesto, AccionPDF } from '../services/presupuestos';
import { Presupuesto, presupuestoValido, totalesPresupuesto } from '../utils/presupuestos';
import { generarId } from '../utils/formato';
import { Producto } from '../types/models';
import { precioConRecargo } from '../utils/calculos';

const nuevo = (): Presupuesto => ({
  numero: `P-${Date.now().toString(36).toUpperCase()}-${generarId().slice(-4).toUpperCase()}`,
  fecha: new Date().toISOString(),
  cliente: '',
  validez: 7,
  descuento: 0,
  notas: '',
  lineas: [],
});
export function usePresupuestoViewModel(numero?: string) {
  const { activo, invitado } = usePerfil();
  const { productos, negocio, guardarPresupuesto, cargando, errorCarga } = useInventario();
  const [form, setForm] = useState<Presupuesto>(() =>
    JSON.parse(
      JSON.stringify(
        (numero ? negocio.presupuestos.find((p) => p.numero === numero) : negocio.borrador) ?? nuevo(),
      ),
    ),
  );
  const [busqueda, setBusqueda] = useState('');

  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState('');

  const enviando = useRef(false);
  function agregar(p: Producto) {
    setForm((prev) => {
      const existe = prev.lineas.find((l) => l.productoId === p.id);
      if (!existe && prev.lineas.length >= 30) return prev;
      return {
        ...prev,
        lineas: existe
          ? prev.lineas.map((l) =>
              l.productoId === p.id ? { ...l, cantidad: Math.min(9999, l.cantidad + 1) } : l,
            )
          : [
              ...prev.lineas,
              {
                productoId: p.id,
                sku: p.sku,
                nombre: `${p.marca} ${p.nombre}`,
                cantidad: 1,
                costo: p.costo,
                recargo: p.recargoPresupuesto ?? 30,
                precio: precioConRecargo(p.costo, p.recargoPresupuesto ?? 30),
              },
            ],
      };
    });
  }
  async function guardar(exportar: boolean, accion: AccionPDF = 'compartir') {
    if (!activo || invitado || enviando.current || errorCarga || !presupuestoValido(form)) return false;
    enviando.current = true;
    setOcupado(true);
    setError('');
    setResultado('');
    try {
      await guardarPresupuesto(form, exportar);
      if (exportar)
        setResultado(await exportarPresupuesto(form, activo.id, activo.nombre, negocio.marca, accion));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos preparar el presupuesto.');
      return false;
    } finally {
      enviando.current = false;
      setOcupado(false);
    }
  }
  return {
    form,
    setForm,
    busqueda,
    setBusqueda,
    cargando,
    ocupado,
    error,
    resultado,
    agregar,
    guardar,
    totales: totalesPresupuesto(form),
    puedeGuardar: !errorCarga && !cargando && presupuestoValido(form),
    disponibles: productos
      .filter((p) => `${p.sku ?? ''} ${p.marca} ${p.nombre}`.toLowerCase().includes(busqueda.toLowerCase()))
      .slice(0, 20),
    nuevo: () => {
      setForm(nuevo());
      setError('');
      setResultado('');
    },
  };
}
