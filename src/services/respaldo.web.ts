import { DatosGuardados } from '../types/models';
import { MAX_RESPALDO } from '../domain/inventario/respaldo';
import { crearCopiaInventario } from './respaldoDatos';
import { cifrarCopia } from './respaldoCripto';
export async function compartirCopia(datos: DatosGuardados, perfilId: string, clave: string) {
  const texto = await cifrarCopia(await crearCopiaInventario(datos, perfilId), clave);
  const url = URL.createObjectURL(new Blob([texto], { type: 'application/octet-stream' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `NEXA-${Date.now()}.nexa`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
export async function elegirCopia(): Promise<string | null> {
  const archivo = await new Promise<File | null>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.nexa';
    input.style.display = 'none';
    const terminar = (f: File | null) => {
      input.remove();
      resolve(f);
    };
    input.onchange = () => terminar(input.files?.[0] ?? null);
    input.oncancel = () => terminar(null);
    document.body.appendChild(input);
    input.click();
  });
  if (!archivo) return null;
  if (archivo.size > MAX_RESPALDO) throw new Error('La copia supera los 30 MB.');
  const texto = await archivo.text();
  if (texto.length > MAX_RESPALDO) throw new Error('La copia supera los 30 MB.');
  return texto;
}
