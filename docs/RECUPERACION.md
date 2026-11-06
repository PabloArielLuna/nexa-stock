# Copia y recuperación de los datos del negocio

Este documento trata de exportar e importar archivos cifrados **.nexa** desde la app. Es independiente de recuperar código fuente mediante GitHub. Última ejecución automatizada registrada: 5 de noviembre de 2026; la prueba física completa entre instalaciones sigue pendiente.

## Comprobación automatizada ejecutada

La prueba de integración crea un negocio sintético con foto de producto, logo, marca, presupuesto guardado, borrador, una venta anulada y un ajuste de stock. Guarda el archivo cifrado en un archivo temporal real `.nexa`.

Después se aíslan por completo el almacenamiento y el llavero de la instalación de origen. La instalación de destino descifra el archivo usando solo su contraseña, genera una clave de dispositivo independiente, recifra foto y logo, confirma todo el negocio en un registro cifrado y vuelve a leerlo. Se comparan SKU, IDs, cantidades, precios, ventas, motivos, movimientos, marca y propuestas; también se regenera el HTML del PDF con la marca y el logo recuperados.

Se verifican además contraseña incorrecta, archivo alterado, parámetros KDF inválidos, copias v1, logo ausente, datos inválidos y fallo de escritura sin restauración parcial de marca o propuestas. Los datos de prueba no son inventarios reales del usuario.

Esto valida formato, lógica y persistencia con adaptadores nativos de prueba. No equivale a reinstalar NEXA físicamente ni a comprobar Keychain/Keystore, el selector de Archivos o el menú de compartir en iOS/Android.

## Prueba física pendiente en iPhone y Android

1. Mantener el perfil de origen. Cargar un producto identificable con SKU, foto, costo, precio y cantidad; configurar la marca con logo y pie.
2. Generar una propuesta PDF, comprobar que está en Presupuestos guardados y guardar un borrador distinto.
3. Vender una unidad, anular con motivo y ajustar el stock con otro motivo. Revisar Historial de movimientos y que el ingreso excluya la venta anulada.
4. En Mi espacio → Copias de seguridad, exportar con una contraseña propia y guardar el archivo en Archivos/almacenamiento externo. Comprobar nombre, tamaño y que el archivo existe fuera de NEXA. Cancelar el menú no guarda una copia.
5. Instalar NEXA en otro dispositivo o usar otra instalación sin borrar el origen. Crear un perfil vacío con un PIN nuevo; seleccionar el archivo y probar primero una contraseña incorrecta. No debe modificar el destino.
6. Usar la contraseña correcta, revisar el resumen y confirmar. Comprobar producto, foto, SKU, QR, precios, stock, venta anulada, motivo, movimientos, marca, logo, borrador y propuesta archivada.
7. Cerrar y reabrir la app del destino. Generar de nuevo el PDF de la propuesta guardada y verificar membrete, logo, pie y precios.
8. Intentar restaurar en un perfil con datos: debe impedirlo. Conservar origen y archivo hasta completar todas las verificaciones.

Los PIN y perfiles no se copian: el usuario crea su acceso en la instalación nueva. Los PDFs ya compartidos no se transportan como archivos, pero las propuestas guardadas permiten generarlos otra vez. La copia antigua v1 puede carecer de marca, propuestas e historial; la app debe indicarlo sin inventar datos faltantes.

## Comprobación en navegador del 05/11/2026

Chrome descargó una copia cifrada real con producto, foto, marca, logo y presupuesto. Se restauró en otra cuenta vacía y se comprobó el producto y la imagen del logo. Las pruebas criptográficas adicionales comparan Web Crypto con AES-GCM de Node usando el mismo formato y parámetros del adaptador nativo; no sustituyen un traslado físico entre teléfono y navegador. El archivo .nexa es portable; los perfiles y PIN siguen siendo locales.
