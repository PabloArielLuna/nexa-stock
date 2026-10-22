export type Rol = 'invitado' | 'usuario';
export type Accion = 'catalogo' | 'ficha' | 'escanear' | 'inventario' | 'ventas' | 'analisis';
export function permite(rol: Rol, accion: Accion): boolean {
  return rol === 'usuario' || ['catalogo', 'ficha', 'escanear'].includes(accion);
}
