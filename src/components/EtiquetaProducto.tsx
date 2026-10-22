import React, { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { codigoProducto } from '../utils/codigos';
import { colors } from '../styles/colors';
import BotonPrimario from './BotonPrimario';
import { avisar } from '../utils/dialogos';

export default function EtiquetaProducto({ id, nombre, sku }: { id: string; nombre: string; sku?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={s.card}>
      <Text style={s.title}>Una etiqueta. Acceso directo.</Text>
      <Text style={s.body}>Escaneá este QR desde NEXA para encontrar el producto en tu inventario.</Text>
      <BotonPrimario
        label={visible ? 'Ocultar etiqueta' : 'Ver etiqueta QR'}
        icono="qr-code-outline"
        variante="secundario"
        onPress={() => setVisible(!visible)}
      />
      {visible && (
        <>
          <View style={s.qr}>
            <QRCode
              value={codigoProducto(id)}
              size={180}
              color="#101210"
              backgroundColor="#FFFFFF"
              quietZone={16}
            />
            <Text style={s.code}>{sku ?? 'SKU pendiente'}</Text>
          </View>
          <Text style={s.body}>
            La etiqueta identifica el producto. No contiene precios ni concede acceso a los datos de otro
            usuario.
          </Text>
          <BotonPrimario
            label="Compartir código"
            icono="share-outline"
            variante="secundario"
            onPress={() => {
              void Share.share({
                message: `${nombre}${sku ? `\nSKU: ${sku}` : ''}\nCódigo NEXA: ${codigoProducto(id)}`,
              }).catch(() => avisar('No se pudo compartir', 'Intentá nuevamente.'));
            }}
          />
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    gap: 16,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '600' },
  body: { color: colors.textMuted, fontSize: 13, lineHeight: 21 },
  qr: { padding: 16, backgroundColor: '#FFF', borderRadius: 18, alignSelf: 'center', alignItems: 'center' },
  code: { color: '#101210', fontSize: 12, marginTop: 10 },
});
