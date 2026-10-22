import { guardarProtegido, leerProtegido } from './boveda';
import { Credencial, verificarPin } from './credenciales';

type Limite = { cantidad: number; hasta: number };
export async function comprobarPin(id: string, pin: string, credencial: Credencial) {
  const valor = await leerProtegido(`intentos-${id}`);
  const limite = valor as Limite | null;
  if (
    limite &&
    (!Number.isSafeInteger(limite.cantidad) || limite.cantidad < 0 || !Number.isFinite(limite.hasta))
  )
    throw new Error('No pudimos verificar el acceso.');
  if (limite && limite.hasta > Date.now()) throw new Error('Esperá un minuto antes de volver a intentar.');
  const cantidad = (limite?.cantidad ?? 0) + 1;
  // Persistir antes del cálculo evita evadir el conteo cerrando el proceso.
  await guardarProtegido(`intentos-${id}`, {
    cantidad: cantidad >= 5 ? 0 : cantidad,
    hasta: cantidad >= 5 ? Date.now() + 60_000 : 0,
  });
  if (!(await verificarPin(pin, credencial))) throw new Error('El PIN no es correcto.');
  await guardarProtegido(`intentos-${id}`, { cantidad: 0, hasta: 0 });
}
