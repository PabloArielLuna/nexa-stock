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
  @page{size:A4;margin:36pt}
  *{box-sizing:border-box}
  body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#18243a;font-size:12px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  p{margin:0;overflow-wrap:anywhere;word-break:break-word}
  header{padding:4px 0 24px;break-inside:avoid;page-break-inside:avoid}
  .identidad{display:table;width:100%;table-layout:fixed}
  .logo{display:table-cell;width:112px;vertical-align:middle;padding-right:18px}
  .logo img{display:block;width:94px;height:94px;object-fit:contain}
  .monograma{display:block;background:#2457ff;color:white;width:64px;height:64px;line-height:64px;text-align:center;font-size:32px;font-weight:bold;border-radius:14px}
  .marca-datos{display:table-cell;vertical-align:middle;text-align:right;overflow-wrap:anywhere;word-break:break-word}
  .marca{font-size:25px;line-height:1.2;font-weight:bold;margin-bottom:8px}
  .etiqueta{color:#2457ff;font-size:9px;font-weight:bold;letter-spacing:2px}
  .referencia{font-size:10px;color:#67748a;overflow-wrap:anywhere;word-break:break-word}
  .datos{display:table;table-layout:fixed;width:100%;margin:8px 0 28px;break-inside:avoid;page-break-inside:avoid}
  .datos>div{display:table-cell;width:50%;vertical-align:top;overflow-wrap:anywhere;word-break:break-word}
  .datos>div:first-child{padding-right:18px}.datos>div:last-child{padding-left:18px}
  .bloque-titulo{font-size:15px;font-weight:bold;border-top:3px solid #18243a;border-bottom:1px solid #18243a;padding:10px 0 8px;margin-bottom:10px;letter-spacing:.6px}
  .campo{font-size:11px;line-height:1.6;margin-top:5px;white-space:pre-wrap}
  .gris{color:#67748a;font-size:10px}
  .cliente{font-size:16px;font-weight:bold;margin-top:5px;line-height:1.4}
  table.productos{width:100%;border-collapse:collapse;table-layout:fixed;border-top:3px solid #18243a}
  thead{display:table-header-group}
  th{background:#f4f7fc;color:#18243a;font-size:10px;padding:12px 8px;text-align:left;line-height:1.4;border-bottom:1px solid #aab7ca}
  td{padding:14px 8px;border-bottom:1px solid #e3e8f1;vertical-align:top;overflow-wrap:anywhere;word-break:break-word}
  tr{break-inside:avoid;page-break-inside:avoid}
  .descripcion{font-size:12px;line-height:1.5}.sku{margin-top:5px;font-size:10px;color:#67748a}
  .num{text-align:right;font-variant-numeric:tabular-nums;font-size:11px;white-space:nowrap}
  .resumen{width:330px;max-width:100%;margin:24px 0 0 auto;break-inside:avoid;page-break-inside:avoid}
  .fila{display:table;table-layout:fixed;width:100%;margin:10px 0}
  .fila>span,.fila>b{display:table-cell;vertical-align:middle}
  .fila>span:first-child{width:35%}.fila>b,.fila>span:last-child{text-align:right}
  .total{background:#f4f7fc;color:#173fcd;border-top:1px solid #18243a;border-bottom:3px solid #2457ff;padding:14px 10px;font-size:18px;font-weight:bold}
  .total>span:first-child{font-size:13px}.total>span:last-child{white-space:nowrap}
  .notas{border-top:1px solid #dce3ef;margin-top:28px;padding-top:18px;break-inside:avoid;page-break-inside:avoid}
  .notas p{white-space:pre-wrap;margin-top:8px;color:#59677f}
  .legal{color:#67748a;font-size:9px;margin-top:22px;line-height:1.6}
  footer{margin-top:30px;border-top:2px solid #2457ff;padding-top:14px;break-inside:avoid;page-break-inside:avoid;overflow-wrap:anywhere;word-break:break-word}
  .pie{white-space:pre-wrap;font-size:11px;color:#59677f;margin-bottom:10px}
  .cierre{color:#67748a;font-size:9px}
  </style></head><body>
  <header><div class="identidad"><div class="logo">${imagen}</div><div class="marca-datos"><div class="etiqueta">PROPUESTA COMERCIAL</div><div class="marca">Presupuesto</div><p class="referencia">N.º ${e(p.numero)}</p><p class="gris">Importes en ARS</p></div></div></header>
  <main><div class="datos"><div><div class="bloque-titulo">CLIENTE</div><div class="cliente">${e(p.cliente)}</div><p class="campo"><b>Emisión:</b> ${formatoFecha(fecha)}</p><p class="campo"><b>Vencimiento:</b> ${formatoFecha(vence)}</p><p class="gris">Validez de la propuesta: ${p.validez} días</p></div><div><div class="bloque-titulo">EMISOR</div><div class="cliente">${e(marca.nombre || 'Mi negocio')}</div>${marca.contacto ? `<p class="campo"><b>Contacto:</b> ${e(marca.contacto)}</p>` : ''}${marca.direccion ? `<p class="campo"><b>Dirección:</b> ${e(marca.direccion)}</p>` : ''}</div></div>
  <table class="productos"><colgroup><col style="width:47%"><col style="width:9%"><col style="width:22%"><col style="width:22%"></colgroup><thead><tr><th>Descripción / SKU</th><th class="num">Cant.</th><th class="num">Precio unitario</th><th class="num">Importe</th></tr></thead><tbody>${p.lineas.map((l) => `<tr><td class="descripcion">${e(l.nombre)}${l.sku ? `<div class="sku">SKU: ${e(l.sku)}</div>` : ''}</td><td class="num">${l.cantidad}</td><td class="num">${formatoPrecio(l.precio)}</td><td class="num">${formatoPrecio(l.cantidad * l.precio)}</td></tr>`).join('')}</tbody></table>
  <div class="resumen"><div class="fila"><span>Subtotal</span><b>${formatoPrecio(t.subtotal)}</b></div>${p.descuento ? `<div class="fila"><span>Descuento (${p.descuento}%)</span><b>- ${formatoPrecio(t.descuento)}</b></div>` : ''}<div class="fila total"><span>Total ARS</span><span>${formatoPrecio(t.total)}</span></div></div>
  ${p.notas ? `<div class="notas"><b>Observaciones y condiciones</b><p>${e(p.notas)}</p></div>` : ''}<p class="legal">Importes expresados en pesos argentinos. Este presupuesto no reserva unidades ni constituye una factura.</p></main>
  <footer>${marca.pie ? `<div class="pie">${e(marca.pie)}</div>` : ''}<div class="cierre">${e(marca.nombre || 'Mi negocio')} · Presupuesto ${e(p.numero)}</div></footer>
  </body></html>`;
}
