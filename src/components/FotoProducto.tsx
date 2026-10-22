import React, { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { CategoriaId } from '../types/models';
import IconoCategoria from './IconoCategoria';
import { abrirFoto } from '../services/fotos';
import { usePerfil } from '../context/PerfilContext';
import { colors } from '../styles/colors';

type Props = { uri: string | null; categoria: CategoriaId; tamanio?: number };
/** La foto se descifra solo en memoria y pertenece al usuario activo. */
export default function FotoProducto({ uri, categoria, tamanio = 56 }: Props) {
  const { activo, invitado } = usePerfil();
  const [foto, setFoto] = useState<{ referencia: string; perfil: string; datos: string } | null>(null);
  useEffect(() => {
    let cancelado = false;
    setFoto(null);
    if (uri && activo && !invitado) {
      void abrirFoto(uri, activo.id)
        .then((datos) => {
          if (!cancelado && datos) setFoto({ referencia: uri, perfil: activo.id, datos });
        })
        .catch(() => undefined);
    }
    return () => {
      cancelado = true;
    };
  }, [uri, activo?.id, invitado]);
  const visible = foto && foto.referencia === uri && foto.perfil === activo?.id ? foto.datos : null;
  return visible ? (
    <Image
      source={{ uri: visible }}
      accessibilityLabel="Foto del producto"
      onError={() => setFoto(null)}
      style={[s.foto, { width: tamanio, height: tamanio, borderRadius: tamanio / 3 }]}
    />
  ) : (
    <IconoCategoria categoria={categoria} tamanio={tamanio} />
  );
}
const s = StyleSheet.create({ foto: { backgroundColor: colors.surface } });
