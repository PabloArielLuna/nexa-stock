import { CalendarioDestino, ResultadoSeguimiento } from '../domain/seguimiento';
export const limitacionCalendario: string | null =
  'El calendario está disponible en una compilación propia de NEXA para iPhone o Android.';
export async function listarCalendarios(): Promise<CalendarioDestino[]> {
  throw new Error(limitacionCalendario!);
}
export async function agendarSeguimiento(_numero: string, _destino: string): Promise<ResultadoSeguimiento> {
  throw new Error(limitacionCalendario!);
}
