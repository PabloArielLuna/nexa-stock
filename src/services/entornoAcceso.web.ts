export const limitacionAcceso: string | null =
  typeof window === 'undefined' ||
  !window.isSecureContext ||
  !globalThis.crypto?.subtle ||
  !globalThis.indexedDB
    ? 'Para ingresar o crear una cuenta, abrí NEXA en HTTPS o localhost en un navegador actualizado.'
    : null;
