const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
// Transpila únicamente nuestros módulos para ejecutar reglas sin un emulador.
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    filename,
  );
};
const memoria = new Map();
const llavero = new Map();
const crypto = require('node:crypto');
class ClaveAES {
  constructor(bytes) {
    this.valor = Buffer.from(bytes);
  }
  static async generate() {
    return new ClaveAES(crypto.randomBytes(32));
  }
  static async import(texto, encoding) {
    return new ClaveAES(Buffer.from(texto, encoding));
  }
  async encoded(encoding) {
    return this.valor.toString(encoding);
  }
}
class Sellado {
  constructor(bytes) {
    this.valor = Buffer.from(bytes);
  }
  static fromCombined(texto) {
    return new Sellado(Buffer.from(texto, 'base64'));
  }
  async combined(encoding) {
    return this.valor.toString(encoding);
  }
}
let falla = false;
const originalLoad = Module._load;
Module._load = function (id, parent, main) {
  if (id === 'expo-file-system')
    return {
      Paths: { cache: { uri: 'file:///cache/' } },
      File: class {
        exists = true;
        delete() {}
      },
    };
  if (id === 'expo-image-manipulator')
    return {
      SaveFormat: { JPEG: 'jpeg' },
      manipulateAsync: async () => ({
        uri: 'file:///cache/reducida.jpg',
        base64: Buffer.from('imagen-de-prueba').toString('base64'),
      }),
    };
  if (id === 'react-native') return { Platform: { OS: 'ios' } };
  if (id === 'expo-secure-store')
    return {
      WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'when-unlocked-this-device',
      getItemAsync: async (key) => llavero.get(key) ?? null,
      setItemAsync: async (key, value) => {
        llavero.set(key, value);
      },
    };
  if (id === 'expo-crypto')
    return {
      getRandomBytesAsync: async (cantidad) => crypto.randomBytes(cantidad),
      AESEncryptionKey: ClaveAES,
      AESKeySize: { AES256: 256 },
      AESSealedData: Sellado,
      aesEncryptAsync: async (bytes, key, options) => {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', key.valor, iv);
        cipher.setAAD(Buffer.from(options.additionalData));
        const cifrado = Buffer.concat([cipher.update(bytes), cipher.final()]);
        return new Sellado(Buffer.concat([iv, cifrado, cipher.getAuthTag()]));
      },
      aesDecryptAsync: async (sobre, key, options) => {
        const bytes = sobre.valor;
        const decipher = crypto.createDecipheriv('aes-256-gcm', key.valor, bytes.subarray(0, 12));
        decipher.setAAD(Buffer.from(options.additionalData));
        decipher.setAuthTag(bytes.subarray(-16));
        return new Uint8Array(Buffer.concat([decipher.update(bytes.subarray(12, -16)), decipher.final()]));
      },
    };
  if (id === '@react-native-async-storage/async-storage')
    return {
      __esModule: true,
      default: {
        getAllKeys: async () => [...memoria.keys()],
        getItem: async (key) => memoria.get(key) ?? null,
        setItem: async (key, value) => {
          if (falla) throw new Error('Sin espacio');
          memoria.set(key, value);
        },
        removeItem: async (key) => {
          memoria.delete(key);
        },
      },
    };
  return originalLoad.call(this, id, parent, main);
};
const { vender, anular, validarInput } = require('../src/utils/operaciones.ts');
const { validarProducto, validarVenta, sinErrores } = require('../src/utils/validaciones.ts');
const { buscarCodigo, codigoProducto } = require('../src/utils/codigos.ts');
const { guardarDatos, cargarDatos, validarDatos } = require('../src/services/almacenamiento.ts');
const { crearDatosIniciales } = require('../src/data/datosIniciales.ts');
const { crearCredencial, verificarPin } = require('../src/services/credenciales.ts');
const { guardarProtegido, leerProtegido } = require('../src/services/boveda.ts');
const { permite } = require('../src/utils/permisos.ts');

test('el PIN nunca se guarda en claro y se verifica correctamente', async () => {
  const credencial = await crearCredencial('483729');
  assert.notEqual(credencial.hash, '483729');
  assert.equal(await verificarPin('483729', credencial), true);
  assert.equal(await verificarPin('000000', credencial), false);
});
test('dos usuarios con el mismo PIN tienen verificadores diferentes', async () => {
  const a = await crearCredencial('483729');
  const b = await crearCredencial('483729');
  assert.notEqual(a.salt, b.salt);
  assert.notEqual(a.hash, b.hash);
});
test('el registro rechaza PIN incompleto', async () => {
  await assert.rejects(crearCredencial('123'));
});

for (const cantidad of [0, -1, 1.5, NaN, Infinity, 99999]) {
  test(`venta rechaza cantidad inválida: ${cantidad}`, () => {
    const datos = crearDatosIniciales();
    assert.equal(vender(datos, 'p1', cantidad, 100), null);
    assert.equal(datos.productos[0].stock, 12);
  });
}
for (const precio of [0, -1, NaN, Infinity]) {
  test(`venta rechaza precio inválido: ${precio}`, () =>
    assert.equal(vender(crearDatosIniciales(), 'p1', 1, precio), null));
}
test('venta y stock cambian juntos sin modificar el estado anterior', () => {
  const datos = crearDatosIniciales();
  const resultado = vender(datos, 'p1', 12, 20000);
  assert.equal(resultado.estado.productos[0].stock, 0);
  assert.equal(resultado.estado.ventas[0].cantidad, 12);
  assert.equal(datos.productos[0].stock, 12);
  assert.equal(vender(resultado.estado, 'p1', 1, 20000), null);
});
test('anular dos veces no duplica unidades', () => {
  const { estado, venta } = vender(crearDatosIniciales(), 'p1', 2, 20000);
  const restaurado = anular(estado, venta.id, 'Venta duplicada');
  assert.equal(restaurado.productos[0].stock, 12);
  assert.equal(anular(restaurado, venta.id, 'Segundo intento'), restaurado);
});
test('la venta conserva nombre y costo del momento', () => {
  const datos = crearDatosIniciales();
  const { venta } = vender(datos, 'p1', 1, 20000);
  datos.productos[0].nombre = 'Nombre cambiado';
  assert.equal(venta.productoNombre, 'Redmi Buds 6 Active');
  assert.equal(venta.costoUnitario, 18000);
});
test('QR conocido resuelve; URLs y códigos de otro inventario no', () => {
  const datos = crearDatosIniciales();
  assert.equal(buscarCodigo(codigoProducto('p1'), datos.productos).id, 'p1');
  assert.equal(buscarCodigo('https://sitio.example/p1', datos.productos), undefined);
  assert.equal(buscarCodigo(codigoProducto('otro'), datos.productos), undefined);
});
test('QR propio vinculado resuelve datos actuales, sin abrir ni importar URLs', async () => {
  const { asociarCodigoQr } = require('../src/utils/codigos.ts');
  const inicial = crearDatosIniciales();
  const codigo = 'https://etiquetas.example/AUR01';
  const vinculados = asociarCodigoQr(inicial, 'p1', codigo);
  assert.equal(inicial.productos[0].codigoQr, undefined);
  assert.equal(buscarCodigo(codigo, vinculados.productos).sku, 'BUDS6');
  const venta = vender(vinculados, 'p1', 1, 32000);
  const actual = {
    ...venta.estado,
    productos: venta.estado.productos.map((p) => (p.id === 'p1' ? { ...p, precio: 35000 } : p)),
  };
  assert.equal(buscarCodigo(codigo, actual.productos).stock, 11);
  assert.equal(buscarCodigo(codigo, actual.productos).precio, 35000);
  assert.equal(buscarCodigo(codigo, crearDatosIniciales().productos), undefined);
  await guardarDatos(actual, 'qr-propio');
  assert.equal(buscarCodigo(codigo, (await cargarDatos('qr-propio')).productos).id, 'p1');
});
test('QR propio rechaza conflictos, permite reemplazar y desvincular sin borrar el producto', () => {
  const { asociarCodigoQr } = require('../src/utils/codigos.ts');
  const datos = asociarCodigoQr(crearDatosIniciales(), 'p1', 'MIQR01');
  assert.throws(() => asociarCodigoQr(datos, 'p2', 'MIQR01'), /ya identifica/);
  assert.throws(() => asociarCodigoQr(datos, 'p2', 'BUDS6'), /ya identifica/);
  assert.throws(() => asociarCodigoQr(datos, 'p2', 'nexa:producto:p1'), /etiquetas NEXA/);
  assert.throws(() => asociarCodigoQr(datos, 'p2', 'x'.repeat(1025)), /1024/);
  assert.throws(() => asociarCodigoQr(datos, 'p2', 'a\u0000b'), /1024/);
  const impreso = asociarCodigoQr(datos, 'p2', 'SKU: SONY520\nNombre: Auriculares\nPrecio: 84900');
  assert.equal(buscarCodigo('SKU: SONY520\nNombre: Auriculares\nPrecio: 84900', impreso.productos).id, 'p2');
  assert.equal(validarInput({ ...datos.productos[1], sku: 'MIQR01' }, datos.productos, 'p2'), false);
  const reemplazo = asociarCodigoQr(datos, 'p1', 'NUEVOQR');
  assert.equal(buscarCodigo('MIQR01', reemplazo.productos), undefined);
  assert.equal(buscarCodigo('NUEVOQR', reemplazo.productos).id, 'p1');
  const limpio = asociarCodigoQr(reemplazo, 'p1', null);
  assert.equal(limpio.productos.length, datos.productos.length);
  assert.equal(buscarCodigo('NUEVOQR', limpio.productos), undefined);
  assert.equal(buscarCodigo(codigoProducto('p1'), limpio.productos).id, 'p1');
  const conflicto = {
    ...datos,
    productos: datos.productos.map((p) => (p.id === 'p2' ? { ...p, codigoQr: 'MIQR01' } : p)),
  };
  assert.equal(validarDatos(conflicto), false);
});
test('SKU corto alfanumérico: normalización, formato y duplicados al crear o editar', () => {
  const { skuValido, normalizarSku } = require('../src/utils/sku.ts');
  assert.equal(normalizarSku(' aur01 '), 'AUR01');
  for (const sku of ['', 'AB', 'AUR-01', 'AUR 01', 'ÁUR01', 'ABCDEFGHIJKLM']) {
    assert.equal(skuValido(sku), false);
  }
  assert.equal(skuValido('AUR01'), true);
  const productos = crearDatosIniciales().productos;
  const input = { ...productos[0], sku: 'BUDS6' };
  assert.equal(validarInput(input, productos), false);
  assert.equal(validarInput(input, productos, input.id), true);
  assert.equal(validarInput({ ...input, sku: 'JBLGO4' }, productos, input.id), false);
  assert.equal(validarInput(input, []), true); // otro inventario puede usar el mismo SKU
  assert.equal(buscarCodigo(' buds6 ', productos).id, input.id);
});
test('la persistencia conserva SKU únicos y admite inventarios anteriores sin asignarlos', async () => {
  const datos = crearDatosIniciales();
  datos.productos[1].sku = datos.productos[0].sku;
  assert.equal(validarDatos(datos), false);
  delete datos.productos[1].sku;
  assert.equal(validarDatos(datos), true);
  await guardarDatos(datos, 'sku-usuario');
  assert.equal((await cargarDatos('sku-usuario')).productos[0].sku, 'BUDS6');
});
test('validaciones rechazan números no finitos y fracciones', () => {
  assert.ok(validarVenta({ cantidad: '1.5', precio: '200' }, 10).cantidad);
  assert.ok(validarVenta({ cantidad: '1', precio: 'NaN' }, 10).precio);
  const form = {
    sku: 'PROD01',
    nombre: 'Producto',
    marca: 'Marca',
    categoria: 'otros',
    costo: '10',
    precio: '20',
    stock: '0',
    stockMinimo: '0',
    fotoUri: null,
    reacondicionado: false,
  };
  assert.ok(sinErrores(validarProducto(form)));
  assert.ok(validarProducto({ ...form, costo: 'Infinity' }).costo);
  assert.ok(validarProducto({ ...form, stock: '-1' }).stock);
  assert.ok(validarProducto({ ...form, stockMinimo: '1.5' }).stockMinimo);
  assert.equal(validarInput({ ...crearDatosIniciales().productos[0], stock: -1 }), false);
});
test('datos dañados y ids duplicados se rechazan', () => {
  assert.equal(validarDatos({ productos: [], ventas: [] }), true);
  assert.equal(validarDatos({ productos: 'no', ventas: [] }), false);
  const datos = crearDatosIniciales();
  datos.productos.push(datos.productos[0]);
  assert.equal(validarDatos(datos), false);
});
test('persistencia separa usuarios y respeta el orden de escritura', async () => {
  const a = crearDatosIniciales();
  const b = { productos: [], ventas: [] };
  await Promise.all([
    guardarDatos(a, 'usuario-a'),
    guardarDatos(b, 'usuario-b'),
    guardarDatos(b, 'usuario-a'),
  ]);
  assert.deepEqual(await cargarDatos('usuario-a'), b);
  assert.deepEqual(await cargarDatos('usuario-b'), b);
  await guardarDatos(a, 'usuario-a');
  assert.equal((await cargarDatos('usuario-a')).productos.length, 9);
  assert.equal((await cargarDatos('usuario-b')).productos.length, 0);
});
test('un fallo de escritura se propaga y la cola permite reintentar', async () => {
  falla = true;
  await assert.rejects(guardarDatos({ productos: [], ventas: [] }, 'error'));
  falla = false;
  await guardarDatos(crearDatosIniciales(), 'error');
  assert.equal((await cargarDatos('error')).productos.length, 9);
});
test('la lectura corrupta no se trata como un inventario nuevo', async () => {
  memoria.set('@nexa/roto/inventario-v1', '{no-es-json');
  await assert.rejects(cargarDatos('roto'));
  assert.equal(memoria.get('@nexa/roto/inventario-v1'), '{no-es-json');
});

test('AES-GCM no deja nombres ni precios legibles y cambia el nonce en cada escritura', async () => {
  const datos = crearDatosIniciales();
  await guardarDatos(datos, 'cifrado');
  const uno = memoria.get('@nexa/seguro-v1/inventario-cifrado');
  assert.equal(uno.includes('Redmi'), false);
  assert.equal(uno.includes('29900'), false);
  await guardarDatos(datos, 'cifrado');
  assert.notEqual(memoria.get('@nexa/seguro-v1/inventario-cifrado'), uno);
  assert.deepEqual(await cargarDatos('cifrado'), datos);
});
test('un archivo cifrado alterado se rechaza', async () => {
  await guardarProtegido('alterado', { secreto: 'costos' });
  const ruta = '@nexa/seguro-v1/alterado';
  const sobre = JSON.parse(memoria.get(ruta));
  const bytes = Buffer.from(sobre.datos, 'base64');
  bytes[15] ^= 1;
  memoria.set(ruta, JSON.stringify({ ...sobre, datos: bytes.toString('base64') }));
  await assert.rejects(leerProtegido('alterado'));
});
test('copiar contenido cifrado a otro usuario no permite leerlo', async () => {
  await guardarDatos(crearDatosIniciales(), 'origen');
  memoria.set('@nexa/seguro-v1/inventario-destino', memoria.get('@nexa/seguro-v1/inventario-origen'));
  await assert.rejects(cargarDatos('destino'));
});
test('migración verifica el cifrado antes de retirar el JSON anterior', async () => {
  const datos = crearDatosIniciales();
  memoria.set('@nexa/antiguo/inventario-v1', JSON.stringify(datos));
  assert.deepEqual(await cargarDatos('antiguo'), datos);
  assert.equal(memoria.has('@nexa/antiguo/inventario-v1'), false);
  assert.ok(memoria.has('@nexa/seguro-v1/inventario-antiguo'));
});
test('perder la clave no genera una nueva ni sobrescribe el inventario', async () => {
  await guardarDatos(crearDatosIniciales(), 'sin-clave');
  const copia = new Map(llavero);
  const original = memoria.get('@nexa/seguro-v1/inventario-sin-clave');
  llavero.clear();
  await assert.rejects(cargarDatos('sin-clave'));
  await assert.rejects(guardarDatos({ productos: [], ventas: [] }, 'sin-clave'));
  await assert.rejects(guardarProtegido('ambito-nuevo-sin-clave', { datos: 1 }));
  assert.equal(llavero.size, 0);
  assert.equal(memoria.get('@nexa/seguro-v1/inventario-sin-clave'), original);
  for (const [key, value] of copia) llavero.set(key, value);
});
test('el invitado solo puede consultar catálogo, ficha y escáner', () => {
  for (const accion of ['catalogo', 'ficha', 'escanear']) assert.equal(permite('invitado', accion), true);
  for (const accion of ['inventario', 'ventas', 'analisis']) {
    assert.equal(permite('invitado', accion), false);
    assert.equal(permite('usuario', accion), true);
  }
});

test('las fotos se guardan cifradas y solo se abren para el usuario correspondiente', async () => {
  const { protegerFoto, abrirFoto } = require('../src/services/fotos.ts');
  const referencia = await protegerFoto('file:///cache/original.jpg', 'fotoa');
  assert.ok(referencia.startsWith('nexa-foto:fotoa:'));
  assert.equal(await abrirFoto(referencia, 'fotob'), null);
  assert.ok((await abrirFoto(referencia, 'fotoa')).startsWith('data:image/jpeg;base64,'));
  const ruta = '@nexa/seguro-v1/foto-fotoa-' + referencia.split(':')[2];
  assert.equal(memoria.get(ruta).includes(Buffer.from('imagen-de-prueba').toString('base64')), false);
});
test('el límite de intentos de PIN se consulta desde el almacenamiento persistido', async () => {
  const { comprobarPin } = require('../src/services/acceso.ts');
  const credencial = await crearCredencial('483729');
  for (let i = 0; i < 5; i++) await assert.rejects(comprobarPin('limitado', '000000', credencial), /PIN/);
  await assert.rejects(comprobarPin('limitado', '483729', credencial), /Esperá un minuto/);
  await guardarProtegido('intentos-limitado', { cantidad: 0, hasta: 0 });
  await comprobarPin('limitado', '483729', credencial);
  assert.deepEqual(await leerProtegido('intentos-limitado'), { cantidad: 0, hasta: 0 });
});

const { totalesPresupuesto, presupuestoValido, htmlPresupuesto } = require('../src/utils/presupuestos.ts');
const cotizacion = () => ({
  numero: 'P-DEMO-001',
  fecha: '2026-10-15T12:00:00Z',
  cliente: 'Cliente de ejemplo',
  validez: 7,
  descuento: 10,
  notas: 'Entrega a coordinar.',
  lineas: [
    {
      productoId: 'p1',
      nombre: 'Auriculares de ejemplo',
      cantidad: 2,
      costo: 23000,
      recargo: 30,
      precio: 29900,
    },
  ],
});
const marcaEjemplo = {
  nombre: 'NEXA Demo',
  contacto: 'contacto@example.com',
  direccion: 'Datos del negocio',
  pie: 'Gracias por tu consulta.',
  logo: null,
};
test('el PDF muestra el SKU de la cotización y rechaza códigos inválidos', () => {
  const p = cotizacion();
  p.lineas[0].sku = 'AUR01';
  const html = htmlPresupuesto(p, marcaEjemplo, null);
  assert.ok(html.includes('SKU: AUR01'));
  assert.equal(presupuestoValido({ ...p, lineas: [{ ...p.lineas[0], sku: '<script>' }] }), false);
});
test('el presupuesto calcula subtotal, descuento y total sin modificar el stock', () => {
  const datos = crearDatosIniciales();
  const antes = JSON.stringify(datos);
  assert.deepEqual(totalesPresupuesto(cotizacion()), { subtotal: 59800, descuento: 5980, total: 53820 });
  assert.equal(JSON.stringify(datos), antes);
  assert.equal(presupuestoValido(cotizacion()), true);
});
test('cada SKU aplica el recargo sobre el costo y el PDF oculta los datos internos', () => {
  const { precioConRecargo } = require('../src/utils/calculos.ts');
  assert.equal(precioConRecargo(10000, 30), 13000);
  assert.equal(precioConRecargo(10000, 0), 10000);
  const p = {
    ...cotizacion(),
    descuento: 0,
    lineas: [{ productoId: 'p1', nombre: 'Producto', cantidad: 2, costo: 10000, recargo: 30, precio: 13000 }],
  };
  assert.equal(presupuestoValido(p), true);
  assert.equal(totalesPresupuesto(p).total, 26000);
  assert.equal(presupuestoValido({ ...p, lineas: [{ ...p.lineas[0], precio: 14000 }] }), false);
  const html = htmlPresupuesto(p, marcaEjemplo, null);
  assert.equal(/recargo|costo|10[.,]000|30%/i.test(html), false);
  assert.ok(html.includes('13.000'));
});
test('el presupuesto rechaza cantidades inválidas, descuentos excesivos y clientes vacíos', () => {
  assert.equal(presupuestoValido({ ...cotizacion(), cliente: '' }), false);
  assert.equal(presupuestoValido({ ...cotizacion(), descuento: 101 }), false);
  assert.equal(
    presupuestoValido({
      ...cotizacion(),
      lineas: [{ productoId: 'x', nombre: 'x', cantidad: 1.5, precio: 10 }],
    }),
    false,
  );
  assert.equal(presupuestoValido({ ...cotizacion(), lineas: [] }), false);
});
test('el PDF incorpora membrete y pie, escapa el texto y no admite logos remotos', () => {
  const html = htmlPresupuesto(
    { ...cotizacion(), cliente: '<script>alert(1)</script>' },
    marcaEjemplo,
    'https://externo.example/logo.png',
  );
  assert.ok(html.includes('NEXA Demo'));
  assert.ok(html.includes('Gracias por tu consulta.'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.equal(html.includes('<script>'), false);
  assert.equal(html.includes('src="https://'), false);
  assert.ok(html.includes('Total ARS'));
});
const { inclinacion, estaNivelado, suavizar } = require('../src/utils/nivel.ts');
test('el nivel reconoce superficies horizontales y una inclinación de 45 grados', () => {
  assert.deepEqual(inclinacion({ x: 0, y: 0, z: 1 }), { lateral: 0, frontal: 0 });
  assert.deepEqual(inclinacion({ x: 0, y: 0, z: -1 }), { lateral: 0, frontal: 0 });
  assert.ok(Math.abs(inclinacion({ x: 1, y: 0, z: 1 }).lateral - 45) < 0.001);
  assert.equal(estaNivelado(1, -1), true);
  assert.equal(estaNivelado(2, 0), false);
  assert.equal(estaNivelado(NaN, 0), false);
  assert.deepEqual(suavizar({ x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }), { x: 0.2, y: 0, z: 1 });
});

const { crearCopiaInventario, prepararRestauracion } = require('../src/services/respaldoDatos.ts');
const { cifrarCopia, descifrarCopia } = require('../src/services/respaldoCripto.ts');
const { copiaValida } = require('../src/domain/inventario/respaldo.ts');
test('copia portátil cifra el inventario, no expone costos y detecta contraseña errónea o alteraciones', async () => {
  const copia = await crearCopiaInventario(crearDatosIniciales(), 'copia-origen');
  const clave = 'Una contraseña larga 2026';
  const archivo = await cifrarCopia(copia, clave);
  assert.equal(archivo.includes('Redmi'), false);
  assert.equal(archivo.includes(clave), false);
  assert.deepEqual(await descifrarCopia(archivo, clave), copia);
  await assert.rejects(descifrarCopia(archivo, 'otra contraseña larga'), /incorrecta o copia dañada/);
  const sobre = JSON.parse(archivo);
  const bytes = Buffer.from(sobre.contenido, 'base64');
  bytes[18] ^= 1;
  await assert.rejects(
    descifrarCopia(JSON.stringify({ ...sobre, contenido: bytes.toString('base64') }), clave),
    /dañada/,
  );
  await assert.rejects(cifrarCopia(copia, '123456'), /12 a 128/);
  await assert.rejects(
    descifrarCopia(JSON.stringify({ ...sobre, iteraciones: 1e12 }), clave),
    /no compatible/,
  );
});
test('restaurar fotos las cifra con el perfil de destino y preserva SKU, QR, ventas e IDs', async () => {
  const { protegerFoto, abrirFoto } = require('../src/services/fotos.ts');
  const datos = crearDatosIniciales();
  datos.productos[0].fotoUri = await protegerFoto('file:///cache/copia.jpg', 'copiaorigen');
  datos.productos[0].codigoQr = 'MIETIQUETA01';
  const copia = await crearCopiaInventario(datos, 'copiaorigen');
  const restaurados = await prepararRestauracion(copia, 'copiadestino');
  assert.equal(restaurados.productos[0].id, datos.productos[0].id);
  assert.equal(restaurados.productos[0].sku, 'BUDS6');
  assert.equal(restaurados.productos[0].codigoQr, 'MIETIQUETA01');
  assert.deepEqual(restaurados.ventas, datos.ventas);
  assert.notEqual(restaurados.productos[0].fotoUri, datos.productos[0].fotoUri);
  assert.ok(await abrirFoto(restaurados.productos[0].fotoUri, 'copiadestino'));
  assert.equal(await abrirFoto(restaurados.productos[0].fotoUri, 'copiaorigen'), null);
  assert.ok(await abrirFoto(datos.productos[0].fotoUri, 'copiaorigen'));
  assert.equal(copiaValida({ ...copia, imagenes: [] }), false);
  assert.equal(copiaValida({ ...copia, datos: { ...copia.datos, productos: [null] } }), false);
});
test('datos y credenciales malformados se rechazan sin lanzar excepciones de tipo', async () => {
  const { credencialValida } = require('../src/services/credenciales.ts');
  for (const valor of [null, {}, { salt: 'x', hash: 'x' }, { salt: 10, hash: [] }]) {
    assert.equal(credencialValida(valor), false);
    assert.equal(await verificarPin('123456', valor), false);
  }
  const datos = crearDatosIniciales();
  datos.productos[0].nombre = '';
  assert.equal(validarDatos(datos), false);
  assert.equal(copiaValida(null), false);
});

test('anulación conserva la venta y motivo, registra el movimiento y no suma ingresos', () => {
  const { totalVenta, gananciaVenta } = require('../src/utils/calculos.ts');
  const { estado, venta } = vender(crearDatosIniciales(), 'p1', 2, 25000);
  const anulado = anular(estado, venta.id, 'Cliente canceló el pedido');
  const registro = anulado.ventas.find((v) => v.id === venta.id);
  assert.equal(registro.cantidad, 2);
  assert.equal(registro.precioUnitario, 25000);
  assert.equal(registro.anulacion.motivo, 'Cliente canceló el pedido');
  assert.ok(Number.isFinite(Date.parse(registro.anulacion.fecha)));
  assert.equal(registro.anulacion.stockRestituido, true);
  assert.equal(totalVenta(registro), 0);
  assert.equal(gananciaVenta(registro), 0);
  assert.equal(anulado.movimientos[0].tipo, 'anulacion');
  assert.equal(anulado.movimientos[0].ventaId, venta.id);
  assert.equal(anulado.movimientos[0].stockAntes, 10);
  assert.equal(anulado.movimientos[0].stockDespues, 12);
  assert.equal(anular(anulado, venta.id, 'Repetido'), anulado);
  assert.throws(() => anular(estado, venta.id, ''), /motivo/);
});
test('ajustes, ediciones y bajas dejan evidencia sin mutar el historial anterior', () => {
  const { editarProducto, darBajaProducto } = require('../src/domain/inventario/movimientos.ts');
  const inicial = crearDatosIniciales();
  const p = inicial.productos[0];
  assert.throws(() => editarProducto(inicial, p.id, { ...p, stock: 20 }), /por qué/);
  const ajustado = editarProducto(inicial, p.id, { ...p, stock: 20, precio: 31000 }, 'Ingreso de mercadería');
  assert.equal(inicial.productos[0].stock, 12);
  assert.equal(ajustado.movimientos[0].stockAntes, 12);
  assert.equal(ajustado.movimientos[0].stockDespues, 20);
  assert.equal(ajustado.movimientos[0].cambios[0].campo, 'precio');
  const { estado, venta } = vender(ajustado, p.id, 1, 31000);
  const baja = darBajaProducto(estado, p.id, 'Producto discontinuado');
  assert.equal(baja.movimientos.length, 3);
  assert.equal(baja.movimientos[0].tipo, 'baja');
  const anulado = anular(baja, venta.id, 'Devolución tras baja');
  assert.equal(anulado.ventas[0].anulacion.stockRestituido, false);
  assert.equal(
    anulado.productos.some((v) => v.id === p.id),
    false,
  );
  assert.equal(validarDatos(anulado), true);
  assert.equal(ajustado.movimientos.length, 1);
});
test('migración conserva marca y borrador anteriores dentro del registro atómico del negocio', async () => {
  const id = 'legadonegocio';
  const datos = crearDatosIniciales();
  await guardarDatos(datos, id);
  await guardarProtegido(`marca-${id}`, marcaEjemplo);
  await guardarProtegido(`presupuesto-borrador-${id}`, cotizacion());
  const migrados = await cargarDatos(id);
  assert.deepEqual(migrados.negocio.marca, marcaEjemplo);
  assert.deepEqual(migrados.negocio.borrador, cotizacion());
  assert.deepEqual((await leerProtegido(`inventario-${id}`)).negocio, migrados.negocio);
  assert.deepEqual(await leerProtegido(`marca-${id}`), marcaEjemplo);
  await guardarProtegido('marca-legadosinstock', marcaEjemplo);
  assert.deepEqual((await cargarDatos('legadosinstock')).negocio.marca, marcaEjemplo);
});
test('recuperación completa entre instalaciones con almacenamiento y llaveros independientes', async () => {
  const { protegerFoto, abrirFoto } = require('../src/services/fotos.ts');
  const { editarProducto } = require('../src/domain/inventario/movimientos.ts');
  const datos = crearDatosIniciales();
  datos.productos[0].fotoUri = await protegerFoto('file:///cache/producto.jpg', 'instalaciona');
  const logo = await protegerFoto('file:///cache/logo.jpg', 'instalaciona');
  const fotoOriginal = await abrirFoto(datos.productos[0].fotoUri, 'instalaciona');
  const logoOriginal = await abrirFoto(logo, 'instalaciona');
  datos.negocio = { marca: { ...marcaEjemplo, logo }, borrador: cotizacion(), presupuestos: [cotizacion()] };
  const vendido = vender(datos, 'p1', 2, 32000);
  const cancelado = anular(vendido.estado, vendido.venta.id, 'Pedido cancelado');
  const origen = editarProducto(
    cancelado,
    'p1',
    { ...cancelado.productos[0], stock: 18 },
    'Reposición verificada',
  );
  await guardarDatos(origen, 'instalaciona');
  const archivo = await cifrarCopia(
    await crearCopiaInventario(await cargarDatos('instalaciona'), 'instalaciona'),
    'Recuperar mi negocio 2026',
  );
  const anteriorMemoria = new Map(memoria);
  const anteriorLlavero = new Map(llavero);
  const carpetaTemporal = fs.mkdtempSync(
    require('node:path').join(require('node:os').tmpdir(), 'nexa-recuperacion-'),
  );
  const archivoTemporal = require('node:path').join(carpetaTemporal, 'negocio.nexa');
  try {
    fs.writeFileSync(archivoTemporal, archivo, 'utf8');
    memoria.clear();
    llavero.clear();
    const copia = await descifrarCopia(fs.readFileSync(archivoTemporal, 'utf8'), 'Recuperar mi negocio 2026');
    assert.equal(copia.version, 2);
    assert.equal(llavero.size, 0); // descifrar no depende de la clave de la instalación anterior
    const destino = await prepararRestauracion(copia, 'instalacionb');
    await guardarDatos(destino, 'instalacionb');
    const reabierto = await cargarDatos('instalacionb');
    assert.equal(reabierto.productos[0].stock, 18);
    assert.equal(reabierto.productos[0].sku, origen.productos[0].sku);
    assert.equal(reabierto.productos[0].precio, origen.productos[0].precio);
    assert.deepEqual(reabierto.movimientos, origen.movimientos);
    assert.deepEqual(reabierto.ventas, origen.ventas);
    assert.deepEqual(reabierto.negocio.presupuestos, origen.negocio.presupuestos);
    assert.deepEqual(reabierto.negocio.borrador, origen.negocio.borrador);
    assert.equal(reabierto.negocio.marca.nombre, origen.negocio.marca.nombre);
    assert.equal(await abrirFoto(reabierto.productos[0].fotoUri, 'instalacionb'), fotoOriginal);
    assert.equal(await abrirFoto(reabierto.negocio.marca.logo, 'instalacionb'), logoOriginal);
    assert.equal(await abrirFoto(reabierto.negocio.marca.logo, 'instalaciona'), null);
    const html = htmlPresupuesto(reabierto.negocio.presupuestos[0], reabierto.negocio.marca, logoOriginal);
    assert.ok(html.includes('NEXA Demo'));
    assert.ok(html.includes('Gracias por tu consulta.'));
    assert.ok(html.includes('data:image/jpeg;base64,'));
  } finally {
    if (fs.existsSync(archivoTemporal)) fs.unlinkSync(archivoTemporal);
    fs.rmdirSync(carpetaTemporal);
    memoria.clear();
    llavero.clear();
    for (const [k, v] of anteriorMemoria) memoria.set(k, v);
    for (const [k, v] of anteriorLlavero) llavero.set(k, v);
  }
});
test('las copias antiguas siguen siendo legibles y una copia completa exige su logo', async () => {
  const { perfilSinDatos, negocioVacio } = require('../src/domain/inventario/negocio.ts');
  const antigua = {
    tipo: 'NEXA-INVENTARIO',
    version: 1,
    creadoEn: new Date().toISOString(),
    datos: crearDatosIniciales(),
    imagenes: [],
  };
  assert.equal(copiaValida(antigua), true);
  assert.equal(
    (
      await descifrarCopia(
        await cifrarCopia(antigua, 'Una contraseña compatible'),
        'Una contraseña compatible',
      )
    ).version,
    1,
  );
  assert.equal(copiaValida({ ...antigua, version: 2 }), false);
  assert.equal(
    copiaValida({
      ...antigua,
      version: 2,
      datos: {
        ...antigua.datos,
        negocio: { ...negocioVacio(), marca: { ...marcaEjemplo, logo: 'nexa-foto:origen:logo' } },
      },
    }),
    false,
  );
  assert.equal(perfilSinDatos({ productos: [], ventas: [], negocio: negocioVacio() }), true);
  assert.equal(
    perfilSinDatos({ productos: [], ventas: [], negocio: { ...negocioVacio(), marca: marcaEjemplo } }),
    false,
  );
  assert.equal(
    perfilSinDatos({ productos: [], ventas: [], negocio: { ...negocioVacio(), borrador: cotizacion() } }),
    false,
  );
});

test('si falla el guardado al recuperar, no queda una marca o presupuesto parcialmente restaurado', async () => {
  const { negocioVacio } = require('../src/domain/inventario/negocio.ts');
  const destinoVacio = { productos: [], ventas: [], negocio: negocioVacio() };
  await guardarDatos(destinoVacio, 'recuperacionfallida');
  const origen = {
    ...crearDatosIniciales(),
    negocio: { marca: marcaEjemplo, borrador: cotizacion(), presupuestos: [cotizacion()] },
  };
  const preparada = await prepararRestauracion(
    await crearCopiaInventario(origen, 'origensinfotos'),
    'recuperacionfallida',
  );
  try {
    falla = true;
    await assert.rejects(guardarDatos(preparada, 'recuperacionfallida'), /Sin espacio/);
  } finally {
    falla = false;
  }
  assert.deepEqual(await cargarDatos('recuperacionfallida'), destinoVacio);
});
