# Seguimientos y exportación de propuestas

## Calendario

Desde **Ventas → Presupuestos → Presupuestos guardados → Agendar seguimiento**, NEXA explica qué dato sale de la app y solicita permiso solo al continuar. El formulario nativo permite revisar fecha, hora, calendario y aviso. Propone mañana a las 10:00, durante 30 minutos. iOS recibe una alarma al comienzo; en Android se debe revisar/configurar el aviso en el formulario del calendario, porque el API del formulario no admite precargar alarmas.

La integración usa la API actual de `expo-calendar ~57.0.6`: `getCalendarPermissions`, `requestCalendarPermissions`, `getDefaultCalendarSync`/`getCalendars` y `addEventWithForm`. No usa Linking, URLs ni la librería discontinuada `react-native-calendar-events`.

En iOS se pide acceso de escritura. iOS 17+ expone un calendario virtual para crear eventos sin leer los calendarios reales. El formulario del sistema permite elegir dónde guardarlo. En Android se enumeran únicamente calendarios editables; el usuario elige antes de abrir el formulario. Android requiere permisos de lectura/escritura para esta selección. NEXA no consulta eventos ni pide acceso a Recordatorios.

El evento solo contiene el número de propuesta y la indicación de revisarla en NEXA: nunca copia cliente, productos, precios, costos o notas comerciales. Queda fuera del cifrado de NEXA y puede sincronizarse con la cuenta del calendario elegido.

Expo Go no contiene este módulo: se muestra una explicación sin cargarlo ni simular que se creó un evento. Web usa un adaptador sin código nativo. La compilación propia incluye el módulo y su plugin; no necesita publicarse en tiendas. Todavía no se generó una build ni se confirmó el funcionamiento físico.

iOS informa si se guardó o canceló. Android solo informa que cerró el formulario: la app pide comprobar el calendario, sin afirmar que se guardó. Una confirmación nueva permite crear otro seguimiento; no hay sincronización bidireccional ni eventos en el respaldo. Restaurar un respaldo no duplica eventos. Para editarlos o eliminarlos se usa la aplicación Calendario.

## PDF

El membrete y el pie se imprimen dentro del flujo del documento, con márgenes nativos de 36 puntos en iOS y su equivalente en la regla CSS de impresión. No se usan coordenadas negativas para colocar el logo fuera del área imprimible. La propuesta presenta logo arriba, datos de cliente/emisor en dos columnas, tabla de productos y resumen final. La cabecera de la tabla se repite al paginar; el membrete aparece al principio y el pie comercial al final. Si un logo configurado no puede abrirse, se informa y no se exporta silenciosamente sin él.

La revisión visual local incluyó una propuesta de una página y otra de 30 productos, nombres largos, importes máximos y observaciones extensas: márgenes, logo y texto dentro del área imprimible en el motor de escritorio. El usuario confirmó que el PDF corregido se ve bien en su iPhone; faltan las demás pruebas físicas de exportación.

En el formulario del presupuesto hay tres acciones. Antes de exportar, NEXA valida y archiva la propuesta cifrada para que pueda retomarse aunque el usuario cancele el destino.

- **Compartir PDF · WhatsApp y otras apps:** adjunta el archivo PDF real con nombre reconocible y MIME `application/pdf`. El sistema muestra destinos instalados y compatibles; el usuario elige WhatsApp, el contacto y confirma. No se envía automáticamente ni se afirma que fue enviado.
- **Guardar PDF en el teléfono:** abre el selector de carpetas y escribe una copia en la ubicación elegida, fuera de la caché de la app. Confirma el guardado después de escribir. Cancelar no genera una copia nueva. Si el proveedor de archivos no permite esa operación, se puede usar Compartir y elegir Archivos/gestor de archivos.
- **Preparar correo con PDF adjunto:** `expo-mail-composer ~57.0.2` abre el editor nativo con asunto, mensaje y PDF adjunto. El usuario completa destinatario y revisa antes de enviar. Requiere correo configurado; en iPhone usa Mail. Para Gmail/Outlook u otras apps también puede usarse Compartir. Android no confirma el envío: NEXA lo aclara. iOS diferencia cancelación, borrador y aceptación del envío; ninguna respuesta prueba entrega al destinatario.

Se conserva el membrete, logo, pie, SKU y precios finales del PDF existente; no se incluyen costos ni porcentajes internos. Guardar o compartir una propuesta no descuenta stock.

El archivo temporal se elimina al terminar el guardado local o al cerrar el correo en iOS, salvo borrador. Para compartir y para adjuntos que Android consume después de devolver el control se conserva una copia en `cache/nexa-presupuestos`. Se eliminan copias de más de 24 horas al preparar otra exportación; no es un temporizador y el sistema puede limpiar la caché antes. Los PDFs exportados son legibles fuera del cifrado de NEXA. No usar esa caché como respaldo: guardar en una carpeta externa para conservarlos.

## Verificación

Los casos de calendario y exportaciones forman parte de las **62 pruebas** ejecutadas el 27/10/2026. La revisión de documentación del 29/10 no representa una nueva prueba física ni un envío real.

Pruebas automatizadas con adaptadores nativos simulados: payload privado, fecha local y cambio de año, permisos y revocación, calendario no editable, cancelación y resultado no confirmado de Android, Expo Go/web sin módulo, copia PDF byte a byte, cancelación sin generar archivo, fallo de escritura y limpieza de copia parcial, adjuntos y correo no configurado. Estas pruebas no reemplazan la comprobación física.

Pendiente en iPhone y Android:

1. En Expo Go, abrir seguimiento y comprobar aviso sin cierre; guardar, compartir y preparar correo con un presupuesto de prueba.
2. En compilación propia nueva, conceder/rechazar permiso de calendario; verificar que se solicita al continuar, nunca al arrancar.
3. Elegir calendario, fecha y hora; guardar y cancelar; comprobar evento, duración, privacidad y aviso. La entrega de avisos depende de los ajustes y del modo de concentración.
4. Volver desde el calendario, correo, WhatsApp o selector de carpetas y desbloquear NEXA si pasó a segundo plano. El bloqueo de privacidad se conserva.
5. Guardar un PDF y abrirlo desde Archivos/Descargas después de cerrar NEXA; probar carpetas locales y proveedor iCloud/Drive utilizado.
6. Compartir un PDF a WhatsApp y abrir el adjunto; probar sin WhatsApp instalado y con cancelación. La prueba de envío debe realizarla el usuario con un contacto elegido.
7. Preparar correo, revisar adjunto, cancelar/guardar borrador y comprobar cuenta no configurada. Cualquier envío real requiere decisión del usuario.

Fuentes oficiales: [Expo Calendar SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/calendar/), [Expo MailComposer](https://docs.expo.dev/versions/latest/sdk/mail-composer/), [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/).

## Navegador

El presupuesto usa la misma plantilla con marca y logo. **Imprimir / Guardar PDF** abre una ventana de impresión; el usuario elige Guardar como PDF. Cancelar no guarda un archivo. Se requieren ventanas emergentes habilitadas. No se muestran los botones nativos de WhatsApp/correo; el archivo descargado se puede adjuntar desde el equipo. El 05/11/2026 se verificó el contenido de la ventana con logo, pie y SKU en Chrome.
