import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoriaId } from '../types/models';
import { obtenerCategoria } from '../utils/categorias';

type Props = {
  categoria: CategoriaId;
  tamanio?: number;
};

/** Círculo de color con el ícono de la categoría. */
const IconoCategoria: React.FC<Props> = ({ categoria, tamanio = 48 }) => {
  const info = obtenerCategoria(categoria);
  return (
    <View
      style={[
        styles.circulo,
        // El fondo es el color de la categoría con transparencia ("1A" = 10%)
        { width: tamanio, height: tamanio, borderRadius: tamanio / 3, backgroundColor: `${info.color}1A` },
      ]}
    >
      <Ionicons name={info.icono} size={tamanio * 0.5} color={info.color} />
    </View>
  );
};

export default IconoCategoria;

const styles = StyleSheet.create({
  circulo: { justifyContent: 'center', alignItems: 'center' },
});
