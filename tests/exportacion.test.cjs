const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    filename,
  );
const archivos = new Map();
const platform = { OS: 'ios' };
let cancelar = false;
let compartirDisponible = true;
let mailDisponible = true;
let falloEscritura = false;
let compartido;
let correo;
let html;
let opcionesImpresion;
let logoProtegido = null;
let contador = 0;
let estadoCorreo = 'cancelled';
class File {
  constructor(...partes) {
    const [primero, ...resto] = partes.map((p) => (typeof p === 'string' ? p : p.uri));
    this.uri = [primero.replace(/\/+$/, ''), ...resto.map((p) => p.replace(/^\/+|\/+$/g, ''))].join('/');
  }
  get name() {
    return this.uri.split('/').pop();
  }
  get exists() {
    return archivos.has(this.uri);
  }
  delete() {
    archivos.delete(this.uri);
  }
  async move(destino) {
    archivos.set(destino.uri, archivos.get(this.uri));
    archivos.delete(this.uri);
    this.uri = destino.uri;
  }
  async bytes() {
    return archivos.get(this.uri);
  }
  write(bytes) {
    if (falloEscritura) throw new Error('Sin espacio');
    archivos.set(this.uri, bytes);
  }
}
class Directory {
  constructor(...partes) {
    this.uri = new File(...partes).uri;
  }
  create() {}
  list() {
    return [...archivos.keys()].filter((k) => k.startsWith(this.uri + '/')).map((k) => new File(k));
  }
  createFile(nombre) {
    const file = new File(this, nombre);
    archivos.set(file.uri, Buffer.alloc(0));
    return file;
  }
  static async pickDirectoryAsync() {
    if (cancelar)
      throw Object.assign(new Error('File picking was cancelled'), { code: 'ERR_FILE_PICKING_CANCELLED' });
    return new Directory('content://elegida');
  }
}
const original = Module._load;
Module._load = function (id, parent, main) {
  if (id === 'react-native') return { Platform: platform };
  if (id === 'expo-file-system') return { File, Directory, Paths: { cache: { uri: 'file:///cache/' } } };
  if (id === './fotos' && parent.filename.endsWith('presupuestos.ts'))
    return { abrirFoto: async () => logoProtegido };
  if (id === 'expo-print')
    return {
      printToFileAsync: async (opciones) => {
        html = opciones.html;
        opcionesImpresion = opciones;
        const uri = `file:///cache/print-${++contador}.pdf`;
        archivos.set(uri, Buffer.from('%PDF-prueba'));
        return { uri };
      },
    };
  if (id === 'expo-sharing')
    return {
      isAvailableAsync: async () => compartirDisponible,
      shareAsync: async (uri, opciones) => {
        assert(archivos.has(uri));
        compartido = { uri, opciones };
      },
    };
  if (id === 'expo-mail-composer')
    return {
      isAvailableAsync: async () => mailDisponible,
      MailComposerStatus: { SENT: 'sent', SAVED: 'saved', CANCELLED: 'cancelled' },
      composeAsync: async (opciones) => {
        correo = opciones;
        assert(archivos.has(opciones.attachments[0]));
        return { status: estadoCorreo };
      },
    };
  return original.call(this, id, parent, main);
};
const { exportarPresupuesto } = require('../src/services/presupuestos.ts');
const p = {
  numero: 'P-TEST',
  cliente: 'Cliente prueba',
  fecha: '2026-10-22T12:00:00Z',
  validez: 7,
  descuento: 0,
  notas: '',
  lineas: [
    { productoId: '1', sku: 'ABC', nombre: 'Producto', costo: 100, recargo: 30, precio: 130, cantidad: 1 },
  ],
};
const marca = { nombre: 'Mi negocio', contacto: '', direccion: '', pie: '', logo: null };
const exportar = (accion) => exportarPresupuesto(p, 'perfil-prueba', 'Nombre', marca, accion);
test('PDF: copia persistente en carpeta elegida y limpieza del temporal', async () => {
  const mensaje = await exportar('guardar');
  assert.match(mensaje, /PDF guardado/);
  const guardado = [...archivos.keys()].find((k) => k.startsWith('content://elegida/'));
  assert.deepEqual(archivos.get(guardado), Buffer.from('%PDF-prueba'));
  assert(![...archivos.keys()].some((k) => k.includes('/cache/')));
  assert(html.includes('P-TEST'));
  assert.deepEqual(opcionesImpresion.margins, { top: 36, right: 36, bottom: 36, left: 36 });
  assert.equal(opcionesImpresion.width, 595);
  assert.equal(opcionesImpresion.height, 842);
});
test('PDF: incorpora marca y logo guardados y no exporta silenciosamente un logo inaccesible', async () => {
  const configurada = {
    ...marca,
    logo: 'nexa-foto:perfil-prueba:imagen',
    contacto: 'Contacto de prueba',
    direccion: 'Dirección de prueba',
    pie: 'Pie de marca',
  };
  const antes = contador;
  await assert.rejects(
    exportarPresupuesto(p, 'perfil-prueba', 'Nombre', configurada, 'guardar'),
    /logo guardado/,
  );
  assert.equal(contador, antes);
  logoProtegido = 'data:image/jpeg;base64,aW1hZ2Vu';
  await exportarPresupuesto(p, 'perfil-prueba', 'Nombre', configurada, 'guardar');
  assert(html.includes(logoProtegido));
  for (const texto of [
    'Mi negocio',
    'Contacto de prueba',
    'Dirección de prueba',
    'Pie de marca',
    'CLIENTE',
    'EMISOR',
  ])
    assert(html.includes(texto));
  logoProtegido = null;
});
test('PDF: cancelar carpeta no genera archivo ni afirma guardado', async () => {
  cancelar = true;
  const antes = contador;
  assert.match(await exportar('guardar'), /cancelado/);
  assert.equal(contador, antes);
  cancelar = false;
});
test('PDF: escritura fallida elimina únicamente la nueva copia parcial', async () => {
  const antes = [...archivos.keys()].filter((k) => k.startsWith('content:'));
  falloEscritura = true;
  await assert.rejects(exportar('guardar'), /Sin espacio/);
  assert.deepEqual(
    [...archivos.keys()].filter((k) => k.startsWith('content:')),
    antes,
  );
  falloEscritura = false;
});
test('PDF: adjunto real, MIME y nombre reconocibles, sin afirmar envío de WhatsApp', async () => {
  const mensaje = await exportar('compartir');
  assert.match(mensaje, /no confirma el envío/);
  assert.match(compartido.uri, /Presupuesto-P-TEST\.pdf$/);
  assert.equal(compartido.opciones.mimeType, 'application/pdf');
  assert(archivos.has(compartido.uri));
});
test('PDF: correo cancelado iOS y resultado Android sin confirmación de envío', async () => {
  platform.OS = 'ios';
  estadoCorreo = 'cancelled';
  assert.match(await exportar('correo'), /cancelado/);
  assert.equal(correo.subject, 'Presupuesto P-TEST · Mi negocio');
  assert(!('recipients' in correo));
  assert(!archivos.has(correo.attachments[0]));
  platform.OS = 'android';
  estadoCorreo = 'sent';
  assert.match(await exportar('correo'), /no puede comprobar/);
  assert(archivos.has(correo.attachments[0]));
});
test('PDF: correo no configurado, menú ausente y web no generan PDFs', async () => {
  platform.OS = 'ios';
  const antes = contador;
  mailDisponible = false;
  await assert.rejects(exportar('correo'), /Configurá/);
  mailDisponible = true;
  compartirDisponible = false;
  await assert.rejects(exportar('compartir'), /No está disponible/);
  compartirDisponible = true;
  platform.OS = 'web';
  await assert.rejects(exportar('guardar'), /teléfono/);
  assert.equal(contador, antes);
});
