const fs = require('node:fs');
const path = require('node:path');
const raiz = path.resolve(__dirname, '..', 'dist', '_expo', 'static', 'js');
const vigiladas = ['braces', 'node-forge', 'uuid', 'glob', 'minimatch'];
function mapas(carpeta) {
  return fs
    .readdirSync(carpeta, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? mapas(path.join(carpeta, e.name))
        : e.name.endsWith('.map')
          ? [path.join(carpeta, e.name)]
          : [],
    );
}
function fuentes(mapa) {
  return [...(mapa.sources ?? []), ...(mapa.sections ?? []).flatMap((s) => fuentes(s.map))];
}
const archivos = mapas(raiz);
if (!archivos.length) throw new Error('Primero exportá con --source-maps. No hay mapas para verificar.');
const informe = archivos.map((archivo) => {
  const sources = fuentes(JSON.parse(fs.readFileSync(archivo, 'utf8'))).map((s) => s.replaceAll('\\', '/'));
  if (!sources.length) throw new Error('Un mapa no tiene fuentes verificables.');
  return {
    mapa: path.relative(raiz, archivo),
    fuentes: sources.length,
    presentes: vigiladas.filter((p) =>
      sources.some((s) => s.includes(`/node_modules/${p}/`) || s.startsWith(`node_modules/${p}/`)),
    ),
  };
});
console.log(JSON.stringify({ revisado: new Date().toISOString(), informe }, null, 2));
if (informe.some((r) => r.presentes.length)) process.exitCode = 1;
