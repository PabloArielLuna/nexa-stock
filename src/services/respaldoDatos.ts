import { DatosGuardados } from '../types/models';
import { CopiaInventario, copiaValida } from '../domain/inventario/respaldo';
import { abrirFoto } from './fotos';
import { guardarProtegido } from './boveda';
import { generarId } from '../utils/formato';
import { negocioVacio } from '../domain/inventario/negocio';
export async function crearCopiaInventario(
  datos: DatosGuardados,
  perfilId: string,
): Promise<CopiaInventario> {
  const copia: CopiaInventario = {
    tipo: 'NEXA-INVENTARIO',
    version: 2,
    creadoEn: new Date().toISOString(),
    datos: JSON.parse(JSON.stringify({ ...datos, negocio: datos.negocio ?? negocioVacio() })),
    imagenes: [],
  };
  const referencias = new Set(copia.datos.productos.map((p) => p.fotoUri).filter((r): r is string => !!r));
  if (copia.datos.negocio?.marca.logo) referencias.add(copia.datos.negocio.marca.logo);
  for (const referencia of referencias) {
    const foto = await abrirFoto(referencia, perfilId);
    if (!foto) throw new Error('No pudimos abrir una foto. La copia no se exportó.');
    copia.imagenes.push({ referencia, contenido: foto.replace('data:image/jpeg;base64,', '') });
  }
  if (!copiaValida(copia)) throw new Error('No pudimos validar el inventario para la copia.');
  return copia;
}
/** Las imágenes se escriben primero; el contexto confirma el inventario en una sola escritura. */
export async function prepararRestauracion(
  copia: CopiaInventario,
  perfilId: string,
): Promise<DatosGuardados> {
  if (!copiaValida(copia)) throw new Error('Copia inválida.');
  const referencias = new Map<string, string>();
  for (const imagen of copia.imagenes) {
    const id = generarId();
    await guardarProtegido(`foto-${perfilId}-${id}`, { tipo: 'image/jpeg', contenido: imagen.contenido });
    referencias.set(imagen.referencia, `nexa-foto:${perfilId}:${id}`);
  }
  const datos: DatosGuardados = JSON.parse(JSON.stringify(copia.datos));
  if (datos.negocio?.marca.logo) datos.negocio.marca.logo = referencias.get(datos.negocio.marca.logo)!;
  return {
    ...datos,
    productos: datos.productos.map((p) => ({
      ...p,
      fotoUri: p.fotoUri ? referencias.get(p.fotoUri)! : null,
    })),
  };
}
