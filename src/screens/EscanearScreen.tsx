import React, { useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { InventarioStackParamList } from '../types/navigation';
import { useInventario } from '../context/InventarioContext';
import { buscarCodigo, qrPersonalValido } from '../utils/codigos';
import { usePerfil } from '../context/PerfilContext';
import AccesoRequeridoScreen from './AccesoRequeridoScreen';
import { feedback } from '../services/dispositivo';
import BotonPrimario from '../components/BotonPrimario';
import { colors } from '../styles/colors';

type Props = NativeStackScreenProps<InventarioStackParamList, 'Escanear'>;
export default function EscanearScreen({ navigation, route }: Props) {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [pausado, setPausado] = useState(false);
  const [candidato, setCandidato] = useState('');
  const leyendo = useRef(false);
  const focused = useIsFocused();
  const [aplicacionActiva, setAplicacionActiva] = useState(AppState.currentState === 'active');
  const [linterna, setLinterna] = useState(false);
  useEffect(() => {
    const evento = AppState.addEventListener('change', (estado) => {
      setAplicacionActiva(estado === 'active');
      if (estado !== 'active') setLinterna(false);
    });
    return () => evento.remove();
  }, []);
  const { productos, vincularQr } = useInventario();
  const { invitado } = usePerfil();
  const vincularId = route.params?.vincularProductoId;
  const destino = productos.find((p) => p.id === vincularId);
  function buscar(data: string) {
    if (leyendo.current) return;
    leyendo.current = true;
    if (vincularId) {
      setPausado(true);
      const contenido = data.trim();
      if (!qrPersonalValido(contenido)) {
        setError(
          'Leé un QR propio de hasta 1024 caracteres. Las etiquetas NEXA ya funcionan sin vincularlas.',
        );
        return;
      }
      const existente = buscarCodigo(contenido, productos);
      if (existente && existente.id !== vincularId) {
        setError(`Esta etiqueta ya identifica a ${existente.sku ?? existente.nombre}. Usá otra.`);
        return;
      }
      setCandidato(contenido);
      setError('');
      return;
    }
    const p = buscarCodigo(data, productos);
    if (p) {
      feedback(true);
      navigation.replace('DetalleProducto', { productoId: p.id });
    } else {
      setPausado(true);
      setError(
        'No encontramos esta etiqueta. Podés vincular tu QR desde la ficha del producto o buscar por SKU.',
      );
    }
  }
  if (vincularId && invitado) return <AccesoRequeridoScreen />;
  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>{vincularId ? 'Vincular QR' : 'Escanear'}</Text>
      <Text style={s.body}>
        {vincularId
          ? `Vinculá una etiqueta impresa a ${destino?.sku ?? 'este producto'} · ${destino?.nombre ?? 'Producto no encontrado'}. Primero leela y después confirmá. Solo se vincula un QR propio por producto.`
          : 'Escaneá una etiqueta o ingresá el SKU.'}
      </Text>
      {Platform.OS !== 'web' && permiso?.granted && focused && aplicacionActiva && !pausado ? (
        <View style={s.camera}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={linterna}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'datamatrix'],
            }}
            onBarcodeScanned={({ data }) => buscar(data)}
            onMountError={() => {
              setPausado(true);
              setError('No pudimos iniciar la cámara. Usá el código manual.');
            }}
          />
          <View pointerEvents="none" style={s.target}>
            <Ionicons name="scan-outline" size={150} color={colors.primary} />
          </View>
          <Text style={s.cameraCaption}>Ubicá el QR dentro del recuadro</Text>
        </View>
      ) : (
        <View style={s.placeholder}>
          <Ionicons name="scan-outline" size={64} color={colors.primary} />
          <Text style={s.body}>
            {Platform.OS === 'web'
              ? 'En la compu, buscá con el SKU. La cámara está disponible en la app móvil.'
              : 'El permiso de cámara se usa solamente para leer etiquetas.'}
          </Text>
          {Platform.OS !== 'web' && !permiso?.granted && (
            <BotonPrimario
              label={permiso?.canAskAgain === false ? 'Abrir ajustes' : 'Habilitar cámara'}
              onPress={() => {
                if (permiso?.canAskAgain === false) void Linking.openSettings();
                else void pedirPermiso().catch(() => setError('No pudimos solicitar el permiso.'));
              }}
            />
          )}
        </View>
      )}
      {Platform.OS !== 'web' && permiso?.granted && focused && aplicacionActiva && !pausado && (
        <BotonPrimario
          label={linterna ? 'Apagar linterna' : 'Encender linterna'}
          variante="secundario"
          icono="flashlight-outline"
          onPress={() => setLinterna((valor) => !valor)}
        />
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {!!candidato && !!vincularId && (
        <View style={s.placeholder}>
          <Text style={s.label}>ETIQUETA LISTA PARA VINCULAR</Text>
          <Text style={s.body} numberOfLines={4}>
            {candidato}
          </Text>
          <Text style={s.body}>
            Producto: {destino?.sku ?? 'Sin SKU'} · {destino?.nombre}
            {destino?.codigoQr
              ? '\nReemplazará el vínculo anterior; la etiqueta anterior dejará de encontrarlo.'
              : ''}
          </Text>
          <BotonPrimario
            label="Confirmar vínculo"
            deshabilitado={!destino}
            onPress={() => {
              try {
                vincularQr(vincularId, candidato);
                feedback(true);
                navigation.goBack();
              } catch (e) {
                setError(e instanceof Error ? e.message : 'No pudimos vincular el QR.');
              }
            }}
          />
        </View>
      )}
      {pausado && (
        <BotonPrimario
          label="Volver a escanear"
          variante="secundario"
          onPress={() => {
            leyendo.current = false;
            setPausado(false);
            setError('');
            setCandidato('');
          }}
        />
      )}
      <Text style={s.label}>TAMBIÉN PODÉS INGRESAR EL CÓDIGO</Text>
      <TextInput
        accessibilityLabel="Código del producto"
        placeholder="SKU, por ejemplo AUR01, o código NEXA"
        placeholderTextColor={colors.textLight}
        autoCapitalize="none"
        autoCorrect={false}
        value={codigo}
        onChangeText={(v) => {
          setCodigo(v);
          setCandidato('');
          leyendo.current = false;
        }}
        style={s.input}
        maxLength={1024}
        multiline={!!vincularId}
      />
      <BotonPrimario
        label={vincularId ? 'Preparar vínculo con este código' : 'Buscar producto'}
        icono="search-outline"
        deshabilitado={!codigo.trim()}
        onPress={() => buscar(codigo)}
      />
    </ScrollView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, gap: 20, maxWidth: 600, width: '100%', alignSelf: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', letterSpacing: -1 },
  body: { color: colors.textMuted, lineHeight: 23, fontSize: 14 },
  camera: { height: 320, overflow: 'hidden', borderRadius: 24, backgroundColor: '#000' },
  target: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cameraCaption: { color: '#FFF', padding: 20, textAlign: 'center', backgroundColor: '#0009' },
  placeholder: { padding: 28, gap: 20, backgroundColor: colors.surface, borderRadius: 24 },
  error: { color: colors.error, lineHeight: 22 },
  label: { color: colors.textLight, fontSize: 10, letterSpacing: 1.5 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    color: colors.text,
    padding: 16,
    fontSize: 16,
  },
});
