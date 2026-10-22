import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import BotonPrimario from './BotonPrimario';
import { colors } from '../styles/colors';
import { motivoValido } from '../domain/inventario/movimientos';
export default function MotivoModal({
  visible,
  titulo,
  detalle,
  onCancelar,
  onConfirmar,
}: {
  visible: boolean;
  titulo: string;
  detalle: string;
  onCancelar: () => void;
  onConfirmar: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');
  const enviando = useRef(false);
  useEffect(() => {
    if (visible) {
      setMotivo('');
      setError('');
      enviando.current = false;
    }
  }, [visible]);
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancelar}>
      <KeyboardAvoidingView style={s.fondo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.card}>
          <Text style={s.titulo}>{titulo}</Text>
          <Text style={s.texto}>{detalle}</Text>
          <TextInput
            accessibilityLabel="Motivo de la operación"
            placeholder="Motivo (3 a 200 caracteres)"
            placeholderTextColor={colors.textLight}
            style={s.input}
            multiline
            maxLength={200}
            value={motivo}
            onChangeText={setMotivo}
          />
          {!!error && (
            <Text accessibilityRole="alert" style={{ color: colors.error }}>
              {error}
            </Text>
          )}
          <BotonPrimario
            label="Confirmar y registrar"
            deshabilitado={!motivoValido(motivo)}
            onPress={() => {
              if (enviando.current) return;
              enviando.current = true;
              try {
                onConfirmar(motivo.trim());
                onCancelar();
              } catch (e) {
                setError(e instanceof Error ? e.message : 'No se pudo completar la operación.');
                enviando.current = false;
              }
            }}
          />
          <BotonPrimario label="Cancelar" variante="secundario" onPress={onCancelar} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
const s = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#000B', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 18,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  titulo: { color: colors.text, fontSize: 23, fontWeight: '700' },
  texto: { color: colors.textMuted, lineHeight: 22 },
  input: {
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
  },
});
