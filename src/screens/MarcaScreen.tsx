import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VentasStackParamList } from '../types/navigation';
import { useMarcaViewModel } from '../viewmodels/useMarcaViewModel';
import CampoTexto from '../components/CampoTexto';
import BotonPrimario from '../components/BotonPrimario';
import FotoProducto from '../components/FotoProducto';
import PantallaCarga from '../components/PantallaCarga';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/global';
export default function MarcaScreen({ navigation }: NativeStackScreenProps<VentasStackParamList, 'Marca'>) {
  const vm = useMarcaViewModel();
  if (vm.cargando) return <PantallaCarga />;
  return (
    <KeyboardAvoidingView
      style={globalStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={globalStyles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Tu marca, en cada propuesta.</Text>
        <Text style={s.body}>
          Estos datos aparecen en el encabezado y pie de tus presupuestos. Se guardan protegidos en tu perfil.
        </Text>
        <View style={[globalStyles.card, s.fields]}>
          <CampoTexto
            label="Nombre del negocio *"
            value={vm.form.nombre}
            maxLength={60}
            onChangeText={(v) => vm.setForm((f) => ({ ...f, nombre: v }))}
          />
          <CampoTexto
            label="Contacto"
            placeholder="Teléfono, email o sitio web"
            value={vm.form.contacto}
            maxLength={120}
            onChangeText={(v) => vm.setForm((f) => ({ ...f, contacto: v }))}
          />
          <CampoTexto
            label="Dirección / datos del membrete"
            value={vm.form.direccion}
            maxLength={160}
            onChangeText={(v) => vm.setForm((f) => ({ ...f, direccion: v }))}
          />
          <CampoTexto
            label="Texto del pie"
            value={vm.form.pie}
            maxLength={180}
            onChangeText={(v) => vm.setForm((f) => ({ ...f, pie: v }))}
          />
        </View>
        <View style={[globalStyles.card, s.fields]}>
          <Text style={s.heading}>Logo opcional</Text>
          <FotoProducto uri={vm.form.logo} categoria="otros" tamanio={80} />
          <BotonPrimario
            label="Cargar logo de la galería"
            variante="secundario"
            icono="image-outline"
            deshabilitado={vm.ocupado}
            onPress={() => void vm.elegirLogo()}
          />
          {vm.form.logo && (
            <BotonPrimario
              label="Quitar logo"
              variante="secundario"
              onPress={() => vm.setForm((f) => ({ ...f, logo: null }))}
            />
          )}
        </View>
        {!!vm.error && (
          <Text accessibilityRole="alert" style={s.error}>
            {vm.error}
          </Text>
        )}
        <BotonPrimario
          label="Guardar marca"
          icono="checkmark-outline"
          cargando={vm.ocupado}
          deshabilitado={!vm.puedeGuardar}
          onPress={() => {
            void vm.guardar().then((ok) => {
              if (ok) navigation.goBack();
            });
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  title: { color: colors.text, fontSize: 29, fontWeight: '700', letterSpacing: -1 },
  body: { color: colors.textMuted, lineHeight: 23 },
  fields: { gap: 20 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '600' },
  error: { color: colors.error, lineHeight: 22 },
});
