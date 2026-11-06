import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRespaldoViewModel } from '../viewmodels/useRespaldoViewModel';
import BotonPrimario from '../components/BotonPrimario';
import Ayuda from '../components/Ayuda';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/global';
import { confirmar } from '../utils/dialogos';

export default function RespaldoScreen() {
  const vm = useRespaldoViewModel();
  return (
    <KeyboardAvoidingView
      style={globalStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={globalStyles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Copias de seguridad</Text>
        <View style={[globalStyles.card, { gap: 16 }]}>
          <Text style={s.heading}>Exportar copia</Text>
          <Text style={s.body}>Contraseña de 12 a 128 caracteres. Guardala: no se recupera.</Text>
          <TextInput
            accessibilityLabel="Contraseña de la copia"
            placeholder="Contraseña de la copia"
            placeholderTextColor={colors.textLight}
            style={s.input}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={128}
            value={vm.clave}
            editable={!vm.ocupado}
            onChangeText={vm.setClave}
          />
          <TextInput
            accessibilityLabel="Repetir contraseña para exportar"
            placeholder="Repetí la contraseña para exportar"
            placeholderTextColor={colors.textLight}
            style={s.input}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={128}
            value={vm.repeticion}
            editable={!vm.ocupado}
            onChangeText={vm.setRepeticion}
          />
          <BotonPrimario
            label="Exportar copia cifrada"
            icono="save-outline"
            cargando={vm.ocupado}
            deshabilitado={!vm.puedeExportar}
            onPress={() => void vm.exportar()}
          />
          <Ayuda
            label="Qué incluye la copia"
            titulo="Copia cifrada"
            mensaje="Incluye inventario, fotos, QR, ventas, movimientos, marca, logo y propuestas. No incluye PIN ni PDFs exportados. Guardá el archivo .nexa y su contraseña fuera de NEXA. Límite: 30 MB. No es una copia automática en la nube."
          />
        </View>
        <View style={[globalStyles.card, { gap: 16 }]}>
          <Text style={s.heading}>Recuperar una copia</Text>
          <Text style={s.body}>
            Ingresá la contraseña de la copia arriba. La restauración requiere un perfil vacío.
          </Text>
          <BotonPrimario
            label="Seleccionar y verificar copia"
            variante="secundario"
            icono="folder-open-outline"
            deshabilitado={!vm.puedeLeer || vm.ocupado}
            onPress={() => void vm.leer()}
          />
          {vm.copia && (
            <>
              <Text style={s.body}>
                Copia del {new Date(vm.copia.creadoEn).toLocaleString('es-AR')}
                {'\n'}
                {vm.copia.datos.productos.length} productos · {vm.copia.datos.ventas.length} ventas ·{' '}
                {vm.copia.imagenes.length} fotos
                {'\n'}
                {vm.copia.datos.movimientos?.length ?? 0} movimientos ·{' '}
                {vm.copia.datos.negocio?.presupuestos.length ?? 0} presupuestos
                {'\n'}Marca: {vm.copia.datos.negocio?.marca.nombre || 'Sin marca'}
                {vm.copia.version === 1 &&
                  '\nCopia antigua: puede no incluir marca, presupuestos o movimientos.'}
              </Text>
              <BotonPrimario
                label="Restaurar en este perfil vacío"
                deshabilitado={!vm.puedeRestaurar || vm.ocupado}
                onPress={() =>
                  confirmar({
                    titulo: 'Restaurar inventario',
                    mensaje:
                      'Se cargarán los datos verificados del negocio, incluidas marca y propuestas cuando estén presentes. El perfil debe estar vacío. Otros perfiles no se modifican.',
                    textoConfirmar: 'Restaurar',
                    onConfirmar: () => void vm.restaurar(),
                  })
                }
              />
            </>
          )}
        </View>
        {!!vm.error && (
          <Text accessibilityRole="alert" style={s.error}>
            {vm.error}
          </Text>
        )}
        {!!vm.mensaje && (
          <Text accessibilityLiveRegion="polite" style={s.body}>
            {vm.mensaje}
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  title: { fontSize: 24, color: colors.text, fontWeight: '700' },
  heading: { fontSize: 20, color: colors.text, fontWeight: '600' },
  body: { color: colors.textMuted, lineHeight: 23 },
  input: {
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  error: { color: colors.error, lineHeight: 23 },
});
