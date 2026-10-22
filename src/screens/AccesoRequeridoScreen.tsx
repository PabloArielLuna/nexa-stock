import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BotonPrimario from '../components/BotonPrimario';
import { usePerfil } from '../context/PerfilContext';
import { colors } from '../styles/colors';

export default function AccesoRequeridoScreen() {
  const { salir } = usePerfil();
  return (
    <View style={s.root}>
      <Ionicons name="lock-closed-outline" size={40} color={colors.primary} />
      <Text style={s.title}>Tu negocio merece su espacio.</Text>
      <Text style={s.body}>
        Iniciá sesión en el celular para administrar productos, registrar ventas y consultar tus números.
      </Text>
      <BotonPrimario label="Ir al acceso" icono="arrow-forward" onPress={salir} />
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: 28, gap: 24, backgroundColor: colors.background },
  title: { fontSize: 30, color: colors.text, fontWeight: '700' },
  body: { fontSize: 15, color: colors.textMuted, lineHeight: 24 },
});
