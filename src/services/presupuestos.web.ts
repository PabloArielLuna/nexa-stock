import { Presupuesto, htmlPresupuesto, presupuestoValido } from '../utils/presupuestos';
import { MarcaNegocio } from '../types/negocio';
import { abrirFoto } from './fotos';
export type AccionPDF = 'guardar' | 'compartir' | 'correo';
export async function exportarPresupuesto(
  p: Presupuesto,
  perfilId: string,
  nombre: string,
  marca: MarcaNegocio,
  accion: AccionPDF,
) {
  if (accion !== 'guardar') throw new Error('Guardá el PDF desde Imprimir y compartilo desde tu equipo.');
  if (!presupuestoValido(p)) throw new Error('Revisá los datos del presupuesto.');
  const ventana = window.open('', '_blank');
  if (!ventana) throw new Error('Permití ventanas emergentes para imprimir el presupuesto.');
  ventana.opener = null;
  try {
    const logo = marca.logo ? await abrirFoto(marca.logo, perfilId) : null;
    if (marca.logo && !logo) throw new Error('No pudimos abrir el logo guardado.');
    ventana.document.write(htmlPresupuesto(p, { ...marca, nombre: marca.nombre || nombre }, logo));
    ventana.document.close();
    await Promise.all(Array.from(ventana.document.images).map((i) => i.decode().catch(() => undefined)));
    if (!ventana.closed) {
      ventana.focus();
      ventana.print();
    }
    return 'En el diálogo de impresión elegí Guardar como PDF. El archivo no se guarda si cancelás.';
  } catch (e) {
    ventana.close();
    throw e;
  }
}
