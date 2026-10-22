import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAccesoViewModel } from '../viewmodels/useAccesoViewModel';
import { etiquetaBiometria, iconoBiometria } from '../services/dispositivo';

import BotonPrimario from '../components/BotonPrimario';
import { colors } from '../styles/colors';

export default function PerfilesScreen() {
  const vm = useAccesoViewModel();
  const { nombre, setNombre, pin, setPin, seleccionado, error, guardando, repetido, crear } = vm;
  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={s.logo}>
            <Ionicons name="layers-outline" size={30} color={colors.onPrimary} />
          </View>
          <Text style={s.brand}>NEXA</Text>
          <Text style={s.title}>Tu negocio.{'\n'}El siguiente nivel.</Text>
          <Text style={s.body}>
            Menos vueltas. Más control. Tu inventario y tus ventas, en un solo lugar.
          </Text>
          <View style={s.card}>
            {!vm.accesoDisponible && (
              <Text style={s.body}>
                Esta es la vista previa web. Explorá el catálogo como invitado; el acceso y el guardado
                protegido están disponibles desde Expo Go en tu celular.
              </Text>
            )}
            <Text style={s.heading}>
              {seleccionado ? `Hola, ${seleccionado.nombre}` : 'Tu espacio empieza acá'}
            </Text>
            {!seleccionado &&
              vm.perfiles.map((p) => (
                <BotonPrimario
                  key={p.id}
                  variante="secundario"
                  icono="person-outline"
                  label={`Ingresar como ${p.nombre}`}
                  onPress={() => {
                    vm.elegir(p);
                  }}
                />
              ))}
            <Text style={s.label}>{seleccionado ? 'INGRESÁ TU PIN LOCAL' : 'CREAR UN USUARIO LOCAL'}</Text>
            {!seleccionado && (
              <TextInput
                accessibilityLabel="Nombre del perfil"
                placeholder="Tu nombre o tu negocio"
                placeholderTextColor={colors.textLight}
                value={nombre}
                maxLength={40}
                onChangeText={setNombre}
                style={s.input}
              />
            )}
            <TextInput
              accessibilityLabel="PIN de seis dígitos"
              placeholder="PIN de 6 dígitos"
              placeholderTextColor={colors.textLight}
              value={pin}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(v) => setPin(v.replace(/\D/g, ''))}
              style={s.input}
            />
            {(error || vm.errorSesion || repetido) && (
              <Text style={s.error}>{error || vm.errorSesion || 'Ya existe un perfil con ese nombre.'}</Text>
            )}
            <BotonPrimario
              label={seleccionado ? 'Iniciar sesión' : 'Crear mi espacio'}
              icono="arrow-forward"
              cargando={guardando}
              deshabilitado={!vm.puedeEnviar}
              onPress={() => void crear()}
            />
            {seleccionado?.biometria && Platform.OS !== 'web' && (
              <BotonPrimario
                label={`Ingresar con ${etiquetaBiometria}`}
                icono={iconoBiometria}
                variante="secundario"
                cargando={guardando}
                onPress={() => void vm.ingresarConBiometria()}
              />
            )}
            {seleccionado && (
              <BotonPrimario
                label="Volver"
                variante="secundario"
                deshabilitado={guardando}
                onPress={() => {
                  vm.elegir(null);
                }}
              />
            )}
          </View>
          <BotonPrimario
            label="Explorar como invitado"
            variante="secundario"
            icono="compass-outline"
            deshabilitado={guardando}
            onPress={vm.explorar}
          />
          <Text style={s.foot}>
            TU INVENTARIO SE GUARDA CIFRADO EN EL CELULAR.{'\n'}El invitado solo accede a un catálogo de
            ejemplo.{'\n'}Elegí un PIN que recuerdes: no hay recuperación por correo.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 28, paddingVertical: 48, maxWidth: 520, width: '100%', alignSelf: 'center', gap: 20 },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: colors.primary, fontSize: 16, fontWeight: '900', letterSpacing: 6 },
  title: { color: colors.text, fontSize: 42, lineHeight: 47, letterSpacing: -1.8, fontWeight: '700' },
  body: { color: colors.textMuted, fontSize: 16, lineHeight: 25 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: { color: colors.text, fontSize: 20, fontWeight: '600' },
  label: { color: colors.textLight, fontSize: 11, letterSpacing: 2, marginTop: 10 },
  input: {
    color: colors.text,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  error: { color: colors.error, fontSize: 13 },
  foot: { color: colors.textLight, fontSize: 11, lineHeight: 20, textAlign: 'center', letterSpacing: 1 },
});
