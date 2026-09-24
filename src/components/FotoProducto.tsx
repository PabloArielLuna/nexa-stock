import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { CategoriaId } from '../types/models';
import IconoCategoria from './IconoCategoria';

type Props = {
  uri: string | null;
  categoria: CategoriaId;
  tamanio?: number;
};

/** Muestra la foto del producto o, si no tiene, el ícono de su categoría. */
const FotoProducto: React.FC<Props> = ({ uri, categoria, tamanio = 56 }) =>
  uri ? (
    <Image
      source={{ uri }}
      style={[styles.foto, { width: tamanio, height: tamanio, borderRadius: tamanio / 3 }]}
    />
  ) : (
    <IconoCategoria categoria={categoria} tamanio={tamanio} />
  );

export default FotoProducto;

const styles = StyleSheet.create({
  foto: { backgroundColor: '#E5E7EB' },
});
