# NEXA · Inventario y presupuestos

Aplicación móvil React Native, Expo SDK 57 y TypeScript. Diseño oscuro con azul eléctrico, indicador de navegación lima y dashboard con colores por categoría de información.

## Ejecutar

```sh
npm ci
npm start
```

Abrí el QR con Expo Go compatible con SDK 57. La web permite revisar el catálogo y dashboard de ejemplo; el registro y la persistencia protegida requieren el teléfono. Face ID en iOS requiere una compilación propia adicional; el recorrido completo de la entrega funciona con PIN en Expo Go.

## Acceso y funciones

- Invitado: catálogo y dashboard con datos ficticios, sin modificar inventario ni acceder a datos personales.
- Usuario local: inventario, ventas, análisis, marca y presupuesto propios en este dispositivo. No hay sincronización entre celulares.
- PIN de seis dígitos; bloqueo al pasar a segundo plano; biometría opcional según dispositivo y compilación.
- Alta y edición de productos, fotos, búsqueda, categorías, reposición y etiquetas QR.
- Venta y descuento de stock atómicos; anulación idempotente y valores históricos conservados.
- Cámara y galería, lectura QR, háptica y menú nativo para compartir.
- Nivel para estanterías: acelerómetro para inclinación y giroscopio para detectar movimiento. Referencia relativa y pausa al salir de la pantalla.
- Presupuesto con cliente, cantidades, descuento, validez y observaciones; PDF con membrete, logo opcional y pie del negocio.
- Guardado del PDF en una carpeta elegida, menú para compartir por WhatsApp y otras apps, y correo con el PDF adjunto para revisar antes de enviar.
- Seguimiento de propuestas desde Presupuestos guardados mediante el calendario nativo (requiere compilación propia; Expo Go muestra la limitación).

## Recargo por SKU

El usuario elige un SKU de 3 a 12 letras o números, sin espacios ni símbolos. Se guarda en mayúsculas y no se repite dentro del inventario del perfil. Ejemplos: `AUR01`, `JBLGO4`. Aparece en catálogo, ficha, etiqueta y presupuesto PDF; la búsqueda de inventario y presupuesto también lo reconoce. El ingreso manual del escáner acepta el SKU. Los QR mantienen un identificador interno estable para conservar etiquetas y vínculos aunque se edite el SKU.

Los productos anteriores sin SKU se conservan con la indicación «Pendiente de asignar»; al editarlos se solicita elegir uno. Los presupuestos nuevos conservan una copia del SKU del momento, sin modificar los ya guardados.

Cada producto tiene un recargo para presupuestos, inicialmente 30%. El precio de la cotización se calcula **sobre el costo de compra**: costo $10.000 + 30% = $13.000. Se puede ajustar por línea sin cambiar el porcentaje guardado en el producto. Es un recargo sobre costo, no un margen del 30% sobre la venta.

El PDF solo incluye descripción, cantidades, precios finales, descuento y total. Los costos y recargos son internos. El presupuesto conserva los valores del momento y no descuenta ni reserva stock. Se puede guardar un borrador cifrado por usuario. El botón de compartir abre el menú del teléfono para elegir WhatsApp, correo, Archivos u otro destino disponible.

## Arquitectura

### Etiquetas QR propias

1. Cargá el producto con el SKU que elegiste.
2. En su ficha, tocá **Vincular mi QR** y escaneá tu etiqueta impresa (también podés pegar su contenido).
3. Revisá el producto y confirmá el vínculo. El mismo contenido no puede identificar dos productos en ese inventario.
4. Desde el escáner de NEXA, leé la etiqueta: abre la ficha con SKU, nombre, precio y stock actuales. Desde allí podés registrar la venta.

Se permite un QR propio por producto y contenido de hasta 1024 caracteres, incluyendo texto, un SKU, datos o una URL. NEXA no abre el enlace ni importa el precio o stock escrito dentro del QR: lo usa como identificador y consulta su inventario. Reemplazar o desvincular no elimina el producto; la etiqueta anterior deja de resolverlo. La etiqueta QR generada por NEXA continúa funcionando.

La información es local al perfil y dispositivo. Este flujo requiere abrir el lector dentro de NEXA; escanear desde la cámara general del iPhone no crea una página web pública ni permite consultar otro inventario.

### Organización

MVVM mediante hooks: `screens` muestra las vistas; `viewmodels` maneja sus acciones; `context` coordina sesión e inventario; `services` adapta almacenamiento y funciones nativas; `utils` contiene reglas puras; `types` define modelos y navegación. Componentes y estilos se reutilizan.

Bottom Tabs con Stacks anidados tipados. Las rutas pasan identificadores. Las escrituras se encolan y los fallos de lectura no se sustituyen silenciosamente por datos nuevos. Cambiar de perfil desmonta el estado previo.

## Seguridad y alcance

Datos de inventario, ventas, marca, borrador y fotos se cifran con AES-256-GCM. La clave del dispositivo se conserva en SecureStore. El PIN usa PBKDF2-SHA256 con salt; el control de intentos persiste. Las capturas y la vista del selector de aplicaciones se protegen donde la plataforma permite hacerlo.

Es acceso local, sin servidor ni recuperación de claves. El PDF compartido sale de la protección de la aplicación. Ver [alcance y límites](docs/SEGURIDAD.md).

## Verificación

La revisión de producto, funciones nativas y comparación con Sortly/Zoho está en [PRODUCTO.md](docs/PRODUCTO.md). La separación de responsabilidades y las reglas de mantenimiento están en [ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Copia y recuperación del inventario

Desde **Mi espacio → Copia y recuperación del inventario**, elegí una contraseña de 12 a 128 caracteres, repetila y exportá el archivo cifrado `.nexa` al destino del teléfono que prefieras. Verificá que se guardó: cerrar o cancelar el menú no garantiza que exista la copia.

Incluye productos, SKU, etiquetas, cantidades, precios, costos, ventas activas y anuladas, movimientos, fotos, marca, logo, presupuestos guardados y borrador. **No incluye perfiles, PIN ni los archivos PDF ya compartidos:** las propuestas guardadas permiten generarlos otra vez. La contraseña es independiente del PIN; NEXA no la conserva ni la puede recuperar. Límite: 30 MB. Se siguen leyendo las copias antiguas de inventario (versión 1); las nuevas copias completas usan versión 2.

Para recuperar en otra instalación (incluido pasar de Expo Go a la app propia), creá un perfil vacío, ingresá la contraseña de la copia, seleccioná el archivo, revisá el resumen y confirmá. Los IDs originales y los QR se conservan, pero fotos y logo se cifran de nuevo para el perfil de destino. No se reemplaza un perfil que ya tenga inventario, historial, marca o propuestas. El negocio se confirma en un registro cifrado único, para evitar restauraciones parciales. El recorrido nativo completo debe probarse en el teléfono antes de depender de esta función como único respaldo.

## Historial del negocio

**Mi espacio → Historial de movimientos** muestra altas, cambios de ficha, ajustes, bajas, ventas y anulaciones con fecha y stock anterior/nuevo. Los ajustes de stock, bajas y anulaciones requieren un motivo. Las ventas anuladas permanecen visibles y no suman ingresos ni ganancia; repetir la anulación no devuelve stock dos veces. Si el producto ya fue eliminado, la venta puede anularse, dejando constancia de que no se restituyó stock.

Los movimientos se registran desde esta actualización. Las ventas anuladas que se borraron con versiones anteriores no se pueden reconstruir. El historial local no constituye un registro fiscal ni una auditoría externa inalterable.

Las propuestas se archivan al generar el PDF y se recuperan desde **Ventas → Presupuestos guardados**. El borrador se guarda por separado; al retomar una propuesta se conservan las cantidades, costos, recargos y precios de esa propuesta.

## Comprobaciones automatizadas

```sh
npm run typecheck
npm test
npx expo export --platform all
```

Las pruebas cubren reglas de stock, recargos, PDF sin datos internos, aislamiento, cifrado, migración, intentos de PIN y cálculos del nivel. Los adaptadores nativos se simulan en las pruebas automatizadas: cámara, sensores, PDF y biometría requieren además validación en un teléfono físico.

[Guía de defensa](docs/DEFENSA.md) · [Pruebas en iPhone y Face ID](docs/IPHONE.md)
