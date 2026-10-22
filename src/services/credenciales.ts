import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import * as Crypto from 'expo-crypto';

export type Credencial = { salt: string; hash: string };
export function credencialValida(valor: unknown): valor is Credencial {
  return (
    !!valor &&
    typeof valor === 'object' &&
    'salt' in valor &&
    'hash' in valor &&
    typeof valor.salt === 'string' &&
    /^[a-f0-9]{48}$/.test(valor.salt) &&
    typeof valor.hash === 'string' &&
    /^[a-f0-9]{64}$/.test(valor.hash)
  );
}
export const pinValido = (pin: string) => /^\d{6}$/.test(pin);
async function derivar(pin: string, salt: string) {
  return bytesToHex(await pbkdf2Async(sha256, pin, salt, { c: 100_000, dkLen: 32 }));
}
/** Nunca se persiste el PIN en texto plano. Este acceso es local, sin servidor. */
export async function crearCredencial(pin: string): Promise<Credencial> {
  if (!pinValido(pin)) throw new Error('Usá un PIN de 6 dígitos.');
  const salt = bytesToHex(await Crypto.getRandomBytesAsync(24));
  return { salt, hash: await derivar(pin, salt) };
}
export async function verificarPin(pin: string, credencial: Credencial): Promise<boolean> {
  if (!pinValido(pin) || !credencialValida(credencial)) return false;
  const hash = await derivar(pin, credencial.salt);
  let diferencia = hash.length ^ credencial.hash.length;
  for (let i = 0; i < hash.length; i++) diferencia |= hash.charCodeAt(i) ^ credencial.hash.charCodeAt(i);
  return diferencia === 0;
}
