import {
  AESEncryptionKey,
  AESSealedData,
  aesEncryptAsync,
  aesDecryptAsync,
  getRandomBytesAsync,
} from './cifrado';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js';
import { CopiaInventario, copiaValida, esRegistro, MAX_RESPALDO } from '../domain/inventario/respaldo';

const ITERACIONES = 210_000;
const contexto = utf8ToBytes('nexa:respaldo-inventario:v1');
export const claveCopiaValida = (s: string) => s.length >= 12 && s.length <= 128;
async function derivar(clave: string, salt: string) {
  if (!claveCopiaValida(clave)) throw new Error('Usá una contraseña de 12 a 128 caracteres para la copia.');
  const bytes = await pbkdf2Async(sha256, clave, salt, { c: ITERACIONES, dkLen: 32 });
  try {
    return await AESEncryptionKey.import(bytes);
  } finally {
    bytes.fill(0);
  }
}
/** La contraseña de la copia es independiente del PIN y no se guarda. */
export async function cifrarCopia(copia: CopiaInventario, clave: string): Promise<string> {
  if (!copiaValida(copia)) throw new Error('La copia del inventario no es válida.');
  const contenido = JSON.stringify(copia);
  if (contenido.length > MAX_RESPALDO * 0.7)
    throw new Error('La copia supera el tamaño admitido (30 MB cifrados).');
  const salt = bytesToHex(await getRandomBytesAsync(24));
  const sellado = await aesEncryptAsync(utf8ToBytes(contenido), await derivar(clave, salt), {
    nonce: { length: 12 },
    tagLength: 16,
    additionalData: contexto,
  });
  const archivo = JSON.stringify({
    formato: 'NEXA-CIFRADO',
    version: 1,
    kdf: 'PBKDF2-SHA256',
    iteraciones: ITERACIONES,
    salt,
    contenido: await sellado.combined('base64'),
  });
  if (archivo.length > MAX_RESPALDO) throw new Error('La copia supera los 30 MB.');
  return archivo;
}
export async function descifrarCopia(texto: string, clave: string): Promise<CopiaInventario> {
  if (texto.length > MAX_RESPALDO) throw new Error('La copia supera los 30 MB.');
  let sobre: unknown;
  try {
    sobre = JSON.parse(texto);
  } catch {
    throw new Error('Este archivo no es una copia de NEXA.');
  }
  if (
    !esRegistro(sobre) ||
    sobre.formato !== 'NEXA-CIFRADO' ||
    sobre.version !== 1 ||
    sobre.kdf !== 'PBKDF2-SHA256' ||
    sobre.iteraciones !== ITERACIONES ||
    typeof sobre.salt !== 'string' ||
    !/^[a-f0-9]{48}$/.test(sobre.salt) ||
    typeof sobre.contenido !== 'string' ||
    sobre.contenido.length < 40 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(sobre.contenido)
  )
    throw new Error('Formato de copia no compatible.');
  const key = await derivar(clave, sobre.salt);
  let copia: unknown;
  try {
    const abierto = await aesDecryptAsync(
      AESSealedData.fromCombined(sobre.contenido, { ivLength: 12, tagLength: 16 }),
      key,
      { additionalData: contexto },
    );
    try {
      copia = JSON.parse(new TextDecoder().decode(abierto));
    } finally {
      abierto.fill(0);
    }
  } catch {
    throw new Error('Contraseña incorrecta o copia dañada. El inventario no se modificó.');
  }
  if (!copiaValida(copia))
    throw new Error('La copia contiene datos inválidos. El inventario no se modificó.');
  return copia;
}
