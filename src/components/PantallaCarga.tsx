import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/global';

/** Se muestra mientras se leen los datos guardados (Clase 11). */
const PantallaCarga: React.FC = () => (
  <View style={[globalStyles.centered, styles.fondo]}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.texto}>Cargando inventario…</Text>
  </View>
);

export default PantallaCarga;

const styles = StyleSheet.create({
  fondo: { backgroundColor: colors.background, gap: 12 },
  texto: { color: colors.textMuted, fontSize: 14 },
});
