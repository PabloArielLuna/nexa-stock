import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { crearDatosIniciales } from '../data/datosIniciales';
import { cargarDatos, guardarDatos } from '../services/almacenamiento';
import { DatosGuardados, Producto, ProductoInput, Venta } from '../types/models';
import { MarcaNegocio, NegocioGuardado, Presupuesto } from '../types/negocio';
import { editarProducto, darBajaProducto, registrarMovimiento } from '../domain/inventario/movimientos';
import { marcaValida, negocioVacio, perfilSinDatos } from '../domain/inventario/negocio';
import { presupuestoValido } from '../utils/presupuestos';
import { generarId } from '../utils/formato';
import { anular, validarInput, vender } from '../utils/operaciones';
import { usePerfil } from './PerfilContext';
import { feedback } from '../services/dispositivo';
import { permite } from '../utils/permisos';
import { asociarCodigoQr } from '../utils/codigos';
import { CopiaInventario } from '../domain/inventario/respaldo';
import { prepararRestauracion } from '../services/respaldoDatos';

type InventarioContextType = DatosGuardados & {
  historialVentas: Venta[];
  negocio: NegocioGuardado;
  guardarMarca: (marca: MarcaNegocio) => Promise<void>;
  guardarPresupuesto: (p: Presupuesto, archivar: boolean) => Promise<void>;
  cargando: boolean;
  errorCarga: string | null;
  errorGuardado: boolean;
  guardando: boolean;
  reintentarGuardado: () => void;
  obtenerProducto: (id: string) => Producto | undefined;
  agregarProducto: (datos: ProductoInput) => Producto;
  actualizarProducto: (id: string, datos: ProductoInput, motivo?: string) => void;
  eliminarProducto: (id: string, motivo: string) => void;
  vincularQr: (id: string, codigo: string | null) => void;
  registrarVenta: (id: string, cantidad: number, precio: number) => Venta | null;
  anularVenta: (id: string, motivo: string) => void;
  restaurarDatosDeEjemplo: () => void;
  restaurarCopia: (copia: CopiaInventario) => Promise<void>;
};
const Context = createContext<InventarioContextType | null>(null);
export function InventarioProvider({ children, perfilId }: { children: React.ReactNode; perfilId: string }) {
  const { perfiles, invitado } = usePerfil();
  const [datos, setDatos] = useState<DatosGuardados>({ productos: [], ventas: [] });
  const actual = useRef(datos);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorGuardado, setErrorGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const revision = useRef(0);
  const montado = useRef(true);
  const restaurando = useRef(false);
  useEffect(() => {
    montado.current = true;
    (invitado ? Promise.resolve(crearDatosIniciales()) : cargarDatos(perfilId, perfiles[0]?.id === perfilId))
      .then((guardados) => {
        if (!montado.current) return;
        actual.current = guardados ?? { productos: [], ventas: [] };
        setDatos(actual.current);
      })
      .catch(() => {
        if (montado.current)
          setErrorCarga('No pudimos abrir este inventario. Tus datos no fueron reemplazados.');
      })
      .finally(() => {
        if (montado.current) setCargando(false);
      });
    return () => {
      montado.current = false;
    };
  }, [perfilId]);
  function persistir(nuevos: DatosGuardados) {
    if (invitado) return;
    const numero = ++revision.current;
    setGuardando(true);
    return guardarDatos(nuevos, perfilId)
      .then(() => {
        if (montado.current && numero === revision.current) setErrorGuardado(false);
      })
      .catch(() => {
        if (montado.current && numero === revision.current) setErrorGuardado(true);
        throw new Error('No se pudo guardar. Reintentá desde el aviso superior antes de salir.');
      })
      .finally(() => {
        if (montado.current && numero === revision.current) setGuardando(false);
      });
  }
  function cambiar(nuevos: DatosGuardados) {
    if (
      cargando ||
      errorCarga ||
      restaurando.current ||
      !permite(invitado ? 'invitado' : 'usuario', 'inventario')
    )
      throw new Error('El inventario no está disponible para cambios en este momento.');
    actual.current = nuevos;
    setDatos(nuevos);
    const guardado = persistir(nuevos);
    void guardado?.catch(() => undefined);
    return guardado;
  }
  async function restaurarCopia(copia: CopiaInventario) {
    if (invitado || cargando || errorCarga || guardando || errorGuardado || restaurando.current)
      throw new Error('Esperá a que termine el guardado antes de restaurar.');
    if (!perfilSinDatos(actual.current))
      throw new Error('Para restaurar, creá un perfil vacío. Tus datos actuales no se reemplazan.');
    restaurando.current = true;
    setGuardando(true);
    try {
      const nuevos = await prepararRestauracion(copia, perfilId);
      if (!montado.current) throw new Error('La sesión cambió. Volvé a abrir tu perfil.');
      await guardarDatos(nuevos, perfilId);
      if (montado.current) {
        actual.current = nuevos;
        setDatos(nuevos);
        setErrorGuardado(false);
      }
    } finally {
      restaurando.current = false;
      if (montado.current) setGuardando(false);
    }
  }
  function agregarProducto(input: ProductoInput): Producto {
    if (invitado) throw new Error('Iniciá sesión para agregar productos.');
    if (!validarInput(input, actual.current.productos)) throw new Error('Producto o SKU inválido');
    const p = { ...input, id: generarId(), creadoEn: new Date().toISOString() };
    cambiar(
      registrarMovimiento(
        { ...actual.current, productos: [p, ...actual.current.productos] },
        p,
        'alta',
        0,
        p.stock,
        'Alta inicial del producto',
      ),
    );
    return p;
  }
  function registrarVenta(id: string, cantidad: number, precio: number) {
    const resultado = vender(actual.current, id, cantidad, precio);
    if (!resultado || cargando || errorCarga || invitado) return null;
    cambiar(resultado.estado);
    feedback(true);
    return resultado.venta;
  }
  return (
    <Context.Provider
      value={{
        ...datos,
        ventas: datos.ventas.filter((v) => !v.anulacion),
        historialVentas: datos.ventas,
        negocio: datos.negocio ?? negocioVacio(),
        guardarMarca: async (marca) => {
          if (!marcaValida(marca) || marca.nombre.trim().length < 2)
            throw new Error('Revisá los datos de la marca.');
          await cambiar({
            ...actual.current,
            negocio: {
              ...(actual.current.negocio ?? negocioVacio()),
              marca: JSON.parse(JSON.stringify(marca)),
            },
          });
        },
        guardarPresupuesto: async (p, archivar) => {
          if (!presupuestoValido(p)) throw new Error('Revisá los datos del presupuesto.');
          const previo = actual.current.negocio ?? negocioVacio();
          const copia = JSON.parse(JSON.stringify(p));
          const presupuestos = archivar
            ? [copia, ...previo.presupuestos.filter((q) => q.numero !== p.numero)]
            : previo.presupuestos;
          if (presupuestos.length > 10000) throw new Error('Llegaste al límite de presupuestos guardados.');
          await cambiar({ ...actual.current, negocio: { ...previo, borrador: copia, presupuestos } });
        },
        cargando,
        errorCarga,
        errorGuardado,
        guardando,
        reintentarGuardado: () => {
          if (!restaurando.current) void persistir(actual.current)?.catch(() => undefined);
        },
        obtenerProducto: (id) => datos.productos.find((p) => p.id === id),
        agregarProducto,
        restaurarCopia,
        vincularQr: (id, codigo) => {
          if (invitado || cargando || errorCarga)
            throw new Error('Ingresá a tu inventario para vincular una etiqueta.');
          cambiar(asociarCodigoQr(actual.current, id, codigo));
        },
        actualizarProducto: (id, input, motivo) => {
          if (!validarInput(input, actual.current.productos, id)) throw new Error('Producto o SKU inválido');
          cambiar(editarProducto(actual.current, id, input, motivo));
        },
        eliminarProducto: (id, motivo) => {
          cambiar(darBajaProducto(actual.current, id, motivo));
        },
        registrarVenta,
        anularVenta: (id, motivo) => {
          cambiar(anular(actual.current, id, motivo));
        },
        restaurarDatosDeEjemplo: () => {
          if (!perfilSinDatos(actual.current))
            throw new Error('Los ejemplos solo se cargan en un perfil vacío.');
          cambiar(crearDatosIniciales());
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useInventario(): InventarioContextType {
  const context = useContext(Context);
  if (!context) throw new Error('Falta InventarioProvider');
  return context;
}
