import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { Presupuesto, htmlPresupuesto, presupuestoValido } from '../utils/presupuestos';
import type { MarcaNegocio } from '../types/negocio';
import { abrirFoto } from './fotos';

export type AccionPDF = 'compartir' | 'guardar' | 'correo';

function borrarTemporal(uri: string) {
  try {
    if (uri.startsWith(Paths.cache.uri)) {
      const archivo = new File(uri);
      if (archivo.exists) archivo.delete();
    }
  } catch {
    /* La limpieza no cambia el resultado de guardar o compartir. */
  }
}

function carpetaExportacion() {
  const carpeta = new Directory(Paths.cache, 'nexa-presupuestos');
  carpeta.create({ idempotent: true });
  // Algunos destinos Android consumen adjuntos después de que su intent retorna.
  // Se conservan hasta el próximo uso posterior a 24 h; el SO puede limpiar antes la caché.
  for (const archivo of carpeta.list()) {
    if (!(archivo instanceof File)) continue;
    const creado = /^NEXA-(\d{13})-/.exec(archivo.name);
    if (creado && Date.now() - Number(creado[1]) > 86_400_000) borrarTemporal(archivo.uri);
  }
  return carpeta;
}

export async function exportarPresupuesto(
  p: Presupuesto,
  perfilId: string,
  nombre: string,
  marca: MarcaNegocio,
  accion: AccionPDF,
) {
  if (Platform.OS === 'web') throw new Error('Exportá el PDF desde NEXA en el teléfono.');
  if (!presupuestoValido(p)) throw new Error('Revisá los datos del presupuesto antes de exportarlo.');
  if (accion === 'compartir' && !(await Sharing.isAvailableAsync()))
    throw new Error('No está disponible el menú para compartir archivos.');
  const correo = accion === 'correo' ? await import('expo-mail-composer') : null;
  if (correo && !(await correo.isAvailableAsync()))
    throw new Error(
      'Configurá una cuenta de correo en el teléfono o elegí «Compartir PDF» para usar otra app.',
    );
  let carpetaDestino: Directory | null = null;
  if (accion === 'guardar') {
    try {
      carpetaDestino = await Directory.pickDirectoryAsync();
    } catch (e) {
      const codigo = (e as { code?: string })?.code ?? '';
      if (/CANCEL/i.test(codigo) || (e instanceof Error && /cancelled|canceled/i.test(e.message)))
        return 'Guardado cancelado. La propuesta sigue disponible en NEXA.';
      throw new Error(
        'No pudimos abrir la carpeta. Probá «Compartir PDF» y elegí Archivos o un gestor de archivos.',
      );
    }
  }
  const logo = marca.logo ? await abrirFoto(marca.logo, perfilId) : null;
  if (marca.logo && !logo)
    throw new Error(
      'No pudimos abrir el logo guardado de este perfil. El presupuesto no se exportó sin tu marca. Revisá el membrete antes de reintentar.',
    );
  const html = htmlPresupuesto(p, { ...marca, nombre: marca.nombre || nombre }, logo);
  let temporal: string | null = null;
  let exportado: File | null = null;
  let conservar = false;
  try {
    // WKWebView en iOS no aplica @page de la misma forma que Chromium/Android.
    // El margen nativo asegura el área imprimible; el membrete está en el flujo normal.
    const pdf = await Print.printToFileAsync({
      html,
      width: 595,
      height: 842,
      margins: { top: 36, right: 36, bottom: 36, left: 36 },
    });
    temporal = pdf.uri;
    const nombreArchivo = `NEXA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-Presupuesto-${p.numero}.pdf`;
    exportado = new File(carpetaExportacion(), nombreArchivo);
    await new File(pdf.uri).move(exportado);
    if (carpetaDestino) {
      const destino = carpetaDestino.createFile(nombreArchivo, 'application/pdf');
      try {
        destino.write(await exportado.bytes());
      } catch (e) {
        try {
          if (destino.exists) destino.delete();
        } catch {
          /* Solo la copia parcial recién creada. */
        }
        throw e;
      }
      return `PDF guardado como ${nombreArchivo} en la carpeta que elegiste.`;
    }
    if (correo) {
      // Android devuelve antes de confirmar el envío; no borrar el adjunto todavía.
      conservar = Platform.OS === 'android';
      const resultado = await correo.composeAsync({
        subject: `Presupuesto ${p.numero} · ${marca.nombre || nombre}`,
        body: `Hola,\n\nAdjunto el presupuesto ${p.numero}.\n\nSaludos,\n${marca.nombre || nombre}`,
        isHtml: false,
        attachments: [exportado.uri],
      });
      if (Platform.OS === 'android')
        return 'Se abrió el correo con el PDF adjunto. Elegí destinatario y confirmá el envío allí; NEXA no puede comprobar si se envió.';
      if (resultado.status === correo.MailComposerStatus.CANCELLED)
        return 'Correo cancelado. La propuesta sigue guardada en NEXA.';
      if (resultado.status === correo.MailComposerStatus.SAVED) {
        conservar = true;
        return 'El correo quedó como borrador en Mail. Revisalo allí para enviarlo.';
      }
      return resultado.status === correo.MailComposerStatus.SENT
        ? 'Mail aceptó el envío. NEXA no confirma la entrega al destinatario.'
        : 'Revisá el estado del mensaje en tu aplicación de correo.';
    }
    conservar = true;
    await Sharing.shareAsync(exportado.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Compartir PDF · Elegí WhatsApp, correo u otra app',
    });
    return 'Se abrió el menú para compartir. Elegí WhatsApp, correo o Archivos y completá la acción allí. NEXA no confirma el envío.';
  } finally {
    if (temporal) borrarTemporal(temporal);
    if (exportado && !conservar) borrarTemporal(exportado.uri);
  }
}
