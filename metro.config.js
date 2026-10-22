const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
if (process.platform === 'win32') {
  // OneDrive puede marcar archivos de este paquete de herramientas como reparse points.
  // No forma parte de la app: evitar su rastreo impide readlink(EINVAL) al reutilizar la caché.
  const previas = config.resolver.blockList;
  config.resolver.blockList = [
    ...(Array.isArray(previas) ? previas : previas ? [previas] : []),
    /[/\\]node_modules[/\\]@expo[/\\]devcert[/\\]/,
  ];
}
module.exports = config;
