import { useRef, useState } from 'react';
import { usePerfil } from '../context/PerfilContext';
import { CalendarioDestino } from '../domain/seguimiento';
import { agendarSeguimiento, listarCalendarios, limitacionCalendario } from '../services/calendario';
import { avisar } from '../utils/dialogos';

export function useSeguimientoViewModel() {
  const { activo, invitado } = usePerfil();
  const [numero, setNumero] = useState<string | null>(null);
  const [destinos, setDestinos] = useState<CalendarioDestino[]>([]);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const enviando = useRef(false);
  async function ejecutar(operacion: () => Promise<void>) {
    if (enviando.current) return;
    enviando.current = true;
    setOcupado(true);
    setError('');
    try {
      if (!activo || invitado) throw new Error('Ingresá a tu perfil para agendar seguimientos.');
      await operacion();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos abrir el calendario.');
    } finally {
      enviando.current = false;
      setOcupado(false);
    }
  }
  return {
    numero,
    destinos,
    error,
    ocupado,
    limitacionCalendario,
    abrir: (n: string) => {
      if (!activo || invitado || enviando.current) return;
      setDestinos([]);
      setError('');
      setNumero(n);
    },
    cerrar: () => {
      if (!enviando.current) setNumero(null);
    },
    cargar: () =>
      ejecutar(async () => {
        setDestinos(await listarCalendarios());
      }),
    agendar: (id: string) =>
      ejecutar(async () => {
        if (!numero) return;
        const resultado = await agendarSeguimiento(numero, id);
        if (resultado === 'cancelado') return;
        setNumero(null);
        avisar(
          resultado === 'guardado' ? 'Seguimiento agendado' : 'Revisá tu calendario',
          resultado === 'guardado'
            ? 'El evento quedó en tu calendario. Podés editarlo o eliminarlo desde allí.'
            : 'El teléfono no confirma si guardaste el evento. Comprobalo en Calendario antes de volver a crearlo.',
        );
      }),
  };
}
