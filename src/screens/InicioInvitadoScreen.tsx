import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Encabezado from '../components/Encabezado';
import BotonPrimario from '../components/BotonPrimario';
import { RootTabParamList } from '../types/navigation';
import { colors } from '../styles/colors';
import { usePerfil } from '../context/PerfilContext';
import InicioScreen from './InicioScreen';

export default function InicioInvitadoScreen(props: BottomTabScreenProps<RootTabParamList, 'Inicio'>) {
  const { navigation } = props;
  const { salir } = usePerfil();
  const [verPanel, setVerPanel] = useState(false);
  if (verPanel)
    return (
      <View style={s.root}>
        <BotonPrimario
          label="Volver a la presentación"
          variante="secundario"
          onPress={() => setVerPanel(false)}
        />
        <InicioScreen {...props} />
      </View>
    );
  return (
    <ScrollView style={s.root} contentContainerStyle={s.page}>
      <Encabezado titulo="El siguiente nivel." detalle="Conocé NEXA. Tu negocio puede ir más lejos." />
      <LinearGradient colors={['#2457FF', '#1336BA']} style={s.hero}>
        <View style={s.badge}>
          <View style={s.dot} />
          <Text style={s.tag}>EXPLORÁ SIN INICIAR SESIÓN</Text>
        </View>
        <Ionicons name="layers-outline" size={52} color={colors.white} />
        <Text style={s.title}>Todo empieza con un buen catálogo.</Text>
        <Text style={s.heroText}>
          Descubrí productos de ejemplo, buscá por categoría y abrí sus fichas con un QR.
        </Text>
      </LinearGradient>
      <BotonPrimario
        label="Explorar catálogo"
        icono="cube-outline"
        onPress={() => navigation.navigate('InventarioTab', { screen: 'ListaProductos' })}
      />
      <BotonPrimario
        label="Ver dashboard con datos de ejemplo"
        variante="secundario"
        icono="grid-outline"
        onPress={() => setVerPanel(true)}
      />
      <View style={s.card}>
        <Text style={s.heading}>Un espacio que es solo tuyo.</Text>
        <Text style={s.body}>
          Con sesión iniciada tenés inventario propio, ventas, costos y análisis. El catálogo de ejemplo no
          muestra datos de otros usuarios.
        </Text>
        <View style={s.feature}>
          <Ionicons name="shield-checkmark-outline" size={23} color={colors.accent} />
          <Text style={s.body}>Datos cifrados en la app del celular</Text>
        </View>
        <View style={s.feature}>
          <Ionicons name="scan-outline" size={23} color={colors.accent} />
          <Text style={s.body}>Face ID o huella, con PIN alternativo</Text>
        </View>
        <BotonPrimario
          label="Crear mi espacio o ingresar"
          variante="secundario"
          icono="arrow-forward"
          onPress={salir}
        />
      </View>
      <Text style={s.foot}>CATÁLOGO DE DEMOSTRACIÓN · SOLO LECTURA</Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  page: { padding: 24, gap: 24, maxWidth: 760, width: '100%', alignSelf: 'center', paddingBottom: 36 },
  hero: { padding: 26, borderRadius: 26, gap: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, backgroundColor: colors.accent, borderRadius: 3 },
  tag: { color: '#DFE7FF', letterSpacing: 1, fontSize: 10 },
  title: { fontSize: 35, fontWeight: '700', letterSpacing: -1, lineHeight: 40, color: colors.white },
  heroText: { color: '#DFE7FF', fontSize: 15, lineHeight: 25 },
  card: {
    backgroundColor: colors.surface,
    padding: 24,
    gap: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: { color: colors.text, fontSize: 23, fontWeight: '600' },
  body: { color: colors.textMuted, fontSize: 14, lineHeight: 23, flexShrink: 1 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  foot: { color: colors.textLight, fontSize: 10, letterSpacing: 1.5, textAlign: 'center' },
});
