# Documentación de NEXA

Revisión documental: 29 de octubre de 2026. Esta carpeta acompaña al proyecto y puede formar parte de la entrega académica. Describe el comportamiento implementado, sus límites y las comprobaciones disponibles.

## Qué leer

| Archivo                                    | Contenido                                            | Uso principal                                          |
| ------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------ |
| [ARQUITECTURA.md](ARQUITECTURA.md)         | Responsabilidades, organización y persistencia       | Evaluación técnica y mantenimiento                     |
| [SEGURIDAD.md](SEGURIDAD.md)               | PIN, cifrado, claves, exportaciones y límites        | Evaluación del alcance y mantenimiento                 |
| [CALENDARIO-Y-PDF.md](CALENDARIO-Y-PDF.md) | Seguimientos, guardar/compartir PDF y correo adjunto | Uso y comprobación de funciones nativas                |
| [IPHONE.md](IPHONE.md)                     | Expo Go, compilación propia y pruebas en dispositivo | Preparación del entorno y demostración                 |
| [RECUPERACION.md](RECUPERACION.md)         | Copia cifrada .nexa y restauración del negocio       | Uso y pruebas de recuperación de datos                 |
| [DEPENDENCIAS.md](DEPENDENCIAS.md)         | Auditoría fechada y compatibilidad del SDK           | Mantenimiento técnico                                  |
| [PRODUCTO.md](PRODUCTO.md)                 | Alcance actual y evolución comercial propuesta       | Contexto del producto; no amplía la consigna académica |

## Implementado y verificado son estados distintos

- **Implementado:** existe código para la función.
- **Verificado automáticamente:** pasó una comprobación local con reglas puras o adaptadores de prueba.
- **Verificado en dispositivo:** exige registrar el resultado real en iPhone o Android. No se deduce de una exportación o de una prueba simulada.

El 27/10/2026 se recuperó de GitHub la versión de código `19f8984`, con las últimas mejoras del calendario y del PDF. Pasaron **62 pruebas automatizadas**, la exportación para iOS/Android/web y la comprobación de mapas de fuentes. La revisión documental del 29/10 no es una nueva auditoría de dependencias ni otra sesión de pruebas físicas.

La plantilla PDF corregida se revisó visualmente en escritorio con una propuesta de una página y otra de 30 productos. La confirmación del PDF regenerado por el iPhone y la validación completa de permisos, cámara, sensores, compartir, restauración, calendario y biometría siguen pendientes de registrar en dispositivos.

## Entornos

| Entorno                       | Alcance                                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Expo Go compatible con SDK 57 | Perfiles locales con PIN, inventario, ventas, cámara/QR, sensores y exportaciones implementados. Requieren sus permisos y pruebas físicas. Calendario y Face ID de iPhone muestran su limitación. |
| Compilación propia            | Incluye los módulos configurados para calendario y biometría compatible. No se ha generado ni validado una compilación propia en dispositivos.                                                    |
| Web                           | Vista de ejemplo de catálogo/dashboard. No registra perfiles ni guarda datos protegidos ni simula funciones nativas.                                                                              |

## Dos respaldos diferentes

GitHub conserva código, recursos e historial. El archivo **.nexa** exportado desde la app conserva el negocio del perfil: productos, ventas, fotos, marca y propuestas, entre otros datos. Recuperar el repositorio no restaura automáticamente productos cargados en un teléfono. Perfiles y PIN tampoco se incluyen en la copia .nexa.

## Capturas

`capturas/nexa-inicio.jpg` y `capturas/nexa-sku.png` muestran pantallas de NEXA con ejemplos. Las imágenes numeradas del 1 al 6 son material histórico de GadgetStock; no representan toda la interfaz actual ni son evidencia de las pruebas nativas pendientes.
