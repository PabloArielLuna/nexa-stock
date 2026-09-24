import { Ionicons } from '@expo/vector-icons';
import { CategoriaId } from '../types/models';

type InfoCategoria = {
  id: CategoriaId;
  nombre: string;
  icono: keyof typeof Ionicons.glyphMap; // tipado como en la Clase 5
  color: string;
};

/** Catálogo de categorías: nombre visible, ícono y color de cada una. */
export const CATEGORIAS: InfoCategoria[] = [
  { id: 'auriculares', nombre: 'Auriculares', icono: 'headset', color: '#6366F1' },
  { id: 'parlantes', nombre: 'Parlantes', icono: 'volume-high', color: '#0EA5E9' },
  { id: 'smartwatches', nombre: 'Smartwatches', icono: 'watch', color: '#10B981' },
  { id: 'powerbanks', nombre: 'Power banks', icono: 'battery-charging', color: '#F59E0B' },
  { id: 'cargadores', nombre: 'Cargadores', icono: 'flash', color: '#EF4444' },
  { id: 'otros', nombre: 'Otros', icono: 'cube', color: '#64748B' },
];

export const obtenerCategoria = (id: CategoriaId): InfoCategoria =>
  CATEGORIAS.find((c) => c.id === id) ?? CATEGORIAS[CATEGORIAS.length - 1];
