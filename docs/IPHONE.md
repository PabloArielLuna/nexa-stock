# iPhone, Expo Go y Face ID

## Calendario y presupuestos

El seguimiento desde Presupuestos guardados usa `expo-calendar` y requiere una compilación propia nueva. Expo Go muestra la limitación y conserva el resto de la app operativo. Guardar el PDF y compartirlo por WhatsApp/correo usan los menús del teléfono; preparar un correo adjunto requiere una cuenta de Mail configurada en iPhone. Consultar el flujo, privacidad y pruebas pendientes en [CALENDARIO-Y-PDF.md](CALENDARIO-Y-PDF.md).

## Entrega obligatoria

En Windows, abrí PowerShell en la carpeta del proyecto. Instalá Expo Go desde App Store en el iPhone y creá o usá una cuenta gratuita de Expo. Iniciá sesión con esa misma cuenta en Expo Go y ejecutá `npx expo login` en la PC. Luego ejecutá `npx expo start --go --port 8083`, manteniendo ambos equipos en la misma Wi-Fi. Escaneá el QR desde la cámara del iPhone y aceptá abrir Expo Go y el acceso a la red local si iOS lo solicita. Mantené la PC encendida y el servidor abierto durante la prueba. Ante problemas de red, detené con Ctrl+C y probá `npx expo start --go --tunnel --port 8083`.

Expo Go para iOS requiere que la cuenta de la CLI y la del teléfono coincidan: https://expo.dev/changelog/expo-go-57-login

Ejecutar `npm start` y abrir el QR con Expo Go compatible con SDK 57. Probar acceso con PIN, perfiles independientes, fotos, QR, nivel, ventas, persistencia y PDF. En iOS, Face ID de expo-local-authentication no funciona dentro de Expo Go; NEXA conserva el acceso con PIN y explica la limitación.

Fuente: https://docs.expo.dev/versions/latest/sdk/local-authentication/

## Face ID adicional desde Windows

EAS Build compila en la nube sin necesitar una Mac propia. Preparación (requiere cuentas y firma válidas):

```sh
npx eas-cli login
npx eas-cli build:configure
npx eas-cli device:create
npx eas-cli build --platform ios --profile preview
```

El proyecto incluye `eas.json` y la explicación de uso de Face ID en `app.json`. No se inició sesión ni se generó una build desde este trabajo. La distribución interna al iPhone usa registro del dispositivo y membresía paga de Apple Developer. El plan gratuito de EAS tiene una cuota limitada de compilaciones; no elimina los requisitos de Apple.

Fuentes: https://docs.expo.dev/build/internal-distribution/ y https://expo.dev/pricing

Tras instalar la build: configurar Face ID en el teléfono, entrar con PIN, habilitar biometría desde Mi espacio y probar acceso, regreso del segundo plano, cancelación y fallback a PIN. En Android se solicita biometría fuerte, como huella compatible. La disponibilidad depende del hardware y de tener biometría registrada.

## BrowserStack

BrowserStack ofrece dispositivos remotos para probar una app compilada. Su función biométrica permite simular respuestas de éxito, fallo y cancelación: sirve para probar el flujo, no para validar el reconocimiento de tu cara en tu iPhone. No equivale a alquilar una Mac de uso general. La prueba gratuita no garantiza que incluya todas las funciones del plan con biometría.

Fuentes: https://www.browserstack.com/docs/app-live/authentication-security y https://www.browserstack.com/pricing?product=app-live

Ya que tenés iPhone, la prueba física en tu dispositivo es la referencia para Face ID real.

## Lista de comprobación física pendiente

- Arranque y teclado con safe areas de iPhone; campos y botones accesibles.
- Cámara/galería: aceptar, rechazar y cancelar permisos; persistencia de foto tras reiniciar.
- Dos perfiles con inventarios y presupuestos distintos; invitado sin información privada.
- Bloqueo al regresar; intentos erróneos de PIN; captura y selector de apps según soporte.
- QR NEXA y propio vinculado: confirmar, reemplazar, desvincular, conflicto entre productos y entrada manual por SKU. Vender y volver a leer el mismo QR para comprobar stock actualizado. El lector debe abrirse dentro de NEXA.
- Nivel en superficie plana e inclinada, referencia y pausa al salir.
- Marca con y sin logo, PDF de una y varias páginas, nombres largos, acentos, cantidades y descuento.
- Compartir PDF a Archivos y al destino elegido; comprobar precios finales y ausencia de costo/recargo.
- Copia: exportar a Archivos, cancelar el menú y comprobar que no afirma haber guardado; seleccionar con contraseña errónea; verificar resumen; restaurar fotos, SKU, QR y ventas a un perfil vacío; reiniciar y comprobar persistencia. Intentar restaurar en un perfil con productos: debe impedirlo. Mantener el origen hasta verificar el destino.
- Escáner ampliado: EAN/UPC y Code 128/39/Data Matrix en dispositivos compatibles; linterna; cámara y luz apagadas al ir a segundo plano. No se importa automáticamente información de internet.
- En build propia: biometría aceptada, cancelada, no configurada y regreso a PIN.

Las pruebas en navegador solo comprueban la interfaz de ejemplo; estas verificaciones nativas siguen pendientes hasta usar un teléfono.
