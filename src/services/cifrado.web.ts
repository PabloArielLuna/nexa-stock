const b64 = (bytes: Uint8Array) => {
  let s = '';
  for (const n of bytes) s += String.fromCharCode(n);
  return btoa(s);
};
const desde64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export class AESEncryptionKey {
  constructor(readonly key: CryptoKey) {}
  static async import(bytes: Uint8Array) {
    return new AESEncryptionKey(
      await crypto.subtle.importKey('raw', bytes as Uint8Array<ArrayBuffer>, 'AES-GCM', false, [
        'encrypt',
        'decrypt',
      ]),
    );
  }
}
export class AESSealedData {
  constructor(readonly bytes: Uint8Array) {}
  static fromCombined(s: string, _opciones: { ivLength: number; tagLength: number }) {
    return new AESSealedData(desde64(s));
  }
  async combined(_encoding: 'base64') {
    return b64(this.bytes);
  }
}
export async function getRandomBytesAsync(n: number) {
  return crypto.getRandomValues(new Uint8Array(n));
}
export async function aesEncryptAsync(
  bytes: Uint8Array,
  clave: AESEncryptionKey,
  opciones: { nonce: { length: number }; tagLength: number; additionalData: Uint8Array },
) {
  const iv = await getRandomBytesAsync(12);
  const cifrado = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
      additionalData: opciones.additionalData as Uint8Array<ArrayBuffer>,
    },
    clave.key,
    bytes as Uint8Array<ArrayBuffer>,
  );
  const combinado = new Uint8Array(12 + cifrado.byteLength);
  combinado.set(iv);
  combinado.set(new Uint8Array(cifrado), 12);
  return new AESSealedData(combinado);
}
export async function aesDecryptAsync(
  sobre: AESSealedData,
  clave: AESEncryptionKey,
  opciones: { additionalData: Uint8Array },
) {
  return new Uint8Array(
    await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: sobre.bytes.slice(0, 12),
        tagLength: 128,
        additionalData: opciones.additionalData as Uint8Array<ArrayBuffer>,
      },
      clave.key,
      sobre.bytes.slice(12),
    ),
  );
}
