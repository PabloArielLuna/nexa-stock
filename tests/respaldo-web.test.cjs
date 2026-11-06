const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const crypto = require('node:crypto');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    filename,
  );
const original = Module._load;
Module._load = function (id, parent, main) {
  if (id === './cifrado' && parent.filename.endsWith('respaldoCripto.ts'))
    return original.call(this, './cifrado.web.ts', parent, main);
  return original.call(this, id, parent, main);
};
const { cifrarCopia, descifrarCopia } = require('../src/services/respaldoCripto.ts');
const { negocioVacio } = require('../src/domain/inventario/negocio.ts');
const copia = {
  tipo: 'NEXA-INVENTARIO',
  version: 2,
  creadoEn: '2026-11-05T12:00:00Z',
  datos: { productos: [], ventas: [], movimientos: [], negocio: negocioVacio() },
  imagenes: [],
};
const clave = 'Contraseña-de-prueba-2026';
const aad = Buffer.from('nexa:respaldo-inventario:v1');
const derivar = (salt) => crypto.pbkdf2Sync(clave, salt, 210000, 32, 'sha256');

test('Copia web: AES-GCM se abre con el formato IV + contenido + tag usado por Expo', async () => {
  const texto = await cifrarCopia(copia, clave);
  const sobre = JSON.parse(texto);
  const bytes = Buffer.from(sobre.contenido, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', derivar(sobre.salt), bytes.subarray(0, 12));
  d.setAAD(aad);
  d.setAuthTag(bytes.subarray(-16));
  const contenido = Buffer.concat([d.update(bytes.subarray(12, -16)), d.final()]);
  assert.deepEqual(JSON.parse(contenido.toString('utf8')), copia);
  assert.deepEqual(await descifrarCopia(texto, clave), copia);
});
test('Copia web: importa un archivo cifrado fuera de Web Crypto con el formato nativo', async () => {
  const salt = crypto.randomBytes(24).toString('hex');
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', derivar(salt), iv);
  c.setAAD(aad);
  const contenido = Buffer.concat([iv, c.update(JSON.stringify(copia)), c.final(), c.getAuthTag()]);
  const texto = JSON.stringify({
    formato: 'NEXA-CIFRADO',
    version: 1,
    kdf: 'PBKDF2-SHA256',
    iteraciones: 210000,
    salt,
    contenido: contenido.toString('base64'),
  });
  assert.deepEqual(await descifrarCopia(texto, clave), copia);
});
test('Copia web: rechaza contraseña incorrecta y modificación del contenido', async () => {
  const texto = await cifrarCopia(copia, clave);
  await assert.rejects(
    descifrarCopia(texto, 'Contraseña-incorrecta'),
    /Contraseña incorrecta o copia dañada/,
  );
  const sobre = JSON.parse(texto);
  const bytes = Buffer.from(sobre.contenido, 'base64');
  bytes[15] ^= 1;
  sobre.contenido = bytes.toString('base64');
  await assert.rejects(descifrarCopia(JSON.stringify(sobre), clave), /Contraseña incorrecta o copia dañada/);
});
