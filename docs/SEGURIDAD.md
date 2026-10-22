# Seguridad de NEXA

## Protección implementada

- Cifrado autenticado AES-256-GCM mediante expo-crypto; nonce aleatorio de 12 bytes y etiqueta de 16 bytes. El contexto autenticado vincula cada registro a su ámbito.
- Clave aleatoria en SecureStore con disponibilidad WHEN_UNLOCKED_THIS_DEVICE_ONLY. Si hay datos cifrados y falta la clave, se informa el fallo y no se genera otra que los sobrescriba.
- AsyncStorage conserva registros cifrados de inventario, perfiles, intentos, marca, borradores e imágenes. No conserva PIN en claro: se verifica PBKDF2-SHA256, 100.000 iteraciones, salt aleatorio de 24 bytes.
- Cinco intentos fallidos generan una espera de un minuto, guardada antes de validar el siguiente intento.
- Separación de datos por identificador de perfil; el invitado usa ejemplos en memoria y no puede modificar información privada. El catálogo de ejemplo no carga datos de usuarios.
- Bloqueo con PIN al volver del segundo plano. Biometría opcional delegada al sistema. Protección de capturas y desenfoque del selector de apps según soporte del sistema.
- Migración de datos anteriores: validar, cifrar, leer y verificar antes de retirar el registro de texto anterior. Fotografías nuevas se reducen y cifran; solo se eliminan copias temporales del caché de la app, nunca originales de la galería.

## Límites

La copia manual del negocio se cifra con contraseña propia mediante AES-256-GCM y PBKDF2-SHA256 (210.000 iteraciones y salt aleatorio). El archivo no contiene perfiles ni PIN. El importador valida tamaño, versión y parámetros antes de derivar la clave; una contraseña incorrecta o un archivo alterado se rechazan. Fotos y logo se recifran para el nuevo perfil antes de confirmar en un solo registro el inventario, historial, marca, propuestas y borrador. Solo se restaura en un perfil vacío. No hay copia automática ni recuperación de esa contraseña. Los PDFs compartidos no se archivan dentro de la copia; se pueden regenerar desde las propuestas guardadas. Ver ARQUITECTURA.md para detalles y PRODUCTO.md para los pendientes de lanzamiento.

El sistema de perfiles es local. No hay servidor, autorización remota, copia en nube ni recuperación de PIN o clave. SecureStore depende de la instalación y de las políticas del sistema operativo. No se promete resistencia frente a un teléfono comprometido ni separación criptográfica independiente entre usuarios que controlan el mismo dispositivo.

Los archivos temporales usados por cámara y generación de PDF pueden existir mientras se procesa o comparte el contenido. Se intenta retirar las copias conocidas; una interrupción del proceso puede dejar caché pendiente. Imágenes cifradas de formularios cancelados pueden quedar sin referencia hasta una futura limpieza.

Un PDF que el usuario exporta es un documento legible fuera de NEXA. Solo contiene la propuesta comercial; no incluye costo de compra ni recargo. El usuario elige destino y destinatario desde el sistema.

La web solo ofrece una vista de ejemplo; no simula protección nativa. Las pruebas automatizadas verifican el formato de cifrado y las reglas con adaptadores de prueba, pero no certifican la implementación del hardware, Keychain/Keystore o los permisos. Falta la comprobación física en iPhone y Android.

El árbol de dependencias de Expo contiene avisos de seguridad de paquetes transitivos. No se aplicó una actualización forzada que rebajaría Expo y rompería compatibilidad; revisar los avisos y actualizar el SDK antes de una publicación comercial. Esta entrega académica no representa una auditoría de seguridad de producción.
