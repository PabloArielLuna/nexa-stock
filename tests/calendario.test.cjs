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
const { prepararSeguimiento } = require('../src/domain/seguimiento.ts');
test('seguimiento: mañana a las 10 local, 30 minutos y solo referencia del presupuesto', () => {
  const evento = prepararSeguimiento('P-TEST-1', new Date(2026, 11, 31, 23, 59));
  assert.equal(evento.startDate.getFullYear(), 2027);
  assert.equal(evento.startDate.getMonth(), 0);
  assert.equal(evento.startDate.getDate(), 1);
  assert.equal(evento.startDate.getHours(), 10);
  assert.equal(evento.endDate - evento.startDate, 1_800_000);
  assert.deepEqual(evento.alarms, [{ relativeOffset: 0 }]);
  assert.equal(evento.startNewActivityTask, false);
  assert.deepEqual(
    Object.keys(evento).sort(),
    ['title', 'notes', 'startDate', 'endDate', 'allDay', 'alarms', 'startNewActivityTask'].sort(),
  );
  assert.throws(() => prepararSeguimiento('cliente@example.com'));
  assert.throws(() => prepararSeguimiento('P-TEST', new Date('invalid')));
});
const platform = { OS: 'ios' };
let entorno = 'storeClient';
let disponible = true;
let cargado = 0;
let autorizacion = { granted: true, canAskAgain: false };
let pedidos = [];
let modoConsulta;
let resultado = { action: 'saved', id: 'event-1' };
let eventos = [];
let lista = [];
const principal = {
  id: 'default',
  title: 'Personal',
  allowsModifications: true,
  addEventWithForm: async (options) => {
    eventos.push(options);
    return resultado;
  },
};
const api = {
  EntityTypes: { EVENT: 'event' },
  getCalendarPermissions: async (writeOnly) => {
    modoConsulta = writeOnly;
    return autorizacion;
  },
  requestCalendarPermissions: async (writeOnly) => {
    pedidos.push(writeOnly);
    return (autorizacion = { granted: true, canAskAgain: false });
  },
  getDefaultCalendarSync: () => principal,
  getCalendars: async () => lista,
};
const original = Module._load;
Module._load = function (id, parent, main) {
  if (id === 'react-native') return { Platform: platform };
  if (id === 'expo') return { requireOptionalNativeModule: () => (disponible ? {} : null) };
  if (id === 'expo-constants')
    return {
      __esModule: true,
      default: { executionEnvironment: entorno },
      ExecutionEnvironment: { StoreClient: 'storeClient' },
    };
  if (id === 'expo-calendar') {
    cargado++;
    return api;
  }
  return original.call(this, id, parent, main);
};
function servicio() {
  delete require.cache[require.resolve('../src/services/calendario.native.ts')];
  return require('../src/services/calendario.native.ts');
}
test('calendario: Expo Go y binario antiguo no cargan ni llaman al módulo ausente', async () => {
  await assert.rejects(servicio().listarCalendarios(), /Expo Go/);
  assert.equal(cargado, 0);
  entorno = 'standalone';
  disponible = false;
  await assert.rejects(servicio().listarCalendarios(), /compilación nueva/);
  assert.equal(cargado, 0);
  disponible = true;
});
test('calendario: iOS solo escritura, solicitud contextual y permiso denegado', async () => {
  entorno = 'standalone';
  platform.OS = 'ios';
  disponible = true;
  autorizacion = { granted: false, canAskAgain: true };
  pedidos = [];
  const s = servicio();
  assert.deepEqual(await s.listarCalendarios(), [{ id: 'default', titulo: 'Continuar en Calendario' }]);
  assert.equal(modoConsulta, true);
  assert.deepEqual(pedidos, [true]);
  autorizacion = { granted: false, canAskAgain: false };
  await assert.rejects(s.listarCalendarios(), /Ajustes/);
  assert.equal(pedidos.length, 1);
});
test('calendario: Android descarta destinos de lectura y revalida antes del formulario', async () => {
  platform.OS = 'android';
  autorizacion = { granted: true, canAskAgain: false };
  lista = [{ id: 'read', title: 'Solo lectura', allowsModifications: false }, principal];
  const s = servicio();
  assert.deepEqual(await s.listarCalendarios(), [{ id: 'default', titulo: 'Personal' }]);
  assert.equal(modoConsulta, false);
  await assert.rejects(s.agendarSeguimiento('P-TEST', 'read'), /ya no está/);
  lista = [];
  await assert.rejects(s.listarCalendarios(), /No hay calendarios/);
});
test('calendario: cancelación, guardado iOS y resultado no confirmado de Android', async () => {
  platform.OS = 'ios';
  autorizacion = { granted: true, canAskAgain: false };
  eventos = [];
  const s = servicio();
  resultado = { action: 'canceled', id: null };
  assert.equal(await s.agendarSeguimiento('P-TEST', 'default'), 'cancelado');
  resultado = { action: 'saved', id: 'event-1' };
  assert.equal(await s.agendarSeguimiento('P-TEST', 'default'), 'guardado');
  platform.OS = 'android';
  lista = [principal];
  resultado = { action: 'done', id: null };
  assert.equal(await s.agendarSeguimiento('P-TEST', 'default'), 'sin-confirmacion');
  assert.equal(eventos.length, 3);
});
test('calendario: web conserva el aviso y no importa código nativo', async () => {
  const antes = cargado;
  await assert.rejects(require('../src/services/calendario.ts').listarCalendarios(), /compilación propia/);
  assert.equal(cargado, antes);
});
