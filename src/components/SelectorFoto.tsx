import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoriaId } from '../types/models';
import { colors } from '../styles/colors';
import { radius, spacing } from '../styles/global';
import { typography } from '../styles/typography';
import FotoProducto from './FotoProducto';

type Props = {
  fotoUri: string | null;
  categoria: CategoriaId | null;
  onTomarFoto: () => void;
  onElegirDeGaleria: () => void;
  onQuitar: () => void;
};

/** Vista previa de la foto + botones de cámara, galería y quitar. */
const SelectorFoto: React.FC<Props> = ({ fotoUri, categoria, onTomarFoto, onElegirDeGaleria, onQuitar }) => (
  <View style={styles.contenedor}>
    <Text style={typography.label}>Foto (opcional)</Text>
    <View style={styles.fila}>
      <FotoProducto uri={fotoUri} categoria={categoria ?? 'otros'} tamanio={84} />
      <View style={styles.acciones}>
        <Accion icono="camera" label="Sacar foto" onPress={onTomarFoto} />
        <Accion icono="images" label="Elegir de la galería" onPress={onElegirDeGaleria} />
        {fotoUri && <Accion icono="trash-outline" label="Quitar foto" onPress={onQuitar} peligro />}
      </View>
    </View>
  </View>
);

type AccionProps = {
  icono: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  peligro?: boolean;
};

const Accion: React.FC<AccionProps> = ({ icono, label, onPress, peligro = false }) => {
  const color = peligro ? colors.error : colors.primary;
  return (
    <TouchableOpacity style={styles.accion} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icono} size={17} color={color} />
      <Text style={[styles.textoAccion, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default SelectorFoto;

const styles = StyleSheet.create({
  contenedor: { gap: 6 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  acciones: { flex: 1, gap: spacing.xs },
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  textoAccion: { fontSize: 14, fontWeight: '600' },
});
