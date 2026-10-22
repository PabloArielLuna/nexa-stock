import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { CalendarioDestino, ResultadoSeguimiento, prepararSeguimiento } from '../domain/seguimiento';

export const limitacionCalendario: string | null =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ? 'Expo Go no incluye el calendario. Para agendar necesitás instalar una compilación propia de NEXA; no hace falta publicarla en una tienda.'
    : !requireOptionalNativeModule('CalendarNext')
      ? 'Esta instalación no incluye el calendario. Instalá una compilación nueva de NEXA.'
      : null;

function calendario() {
  if (limitacionCalendario) throw new Error(limitacionCalendario);
  // No se evalúa el módulo nativo ausente en Expo Go. Web resuelve calendario.ts.
  return require('expo-calendar') as typeof import('expo-calendar');
}

async function permiso() {
  const api = calendario();
  const soloEscritura = Platform.OS === 'ios';
  let estado = await api.getCalendarPermissions(soloEscritura);
  if (!estado.granted && estado.canAskAgain) estado = await api.requestCalendarPermissions(soloEscritura);
  if (!estado.granted)
    throw new Error('No hay permiso de calendario. Podés habilitarlo en Ajustes y volver a intentar.');
  return api;
}

async function destinosNativos() {
  const api = await permiso();
  // iOS 17+: acceso de escritura, sin enumerar calendarios reales ni leer eventos.
  const destinos =
    Platform.OS === 'ios'
      ? [api.getDefaultCalendarSync()]
      : (await api.getCalendars(api.EntityTypes.EVENT)).filter((c) => c.allowsModifications);
  if (!destinos.length)
    throw new Error('No hay calendarios editables. Configurá uno en el teléfono y volvé a intentar.');
  return destinos;
}

export async function listarCalendarios(): Promise<CalendarioDestino[]> {
  return (await destinosNativos()).map((c) => ({
    id: c.id,
    titulo: Platform.OS === 'ios' ? 'Continuar en Calendario' : c.title || 'Calendario sin nombre',
  }));
}

export async function agendarSeguimiento(numero: string, destinoId: string): Promise<ResultadoSeguimiento> {
  const evento = prepararSeguimiento(numero);
  const destino = (await destinosNativos()).find((c) => c.id === destinoId);
  if (!destino) throw new Error('El calendario elegido ya no está disponible. Volvé a seleccionarlo.');
  const resultado = await destino.addEventWithForm(evento);
  if (resultado.action === 'saved') return 'guardado';
  if (resultado.action === 'canceled' || resultado.action === 'deleted') return 'cancelado';
  // Android no informa si se guardó o se canceló: nunca afirmar un guardado inexistente.
  return 'sin-confirmacion';
}
