import type { MarcaNegocio, Presupuesto } from '../types/negocio';
export type { Presupuesto, LineaPresupuesto } from '../types/negocio';
import { formatoFecha, formatoPrecio } from './formato';
import { precioConRecargo } from './calculos';
import { skuValido } from './sku';
export function totalesPresupuesto(p: Pick<Presupuesto, 'lineas' | 'descuento'>) {
  const subtotal = p.lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  const descuento = Math.round((subtotal * p.descuento) / 100);
  return { subtotal, descuento, total: subtotal - descuento };
}
export function presupuestoValido(valor: unknown): valor is Presupuesto {
  if (!valor || typeof valor !== 'object') return false;
  const p = valor as Presupuesto;
  return (
    typeof p.numero === 'string' &&
    /^[A-Z0-9-]{3,80}$/i.test(p.numero) &&
    typeof p.cliente === 'string' &&
    typeof p.fecha === 'string' &&
    typeof p.notas === 'string' &&
    Array.isArray(p.lineas) &&
    p.cliente.trim().length >= 2 &&
    p.cliente.length <= 80 &&
    Number.isFinite(Date.parse(p.fecha)) &&
    Number.isSafeInteger(p.validez) &&
    p.validez >= 1 &&
    p.validez <= 90 &&
    Number.isFinite(p.descuento) &&
    p.descuento >= 0 &&
    p.descuento <= 100 &&
    p.notas.length <= 500 &&
    p.lineas.length > 0 &&
    p.lineas.length <= 30 &&
    p.lineas.every(
      (l) =>
        !!l &&
        typeof l === 'object' &&
        typeof l.productoId === 'string' &&
        l.productoId.length > 0 &&
        l.productoId.length <= 100 &&
        (l.sku === undefined || skuValido(l.sku)) &&
        typeof l.nombre === 'string' &&
        l.nombre.length <= 100 &&
        Number.isSafeInteger(l.cantidad) &&
        l.cantidad >= 1 &&
        l.cantidad <= 9999 &&
        Number.isFinite(l.costo) &&
        l.costo > 0 &&
        Number.isFinite(l.recargo) &&
        l.recargo >= 0 &&
        l.recargo <= 1000 &&
        l.precio === precioConRecargo(l.costo, l.recargo) &&
        Number.isFinite(l.precio) &&
        l.precio > 0 &&
        l.precio <= 1e9,
    ) &&
    new Set(p.lineas.map((l) => l.productoId)).size === p.lineas.length
  );
}
export const escaparHTML = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
/** HTML autocontenido: no ejecuta código ni carga imágenes desde servidores externos. */
export function htmlPresupuesto(p: Presupuesto, marca: MarcaNegocio, logo: string | null) {
  if (!presupuestoValido(p)) throw new Error('Revisá el cliente y los productos del presupuesto.');
  const t = totalesPresupuesto(p);
  const fecha = new Date(p.fecha);
  const vence = new Date(fecha);
  vence.setDate(vence.getDate() + p.validez);
  const e = escaparHTML;
  const imagen =
    logo && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(logo)
      ? `<img alt="Logo" src="${logo}"/>`
      : `<span class="monograma">${e((marca.nombre || 'N').slice(0, 1).toUpperCase())}</span>`;
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><title>Presupuesto ${e(p.numero)}</title><style>
  @page{size:A4;margin:28mm 15mm 23mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#18243a;font-size:11px;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}header{position:fixed;top:-75px;left:0;right:0;height:64px;border-bottom:3px solid #2457ff;display:flex;align-items:center;gap:14px}header img{width:52px;height:52px;object-fit:contain}.monograma{background:#2457ff;color:white;width:45px;height:45px;line-height:45px;text-align:center;font-size:26px;font-weight:bold;border-radius:10px}.marca{font-size:19px;font-weight:bold}.contacto{color:#59677f;font-size:10px;margin-top:5px}footer{position:fixed;bottom:-52px;left:0;right:0;border-top:1px solid #cbd4e5;padding-top:10px;color:#67748a;font-size:9px;display:flex;justify-content:space-between;gap:20px}footer span{max-width:70%;white-space:pre-wrap}h1{font-size:30px;letter-spacing:-1px;margin:16px 0 8px}p{line-height:1.6;overflow-wrap:anywhere}.etiqueta{color:#2457ff;font-size:10px;font-weight:bold;letter-spacing:2px}.datos{display:flex;justify-content:space-between;padding:20px 0;margin:16px 0;border-top:1px solid #dce3ef;border-bottom:1px solid #dce3ef}.gris{color:#67748a;font-size:10px}.cliente{font-size:16px;margin-top:7px;max-width:320px;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:20px}thead{display:table-header-group}th{background:#edf2ff;color:#254285;font-size:9px;text-transform:uppercase;padding:12px 8px;text-align:left}td{padding:14px 8px;border-bottom:1px solid #e3e8f1;overflow-wrap:anywhere}tr{break-inside:avoid;page-break-inside:avoid}.num{text-align:right;font-variant-numeric:tabular-nums}.resumen{width:280px;margin:28px 0 0 auto;break-inside:avoid;page-break-inside:avoid}.fila{display:flex;justify-content:space-between;margin:12px 0}.total{background:#173fcd;color:white;padding:18px;border-radius:10px;font-size:18px;font-weight:bold}.notas{margin-top:30px;white-space:pre-wrap;break-inside:avoid;page-break-inside:avoid}.legal{color:#67748a;font-size:9px;margin-top:22px}
  </style></head><body><header>${imagen}<div><div class="marca">${e(marca.nombre || 'Mi negocio')}</div><div class="contacto">${e(marca.contacto)}${marca.direccion ? ' · ' + e(marca.direccion) : ''}</div></div></header><footer><span>${e(marca.pie)}</span><div>${e(p.numero)}</div></footer><main><div class="etiqueta">PROPUESTA COMERCIAL</div><h1>Presupuesto</h1><p class="gris">N.º ${e(p.numero)} · Emitido el ${formatoFecha(fecha)}</p><div class="datos"><div><div class="gris">PREPARADO PARA</div><div class="cliente">${e(p.cliente)}</div></div><div><div class="gris">VÁLIDO HASTA</div><p>${formatoFecha(vence)} · ${p.validez} días</p></div></div><table><colgroup><col style="width:43%"><col style="width:12%"><col style="width:22%"><col style="width:23%"></colgroup><thead><tr><th>Descripción</th><th class="num">Cant.</th><th class="num">Precio unitario</th><th class="num">Importe</th></tr></thead><tbody>${p.lineas.map((l) => `<tr><td>${e(l.nombre)}${l.sku ? `<div class="gris">SKU: ${e(l.sku)}</div>` : ''}</td><td class="num">${l.cantidad}</td><td class="num">${formatoPrecio(l.precio)}</td><td class="num">${formatoPrecio(l.cantidad * l.precio)}</td></tr>`).join('')}</tbody></table><div class="resumen"><div class="fila"><span>Subtotal</span><b>${formatoPrecio(t.subtotal)}</b></div>${p.descuento ? `<div class="fila"><span>Descuento (${p.descuento}%)</span><b>− ${formatoPrecio(t.descuento)}</b></div>` : ''}<div class="fila total"><span>Total ARS</span><span>${formatoPrecio(t.total)}</span></div></div>${p.notas ? `<div class="notas"><b>Observaciones</b><p>${e(p.notas)}</p></div>` : ''}<p class="legal">Importes expresados en pesos argentinos. Este presupuesto no reserva unidades ni constituye una factura.</p></main></body></html>`;
}
