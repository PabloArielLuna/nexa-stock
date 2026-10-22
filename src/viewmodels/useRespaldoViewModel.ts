import { useRef, useState } from 'react';
import { useInventario } from '../context/InventarioContext';
import { usePerfil } from '../context/PerfilContext';
import { CopiaInventario } from '../domain/inventario/respaldo';
import { compartirCopia, elegirCopia } from '../services/respaldo';
import { claveCopiaValida, descifrarCopia } from '../services/respaldoCripto';
import { perfilSinDatos } from '../domain/inventario/negocio';

export function useRespaldoViewModel() {
  const inventario = useInventario();
  const { activo, invitado } = usePerfil();
  const [clave, setClave] = useState('');
  const [repeticion, setRepeticion] = useState('');
  const [copia, setCopia] = useState<CopiaInventario | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const trabajando = useRef(false);
  const disponible =
    !!activo &&
    !invitado &&
    !inventario.cargando &&
    !inventario.errorCarga &&
    !inventario.guardando &&
    !inventario.errorGuardado;
  async function ejecutar(accion: () => Promise<void>) {
    if (!disponible || trabajando.current) return;
    trabajando.current = true;
    setOcupado(true);
    setError('');
    setMensaje('');
    try {
      await accion();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos completar la operación.');
    } finally {
      trabajando.current = false;
      setOcupado(false);
    }
  }
  return {
    clave,
    setClave,
    repeticion,
    setRepeticion,
    copia,
    ocupado,
    error,
    mensaje,
    puedeExportar: disponible && claveCopiaValida(clave) && clave === repeticion,
    puedeLeer: disponible && claveCopiaValida(clave),
    puedeRestaurar:
      disponible &&
      !!copia &&
      perfilSinDatos({
        productos: inventario.productos,
        ventas: inventario.historialVentas,
        movimientos: inventario.movimientos,
        negocio: inventario.negocio,
      }),
    exportar: () =>
      ejecutar(async () => {
        if (!activo || !claveCopiaValida(clave) || clave !== repeticion)
          throw new Error('Revisá y repetí la contraseña.');
        await compartirCopia(
          {
            productos: inventario.productos,
            ventas: inventario.historialVentas,
            movimientos: inventario.movimientos ?? [],
            negocio: inventario.negocio,
          },
          activo.id,
          clave,
        );
        setClave('');
        setRepeticion('');
        setMensaje(
          'Se cerró el menú para compartir. Comprobá que guardaste el archivo .nexa fuera de la app. Cancelar el menú no guarda una copia.',
        );
      }),
    leer: () =>
      ejecutar(async () => {
        setCopia(null);
        const texto = await elegirCopia();
        if (texto === null) return;
        setCopia(await descifrarCopia(texto, clave));
        setClave('');
        setRepeticion('');
      }),
    restaurar: () =>
      ejecutar(async () => {
        if (!copia) return;
        await inventario.restaurarCopia(copia);
        setCopia(null);
        setMensaje('Inventario restaurado y guardado en este perfil.');
      }),
  };
}
