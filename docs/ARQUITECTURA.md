# Arquitectura y cambios seguros

## Responsabilidades

- `screens/`: presentación, accesibilidad, navegación y confirmaciones.
- `viewmodels/`: estado y acciones de cada flujo. Marca, presupuesto, respaldo y seguimiento de propuestas tienen hooks separados.
- `context/`: sesión y coordinación del inventario activo. Las modificaciones se rechazan mientras carga, falla la lectura o se restaura una copia.
- `domain/inventario/`: validación de datos desconocidos y formato versionado de copias. Sin React, archivos ni almacenamiento nativo.
- `domain/seguimiento`: prepara la referencia y valores iniciales del evento sin copiar cliente ni precios.
- `utils/`: cálculos y reglas puras de ventas, SKU y códigos; validación y HTML autocontenido del presupuesto.
- `services/almacenamiento`: lectura/migración y cola de escritura. Reexporta el validador para conservar imports anteriores.
- `services/boveda`: cifrado del dispositivo y acceso a SecureStore. No sustituye una clave perdida si existe algún registro cifrado, incluso si se intenta crear un ámbito nuevo.
- `services/respaldoDatos`: captura de inventario y traslado de fotos a un perfil nuevo.
- `services/respaldoCripto`: formato cifrado portátil y derivación de contraseña. `cifrado.ts` usa expo-crypto; `cifrado.web.ts` adapta Web Crypto al mismo formato IV + contenido + etiqueta.
- `services/respaldo`: selector de archivos y menú nativo para compartir. No decide sobre inventarios ni permisos de usuario.

- `services/calendario.native`: permisos, destino y formulario con expo-calendar. Carga el módulo después de comprobar disponibilidad. `services/calendario.ts` ofrece la alternativa web sin API nativa.
- `services/presupuestos`: impresión del PDF, copia a carpeta elegida, compartir y editor de correo. No calcula stock ni envía automáticamente. Maneja cancelación, confirmaciones limitadas del sistema y temporales.

Metro selecciona los archivos `.web.ts` en navegador. `boveda.web.ts` usa Web Crypto e IndexedDB, verifica la clave antes de cada escritura y conserva registros si falta esa clave. `fotos.web.ts` reduce imágenes locales y guarda su contenido cifrado. `respaldo.web.ts` descarga/selecciona archivos .nexa; `presupuestos.web.ts` abre la plantilla existente para imprimir o guardar como PDF. Estos adaptadores no cambian el formato de las copias ni la bóveda nativa. Las cuentas no son identidades de servidor ni se sincronizan.

La organización separa presentación, coordinación, reglas de negocio y adaptadores del dispositivo. Cada ampliación conserva esa división de responsabilidades.

## Reglas de mantenimiento

- Validar entradas fuera de TypeScript: el tipo no protege frente a JSON dañado.
- Mantener IDs internos estables. El SKU es editable; las ventas y QR existentes deben conservar sus vínculos.
- Mantener formatos versionados, escribir y verificar antes de retirar datos anteriores.
- Probar stock, dinero, cifrado y recuperación con funciones independientes del teléfono; comprobar también los adaptadores reales en hardware.
- Usar una base de prueba o un perfil vacío. Nunca reemplazar inventario de una persona por datos de demostración.
- No registrar PIN, contraseñas, claves, costos o contenido del inventario en herramientas de errores o analítica.
- Una actualización de dependencias requiere TypeScript, reglas automatizadas, exportación y pruebas físicas de los módulos afectados.

## Copias

El inventario incluye un agregado opcional `negocio` (marca, propuestas guardadas y borrador) y un historial `movimientos`. Las escrituras de marca y presupuestos pasan por el contexto y su cola; no hay escrituras paralelas a registros independientes que puedan perderse al guardar stock. Al leer datos anteriores se incorporan marca y borrador desde sus ámbitos cifrados previos, verificando el registro unido antes de usarlo; los registros cifrados antiguos se conservan como resguardo.

La restauración confirma primero fotos y logo cifrados para el nuevo perfil y después todo el negocio con una sola escritura. Si falla, el destino anterior no se reemplaza y se informa el error. Pueden quedar imágenes cifradas huérfanas tras una interrupción; no se expone su contenido en texto plano. Solo se restaura en un perfil sin inventario, historial, marca ni propuestas. Las copias v1 se conservan legibles; las nuevas se crean con el esquema v2. El sobre criptográfico mantiene su versión y contexto para conservar compatibilidad.

La contraseña de copia no es el PIN. AES-256-GCM autentica el archivo y PBKDF2-SHA256 (210.000 iteraciones, salt aleatorio de 24 bytes) deriva su clave. El archivo tiene un límite de 30 MB y el importador valida el formato antes de derivar la clave. Estas decisiones deben revisarse con mediciones en dispositivos y una auditoría externa antes de publicitar garantías de seguridad.
