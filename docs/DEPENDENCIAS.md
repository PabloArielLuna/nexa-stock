# Dependencias

## Revisión del 5 de noviembre de 2026

Se alinearon las seis actualizaciones recomendadas por Expo dentro del SDK 57: Expo 57.0.32, metro-runtime 57.0.18, constants 57.0.23, image-manipulator 57.0.22, image-picker 57.0.21 y sharing 57.0.25. React Native permanece en 0.86.3. Se agregó Playwright 1.62.1 solo como herramienta de desarrollo para el recorrido de navegador.

Antes de estas actualizaciones, npm audit informó 11 avisos (3 altos, 7 moderados y 1 bajo). Después quedaron **4 moderados, 0 altos y 0 críticos**: glob 13.0.6 y minimatch 10.2.6 dentro de @expo/fingerprint, más sus propagaciones a fingerprint y Expo. Los avisos corresponden a [recorrido de archivos tras cancelar glob](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) y [consumo de recursos en minimatch](https://github.com/advisories/GHSA-g3hv-75wg-m249). No son cuatro fallos independientes en NEXA.

La CLI y config usan glob 14.0.3/minimatch 11.0.5; fingerprint conserva versiones anteriores. La solución forzada sugerida por npm rebaja Expo a 53.0.11: no se aplicó. Estos pendientes requieren una actualización compatible de las herramientas. El control de mapas de fuentes incluye glob y minimatch además de los paquetes revisados anteriormente; no sustituye una auditoría de módulos nativos.

## Registro histórico del 22 de octubre de 2026

Se agregaron `expo-calendar ~57.0.6` y `expo-mail-composer ~57.0.2`, alineados con el catálogo de Expo SDK 57 para seguimientos y adjuntos por correo. No se incorporó `react-native-calendar-events`, cuyo repositorio está discontinuado. Las instalaciones mantuvieron los 15 avisos ya documentados; estos módulos no resolvieron los pendientes de las herramientas.

Este informe conserva los resultados de la consulta del **22/10/2026**. La revisión documental del 29/10 no vuelve a ejecutar npm audit ni verifica si se publicaron correcciones después de aquella fecha. La recuperación del 27/10 conservó el archivo de versiones y volvió a exportar y comprobar mapas de fuentes.

## Resultado del 22/10/2026

La auditoría inicial informó 19 avisos: 16 altos y 3 moderados. Después de aplicar actualizaciones compatibles y alinear expo-sharing con el SDK, quedaron 15 altos, 0 moderados y 0 críticos en aquella ejecución. Los 15 avisos restantes son propagaciones de dos paquetes transitivos de las herramientas; no son 15 fallos independientes en el código de NEXA.

Se mantuvieron Expo SDK 57 y React Native 0.86.3. Se actualizó Expo 57.0.25 → 57.0.31, la CLI y paquetes de soporte compatibles; expo-sharing 57.0.23 → 57.0.24; config-plugins 57.0.10 → 57.0.11 incorpora xcode 4.0.0, retirando uuid 7 del árbol. `expo install --check` confirma compatibilidad de versiones.

No se aplicó `npm audit fix --force`: su propuesta rebajaba Expo a 44 y React Native a 0.72, rompiendo la base del proyecto. No se modificó código criptográfico de terceros ni se ocultaron avisos con una lista de exclusión.

## Clasificación

| Paquete          | Aviso                                                                    | Alcance observado                                                              | Resolución                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| uuid 7.0.3       | [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) | Dependencia de xcode, usado por config-plugins para preparar proyectos nativos | Retirado mediante actualización compatible de config-plugins/xcode; la app no lo usaba para generar IDs                                                     |
| braces 3.0.3     | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | Micromatch/Metro: patrones de archivos en las herramientas de desarrollo       | La versión más reciente consultada el 22/10 seguía afectada. Pendiente una corrección upstream; no se agregó un parche improvisado al parser                |
| node-forge 1.4.0 | [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv) | Expo CLI/code-signing-certificates, manejo de certificados en las herramientas | La versión más reciente consultada el 22/10 seguía afectada. Pendiente una corrección upstream; el cifrado de datos de NEXA usa expo-crypto y no node-forge |

## Comprobación del código distribuido

Se exportaron Android, iOS y web con mapas de fuentes y se verificó que braces, node-forge y uuid no aparecen entre las fuentes de ninguno de esos bundles. `scripts/verificar-bundle.cjs` repite la comprobación y devuelve un error si aparece uno o si no hay mapas para revisar.

```sh
npx expo export --platform all --source-maps
node scripts/verificar-bundle.cjs
npm audit
npx expo install --check
npm run check
```

Esta comprobación clasifica el código JavaScript distribuido; no certifica todos los módulos nativos, las herramientas ni el pipeline. No equivale a eliminar los avisos de npm. Mientras los avisos sigan pendientes, las herramientas deben trabajar con código, configuración y certificados de confianza y los servidores de desarrollo no deben exponerse públicamente. Antes de una publicación comercial, repetir auditoría, revisar las correcciones disponibles y realizar las pruebas nativas pendientes.

## Compilación en Windows y OneDrive

Al reutilizar la caché, Metro clasificaba archivos de `@expo/devcert` como enlaces simbólicos por los reparse points de OneDrive y fallaba con `readlink(EINVAL)`. `metro.config.js` conserva la configuración de Expo y excluye únicamente del rastreo de Windows ese paquete de certificados del host, que no forma parte del bundle de la app. No se modificó el paquete ni se desactivó validación de certificados. La exportación se verifica también con caché existente.
