# NEXA: preparación de producto y comparación

Revisión: 22 de octubre de 2026. Comparación documental de funciones declaradas por los proveedores; no es una prueba práctica de sus apps ni demuestra paridad de calidad.

## Referencias del mercado

| Producto                                                   | Funciones verificadas                                                                                                     | Implicación para NEXA                                                                                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [Sortly](https://www.sortly.com/features/)                 | Fotos, códigos y etiquetas, alertas, informes, trabajo offline y sincronización entre dispositivos                        | QR, fotos y offline son funciones esperables; la confiabilidad y la facilidad para encontrar productos pesan más que sumar sensores       |
| [Zoho Inventory](https://www.zoho.com/inventory/features/) | Compras y proveedores, varios depósitos, series/lotes, códigos de barras, pedidos, devoluciones, informes e integraciones | NEXA aún no cubre una operación comercial de ese tamaño; conviene enfocar el producto inicial en comercios pequeños con un único operador |

La oportunidad propuesta es una herramienta móvil en español para pequeños vendedores: SKU propio → escaneo → precio y stock → presupuesto con recargo → PDF con marca → venta. Es una hipótesis de posicionamiento que requiere validación con usuarios; no se afirma que la combinación sea exclusiva ni que los competidores carezcan de cotizaciones.

## Estado implementado

- Inventario, SKU único por perfil, foto, QR propio, búsqueda, venta con cambio de stock y dashboard.
- Cotización por recargo sobre costo, descuento y PDF con marca. El PDF omite costos y porcentajes internos.
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
| NFC                     | Leer una etiqueta al acercar el teléfono, por ejemplo para ubicaciones o activos reutilizables | Pospuesto: requiere módulo/build propia y etiquetas compatibles; [no funciona en Expo Go](https://github.com/revtel/react-native-nfc-manager) |
| Brújula                 | Orientación en un depósito                                                                     | Sin caso de uso validado; no se implementó                                                                                                    |

Se conserva la compatibilidad con Expo Go para la entrega académica. Una build comercial y una entrega académica tienen verificaciones y distribución diferentes.

## Pendientes antes de cobrar por el producto

1. Probar en iPhone y Android: carga/venta/anulación, permisos rechazados, cámara, PDF de varias páginas, bloqueo, biometría, archivo de copia, reinstalación y restauración. Registrar evidencia y errores. Una compilación exitosa no valida estos puntos.
2. La copia completa y su restauración automatizada están implementadas; falta ejecutar y documentar la prueba física desde Archivos en iPhone y Android. Definir recuperación de PIN y políticas de pérdida de contraseña: hoy no se recuperan.
3. Se aplicaron actualizaciones compatibles: la auditoría bajó de 19 a 15 avisos, todos altos, propagados por dos dependencias de herramientas sin versión corregida publicada. Se verificó su ausencia en los bundles exportados. Ver DEPENDENCIAS.md; continuar siguiendo correcciones upstream.
4. El historial conserva altas, ajustes, cambios, bajas, ventas y anulaciones con motivos y cantidades. Validar el flujo en hardware y definir devoluciones parciales/ajustes de períodos antes de ofrecer una auditoría comercial. El registro local no es inalterable ni fiscal.
5. Importación/exportación CSV, clientes y proveedores, reposición y seguimiento de presupuestos. Evitar llamar factura al presupuesto: no tiene integración fiscal.
6. Si el producto será colaborativo: servidor, cuentas recuperables, autorización en el servidor, sincronización offline con conflictos y respaldo remoto. Los perfiles actuales son locales y no sustituyen un equipo de trabajo.
7. Lanzamiento: documentación de privacidad, eliminación/retención de datos, accesibilidad, soporte, actualización/migraciones, control de errores sin información sensible, revisión de licencias y modelo de cobro. Elegir el modelo antes de integrar pagos o suscripciones.

## Criterio para la primera versión comercial

Enfocar el piloto en un único operador, inventario pequeño y operación local. No prometer varios teléfonos, cumplimiento fiscal, datos siempre respaldados ni una auditoría de seguridad certificada. Definir tiempos de tareas y probarlos con usuarios reales antes de elegir precio o prometer superioridad frente a otras apps.
