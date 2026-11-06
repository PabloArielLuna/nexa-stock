import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAccesoViewModel } from '../viewmodels/useAccesoViewModel';
import { etiquetaBiometria, iconoBiometria } from '../services/dispositivo';
import BotonPrimario from '../components/BotonPrimario';
import Ayuda from '../components/Ayuda';
import { colors } from '../styles/colors';
export default function PerfilesScreen() {
  const vm = useAccesoViewModel();
  const creando = vm.modo === 'crear';
  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={s.brandRow}>
            <View style={s.logo}>
              <Ionicons name="layers-outline" size={23} color={colors.onPrimary} />
            </View>
            <Text style={s.brand}>NEXA</Text>
          </View>
          <View style={s.card}>
            <View style={s.tabs}>
              {(['ingresar', 'crear'] as const).map((modo) => (
                <TouchableOpacity
                  key={modo}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: vm.modo === modo, disabled: vm.guardando }}
                  disabled={vm.guardando}
                  style={[s.tab, vm.modo === modo && s.active]}
                  onPress={() => vm.cambiarModo(modo)}
                >
                  <Text style={[s.tabText, vm.modo === modo && s.activeText]}>
                    {modo === 'ingresar' ? 'Ingresar' : 'Crear cuenta'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text accessibilityRole="header" style={s.heading}>
              {creando ? 'Creá tu cuenta' : 'Bienvenido'}
            </Text>
            {!creando && vm.perfiles.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.profiles}
              >
                {vm.perfiles.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Usar cuenta ${p.nombre}`}
                    onPress={() => vm.elegir(p)}
                    disabled={vm.guardando}
                    style={s.profile}
                  >
                    <Text style={s.profileText}>{p.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <View style={s.field}>
              <Text style={s.label}>Usuario o negocio</Text>
              <TextInput
                accessibilityLabel="Usuario o negocio"
                placeholder="Tu nombre o negocio"
                placeholderTextColor={colors.textLight}
                value={vm.nombre}
                maxLength={60}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!vm.guardando}
                onChangeText={vm.setNombre}
                style={s.input}
              />
            </View>
            <View style={s.field}>
              <Text style={s.label}>PIN de 6 dígitos</Text>
              <TextInput
                accessibilityLabel="PIN de seis dígitos"
                placeholder="••••••"
                placeholderTextColor={colors.textLight}
                value={vm.pin}
                secureTextEntry
                keyboardType="number-pad"
                maxLength={6}
                editable={!vm.guardando}
                onChangeText={(v) => vm.setPin(v.replace(/\D/g, ''))}
                onSubmitEditing={() => {
                  if (vm.puedeEnviar && !creando) void vm.enviar();
                }}
                style={s.input}
              />
            </View>
            {creando && (
              <View style={s.field}>
                <Text style={s.label}>Repetí el PIN</Text>
                <TextInput
                  accessibilityLabel="Repetir PIN"
                  placeholder="••••••"
                  placeholderTextColor={colors.textLight}
                  value={vm.confirmacion}
                  secureTextEntry
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!vm.guardando}
                  onChangeText={(v) => vm.setConfirmacion(v.replace(/\D/g, ''))}
                  style={s.input}
                />
              </View>
            )}
            {!!(vm.error || vm.errorSesion) && (
              <Text accessibilityRole="alert" style={s.error}>
                {vm.error || vm.errorSesion}
              </Text>
            )}
            <BotonPrimario
              label={creando ? 'Crear cuenta' : 'Ingresar'}
              icono="arrow-forward"
              cargando={vm.guardando}
              deshabilitado={!vm.puedeEnviar}
              onPress={() => void vm.enviar()}
            />
            {!creando && vm.seleccionado?.biometria && Platform.OS !== 'web' && (
              <BotonPrimario
                label={`Ingresar con ${etiquetaBiometria}`}
                icono={iconoBiometria}
                variante="secundario"
                cargando={vm.guardando}
                onPress={() => void vm.enviar(true)}
              />
            )}
            <Ayuda
              titulo="Tu cuenta local"
              mensaje={
                Platform.OS === 'web'
                  ? 'La cuenta y el inventario se guardan cifrados en este navegador. No se sincronizan con otros navegadores o celulares. Guardá tu PIN: no tiene recuperación por correo. Borrar los datos del sitio puede eliminar la cuenta y su inventario; exportá una copia antes.'
                  : 'La cuenta y el inventario se guardan cifrados en este teléfono. No se sincronizan con otros dispositivos. Guardá tu PIN: no tiene recuperación por correo. Exportá una copia antes de desinstalar NEXA.'
              }
              label="Sobre tu cuenta"
            />
          </View>
          <BotonPrimario
            label="Entrar como invitado"
            variante="secundario"
            icono="compass-outline"
            deshabilitado={vm.guardando}
            onPress={vm.explorar}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 28,
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
    gap: 18,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { color: colors.text, fontSize: 23, fontWeight: '800', letterSpacing: 3 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    gap: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabs: { flexDirection: 'row', gap: 4, backgroundColor: colors.background, borderRadius: 12, padding: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 9 },
  active: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  activeText: { color: colors.onPrimary },
  heading: { color: colors.text, fontSize: 23, fontWeight: '700' },
  field: { gap: 7 },
  label: { color: colors.textMuted, fontSize: 13 },
  input: {
    color: colors.text,
    padding: 13,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  error: { color: colors.error, fontSize: 13, lineHeight: 20 },
  profiles: { gap: 8 },
  profile: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
  },
  profileText: { color: colors.primary, fontSize: 12 },
});
