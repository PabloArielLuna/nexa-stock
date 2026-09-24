import React, { useState } from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { radius, spacing } from '../styles/global';
import { typography } from '../styles/typography';

type Props = {
  label: string;
  value: string;
  onChangeText: (texto: string) => void;
  onBlur?: () => void;
  error?: string; // si viene, el campo se pinta de rojo y muestra el mensaje
  placeholder?: string;
  prefijo?: string; // ej: "$" para precios
  ayuda?: string; // texto gris debajo cuando no hay error
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
};

/**
 * Input controlado (Clase 7): el valor vive en el estado del padre
 * (value + onChangeText). Este componente sólo lo dibuja y da
 * feedback visual: borde violeta con foco, rojo con error.
 */
const CampoTexto: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  prefijo,
  ayuda,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
}) => {
  // Estado local sólo visual: ¿el campo tiene el foco?
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={styles.contenedor}>
      <Text style={typography.label}>{label}</Text>
      <View style={[styles.caja, enfocado && styles.cajaEnfocada, !!error && styles.cajaError]}>
        {prefijo && <Text style={styles.prefijo}>{prefijo}</Text>}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setEnfocado(true)}
          onBlur={() => {
            setEnfocado(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          accessibilityLabel={label}
        />
      </View>
      {error ? (
        <View style={styles.filaError}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.textoError}>{error}</Text>
        </View>
      ) : (
        ayuda && <Text style={typography.small}>{ayuda}</Text>
      )}
    </View>
  );
};

export default CampoTexto;

const styles = StyleSheet.create({
  // minWidth: 0 deja que el campo se achique cuando van dos en la misma fila
  contenedor: { gap: 6, flex: 1, minWidth: 0 },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  cajaEnfocada: { borderColor: colors.primary },
  cajaError: { borderColor: colors.error, backgroundColor: colors.errorLight },
  prefijo: { fontSize: 16, color: colors.textMuted, marginRight: 6, fontWeight: '600' },
  input: { flex: 1, minWidth: 0, fontSize: 16, color: colors.text, paddingVertical: spacing.sm },
  filaError: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  textoError: { fontSize: 13, color: colors.error, fontWeight: '500' },
});
