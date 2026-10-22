const fs = require('node:fs');
const zlib = require('node:zlib');
const path = require('node:path');
const directory = path.resolve(__dirname, '../assets');
const polygon = [
  [294, 294],
  [398, 294],
  [626, 588],
  [626, 294],
  [730, 294],
  [730, 730],
  [626, 730],
  [398, 436],
  [398, 730],
  [294, 730],
];
const source = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#0b0f19"/><path fill="#527aff" d="M${polygon.map((p) => p.join(' ')).join(' L')} Z"/></svg>`;
fs.writeFileSync(path.join(directory, 'nexa-icon.svg'), source);
function crc(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c ^= byte;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(data.length);
  header.write(type, 4);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc(Buffer.concat([Buffer.from(type), data])));
  return Buffer.concat([header, data, checksum]);
}
function inside(x, y) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i],
      [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) result = !result;
  }
  return result;
}
function render(size, name, transparent = false, monochrome = false) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const foreground = monochrome ? [255, 255, 255, 255] : [82, 122, 255, 255];
  const background = transparent ? [0, 0, 0, 0] : [11, 15, 25, 255];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const color = inside(((x + 0.5) / size) * 1024, ((y + 0.5) / size) * 1024) ? foreground : background;
      const offset = y * (size * 4 + 1) + 1 + x * 4;
      color.forEach((value, index) => (raw[offset + index] = value));
    }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  fs.writeFileSync(
    path.join(directory, name),
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk('IHDR', header),
      chunk('IDAT', zlib.deflateSync(raw)),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  );
}
render(1024, 'nexa-icon.png');
render(1024, 'nexa-foreground.png', true);
render(1024, 'nexa-monochrome.png', true, true);
render(64, 'nexa-favicon.png');
