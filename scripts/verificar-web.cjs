const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const url = process.env.NEXA_WEB_URL || 'http://localhost:8085';
const output = process.env.NEXA_SCREENSHOTS || path.join(__dirname, '..', '.expo', 'verificacion-web');
fs.mkdirSync(output, { recursive: true });
const pin = '483729';

async function cuenta(p, nombre, nueva) {
  await p.getByRole('tab', { name: nueva ? 'Crear cuenta' : 'Ingresar', exact: true }).click();
  await p.getByLabel('Usuario o negocio').fill(nombre);
  await p.getByLabel('PIN de seis dígitos').fill(pin);
  if (nueva) await p.getByLabel('Repetir PIN').fill(pin);
  await p.getByRole('button', { name: nueva ? /Crear cuenta/ : /Ingresar/, exact: false }).click();
  await p.getByRole('button', { name: /Nuevo producto/ }).waitFor({ timeout: 20000 });
}
async function salir(p) {
  await p.getByRole('tab', { name: /Mi espacio/ }).click();
  await p.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await p.getByRole('tab', { name: 'Ingresar', exact: true }).waitFor();
}
async function leerDB(p) {
  return p.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const r = indexedDB.open('nexa-web-v1', 1);
      r.onsuccess = () => resolve(r.result);
      r.onerror = reject;
    });
    const tx = db.transaction(['claves', 'registros'], 'readonly');
    const keys = tx.objectStore('claves').get('dispositivo');
    const records = tx.objectStore('registros').getAll();
    return new Promise((resolve) => {
      tx.oncomplete = () => {
        db.close();
        resolve({
          extractable: keys.result.key.extractable,
          algorithm: keys.result.key.algorithm.name,
          records: records.result.map((r) => new TextDecoder().decode(r.datos)),
        });
      };
    });
  });
}

(async () => {
  const browser = await chromium.launch({
    channel: process.env.NEXA_BROWSER_CHANNEL || 'chrome',
    headless: true,
  });
  try {
    for (const [nombre, viewport] of [
      ['escritorio', { width: 1280, height: 820 }],
      ['movil', { width: 390, height: 844 }],
    ]) {
      const context = await browser.newContext({ viewport });
      const p = await context.newPage();
      const errores = [];
      p.on('pageerror', (e) => errores.push(e.message));
      p.on('dialog', (d) => d.accept());
      await p.goto(url, { waitUntil: 'networkidle' });
      await p.getByRole('tab', { name: 'Ingresar', exact: true }).waitFor();
      await p.getByRole('tab', { name: 'Crear cuenta', exact: true }).waitFor();
      const entrar = await p.getByRole('button', { name: /Entrar como invitado/ }).boundingBox();
      assert(entrar && entrar.y + entrar.height <= viewport.height, 'Acceso invitado visible sin scroll');
      await p.screenshot({ path: path.join(output, `acceso-${nombre}.png`) });
      await cuenta(p, 'Prueba A', true);
      const nuevo = await p.getByRole('button', { name: /Nuevo producto/ }).boundingBox();
      assert(nuevo && nuevo.y + nuevo.height < viewport.height, 'Acción principal visible sin scroll');
      await p.screenshot({ path: path.join(output, `inicio-${nombre}.png`) });
      await p.getByRole('button', { name: /Nuevo producto/ }).click();
      await p.getByLabel('SKU *', { exact: true }).fill('TEST01');
      await p.getByLabel('Nombre *', { exact: true }).fill('Producto privado A');
      await p.getByLabel('Marca *', { exact: true }).fill('Prueba');
      await p.getByRole('button', { name: /Otros/ }).last().click();
      await p.getByLabel('Costo *', { exact: true }).fill('100');
      await p.getByLabel('Precio de venta *', { exact: true }).fill('150');
      await p.getByLabel('Unidades *', { exact: true }).fill('3');
      const [chooser] = await Promise.all([
        p.waitForEvent('filechooser'),
        p.getByRole('button', { name: /Elegir de la galería/ }).click(),
      ]);
      await chooser.setFiles(path.join(__dirname, '..', 'assets', 'nexa-icon.png'));
      await p.getByLabel('Foto del producto', { exact: true }).waitFor();
      await p.getByRole('button', { name: /Agregar producto/ }).click();
      await p.getByText('Producto privado A', { exact: true }).waitFor();
      await p.getByText('Guardando cambios…', { exact: true }).waitFor({ state: 'hidden' });
      const db = await leerDB(p);
      assert.equal(db.extractable, false);
      assert.equal(db.algorithm, 'AES-GCM');
      assert(
        db.records.every((r) => !r.includes('Prueba A') && !r.includes('Producto privado A')),
        'Datos persistidos cifrados',
      );
      await p.getByRole('tab', { name: /Mi espacio/ }).click();
      await p.getByRole('button', { name: /Mi marca y membrete/ }).click();
      await p.getByLabel('Nombre del negocio *', { exact: true }).fill('Marca privada A');
      await p.getByLabel('Texto del pie', { exact: true }).fill('Pie de prueba');
      const [logo] = await Promise.all([
        p.waitForEvent('filechooser'),
        p.getByRole('button', { name: /Cargar logo de la galería/ }).click(),
      ]);
      await logo.setFiles(path.join(__dirname, '..', 'assets', 'nexa-icon.png'));
      await p.getByRole('button', { name: /Quitar logo/ }).waitFor();
      await p.getByRole('button', { name: /Guardar marca/ }).click();
      await p.getByRole('tab', { name: /Mi espacio/ }).click();
      await p.getByRole('button', { name: /Copias de seguridad/ }).waitFor();
      await p.getByRole('tab', { name: /Inicio/ }).click();
      await p.getByRole('button', { name: /Crear presupuesto/ }).click();
      await p.getByLabel('Cliente *', { exact: true }).fill('Cliente prueba');
      await p.getByRole('button', { name: 'Agregar Producto privado A', exact: true }).click();
      const [popup] = await Promise.all([
        p.waitForEvent('popup'),
        p.getByRole('button', { name: /Imprimir \/ Guardar PDF/ }).click(),
      ]);
      await popup.getByText('Marca privada A', { exact: true }).waitFor();
      const html = await popup.content();
      for (const texto of [
        'Marca privada A',
        'Pie de prueba',
        'Cliente prueba',
        'TEST01',
        'data:image/jpeg;base64,',
      ])
        assert(html.includes(texto), `Impresión incluye ${texto}`);
      assert(!html.includes('Costo interno'));
      await popup.close();
      await p.getByText(/En el diálogo de impresión elegí/).waitFor();
      await p.getByRole('tab', { name: /Mi espacio/ }).click();
      await p.getByRole('button', { name: /Copias de seguridad/ }).click();
      await p.getByLabel('Contraseña de la copia', { exact: true }).fill('Copia-de-prueba-2026');
      await p.getByLabel('Repetir contraseña para exportar', { exact: true }).fill('Copia-de-prueba-2026');
      const [download] = await Promise.all([
        p.waitForEvent('download'),
        p.getByRole('button', { name: /Exportar copia cifrada/ }).click(),
      ]);
      const copia = await download.path();
      const sobre = JSON.parse(fs.readFileSync(copia, 'utf8'));
      assert.equal(sobre.formato, 'NEXA-CIFRADO');
      assert(!JSON.stringify(sobre).includes('Producto privado A'));
      await salir(p);
      await p.getByLabel('Usuario o negocio').fill('Prueba A');
      await p.getByLabel('PIN de seis dígitos').fill('000000');
      await p.getByRole('button', { name: /Ingresar/ }).click();
      await p.getByText('El PIN no es correcto.', { exact: true }).waitFor();
      await cuenta(p, 'Prueba A', false);
      await p.reload({ waitUntil: 'networkidle' });
      await cuenta(p, 'Prueba A', false);
      await p.getByRole('tab', { name: /Inventario/ }).click();
      await p.getByText('Producto privado A', { exact: true }).waitFor();
      await salir(p);
      await cuenta(p, 'Prueba B', true);
      await p.getByRole('tab', { name: /Inventario/ }).click();
      await p.getByText('Tu inventario está vacío', { exact: true }).waitFor();
      assert.equal(await p.getByText('Producto privado A', { exact: true }).count(), 0);
      await p.getByRole('tab', { name: /Mi espacio/ }).click();
      await p.getByRole('button', { name: /Copias de seguridad/ }).click();
      await p.getByLabel('Contraseña de la copia', { exact: true }).fill('Copia-de-prueba-2026');
      const [restaurar] = await Promise.all([
        p.waitForEvent('filechooser'),
        p.getByRole('button', { name: /Seleccionar y verificar copia/ }).click(),
      ]);
      await restaurar.setFiles({
        name: 'copia.nexa',
        mimeType: 'application/octet-stream',
        buffer: fs.readFileSync(copia),
      });
      await p.getByText(/1 productos · 0 ventas · 2 fotos/).waitFor();
      await p.getByRole('button', { name: /Restaurar en este perfil vacío/ }).click();
      await p.getByText('Inventario restaurado y guardado en este perfil.', { exact: true }).waitFor();
      await p.getByRole('tab', { name: /Inventario/ }).click();
      await p.getByText('Producto privado A', { exact: true }).waitFor();
      await p.getByRole('tab', { name: /Mi espacio/ }).click();
      await p.getByRole('button', { name: /Mi marca y membrete/ }).click();
      assert.equal(
        await p.getByLabel('Nombre del negocio *', { exact: true }).inputValue(),
        'Marca privada A',
      );
      await p.getByRole('button', { name: /Quitar logo/ }).waitFor();
      const imagen = p.getByLabel('Foto del producto', { exact: true }).last().locator('img');
      await imagen.waitFor();
      assert(await imagen.evaluate((i) => i.complete && i.naturalWidth > 0));
      await p.getByRole('tab', { name: /Mi espacio/ }).click();
      await salir(p);
      await p.getByRole('button', { name: /Entrar como invitado/ }).click();
      await p.getByRole('button', { name: /Ver catálogo/ }).waitFor();
      assert.equal(await p.getByRole('tab', { name: /Ventas/ }).count(), 0);
      assert.equal(await p.getByRole('button', { name: /Nuevo producto/ }).count(), 0);
      assert.deepEqual(errores, []);
      console.log(
        `PASS ${nombre}: registro, foto, producto cifrado, PIN incorrecto, reingreso, recarga, aislamiento, PDF con logo, copia/restauración e invitado.`,
      );
      // Simula una clave perdida solo en el navegador de prueba; debe conservar los registros.
      const cantidad = (await leerDB(p)).records.length;
      await p.evaluate(
        () =>
          new Promise((resolve) => {
            const r = indexedDB.open('nexa-web-v1', 1);
            r.onsuccess = () => {
              const db = r.result;
              const tx = db.transaction('claves', 'readwrite');
              tx.objectStore('claves').delete('dispositivo');
              tx.oncomplete = () => {
                db.close();
                resolve();
              };
            };
          }),
      );
      await p.reload({ waitUntil: 'networkidle' });
      await p.getByText('No pudimos leer tus perfiles. Volvé a abrir la app.', { exact: true }).waitFor();
      const restantes = await p.evaluate(
        () =>
          new Promise((resolve) => {
            const r = indexedDB.open('nexa-web-v1', 1);
            r.onsuccess = () => {
              const db = r.result;
              const tx = db.transaction('registros', 'readonly');
              const q = tx.objectStore('registros').count();
              tx.oncomplete = () => {
                db.close();
                resolve(q.result);
              };
            };
          }),
      );
      assert.equal(restantes, cantidad);
      console.log(`PASS ${nombre}: clave perdida informa error y conserva los registros.`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
