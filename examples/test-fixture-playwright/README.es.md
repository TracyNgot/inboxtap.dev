# Fixtures de Playwright + InboxTap

Inicia InboxTap como fixture de proceso y, después, un fixture de aplicación que use su
configuración SMTP dinámica. Cada prueba de Playwright recibe un buzón nuevo sin reservar puertos
fijos ni iniciar un navegador.

## Requisitos previos

- Node.js 20 o posterior

## Configuración

```bash
npm install
```

No hace falta descargar un navegador porque este ejemplo demuestra la composición de fixtures sin
usar el fixture `page`.

## Ejecutar las pruebas

```bash
npm test
```

Playwright inicia y detiene toda la cadena de dependencias de fixtures en cada proceso de trabajo.

## Cómo funciona

```ts
import { test as base } from "@playwright/test";
import { extendInboxTap } from "inboxtap/fixtures/playwright";
import nodemailer from "nodemailer";

interface App {
  sendWelcome(to: string): Promise<void>;
}

const withInboxTap = extendInboxTap(base);

export const test = withInboxTap.extend<object, { app: App }>({
  app: [
    async ({ inboxTap }, use) => {
      const transport = nodemailer.createTransport(inboxTap.smtp);
      await transport.verify();
      try {
        await use({
          async sendWelcome(to) {
            await transport.sendMail({
              from: "app@local.test",
              to,
              subject: "Welcome",
              text: "Your account is ready.",
            });
          },
        });
      } finally {
        transport.close();
      }
    },
    { scope: "worker" },
  ],
});
```

El fixture de proceso `app` depende del fixture de proceso `inboxTap`, por lo que Playwright
inicia InboxTap primero y lo cierra al final. El ejemplo ejecutable usa un pequeño objeto que
envía mensajes en lugar de una aplicación web para mostrar claramente el ciclo de vida.

## Aislamiento y limpieza

InboxTap solo se comparte en el ámbito del proceso de trabajo; el adaptador inyecta un `inbox`
nuevo en cada prueba. El fixture de la aplicación es propietario de su transporte y el cierre
ordenado por dependencias detiene ese transporte antes que InboxTap.

No uses la opción `webServer` de Playwright cuando la aplicación necesite el puerto SMTP dinámico
de InboxTap: `webServer` se inicia antes de que existan los fixtures de prueba. Inicia la
aplicación como un fixture de proceso dependiente, tal como hace este ejemplo.

## Solución de problemas

- **La aplicación no puede conectarse**: crea su transporte a partir de `inboxTap.smtp`; no
  copies un puerto fijo en la configuración.
- **La aplicación se inicia antes que InboxTap**: incluye `inboxTap` entre los argumentos de
  dependencia del fixture de la aplicación.
- **Falta el ejecutable del navegador**: este ejemplo no usa `page`; elimina los fixtures del
  navegador de las pruebas copiadas o instala el navegador que necesiten las pruebas de tu
  aplicación.
