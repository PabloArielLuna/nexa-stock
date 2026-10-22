import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatosGuardados } from '../types/models';
import { guardarProtegido, leerProtegido, migrarProtegido } from './boveda';
import { protegerFoto, limpiarTemporal } from './fotos';
import { validarDatos } from '../domain/inventario/esquema';
import { negocioValido, negocioVacio } from '../domain/inventario/negocio';
export { validarDatos } from '../domain/inventario/esquema';

const clave = (perfilId: string) => `@nexa/${perfilId}/inventario-v1`;
async function incorporarNegocioAnterior(datos: DatosGuardados, perfilId: string): Promise<DatosGuardados> {
  if (datos.negocio) return datos;
  const [marca, borrador] = await Promise.all([
    leerProtegido(`marca-${perfilId}`),
    leerProtegido(`presupuesto-borrador-${perfilId}`),
  ]);
  if (marca === null && borrador === null) return datos;
  const negocio = { ...negocioVacio(), ...(marca !== null ? { marca } : {}), borrador };
  if (!negocioValido(negocio))
    throw new Error('No pudimos migrar la marca o el presupuesto anterior. Conservamos tus datos.');
  const nuevos = { ...datos, negocio };
  await guardarProtegido(`inventario-${perfilId}`, nuevos);
  const verificado = await leerProtegido(`inventario-${perfilId}`);
  if (JSON.stringify(verificado) !== JSON.stringify(nuevos))
    throw new Error('No se pudo verificar la migración del negocio.');
  // Los registros antiguos cifrados se conservan como resguardo; dejan de ser la fuente activa.
  return nuevos;
}
export async function cargarDatos(
  perfilId: string,
  importarAnterior = false,
): Promise<DatosGuardados | null> {
  const protegido = await leerProtegido(`inventario-${perfilId}`);
  if (protegido !== null) {
    if (!validarDatos(protegido)) throw new Error('El inventario protegido no tiene un formato válido.');
    await AsyncStorage.removeItem(clave(perfilId));
    if (importarAnterior) await AsyncStorage.removeItem('@gadgetstock/datos-v1');
    return incorporarNegocioAnterior(protegido, perfilId);
  }
  let anterior = clave(perfilId);
  let json = await AsyncStorage.getItem(anterior);
  if (!json && importarAnterior) {
    anterior = '@gadgetstock/datos-v1';
    json = await AsyncStorage.getItem(anterior);
  }
  if (!json) {
    const vacio: DatosGuardados = { productos: [], ventas: [] };
    const migrado = await incorporarNegocioAnterior(vacio, perfilId);
    return migrado === vacio ? null : migrado;
  }
  const datos: unknown = JSON.parse(json);
  if (!validarDatos(datos)) throw new Error('Los datos guardados no tienen un formato válido.');
  const fotosAnteriores: string[] = [];
  for (const p of datos.productos) {
    if (p.fotoUri && !p.fotoUri.startsWith('nexa-foto:')) {
      try {
        const original = p.fotoUri;
        p.fotoUri = await protegerFoto(original, perfilId, false);
        fotosAnteriores.push(original);
      } catch {
        throw new Error(
          'No pudimos proteger una foto anterior. Conservamos los datos para que puedas recuperarlos.',
        );
      }
    }
  }
  await migrarProtegido(`inventario-${perfilId}`, datos, anterior);
  fotosAnteriores.forEach(limpiarTemporal);
  return incorporarNegocioAnterior(datos, perfilId);
}

/** Cola de escrituras: una operación antigua nunca puede pisar una más nueva. */
let pendiente: Promise<void> = Promise.resolve();
export function guardarDatos(datos: DatosGuardados, perfilId: string): Promise<void> {
  if (!validarDatos(datos))
    return Promise.reject(
      new Error('El inventario no pasó la validación. No se reemplazaron los datos guardados.'),
    );
  const copia = JSON.parse(JSON.stringify(datos));
  const escritura = pendiente
    .catch(() => undefined)
    .then(() => guardarProtegido(`inventario-${perfilId}`, copia));
  pendiente = escritura;
  return escritura;
}
