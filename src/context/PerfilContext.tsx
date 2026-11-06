import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generarId } from '../utils/formato';
import { crearCredencial, Credencial, credencialValida } from '../services/credenciales';
import { autenticar } from '../services/dispositivo';
import { guardarProtegido, leerProtegido, migrarProtegido } from '../services/boveda';
import { limitacionAcceso } from '../services/entornoAcceso';
import { comprobarPin } from '../services/acceso';

export type Perfil = { id: string; nombre: string; credencial: Credencial; biometria?: boolean };
type Activo = { id: string; nombre: string };
type Sesion = {
  perfiles: Perfil[];
  activo: Activo | null;
  listo: boolean;
  invitado: boolean;
  error: string | null;
  crear: (nombre: string, pin: string) => Promise<void>;
  entrar: (perfil: Perfil, pin: string) => Promise<void>;
  entrarConBiometria: (perfil: Perfil) => Promise<void>;
  configurarBiometria: (habilitado: boolean) => Promise<void>;
  verificarPinSesion: (pin: string) => Promise<void>;
  explorar: () => void;
  salir: () => void;
};
const Context = createContext<Sesion | null>(null);
const CLAVE = '@nexa/perfiles-v1';

/** Sesión en memoria; inventario persistente por usuario. La demo no escribe datos. */
export function PerfilProvider({ children }: { children: React.ReactNode }) {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [activo, setActivo] = useState<Activo | null>(null);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ocupado = useRef(false);
  const invitado = activo?.id === 'invitado';
  useEffect(() => {
    if (limitacionAcceso) {
      setError(limitacionAcceso);
      setListo(true);
      return;
    }
    (async () => {
      const protegido = await leerProtegido('perfiles');
      const json = protegido === null ? await AsyncStorage.getItem(CLAVE) : null;
      const datos: unknown = protegido ?? (json ? JSON.parse(json) : []);
      if (
        !Array.isArray(datos) ||
        !datos.every(
          (p) =>
            !!p &&
            typeof p === 'object' &&
            typeof p.id === 'string' &&
            /^[a-z0-9]+$/i.test(p.id) &&
            p.id !== 'invitado' &&
            typeof p.nombre === 'string' &&
            p.nombre.trim().length >= 2 &&
            p.nombre.length <= 60 &&
            (p.biometria === undefined || typeof p.biometria === 'boolean') &&
            credencialValida(p.credencial),
        ) ||
        new Set(datos.map((p) => p.id)).size !== datos.length ||
        new Set(datos.map((p) => p.nombre.trim().toLowerCase())).size !== datos.length
      )
        throw new Error('Perfiles inválidos');
      if (json) await migrarProtegido('perfiles', datos, CLAVE);
      if (protegido !== null) await AsyncStorage.removeItem(CLAVE);
      setPerfiles(datos);
    })()
      .catch(() => setError('No pudimos leer tus perfiles. Volvé a abrir la app.'))
      .finally(() => setListo(true));
  }, []);
  async function crear(nombre: string, pin: string) {
    if (ocupado.current || error) throw new Error('El acceso no está disponible. Intentá nuevamente.');
    if (nombre.trim().length < 2 || nombre.trim().length > 60)
      throw new Error('Usá un nombre de 2 a 60 caracteres.');
    if (perfiles.some((p) => p.nombre.toLowerCase() === nombre.trim().toLowerCase()))
      throw new Error('Ese nombre ya existe.');
    ocupado.current = true;
    try {
      const perfil = { id: generarId(), nombre: nombre.trim(), credencial: await crearCredencial(pin) };
      const nuevos = [...perfiles, perfil];
      await guardarProtegido('perfiles', nuevos);
      setPerfiles(nuevos);
      setActivo({ id: perfil.id, nombre: perfil.nombre });
    } finally {
      ocupado.current = false;
    }
  }
  async function entrar(perfil: Perfil, pin: string) {
    if (ocupado.current) throw new Error('Ya hay un acceso en curso.');
    const vigente = perfiles.find((p) => p.id === perfil.id);
    if (!vigente || error) throw new Error('Volvé a seleccionar tu perfil.');
    ocupado.current = true;
    try {
      await comprobarPin(vigente.id, pin, vigente.credencial);
      setActivo({ id: vigente.id, nombre: vigente.nombre });
    } finally {
      ocupado.current = false;
    }
  }
  async function entrarConBiometria(perfil: Perfil) {
    const vigente = perfiles.find((p) => p.id === perfil.id);
    if (ocupado.current || !vigente?.biometria || error) throw new Error('Ingresá con tu PIN.');
    ocupado.current = true;
    try {
      if (!(await autenticar()))
        throw new Error('No se completó la verificación. Podés ingresar con tu PIN.');
      setActivo({ id: vigente.id, nombre: vigente.nombre });
    } finally {
      ocupado.current = false;
    }
  }
  async function configurarBiometria(habilitado: boolean) {
    if (!activo || invitado) return;
    const nuevos = perfiles.map((p) => (p.id === activo.id ? { ...p, biometria: habilitado } : p));
    await guardarProtegido('perfiles', nuevos);
    setPerfiles(nuevos);
  }
  return (
    <Context.Provider
      value={{
        perfiles,
        activo,
        listo,
        invitado,
        error,
        crear,
        entrar,
        entrarConBiometria,
        configurarBiometria,
        verificarPinSesion: async (pin) => {
          const perfil = perfiles.find((p) => p.id === activo?.id);
          if (!perfil) throw new Error('Iniciá sesión nuevamente.');
          await entrar(perfil, pin);
        },
        explorar: () => setActivo({ id: 'invitado', nombre: 'Visitante' }),
        salir: () => setActivo(null),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function usePerfil() {
  const value = useContext(Context);
  if (!value) throw new Error('Falta PerfilProvider');
  return value;
}
