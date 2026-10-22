export type CalendarioDestino = { id: string; titulo: string };
export type ResultadoSeguimiento = 'guardado' | 'cancelado' | 'sin-confirmacion';

/** Solo viaja la referencia de la propuesta; nunca el cliente ni los importes. */
export function prepararSeguimiento(numero: string, ahora = new Date()) {
  if (!/^[A-Z0-9-]{3,80}$/i.test(numero) || !Number.isFinite(ahora.getTime()))
    throw new Error('La referencia del presupuesto no es válida.');
  const inicio = new Date(ahora);
  inicio.setDate(inicio.getDate() + 1);
  inicio.setHours(10, 0, 0, 0);
  return {
    title: `NEXA · Seguimiento ${numero}`,
    notes: `Revisar la propuesta ${numero} en NEXA. Los datos del cliente están dentro de la app.`,
    startDate: inicio,
    endDate: new Date(inicio.getTime() + 30 * 60_000),
    allDay: false,
    alarms: [{ relativeOffset: 0 }],
    startNewActivityTask: false,
  };
}
