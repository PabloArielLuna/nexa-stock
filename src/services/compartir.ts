import { Share } from 'react-native';
import { Producto } from '../types/models';
import { formatoPrecio } from '../utils/formato';

/**
 * Abre el menú nativo de "Compartir" del teléfono (WhatsApp, Instagram, mail…)
 * con un texto listo para mandarle a un cliente.
 */
export const compartirProducto = async (producto: Producto): Promise<void> => {
  const estado = producto.reacondicionado ? 'Reacondicionado' : 'Nuevo';
  const disponibilidad =
    producto.stock > 0 ? '✅ Disponible para entrega inmediata' : '⏳ Sin stock por el momento';

  const mensaje = [
    `🎧 ${producto.nombre} — ${producto.marca}`,
    ...(producto.sku ? [`SKU: ${producto.sku}`] : []),
    `${estado} · ${formatoPrecio(producto.precio)}`,
    disponibilidad,
    '¡Consultame por medios de pago!',
  ].join('\n');

  await Share.share({ message: mensaje });
};
