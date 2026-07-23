# Express + Nodemailer + InboxTap

Una pequeña API de Express que envía correos transaccionales mediante Nodemailer: un mensaje de
bienvenida con un enlace de verificación, una invitación con un token de un solo uso y un código
de acceso de un solo uso. Incluye un conjunto de pruebas de Vitest que captura y comprueba todos
los mensajes con [InboxTap](https://inboxtap.dev). Usa el adaptador de matchers de InboxTap para
Vitest a fin de expresar de forma concisa las aserciones de entrega, destinatario, enlaces y
cabeceras.

## Requisitos previos

- Node.js 20 o posterior

## Configuración

```bash
npm install
```

Este ejemplo fija InboxTap en la versión `1.3.0`, la primera que incluye matchers de aserción.

## Ejecutar las pruebas

```bash
npm test
```

Las propias pruebas inician InboxTap y la aplicación, por lo que no hace falta abrir otra
terminal. Cada archivo de pruebas inicia su propio servidor InboxTap y la aplicación en puertos
efímeros; así, los archivos pueden ejecutarse en paralelo sin conflictos de puertos.

## Ejecutar en modo interactivo

Inicia InboxTap en una terminal y la aplicación en otra:

```bash
npx inboxtap
```

```bash
npm run dev
```

Después, activa el envío de un mensaje y consulta lo que se ha capturado:

```bash
curl -X POST http://localhost:3001/signup \
  -H "content-type: application/json" \
  -d '{"email":"someone@local.test"}'

curl http://localhost:8025/api/emails/latest
```

## Cómo funciona

```
app (Express) → nodemailer → SMTP :1025 → InboxTap → HTTP API :8025 ← InboxTapClient (tests)
```

- `src/mailer.ts` contiene el único transporte de Nodemailer: `secure: false`,
  `ignoreTLS: true` y sin `auth`, porque InboxTap desactiva AUTH y STARTTLS.
- `src/app.ts` expone `createApp({ mailer, baseUrl })`. Inyectar el servicio de correo y la URL
  base permite que las pruebas conecten la misma aplicación a puertos efímeros.
- `test/helpers.ts` inicia toda la pila para cada archivo de pruebas:
  `new InboxTapServer({ apiPort: 0, smtpPort: 0 })`, un `InboxTapClient` conectado a
  `server.apiUrl` y la aplicación enlazada al puerto 0.
- `test/setup.ts` registra los matchers de InboxTap para Vitest en la propia instancia `expect`
  del entorno de pruebas.
- Cada prueba llama a `inboxTap.createInbox()` para obtener una dirección única; así, ninguna
  prueba ve los mensajes de otra y no es necesario limpiar nada entre ejecuciones.

## Registrar los matchers

Importa el adaptador de Vitest en un archivo de configuración y pásale la función `expect` nativa
de Vitest:

```ts
import { extendInboxTapExpect } from "inboxtap/matchers/vitest";
import { expect } from "vitest";

extendInboxTapExpect(expect);
```

El archivo de configuración se carga mediante `setupFiles` en `vitest.config.ts`. El matcher
asíncrono de entrega debe esperarse con `await`; los matchers de mensajes siguen siendo
síncronos:

```ts
await expect(inbox).toHaveDeliveredOnce({ subject: /welcome/i });

const email = await inbox.waitForMessage({ subject: /welcome/i });
expect(email).toHaveRecipient(inbox.address);
expect(email).toContainLink("/verify?token=");
expect(email).not.toHaveUnsubscribeHeader();
```

`toHaveDeliveredOnce()` comprueba la instantánea actual del buzón. Usa un valor `quietMs`
explícito cuando una prueba necesite un breve periodo de observación para detectar un duplicado,
pero no consideres ese intervalo como prueba de que no pueda producirse un reintento posterior.

Para probar este ejemplo con una compilación local de InboxTap en lugar del paquete publicado,
ejecuta `bun run build && bun pm pack` en la raíz del repositorio e instala aquí el archivo
generado: `npm install ../../inboxtap-<version>.tgz`.

## Solución de problemas

- **`waitFor…` agotó el tiempo de espera**: lo más probable es que la aplicación nunca enviara
  el mensaje. Revisa los registros de la aplicación y comprueba que el transporte apunte al host
  y al puerto SMTP que InboxTap mostró al iniciarse.
- **El puerto ya está en uso**: el conjunto de pruebas usa puertos efímeros y no se ve afectado,
  pero el modo interactivo usa de forma predeterminada 1025/8025 (InboxTap) y 3001 (aplicación).
  Detén el proceso que provoca el conflicto o configura `PORT` y `SMTP_PORT`.
- **Los mensajes aparecen en la interfaz, pero no en las pruebas**: realiza las aserciones sobre
  la misma dirección de buzón a la que envió la aplicación; `createInbox()` genera una dirección
  nueva en cada llamada.
- **Falta el tipo de un matcher**: registra `inboxtap/matchers/vitest` en el archivo de
  configuración correspondiente; el adaptador no se exporta deliberadamente desde la raíz del
  paquete InboxTap.
