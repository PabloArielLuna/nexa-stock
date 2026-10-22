import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { autenticar, etiquetaBiometria, iconoBiometria } from '../services/dispositivo';
import { pinValido } from '../services/credenciales';
import { usePerfil } from '../context/PerfilContext';
import { colors } from '../styles/colors';
import BotonPrimario from './BotonPrimario';

const Context = createContext({
  habilitado: false,
  capturaProtegida: false,
  cambiar: async (): Promise<{ ok: boolean; error?: string }> => ({ ok: false }),
});
export const useBloqueo = () => useContext(Context);
/** Conserva la pantalla debajo del bloqueo; no pierde formularios al proteger la sesión. */
export default function BloqueoApp({ children }: { children: React.ReactNode }) {
  const { salir, activo, perfiles, invitado, configurarBiometria, verificarPinSesion } = usePerfil();
  const [habilitado, setHabilitado] = useState(() =>
    perfiles.some((p) => p.id === activo?.id && p.biometria),
  );
  const [bloqueado, setBloqueado] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [capturaProtegida, setCapturaProtegida] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const autenticando = useRef(false);
  useEffect(() => {
    const listener = AppState.addEventListener('change', (estado) => {
      if (invitado) return;
      setOculto(estado !== 'active');
      if (estado === 'background' && !autenticando.current) {
        setBloqueado(true);
        setPin('');
      }
    });
    return () => listener.remove();
  }, [invitado]);
  useEffect(() => {
    if (invitado || Platform.OS === 'web') return;
    let cancelado = false;
    // Serializar alta y baja impide dejar FLAG_SECURE aplicado después de cerrar sesión.
    const proteccion = (async () => {
      if (!(await ScreenCapture.isAvailableAsync())) return;
      await ScreenCapture.preventScreenCaptureAsync('nexa-privado');
      if (!cancelado) setCapturaProtegida(true);
      if (Platform.OS === 'ios') await ScreenCapture.enableAppSwitcherProtectionAsync(1);
    })();
    void proteccion.catch(() => undefined);
    return () => {
      cancelado = true;
      void proteccion
        .catch(() => undefined)
        .then(async () => {
          await ScreenCapture.allowScreenCaptureAsync('nexa-privado');
          if (Platform.OS === 'ios') await ScreenCapture.disableAppSwitcherProtectionAsync();
        })
        .catch(() => undefined);
    };
  }, [invitado]);
  async function validar(biometria: boolean) {
    if (autenticando.current) return false;
    autenticando.current = true;
    setOcupado(true);
    setError('');
    try {
      if (biometria) {
        if (!(await autenticar())) throw new Error('No se completó la verificación. Podés usar tu PIN.');
      } else await verificarPinSesion(pin);
      setPin('');
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo verificar el acceso.');
      return false;
    } finally {
      autenticando.current = false;
      setOcupado(false);
    }
  }
  async function cambiar() {
    if (autenticando.current) return { ok: false, error: 'Ya hay una verificación en curso.' };
    autenticando.current = true;
    try {
      if (!habilitado && !(await autenticar()))
        return { ok: false, error: 'Verificación cancelada o no completada. Tu PIN sigue disponible.' };
      await configurarBiometria(!habilitado);
      setHabilitado(!habilitado);
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : 'No pudimos guardar la configuración biométrica.',
      };
    } finally {
      autenticando.current = false;
    }
  }
  const cubierto = bloqueado || oculto;
  return (
    <Context.Provider value={{ habilitado, capturaProtegida, cambiar }}>
      <View style={s.root}>
        <View
          style={[s.content, cubierto && s.hidden]}
          pointerEvents={cubierto ? 'none' : 'auto'}
          accessibilityElementsHidden={cubierto}
          importantForAccessibility={cubierto ? 'no-hide-descendants' : 'auto'}
        >
          {children}
        </View>
        {cubierto && (
          <View style={s.overlay}>
            {oculto ? (
              <Text style={s.brand}>NEXA</Text>
            ) : (
              <>
                <Text style={s.brand}>NEXA / ESPACIO PRIVADO</Text>
                <Text style={s.title}>Tu información, bajo llave.</Text>
                <Text style={s.body}>Ingresá tu PIN para retomar donde estabas.</Text>
                <TextInput
                  accessibilityLabel="PIN para desbloquear"
                  style={s.input}
                  value={pin}
                  onChangeText={(v) => setPin(v.replace(/\D/g, ''))}
                  maxLength={6}
                  secureTextEntry
                  keyboardType="number-pad"
                  placeholder="PIN de 6 dígitos"
                  placeholderTextColor={colors.textLight}
                />
                {!!error && (
                  <Text accessibilityRole="alert" style={s.error}>
                    {error}
                  </Text>
                )}
                <BotonPrimario
                  label="Desbloquear con PIN"
                  deshabilitado={!pinValido(pin)}
                  cargando={ocupado}
                  onPress={() => {
                    void validar(false).then((ok) => {
                      if (ok) setBloqueado(false);
                    });
                  }}
                />
                {habilitado && (
                  <BotonPrimario
                    label={`Usar ${etiquetaBiometria}`}
                    icono={iconoBiometria}
                    variante="secundario"
                    cargando={ocupado}
                    onPress={() => {
                      void validar(true).then((ok) => {
                        if (ok) setBloqueado(false);
                      });
                    }}
                  />
                )}
                <BotonPrimario
                  label="Cerrar sesión"
                  variante="secundario"
                  deshabilitado={ocupado}
                  onPress={salir}
                />
              </>
            )}
          </View>
        )}
      </View>
    </Context.Provider>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  hidden: { opacity: 0 },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    padding: 32,
    gap: 24,
    backgroundColor: colors.background,
  },
  brand: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 3 },
  title: { color: colors.text, fontSize: 30, fontWeight: '700' },
  body: { color: colors.textMuted, lineHeight: 23 },
  input: {
    color: colors.text,
    fontSize: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    letterSpacing: 6,
  },
  error: { color: colors.error, lineHeight: 22 },
});
