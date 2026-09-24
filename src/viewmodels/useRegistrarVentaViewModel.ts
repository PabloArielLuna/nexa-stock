import { useState } from 'react';
import { useInventario } from '../context/InventarioContext';
import { FormVenta } from '../types/formularios';
import { sinErrores, validarVenta } from '../utils/validaciones';

/** VIEWMODEL de "Registrar venta": cantidad, precio, totales y confirmación. */
export const useRegistrarVentaViewModel = (productoId: string) => {
  const { obtenerProducto, registrarVenta } = useInventario();
  const producto = obtenerProducto(productoId);

  const [form, setForm] = useState<FormVenta>({
    cantidad: '1',
    precio: producto ? String(producto.precio) : '',
  });

  const setField = <K extends keyof FormVenta>(campo: K, valor: FormVenta[K]) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const stockDisponible = producto?.stock ?? 0;
  const cantidad = Number(form.cantidad) || 0;
  const precio = Number(form.precio) || 0;

  // Todo esto es estado derivado: se calcula, no se guarda.
  const errores = validarVenta(form, stockDisponible);
  const puedeConfirmar = !!producto && sinErrores(errores);
  const total = cantidad * precio;
  const ganancia = producto ? cantidad * (precio - producto.costo) : 0;
  const hayDescuento = !!producto && precio > 0 && precio < producto.precio;
  const vendeBajoCosto = !!producto && precio > 0 && precio < producto.costo;

  /** Suma o resta 1 a la cantidad, sin salirse de 1..stock (setter funcional). */
  const cambiarCantidad = (delta: number) => {
    setForm((prev) => {
      const nueva = Math.min(Math.max((Number(prev.cantidad) || 0) + delta, 1), stockDisponible);
      return { ...prev, cantidad: String(nueva) };
    });
  };

  const confirmar = (): boolean => {
    if (!puedeConfirmar || !producto) return false;
    return registrarVenta(producto.id, cantidad, precio) !== null;
  };

  return {
    producto,
    form,
    setField,
    errores,
    cantidad,
    stockDisponible,
    total,
    ganancia,
    hayDescuento,
    vendeBajoCosto,
    puedeConfirmar,
    cambiarCantidad,
    confirmar,
  };
};
