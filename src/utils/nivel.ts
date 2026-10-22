export type Vector3 = { x: number; y: number; z: number };
export function inclinacion(v: Vector3) {
  const factor = 180 / Math.PI;
  return {
    lateral: Math.atan2(v.x, Math.hypot(v.y, v.z)) * factor,
    frontal: Math.atan2(v.y, Math.hypot(v.x, v.z)) * factor,
  };
}
export function suavizar(anterior: Vector3 | null, nueva: Vector3): Vector3 {
  if (!anterior) return nueva;
  return {
    x: anterior.x * 0.8 + nueva.x * 0.2,
    y: anterior.y * 0.8 + nueva.y * 0.2,
    z: anterior.z * 0.8 + nueva.z * 0.2,
  };
}
export function estaNivelado(lateral: number, frontal: number) {
  return (
    Number.isFinite(lateral) &&
    Number.isFinite(frontal) &&
    Math.abs(lateral) <= 1.5 &&
    Math.abs(frontal) <= 1.5
  );
}
