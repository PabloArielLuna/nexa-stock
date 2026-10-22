import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Presupuesto, htmlPresupuesto } from '../utils/presupuestos';
import type { MarcaNegocio } from '../types/negocio';
import { abrirFoto } from './fotos';

export async function compartirPresupuesto(
  p: Presupuesto,
  perfilId: string,
  nombre: string,
  marca: MarcaNegocio,
) {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error('No está disponible el menú para compartir archivos.');
  const logo = marca.logo ? await abrirFoto(marca.logo, perfilId) : null;
  const html = htmlPresupuesto(p, { ...marca, nombre: marca.nombre || nombre }, logo);
  let temporal: string | null = null;
  try {
    const pdf = await Print.printToFileAsync({ html, width: 595, height: 842 });
    temporal = pdf.uri;
    await Sharing.shareAsync(pdf.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: `Presupuesto ${p.numero}`,
    });
  } finally {
    if (temporal?.startsWith(Paths.cache.uri)) {
      const archivo = new File(temporal);
      if (archivo.exists) archivo.delete();
    }
  }
}
