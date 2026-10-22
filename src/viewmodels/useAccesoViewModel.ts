import { useState } from 'react';
import { Perfil, usePerfil } from '../context/PerfilContext';
import { pinValido } from '../services/credenciales';
import { Platform } from 'react-native';

/** Estado del formulario de acceso; la vista solo presenta campos y acciones. */
export function useAccesoViewModel() {
  const sesion = usePerfil();
  const [nombre, setNombre] = useState('');
  const [pin, setPin] = useState('');
  const [seleccionado, setSeleccionado] = useState<Perfil | null>(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const repetido =
    !seleccionado && sesion.perfiles.some((p) => p.nombre.toLowerCase() === nombre.trim().toLowerCase());
  async function crear() {
    setGuardando(true);
    setError('');
    try {
      if (seleccionado) await sesion.entrar(seleccionado, pin);
      else await sesion.crear(nombre, pin);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos completar el acceso.');
    } finally {
      setGuardando(false);
    }
  }
  function elegir(perfil: Perfil | null) {
    setSeleccionado(perfil);
    setPin('');
    setError('');
  }
  async function ingresarConBiometria() {
    if (!seleccionado || guardando) return;
    setGuardando(true);
    setError('');
    try {
      await sesion.entrarConBiometria(seleccionado);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ingresá con tu PIN.');
    } finally {
      setGuardando(false);
    }
  }
  return {
    accesoDisponible: Platform.OS !== 'web',
    perfiles: sesion.perfiles,
    errorSesion: sesion.error,
    explorar: sesion.explorar,
    nombre,
    setNombre,
    pin,
    setPin,
    seleccionado,
    error,
    guardando,
    repetido,
    crear,
    elegir,
    ingresarConBiometria,
    puedeEnviar:
      Platform.OS !== 'web' &&
      (seleccionado !== null || nombre.trim().length >= 2) &&
      pinValido(pin) &&
      !repetido &&
      !sesion.error,
  };
}
