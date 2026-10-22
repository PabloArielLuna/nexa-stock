import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

export default function Encabezado({
  titulo,
  detalle,
  accion,
}: {
  titulo: string;
  detalle: string;
  accion?: React.ReactNode;
}) {
  return (
    <View style={s.row}>
      <View style={s.copy}>
        <Text style={s.eyebrow}>
          NEXA <Text style={s.workspace}>/ WORKSPACE</Text>
        </Text>
        <Text accessibilityRole="header" style={s.title}>
          {titulo}
        </Text>
        <Text style={s.detail}>{detalle}</Text>
      </View>
      {accion}
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 8 },
  copy: { flex: 1 },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 3 },
  workspace: { color: colors.textLight, fontWeight: '500', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 34, fontWeight: '700', letterSpacing: -1.3, marginTop: 20 },
  detail: { color: colors.textMuted, fontSize: 14, marginTop: 7, lineHeight: 21 },
});
