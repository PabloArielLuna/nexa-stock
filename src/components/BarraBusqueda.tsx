import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radius, spacing } from '../styles/global';

type Props = {
  value: string;
  onChangeText: (texto: string) => void;
  placeholder?: string;
};

/** Buscador con ícono de lupa y botón para borrar. */
const BarraBusqueda: React.FC<Props> = ({ value, onChangeText, placeholder = 'Buscar…' }) => (
  <View style={styles.barra}>
    <Ionicons name="search" size={18} color={colors.textLight} />
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textLight}
      autoCorrect={false}
      accessibilityLabel="Buscar"
    />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Borrar búsqueda">
        <Ionicons name="close-circle" size={18} color={colors.textLight} />
      </TouchableOpacity>
    )}
  </View>
);

export default BarraBusqueda;

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 46,
  },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: spacing.sm },
});
