import { useMemo, useRef, useState } from 'react';
import { useInventario } from '../context/InventarioContext';
import { elegirDeGaleria, tomarFoto } from '../services/camara';
import { Errores, FormProducto } from '../types/formularios';
import { Producto, ProductoInput } from '../types/models';
import { gananciaUnitaria, margenPorcentaje } from '../utils/calculos';
import { avisar } from '../utils/dialogos';
import { sinErrores, validarProducto } from '../utils/validaciones';
import { usePerfil } from '../context/PerfilContext';
import { normalizarSku } from '../utils/sku';
import { motivoValido } from '../domain/inventario/movimientos';

const FORM_VACIO: FormProducto = {
  sku: '',
  nombre: '',
  marca: '',
  categoria: null,
  costo: '',
  precio: '',
  recargoPresupuesto: '30',
  stock: '',
  stockMinimo: '2',
  reacondicionado: false,
  fotoUri: null,
};

/** Convierte un producto existente al formato del formulario (números → texto). */
const productoAForm = (p: Producto): FormProducto => ({
  sku: p.sku ?? '',
  nombre: p.nombre,
  marca: p.marca,
  categoria: p.categoria,
  costo: String(p.costo),
  precio: String(p.precio),
  recargoPresupuesto: String(p.recargoPresupuesto ?? 30),
  stock: String(p.stock),
  stockMinimo: String(p.stockMinimo),
  reacondicionado: p.reacondicionado,
  fotoUri: p.fotoUri,
});

/**
 * VIEWMODEL del formulario de alta / edición.
 *
 * - Un solo estado-objeto con setField<K> genérico (Clase 7, Ejercicio 5).
 * - Los errores NO son estado: se calculan con validarProducto (estado derivado).
 * - "tocados" guarda qué campos ya visitó el usuario, para no mostrarle
 *   errores en rojo antes de que empiece a escribir.
 */
export const useFormularioProductoViewModel = (productoId?: string) => {
  const { activo, invitado } = usePerfil();
  const { productos, obtenerProducto, agregarProducto, actualizarProducto } = useInventario();
  const productoEditado = productoId ? obtenerProducto(productoId) : undefined;
  const esEdicion = !!productoEditado;

  // El valor inicial se calcula una sola vez (función en useState).
  const [form, setForm] = useState<FormProducto>(() =>
    productoEditado ? productoAForm(productoEditado) : FORM_VACIO,
  );
  const [tocados, setTocados] = useState<Partial<Record<keyof FormProducto, boolean>>>({});
  const enviado = useRef(false);
  const cargandoImagen = useRef(false);
  const [cargandoFoto, setCargandoFoto] = useState(false);
  const [motivoAjuste, setMotivoAjuste] = useState('');

  const setField = <K extends keyof FormProducto>(campo: K, valor: FormProducto[K]) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const marcarTocado = (campo: keyof FormProducto) => {
    setTocados((prev) => ({ ...prev, [campo]: true }));
  };

  // Nombres de los OTROS productos, para no permitir duplicados.
  const nombresExistentes = useMemo(
    () => productos.filter((p) => p.id !== productoId).map((p) => p.nombre),
    [productos, productoId],
  );

  const skusExistentes = productos
    .filter((p) => p.id !== productoId)
    .flatMap((p) => [p.sku, p.codigoQr].filter((s): s is string => !!s));
  const errores: Errores<FormProducto> = validarProducto(form, nombresExistentes, skusExistentes);
  const requiereMotivo = !!productoEditado && Number(form.stock) !== productoEditado.stock;
  const puedeGuardar =
    !cargandoFoto && sinErrores(errores) && (!requiereMotivo || motivoValido(motivoAjuste));

  /** Muestra el error de un campo sólo si ya lo tocó o si tiene algo escrito. */
  const errorDe = (campo: keyof FormProducto): string | undefined =>
    tocados[campo] || (typeof form[campo] === 'string' && form[campo] !== '') ? errores[campo] : undefined;

  // Vista previa de la ganancia mientras escribe los precios.
  const costo = Number(form.costo) || 0;
  const precio = Number(form.precio) || 0;
  const vistaPrevia =
    costo > 0 && precio > 0
      ? { ganancia: gananciaUnitaria({ costo, precio }), margen: margenPorcentaje({ costo, precio }) }
      : null;

  const cargarFoto = async (origen: 'camara' | 'galeria') => {
    if (!activo || invitado || cargandoImagen.current) return;
    cargandoImagen.current = true;
    setCargandoFoto(true);
    try {
      const resultado = origen === 'camara' ? await tomarFoto(activo.id) : await elegirDeGaleria(activo.id);
      if (resultado.ok) {
        setField('fotoUri', resultado.uri);
      } else if (resultado.motivo === 'sin-permiso') {
        avisar(
          'Permiso necesario',
          'Habilitá el acceso desde la configuración del teléfono para agregar la foto.',
        );
      }
    } catch {
      avisar('No se pudo abrir la foto', 'Intentá nuevamente desde la cámara o la galería.');
    } finally {
      cargandoImagen.current = false;
      setCargandoFoto(false);
    }
  };

  /** Guarda y devuelve true si salió bien (la pantalla decide a dónde navegar). */
  const guardar = (): boolean => {
    if (!puedeGuardar || !form.categoria || enviado.current) return false;
    enviado.current = true;

    const datos: ProductoInput = {
      sku: normalizarSku(form.sku),
      nombre: form.nombre.trim(),
      marca: form.marca.trim(),
      categoria: form.categoria,
      costo: Number(form.costo),
      precio: Number(form.precio),
      recargoPresupuesto: Number(form.recargoPresupuesto),
      stock: Number(form.stock),
      stockMinimo: Number(form.stockMinimo),
      reacondicionado: form.reacondicionado,
      fotoUri: form.fotoUri,
    };

    try {
      if (productoEditado) actualizarProducto(productoEditado.id, datos, motivoAjuste);
      else agregarProducto(datos);
      return true;
    } catch {
      enviado.current = false;
      avisar('No se pudo guardar', 'Revisá que el SKU sea válido y no esté usado por otro producto.');
      return false;
    }
  };

  return {
    cargandoFoto,
    motivoAjuste,
    setMotivoAjuste,
    requiereMotivo,
    form,
    setField,
    marcarTocado,
    errorDe,
    puedeGuardar,
    esEdicion,
    vistaPrevia,
    tomarFoto: () => cargarFoto('camara'),
    elegirDeGaleria: () => cargarFoto('galeria'),
    guardar,
  };
};
