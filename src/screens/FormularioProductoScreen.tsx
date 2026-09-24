import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BotonPrimario from '../components/BotonPrimario';
import CampoTexto from '../components/CampoTexto';
import ChipFiltro from '../components/ChipFiltro';
import SelectorFoto from '../components/SelectorFoto';
import { colors } from '../styles/colors';
import { globalStyles, radius, spacing } from '../styles/global';
import { typography } from '../styles/typography';
import { InventarioStackParamList } from '../types/navigation';
import { CATEGORIAS } from '../utils/categorias';
import { avisar } from '../utils/dialogos';
import { formatoPrecio, soloNumeros } from '../utils/formato';
import { useFormularioProductoViewModel } from '../viewmodels/useFormularioProductoViewModel';

type Props = NativeStackScreenProps<InventarioStackParamList, 'FormularioProducto'>;

/**
 * VISTA: formulario de alta y edición de productos (la misma pantalla sirve para las dos cosas).
 * Todos los inputs son controlados: value viene del ViewModel y onChangeText llama a setField.
 */
const FormularioProductoScreen: React.FC<Props> = ({ navigation, route }) => {
  const vm = useFormularioProductoViewModel(route.params?.productoId);
  const { form, setField, marcarTocado, errorDe } = vm;

  const onGuardar = () => {
    if (vm.guardar()) {
      navigation.goBack();
      const nombre = form.nombre.trim();
      avisar(
        vm.esEdicion ? 'Cambios guardados' : 'Producto agregado',
        vm.esEdicion ? `Se actualizó "${nombre}".` : `"${nombre}" ya está en tu inventario.`,
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={globalStyles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* --- Datos básicos --- */}
        <View style={[globalStyles.card, styles.seccion]}>
          <Text style={typography.h3}>Datos del producto</Text>

          <CampoTexto
            label="Nombre *"
            value={form.nombre}
            onChangeText={(v) => setField('nombre', v)}
            onBlur={() => marcarTocado('nombre')}
            error={errorDe('nombre')}
            placeholder="Ej: Redmi Buds 6"
            maxLength={50}
          />

          <CampoTexto
            label="Marca *"
            value={form.marca}
            onChangeText={(v) => setField('marca', v)}
            onBlur={() => marcarTocado('marca')}
            error={errorDe('marca')}
            placeholder="Ej: Xiaomi"
            autoCapitalize="words"
            maxLength={30}
          />

          <View style={styles.grupo}>
            <Text style={typography.label}>Categoría *</Text>
            <View style={styles.chips}>
              {CATEGORIAS.map((cat) => (
                <ChipFiltro
                  key={cat.id}
                  label={cat.nombre}
                  icono={cat.icono}
                  color={cat.color}
                  activo={form.categoria === cat.id}
                  onPress={() => {
                    setField('categoria', cat.id);
                    marcarTocado('categoria');
                  }}
                />
              ))}
            </View>
            {errorDe('categoria') && <Text style={styles.error}>{errorDe('categoria')}</Text>}
          </View>

          <View style={styles.filaSwitch}>
            <View style={styles.textosSwitch}>
              <Text style={typography.body}>Reacondicionado</Text>
              <Text style={typography.small}>Equipo usado o reparado, no de caja sellada</Text>
            </View>
            <Switch
              value={form.reacondicionado}
              onValueChange={(v) => setField('reacondicionado', v)}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* --- Precios --- */}
        <View style={[globalStyles.card, styles.seccion]}>
          <Text style={typography.h3}>Precios por unidad</Text>
          <View style={styles.fila}>
            <CampoTexto
              label="Costo *"
              prefijo="$"
              value={form.costo}
              onChangeText={(v) => setField('costo', soloNumeros(v))}
              onBlur={() => marcarTocado('costo')}
              error={errorDe('costo')}
              placeholder="0"
              keyboardType="number-pad"
              maxLength={9}
            />
            <CampoTexto
              label="Precio de venta *"
              prefijo="$"
              value={form.precio}
              onChangeText={(v) => setField('precio', soloNumeros(v))}
              onBlur={() => marcarTocado('precio')}
              error={errorDe('precio')}
              placeholder="0"
              keyboardType="number-pad"
              maxLength={9}
            />
          </View>

          {/* Vista previa calculada: estado derivado del ViewModel */}
          {vm.vistaPrevia && vm.vistaPrevia.ganancia >= 0 && (
            <View style={styles.vistaPrevia}>
              <Text style={styles.textoVistaPrevia}>
                Ganás {formatoPrecio(vm.vistaPrevia.ganancia)} por unidad ({vm.vistaPrevia.margen}% de margen)
              </Text>
            </View>
          )}
        </View>

        {/* --- Stock --- */}
        <View style={[globalStyles.card, styles.seccion]}>
          <Text style={typography.h3}>Stock</Text>
          <View style={styles.fila}>
            <CampoTexto
              label="Unidades *"
              value={form.stock}
              onChangeText={(v) => setField('stock', soloNumeros(v))}
              onBlur={() => marcarTocado('stock')}
              error={errorDe('stock')}
              placeholder="0"
              keyboardType="number-pad"
              maxLength={4}
            />
            <CampoTexto
              label="Avisarme con *"
              value={form.stockMinimo}
              onChangeText={(v) => setField('stockMinimo', soloNumeros(v))}
              onBlur={() => marcarTocado('stockMinimo')}
              error={errorDe('stockMinimo')}
              ayuda="Stock bajo"
              placeholder="2"
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
        </View>

        {/* --- Foto (cámara / galería) --- */}
        <View style={globalStyles.card}>
          <SelectorFoto
            fotoUri={form.fotoUri}
            categoria={form.categoria}
            onTomarFoto={vm.tomarFoto}
            onElegirDeGaleria={vm.elegirDeGaleria}
            onQuitar={() => setField('fotoUri', null)}
          />
        </View>

        {/* --- Guardar --- */}
        {!vm.puedeGuardar && (
          <Text style={styles.pista}>Completá los campos obligatorios (*) para guardar</Text>
        )}
        <BotonPrimario
          label={vm.esEdicion ? 'Guardar cambios' : 'Agregar producto'}
          icono="checkmark"
          deshabilitado={!vm.puedeGuardar}
          onPress={onGuardar}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FormularioProductoScreen;

const styles = StyleSheet.create({
  seccion: { gap: spacing.lg },
  grupo: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { fontSize: 13, color: colors.error, fontWeight: '500' },
  fila: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textosSwitch: { flex: 1, gap: 2 },
  vistaPrevia: { backgroundColor: colors.successLight, borderRadius: radius.sm, padding: spacing.md },
  textoVistaPrevia: { color: colors.success, fontWeight: '600', fontSize: 14 },
  pista: { textAlign: 'center', color: colors.textMuted, fontSize: 13 },
});
