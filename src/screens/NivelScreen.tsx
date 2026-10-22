import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BotonPrimario from '../components/BotonPrimario';
import { useNivelViewModel } from '../viewmodels/useNivelViewModel';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/global';
export default function NivelScreen() {
  const vm = useNivelViewModel();
  const color = vm.nivelado ? colors.accent : colors.primary;
  const referencia = vm.referencia.lateral !== 0 || vm.referencia.frontal !== 0;
  return (
    <ScrollView style={globalStyles.screen} contentContainerStyle={globalStyles.scrollContent}>
      <Text style={s.title}>Cada cosa, bien apoyada.</Text>
      <Text style={s.body}>
        Apoyá el celular plano sobre la estantería para revisar su inclinación. El acelerómetro mide el
        ángulo; el giroscopio ayuda a detectar movimiento.
      </Text>
      <View style={[globalStyles.card, s.center]}>
        <Text style={[s.state, { color }]}>
          {!vm.activo
            ? 'SENSORES EN PAUSA'
            : !vm.lectura
              ? 'ESPERANDO LECTURA'
              : !vm.lectura.estable
                ? 'MANTENÉ EL TELÉFONO QUIETO'
                : vm.nivelado
                  ? 'DENTRO DE ±1,5°'
                  : 'AJUSTÁ LA INCLINACIÓN'}
        </Text>
        <View style={s.level}>
          <View style={s.horizontal} />
          <View style={s.vertical} />
          <View style={s.target} />
          <View
            style={[
              s.bubble,
              {
                backgroundColor: color,
                transform: [
                  { translateX: vm.lectura ? Math.max(-75, Math.min(75, vm.lateral * 3)) : 0 },
                  { translateY: vm.lectura ? Math.max(-75, Math.min(75, -vm.frontal * 3)) : 0 },
                ],
              },
            ]}
          >
            <Ionicons name={vm.nivelado ? 'checkmark' : 'add'} size={25} color={colors.onPrimary} />
          </View>
        </View>
        <View style={s.row}>
          <View style={s.metric}>
            <Text style={s.body}>Lateral</Text>
            <Text style={s.angle}>{vm.lectura ? `${vm.lateral.toFixed(1)}°` : '—'}</Text>
          </View>
          <View style={s.metric}>
            <Text style={s.body}>Frontal</Text>
            <Text style={s.angle}>{vm.lectura ? `${vm.frontal.toFixed(1)}°` : '—'}</Text>
          </View>
        </View>
        <Text style={s.caption}>
          {referencia ? 'Medición relativa a tu referencia.' : 'Medición respecto de la horizontal.'}
          {vm.activo ? ` ${vm.gyro ? 'Acelerómetro + giroscopio.' : 'Solo acelerómetro disponible.'}` : ''}
        </Text>
      </View>
      {!!vm.error && (
        <Text accessibilityRole="alert" style={s.error}>
          {vm.error}
        </Text>
      )}
      <BotonPrimario
        label={vm.activo ? 'Pausar sensores' : 'Iniciar nivel'}
        icono={vm.activo ? 'pause-outline' : 'speedometer-outline'}
        cargando={vm.ocupado}
        onPress={() => {
          if (vm.activo) vm.parar();
          else void vm.iniciar();
        }}
      />
      <BotonPrimario
        label="Usar esta posición como referencia"
        variante="secundario"
        deshabilitado={!vm.activo || !vm.lectura?.estable}
        onPress={vm.calibrar}
      />
      {referencia && (
        <BotonPrimario label="Volver a la horizontal" variante="secundario" onPress={vm.restablecer} />
      )}
      <Text style={s.caption}>
        Referencia orientativa. La funda y el relieve de la cámara pueden alterar el apoyo. Los sensores se
        pausan al salir de esta pantalla y sus lecturas no se guardan.
      </Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  title: { color: colors.text, fontSize: 29, fontWeight: '700', letterSpacing: -1 },
  body: { color: colors.textMuted, fontSize: 14, lineHeight: 23 },
  center: { alignItems: 'center', gap: 24, paddingVertical: 26 },
  state: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textAlign: 'center' },
  level: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  horizontal: { position: 'absolute', height: 1, width: '90%', backgroundColor: colors.border },
  vertical: { position: 'absolute', width: 1, height: '90%', backgroundColor: colors.border },
  target: { width: 65, height: 65, borderRadius: 33, borderWidth: 1, borderColor: colors.primary },
  bubble: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: 50 },
  metric: { alignItems: 'center', gap: 8 },
  angle: { fontSize: 29, fontWeight: '600', color: colors.text },
  caption: { fontSize: 12, color: colors.textMuted, lineHeight: 21, textAlign: 'center' },
  error: { color: colors.error, lineHeight: 22 },
});
