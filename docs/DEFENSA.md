# Defensa de NEXA

## Producto

NEXA ayuda a un emprendimiento de gadgets a controlar stock, registrar ventas y preparar presupuestos desde el celular. El invitado explora ejemplos; cada usuario conserva sus datos locales protegidos. No requiere una pantalla de administrador para cumplir la consigna: no hay empleados ni roles administrativos compartidos.

## Relación con la cursada

| Clases | Tema | Ejemplo |
| --- | --- | --- |
| 2–3 | Componentes funcionales, props, TypeScript y reutilización | Encabezado, CampoTexto, tarjetas, botones |
| 4–6 | Stack, Tabs y parámetros | InventarioStack y VentasStack; rutas con productoId |
| 7 | Formularios controlados | Producto, acceso, marca y presupuesto |
| 8 | Condicionales, listas e inmutabilidad | Invitado/usuario, estados vacíos, map/filter |
| 9 | Eventos y callbacks | Acciones de ViewModels y selectores |
| 10 | Estilos avanzados | Sistema de colores, Flexbox y dashboard |
| 11 | Feedback | Carga, errores, confirmaciones y háptica |
| 12 | Organización del proyecto | Vistas, hooks, servicios y reglas separadas |

MVVM mediante hooks, cifrado y módulos nativos son ampliaciones. Conviene poder explicar cada una, además de mostrarla.

## Recorrido en Expo Go

1. Entrar como invitado y explorar catálogo/dashboard de ejemplo; comprobar que no permite ventas o cambios.
2. Salir, crear un perfil con PIN y cargar un producto con foto, costo, stock y recargo del 30%.
3. Abrir detalle y QR; leerlo con la cámara. Vincular un QR propio impreso, confirmar la asociación y leerlo desde el escáner de NEXA. Rechazar permiso y mostrar la alternativa manual por SKU. Explicar que el QR identifica al producto y que el precio y stock se consultan del inventario actual.
4. Registrar una venta y comprobar la baja de unidades. Anular y comprobar la devolución una sola vez.
5. Abrir dashboard y análisis: los datos derivan de las operaciones, no de valores inventados.
6. Configurar nombre del negocio, logo, contacto y pie. Crear presupuesto: costo $10.000, recargo 30%, precio al cliente $13.000. Ajustar cantidad y descuento.
7. Guardar borrador, volver a abrir y compartir PDF. Mostrar que no contiene costos ni recargos y que cotizar no modifica stock.
8. Abrir nivel para estanterías; mostrar inclinación, estabilización y referencia relativa. Explicar acelerómetro y giroscopio.
9. Pasar a segundo plano y regresar: desbloquear con PIN. Reiniciar y comprobar persistencia.
10. Crear otro perfil y comprobar separación de productos, ventas, marca y borrador.

La demostración adicional de Face ID requiere una compilación propia en iPhone; no debe impedir el recorrido obligatorio en Expo Go.

## Decisiones para explicar

- Una venta y su cambio de stock forman una transición atómica; la anulación es idempotente.
- Las escrituras se encolan; ante un fallo de lectura se conserva el error, sin reemplazar datos por un inventario nuevo.
- Cambiar de perfil desmonta estado y navegación; el invitado no carga información privada.
- El PIN se verifica con PBKDF2 y salt. La biometría la resuelve el sistema, no una cámara que reconozca caras por cuenta de la aplicación.
- AES-GCM cifra y detecta alteraciones; SecureStore conserva la clave del dispositivo. Son responsabilidades distintas del bloqueo visual.
- Un recargo del 30% sobre costo no equivale a un margen del 30% sobre precio de venta.
- Un presupuesto conserva costo y recargo internamente para poder editarse, pero el generador HTML solo publica los precios finales.
- El nivel tiene una utilidad concreta para ordenar el espacio de stock. Brújula y NFC quedan fuera porque no resuelven un flujo necesario de esta entrega.

## Límites honestos

Perfiles locales, sin nube ni recuperación. PDF exportado fuera del cifrado de la app. Cámara, permisos, sensores, impresión, bloqueo y biometría requieren pruebas físicas. Las verificaciones automatizadas y la vista web no sustituyen esas pruebas. Ver SEGURIDAD.md e IPHONE.md.
