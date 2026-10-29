# NEXA: preparación de producto y comparación

Estado del proyecto revisado el 29 de octubre de 2026. La comparación de proveedores corresponde a la consulta documental del 22 de octubre; no se volvió a comprobar en esta actualización. No es una prueba práctica de esas apps ni demuestra paridad de calidad.

## Referencias del mercado

| Producto                                                   | Funciones verificadas                                                                                                     | Implicación para NEXA                                                                                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [Sortly](https://www.sortly.com/features/)                 | Fotos, códigos y etiquetas, alertas, informes, trabajo offline y sincronización entre dispositivos                        | QR, fotos y offline son funciones esperables; la confiabilidad y la facilidad para encontrar productos pesan más que sumar sensores       |
| [Zoho Inventory](https://www.zoho.com/inventory/features/) | Compras y proveedores, varios depósitos, series/lotes, códigos de barras, pedidos, devoluciones, informes e integraciones | NEXA aún no cubre una operación comercial de ese tamaño; conviene enfocar el producto inicial en comercios pequeños con un único operador |

La oportunidad propuesta es una herramienta móvil en español para pequeños vendedores: SKU propio → escaneo → precio y stock → presupuesto con recargo → PDF con marca → venta. Es una hipótesis de posicionamiento que requiere validación con usuarios; no se afirma que la combinación sea exclusiva ni que los competidores carezcan de cotizaciones.

## Estado implementado

- Inventario, SKU único por perfil, foto, QR propio, búsqueda, venta con cambio de stock y dashboard.
- Cotización por recargo sobre costo, descuento, borrador y propuestas archivadas. PDF con logo, cliente/emisor, tabla y pie comercial; omite costos y porcentajes internos.
- Guardado del PDF en carpeta elegida, menú para compartir por WhatsApp/otras apps y preparación de correo con adjunto. El usuario elige destino y confirma el envío.
- Seguimiento de propuestas con expo-calendar implementado: formulario nativo para fecha, hora y calendario. Requiere compilación propia; falta validarlo en iPhone y Android.
- Datos locales cifrados, PIN, biometría opcional y bloqueo del segundo plano.
- Copia manual cifrada del negocio completo: inventario, ventas, fotos, logo, marca, movimientos, propuestas guardadas y borrador; restauración a perfil vacío preservando identificadores, SKU y etiquetas. No incluye perfiles, PIN ni PDFs ya compartidos.
- Escáner ampliado a QR, EAN/UPC, Code 128/39 y Data Matrix; linterna y pausa al salir del primer plano. Requiere validar cada formato en dispositivos físicos.

## Funciones nativas con propósito

| Función                 | Uso                                                                                            | Estado                                                                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Cámara/galería          | Fotos y lectura de etiquetas                                                                   | Implementado; verificación física pendiente                                                                                                   |
| Biometría               | Acceso al perfil sin volver a escribir el PIN                                                  | Implementado; Face ID requiere build propia; aviso de Expo Go corregido                                                                       |
| Háptica                 | Confirmación de acciones y nivel estable                                                       | Implementado; depende del dispositivo                                                                                                         |
| Archivos y compartir    | Copia cifrada y PDF desde el menú del teléfono                                                 | Implementado; prueba física de exportar/restaurar pendiente                                                                                   |
| Acelerómetro/giroscopio | Nivel para estanterías y estabilidad de la medición                                            | Implementado; herramienta orientativa, sin calibración certificada                                                                            |
| Calendario              | Seguimiento de una propuesta sin copiar cliente ni importes                                    | Implementado con expo-calendar; requiere compilación propia; prueba física pendiente                                                          |
| Correo con adjunto      | Preparar un mensaje con el presupuesto PDF                                                     | Implementado; requiere correo configurado; no confirma entrega al destinatario                                                                |
| NFC                     | Leer una etiqueta al acercar el teléfono, por ejemplo para ubicaciones o activos reutilizables | Pospuesto: requiere módulo/build propia y etiquetas compatibles; [no funciona en Expo Go](https://github.com/revtel/react-native-nfc-manager) |
| Brújula                 | Orientación en un depósito                                                                     | Sin caso de uso validado; no se implementó                                                                                                    |

Se conserva la compatibilidad con Expo Go para la entrega académica. Una build comercial y una entrega académica tienen verificaciones y distribución diferentes.

## Pendientes antes de cobrar por el producto

1. Probar en iPhone y Android: carga/venta/anulación, permisos rechazados, cámara, PDF de varias páginas, bloqueo, biometría, archivo de copia, reinstalación y restauración. Registrar evidencia y errores. Una compilación exitosa no valida estos puntos.
2. La copia completa y su restauración automatizada están implementadas; falta ejecutar y documentar la prueba física desde Archivos en iPhone y Android. Definir recuperación de PIN y políticas de pérdida de contraseña: hoy no se recuperan.
3. Repetir la auditoría de dependencias antes de publicar. La revisión del 22/10 bajó de 19 a 15 avisos altos propagados por dos dependencias de herramientas, sin corrección publicada en aquella consulta. El 27/10 se repitió la comprobación de su ausencia en los mapas de los bundles; eso no actualiza la auditoría de npm. Ver [DEPENDENCIAS.md](DEPENDENCIAS.md).
4. El historial conserva altas, ajustes, cambios, bajas, ventas y anulaciones con motivos y cantidades. Validar el flujo en hardware y definir devoluciones parciales/ajustes de períodos antes de ofrecer una auditoría comercial. El registro local no es inalterable ni fiscal.
5. Como ampliaciones futuras: importación/exportación CSV, agenda de clientes y proveedores, y gestión de pedidos de reposición. El seguimiento básico mediante calendario ya está implementado; su validación física sigue pendiente. El presupuesto no es una factura ni tiene integración fiscal.
6. Si el producto será colaborativo: servidor, cuentas recuperables, autorización en el servidor, sincronización offline con conflictos y respaldo remoto. Los perfiles actuales son locales y no sustituyen un equipo de trabajo.
7. Lanzamiento: documentación de privacidad, eliminación/retención de datos, accesibilidad, soporte, actualización/migraciones, control de errores sin información sensible, revisión de licencias y modelo de cobro. Elegir el modelo antes de integrar pagos o suscripciones.

## Criterio para la primera versión comercial

Enfocar el piloto en un único operador, inventario pequeño y operación local. No prometer varios teléfonos, cumplimiento fiscal, datos siempre respaldados ni una auditoría de seguridad certificada. Definir tiempos de tareas y probarlos con usuarios reales antes de elegir precio o prometer superioridad frente a otras apps.
