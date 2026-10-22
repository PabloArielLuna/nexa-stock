import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { estaNivelado, inclinacion, suavizar, Vector3 } from '../utils/nivel';
import { feedback } from '../services/dispositivo';

type Lectura = { lateral: number; frontal: number; estable: boolean };
export function useNivelViewModel() {
  const focused = useIsFocused();
  const [activo, setActivo] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');
  const [gyro, setGyro] = useState(false);
  const [lectura, setLectura] = useState<Lectura | null>(null);
  const [referencia, setReferencia] = useState({ lateral: 0, frontal: 0 });
  const sensores = useRef<{ remove: () => void }[]>([]);
  const turno = useRef(0);
  const filtro = useRef<Vector3 | null>(null);
  const velocidad = useRef({ valor: Infinity, fecha: 0 });
  const ultimoHaptic = useRef(0);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  function parar() {
    turno.current++;
    sensores.current.forEach((s) => s.remove());
    sensores.current = [];
    if (temporizador.current) clearTimeout(temporizador.current);
    setActivo(false);
    setOcupado(false);
  }
  useEffect(() => {
    if (!focused) parar();
    const listener = AppState.addEventListener('change', (estado) => {
      if (estado === 'background') parar();
    });
    return () => {
      listener.remove();
      parar();
    };
  }, [focused]);
  async function iniciar() {
    if (ocupado || activo) return;
    if (Platform.OS === 'web') {
      setError('Abrí esta herramienta desde Expo Go en tu celular para usar sensores reales.');
      return;
    }
    const actual = ++turno.current;
    setOcupado(true);
    setError('');
    setLectura(null);
    filtro.current = null;
    velocidad.current = { valor: Infinity, fecha: 0 };
    try {
      if (!(await Accelerometer.isAvailableAsync()))
        throw new Error('Este dispositivo no informa un acelerómetro disponible.');
      if (!(await Accelerometer.requestPermissionsAsync()).granted)
        throw new Error('Habilitá el permiso de movimiento para usar el nivel.');
      let tieneGyro = await Gyroscope.isAvailableAsync();
      if (tieneGyro) tieneGyro = (await Gyroscope.requestPermissionsAsync()).granted;
      if (actual !== turno.current) return;
      setGyro(tieneGyro);
      Accelerometer.setUpdateInterval(100);
      if (tieneGyro) {
        Gyroscope.setUpdateInterval(100);
        sensores.current.push(
          Gyroscope.addListener((v) => {
            velocidad.current = { valor: Math.hypot(v.x, v.y, v.z), fecha: Date.now() };
          }),
        );
      }
      sensores.current.push(
        Accelerometer.addListener((v) => {
          if (temporizador.current) {
            clearTimeout(temporizador.current);
            temporizador.current = null;
          }
          filtro.current = suavizar(filtro.current, v);
          const angulo = inclinacion(filtro.current);
          const estable =
            Math.abs(Math.hypot(v.x, v.y, v.z) - 1) < 0.08 &&
            (!tieneGyro || (Date.now() - velocidad.current.fecha < 1000 && velocidad.current.valor < 0.12));
          setLectura({ ...angulo, estable });
        }),
      );
      setActivo(true);
      temporizador.current = setTimeout(() => {
        parar();
        setError('El teléfono no entregó lecturas. Revisá el permiso de movimiento e intentá otra vez.');
      }, 5000);
    } catch (e) {
      if (actual === turno.current) {
        parar();
        setError(e instanceof Error ? e.message : 'No pudimos iniciar los sensores.');
      }
    } finally {
      if (actual === turno.current) setOcupado(false);
    }
  }
  const lateral = (lectura?.lateral ?? 0) - referencia.lateral;
  const frontal = (lectura?.frontal ?? 0) - referencia.frontal;
  const nivelado = activo && !!lectura?.estable && estaNivelado(lateral, frontal);
  useEffect(() => {
    if (nivelado && Date.now() - ultimoHaptic.current > 3000) {
      ultimoHaptic.current = Date.now();
      feedback(true);
    }
  }, [nivelado]);
  return {
    activo,
    ocupado,
    error,
    gyro,
    lectura,
    lateral,
    frontal,
    nivelado,
    iniciar,
    parar,
    referencia,
    calibrar: () => {
      if (lectura?.estable) setReferencia({ lateral: lectura.lateral, frontal: lectura.frontal });
    },
    restablecer: () => setReferencia({ lateral: 0, frontal: 0 }),
  };
}
