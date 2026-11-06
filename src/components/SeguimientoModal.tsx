import React from 'react';
import { Modal, View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSeguimientoViewModel } from '../viewmodels/useSeguimientoViewModel';
import BotonPrimario from './BotonPrimario';
import { colors } from '../styles/colors';

export default function SeguimientoModal({ vm }: { vm: ReturnType<typeof useSeguimientoViewModel> }) {
  return (
    <Modal transparent visible={vm.numero !== null} animationType="fade" onRequestClose={vm.cerrar}>
      <View style={s.fondo}>
        <View style={s.card}>
          <ScrollView contentContainerStyle={s.contenido}>
            <Text style={s.titulo}>Agendar seguimiento</Text>
            <Text style={s.texto}>Seguimiento de {vm.numero}</Text>
            {vm.limitacionCalendario ? (
              <Text style={s.texto}>{vm.limitacionCalendario}</Text>
            ) : (
              <>
                <Text style={s.texto}>
                  Elegí fecha, hora y calendario en el formulario del teléfono. Proponemos mañana a las 10:00,
                  durante 30 minutos. Revisá también el aviso antes de guardar.
                </Text>
                <Text style={s.texto}>
                  Solo se copia el número de presupuesto. El evento queda fuera de la protección de NEXA y
                  puede sincronizarse con la cuenta del calendario elegido.
                </Text>
                {!vm.destinos.length ? (
                  <BotonPrimario
                    label="Continuar"
                    icono="calendar-outline"
                    cargando={vm.ocupado}
                    onPress={() => void vm.cargar()}
                  />
                ) : (
                  vm.destinos.map((c) => (
                    <BotonPrimario
                      key={c.id}
                      label={c.titulo}
                      icono="calendar-outline"
                      cargando={vm.ocupado}
                      onPress={() => void vm.agendar(c.id)}
                    />
                  ))
                )}
              </>
            )}
            {!!vm.error && (
              <Text accessibilityRole="alert" style={{ color: colors.error }}>
                {vm.error}
              </Text>
            )}
            <BotonPrimario
              label="Cerrar"
              variante="secundario"
              deshabilitado={vm.ocupado}
              onPress={vm.cerrar}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const s = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#000B', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    maxHeight: '85%',
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  contenido: { padding: 24, gap: 18 },
  titulo: { color: colors.text, fontSize: 26, fontWeight: '700' },
  texto: { color: colors.textMuted, lineHeight: 22 },
});
