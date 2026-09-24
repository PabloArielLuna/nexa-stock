/**
 * Funciones puras de formato (Clase 12, utils/formato.ts).
 * No dependen de Intl para que se vean igual en cualquier teléfono.
 */

/** 12450 → "$ 12.450" */
export const formatoPrecio = (n: number): string => {
  const signo = n < 0 ? '-' : '';
  const entero = Math.round(Math.abs(n)).toString();
  const conPuntos = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${signo}$ ${conPuntos}`;
};

/** Date o ISO → "23/04/2026" */
export const formatoFecha = (fecha: Date | string): string => {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
};

/** Date o ISO → "23/04/2026 18:05" */
export const formatoFechaHora = (fecha: Date | string): string => {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${formatoFecha(d)} ${hora}:${min}`;
};

/** Deja sólo dígitos: sirve para los inputs de precio y cantidad. */
export const soloNumeros = (texto: string): string => texto.replace(/[^0-9]/g, '');

/** Genera un id único simple (alcanza para datos locales). */
export const generarId = (): string => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
