import AsyncStorage from '@react-native-async-storage/async-storage';
import { limitacionAcceso } from './entornoAcceso';
type Clave = { id: string; key: CryptoKey };
type Sobre = { v: 1; clave: string; iv: Uint8Array; datos: ArrayBuffer };
const perdida =
  'Falta la clave de este navegador. Conservamos los datos; recuperá una copia en otra instalación.';

async function abrir(): Promise<IDBDatabase> {
  if (limitacionAcceso) throw new Error(limitacionAcceso);
  return new Promise((resolve, reject) => {
    let bloqueada = false;
    const r = indexedDB.open('nexa-web-v1', 1);
    r.onupgradeneeded = () => {
      r.result.createObjectStore('claves');
      r.result.createObjectStore('registros');
    };
    r.onsuccess = () => {
      if (bloqueada) r.result.close();
      else resolve(r.result);
    };
    r.onerror = () =>
      reject(new Error('No se pudo abrir el almacenamiento del navegador. Permití los datos de este sitio.'));
    r.onblocked = () => {
      bloqueada = true;
      reject(new Error('Cerrá las otras pestañas de NEXA y volvé a intentar.'));
    };
  });
}
async function transaccion<T>(
  stores: string[],
  mode: IDBTransactionMode,
  accion: (tx: IDBTransaction) => () => T,
): Promise<T> {
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode);
    let resultado: () => T;
    tx.oncomplete = () => {
      db.close();
      resolve(resultado());
    };
    tx.onabort = tx.onerror = () => {
      db.close();
      reject(new Error('No se pudo guardar o leer en este navegador. Tus datos anteriores se conservaron.'));
    };
    try {
      resultado = accion(tx);
    } catch (e) {
      tx.abort();
      db.close();
      reject(e);
    }
  });
}
async function leerRegistro(ambito: string): Promise<Sobre | null> {
  return transaccion(['registros'], 'readonly', (tx) => {
    const r = tx.objectStore('registros').get(ambito);
    return () => r.result ?? null;
  });
}
async function clave(crear: boolean): Promise<Clave> {
  const candidata = crear
    ? {
        id: Array.from(crypto.getRandomValues(new Uint8Array(16)), (n) =>
          n.toString(16).padStart(2, '0'),
        ).join(''),
        key: await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']),
      }
    : null;
  const resultado = await transaccion<Clave | null>(['claves', 'registros'], 'readwrite', (tx) => {
    let salida: Clave | null = null;
    const keys = tx.objectStore('claves');
    const r = keys.get('dispositivo');
    r.onsuccess = () => {
      if (r.result) {
        salida = r.result;
        return;
      }
      const count = tx.objectStore('registros').count();
      count.onsuccess = () => {
        if (count.result === 0 && candidata) {
          keys.put(candidata, 'dispositivo');
          salida = candidata;
        }
      };
    };
    return () => salida;
  });
  if (
    !resultado ||
    typeof resultado.id !== 'string' ||
    !resultado.key ||
    resultado.key.extractable ||
    resultado.key.algorithm.name !== 'AES-GCM'
  )
    throw new Error(perdida);
  return resultado;
}
export async function leerProtegido(ambito: string): Promise<unknown | null> {
  const sobre = await leerRegistro(ambito);
  if (!sobre) return null;
  if (
    sobre.v !== 1 ||
    !(sobre.iv instanceof Uint8Array) ||
    sobre.iv.length !== 12 ||
    !(sobre.datos instanceof ArrayBuffer)
  )
    throw new Error('El archivo protegido del navegador no es válido.');
  const key = await clave(false);
  if (key.id !== sobre.clave) throw new Error(perdida);
  try {
    const abierto = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: sobre.iv as Uint8Array<ArrayBuffer>,
        additionalData: new TextEncoder().encode(`nexa:web:v1:${ambito}`),
        tagLength: 128,
      },
      key.key,
      sobre.datos,
    );
    return JSON.parse(new TextDecoder().decode(abierto));
  } catch {
    throw new Error('No pudimos abrir los datos protegidos. No se reemplazaron.');
  }
}
export async function guardarProtegido(ambito: string, valor: unknown): Promise<void> {
  const key = await clave(!(await leerRegistro(ambito)));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const datos = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: new TextEncoder().encode(`nexa:web:v1:${ambito}`),
      tagLength: 128,
    },
    key.key,
    new TextEncoder().encode(JSON.stringify(valor)),
  );
  let vigente = false;
  await transaccion(['claves', 'registros'], 'readwrite', (tx) => {
    const r = tx.objectStore('claves').get('dispositivo');
    r.onsuccess = () => {
      if (r.result?.id === key.id) {
        tx.objectStore('registros').put({ v: 1, clave: key.id, iv, datos } satisfies Sobre, ambito);
        vigente = true;
      }
    };
    return () => undefined;
  });
  if (!vigente) throw new Error(perdida);
}
export async function migrarProtegido(ambito: string, valor: unknown, anterior: string) {
  await guardarProtegido(ambito, valor);
  if (JSON.stringify(await leerProtegido(ambito)) !== JSON.stringify(valor))
    throw new Error('No se pudo verificar la migración.');
  await AsyncStorage.removeItem(anterior);
}
