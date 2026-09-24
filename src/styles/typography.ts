import { TextStyle } from 'react-native';
import { colors } from './colors';

/** Estilos de texto reutilizables (Clase 10, Ejercicio 4). */
export const typography: Record<'h1' | 'h2' | 'h3' | 'body' | 'small' | 'label', TextStyle> = {
  h1: { fontSize: 28, fontWeight: '800', color: colors.text },
  h2: { fontSize: 20, fontWeight: '700', color: colors.text },
  h3: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  small: { fontSize: 13, color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
};
