import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRespaldoViewModel } from '../viewmodels/useRespaldoViewModel';
import BotonPrimario from '../components/BotonPrimario';
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
        <Text style={s.title}>Tu inventario, a salvo.</Text>
        <Text style={s.body}>
          Guardá una copia cifrada fuera de NEXA para cambiar de celular o pasar de Expo Go a tu app
          instalada.
        </Text>
        <View style={[globalStyles.card, { gap: 16 }]}>
          <Text style={s.heading}>Qué incluye esta copia</Text>
          <Text style={s.body}>
            Productos, SKU, precios, costos, stock, fotos, etiquetas QR, ventas activas y anuladas,
            movimientos, marca, logo, presupuestos guardados y borrador. No incluye perfiles, PIN ni archivos
            PDF ya compartidos; las propuestas se pueden volver a generar.
          </Text>
          <Text style={s.body}>
            Elegí una contraseña diferente del PIN, de 12 a 128 caracteres. Necesitarás el archivo y esa
            contraseña para recuperar los datos. NEXA no guarda ni recupera esta contraseña.
          </Text>
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
          <Text style={s.body}>
            Elegí Guardar en Archivos u otro destino del teléfono y verificá que el archivo .nexa se haya
            guardado. Tamaño máximo: 30 MB. No es una copia automática en la nube.
          </Text>
        </View>
        <View style={[globalStyles.card, { gap: 16 }]}>
          <Text style={s.heading}>Recuperar una copia</Text>
          <Text style={s.body}>
            Ingresá su contraseña arriba y seleccioná el archivo. Primero verás un resumen; todavía no
            modifica tu inventario. Para confirmar la restauración necesitás un perfil sin productos ni
            ventas.
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
  title: { fontSize: 30, color: colors.text, fontWeight: '700' },
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
