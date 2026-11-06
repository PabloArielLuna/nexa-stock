import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';

export default function Encabezado({ titulo, accion }: { titulo: string; accion?: React.ReactNode }) {
  return (
    <View style={s.row}>
      <View style={s.copy}>
        <Text accessibilityRole="header" style={s.title}>
          {titulo}
        </Text>
      </View>
      {accion}
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 0, paddingBottom: 4 },
  copy: { flex: 1 },
  title: { color: colors.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.6 },
});
