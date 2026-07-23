# Fixtures de Vitest + InboxTap

Amplía Vitest con un servidor InboxTap por archivo y un buzón nuevo para cada prueba. Las dos
pruebas del ejemplo se ejecutan de forma concurrente mediante un único transporte SMTP configurado
dinámicamente, mientras sus mensajes capturados permanecen aislados.

## Requisitos previos

- Node.js 20 o posterior

## Configuración

```bash
npm install
```

## Ejecutar las pruebas

```bash
npm test
```

El fixture inicia InboxTap y verifica su transporte Nodemailer antes de ejecutar cualquiera de las
pruebas.

## Cómo funciona

```ts
import { extendInboxTap } from "inboxtap/fixtures/vitest";
import { test as base, expect } from "vitest";

const test = extendInboxTap(base);

test.concurrent("captures an isolated email", async ({ inboxTap, inbox }) => {
  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Welcome",
    text: "Your account is ready.",
  });

  const message = await inbox.waitForMessage({ subject: "Welcome" });
  expect(message.envelope.to).toEqual([inbox.address]);
});
```

`extendInboxTap()` proporciona un fixture `inboxTap` con ámbito de archivo y un fixture `inbox`
con ámbito de prueba. El fixture compartido expone el servidor, el cliente, la configuración SMTP
y un transporte Nodemailer listo para usar.

## Aislamiento y limpieza

Vitest crea una dirección de buzón nueva para cada prueba concurrente. El filtrado por destinatario
mantiene separados los mensajes de cada prueba, aunque el archivo comparta un único servidor SMTP.
El fixture con ámbito de archivo cierra su transporte y los procesos de escucha después de la
última prueba, incluso en las rutas de error.

## Solución de problemas

- **Falta un tipo del entorno de pruebas**: importa el adaptador desde
  `inboxtap/fixtures/vitest`, no desde la exportación raíz de InboxTap.
- **Se agotó el tiempo de espera**: envía el mensaje a la dirección `inbox.address` inyectada,
  no a un destinatario fijo.
- **Las pruebas comparten mensajes de forma inesperada**: usa el fixture `inbox` inyectado en
  cada prueba y evita crear un buzón en el ámbito del módulo.
