import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AESEncryptionKey, AESKeySize, AESSealedData, aesEncryptAsync, aesDecryptAsync } from 'expo-crypto';
import { utf8ToBytes } from '@noble/hashes/utils.js';
import { Platform } from 'react-native';

const CLAVE_DISPOSITIVO = 'nexa.device-key.v1';
const OPCIONES = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
let creando: Promise<void> | null = null;
const ruta = (ambito: string) => `@nexa/seguro-v1/${ambito}`;

async function clave(crear: boolean) {
  if (Platform.OS === 'web')
    throw new Error('El almacenamiento protegido está disponible en la app del celular.');
  let guardada = await SecureStore.getItemAsync(CLAVE_DISPOSITIVO, OPCIONES);
  if (!guardada && crear) {
    if (!creando)
      creando = (async () => {
        // Volver a consultar dentro de la exclusión evita generar dos claves a la vez.
        if (await SecureStore.getItemAsync(CLAVE_DISPOSITIVO, OPCIONES)) return;
        const claves = await AsyncStorage.getAllKeys();
        if (claves.some((k) => k.startsWith('@nexa/seguro-v1/')))
          throw new Error(
            'Falta la clave del dispositivo. Conservamos tus datos; restaurá una copia en una instalación nueva.',
          );
        const nueva = await AESEncryptionKey.generate(AESKeySize.AES256);
        await SecureStore.setItemAsync(CLAVE_DISPOSITIVO, await nueva.encoded('base64'), OPCIONES);
      })().finally(() => {
        creando = null;
      });
    await creando;
    guardada = await SecureStore.getItemAsync(CLAVE_DISPOSITIVO, OPCIONES);
  }
  if (!guardada)
    throw new Error('No se encontró la clave del dispositivo. Los datos originales se conservaron.');
  return AESEncryptionKey.import(guardada, 'base64');
}

/** AES-GCM autentica contenido y ámbito: copiar un archivo a otro usuario falla. */
export async function leerProtegido(ambito: string): Promise<unknown | null> {
  const json = await AsyncStorage.getItem(ruta(ambito));
  if (!json) return null;
  const sobre: unknown = JSON.parse(json);
  if (
    !sobre ||
    typeof sobre !== 'object' ||
    !('v' in sobre) ||
    sobre.v !== 1 ||
    !('datos' in sobre) ||
    typeof sobre.datos !== 'string'
  )
    throw new Error('El archivo protegido no es válido.');
  const sellado = AESSealedData.fromCombined(sobre.datos, { ivLength: 12, tagLength: 16 });
  const abierto = await aesDecryptAsync(sellado, await clave(false), {
    additionalData: utf8ToBytes(`nexa:v1:${ambito}`),
  });
  return JSON.parse(new TextDecoder().decode(abierto));
}

export async function guardarProtegido(ambito: string, valor: unknown): Promise<void> {
  // Si ya existe contenido, perder la clave nunca debe generar otra y sobrescribirlo.
  const existente = await AsyncStorage.getItem(ruta(ambito));
  const key = await clave(!existente);
  const sellado = await aesEncryptAsync(utf8ToBytes(JSON.stringify(valor)), key, {
    nonce: { length: 12 },
    tagLength: 16,
    additionalData: utf8ToBytes(`nexa:v1:${ambito}`),
  });
  await AsyncStorage.setItem(ruta(ambito), JSON.stringify({ v: 1, datos: await sellado.combined('base64') }));
}

/** El dato antiguo se retira solo después de escribir y verificar el cifrado. */
export async function migrarProtegido(ambito: string, valor: unknown, claveAnterior: string) {
  await guardarProtegido(ambito, valor);
  const verificado = await leerProtegido(ambito);
  if (JSON.stringify(verificado) !== JSON.stringify(valor))
    throw new Error('No se pudo verificar la migración.');
  await AsyncStorage.removeItem(claveAnterior);
}
