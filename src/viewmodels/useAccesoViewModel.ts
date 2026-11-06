import { useRef, useState } from 'react';
import { Perfil, usePerfil } from '../context/PerfilContext';
import { pinValido } from '../services/credenciales';

export function useAccesoViewModel() {
  const sesion = usePerfil();
  const [modo, setModo] = useState<'ingresar' | 'crear'>('ingresar');
  const [nombre, setNombre] = useState('');
  const [pin, setPin] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const enviando = useRef(false);
  const seleccionado =
    sesion.perfiles.find((p) => p.nombre.toLowerCase() === nombre.trim().toLowerCase()) ?? null;
  async function enviar(biometria = false) {
    if (enviando.current) return;
    enviando.current = true;
    setGuardando(true);
    setError('');
    try {
      if (modo === 'crear') {
        if (pin !== confirmacion) throw new Error('Los PIN no coinciden.');
        await sesion.crear(nombre, pin);
      } else {
        if (!seleccionado)
          throw new Error(
            'No encontramos esa cuenta en este dispositivo. Revisá el nombre o creá una cuenta.',
          );
        if (biometria) await sesion.entrarConBiometria(seleccionado);
        else await sesion.entrar(seleccionado, pin);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos completar el acceso.');
    } finally {
      enviando.current = false;
      setGuardando(false);
    }
  }
  return {
    modo,
    nombre,
    setNombre,
    pin,
    setPin,
    confirmacion,
    setConfirmacion,
    seleccionado,
    error,
    guardando,
    errorSesion: sesion.error,
    explorar: sesion.explorar,
    perfiles: sesion.perfiles,
    elegir: (p: Perfil) => {
      setNombre(p.nombre);
      setPin('');
      setError('');
    },
    cambiarModo: (m: 'ingresar' | 'crear') => {
      if (enviando.current) return;
      setModo(m);
      setPin('');
      setConfirmacion('');
      setError('');
    },
    enviar,
    puedeEnviar:
      !sesion.error &&
      nombre.trim().length >= 2 &&
      pinValido(pin) &&
      (modo === 'ingresar' || pin === confirmacion),
  };
}
