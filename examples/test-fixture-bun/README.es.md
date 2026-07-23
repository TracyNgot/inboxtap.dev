# Fixtures de Bun + InboxTap

Usa el adaptador de Bun de InboxTap para iniciar un servidor local de captura SMTP por archivo de
pruebas, mientras cada prueba crea su propio buzón. Ambos procesos de escucha usan puertos
dinámicos y el fixture los cierra cuando termina el archivo.

## Requisitos previos

- [Bun](https://bun.sh) 1.3 o posterior

## Configuración

```bash
npm install
```

## Ejecutar las pruebas

```bash
bun test
```

Las pruebas inician InboxTap automáticamente. No se necesita un proceso independiente de la
interfaz de línea de comandos ni puertos fijos.

## Cómo funciona

```ts
import { expect, test } from "bun:test";
import { setupInboxTap } from "inboxtap/fixtures/bun";

const inboxTap = setupInboxTap();

test("captures an email", async () => {
  const inbox = await inboxTap.createInbox();
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

`setupInboxTap()` registra las funciones asíncronas de ciclo de vida `beforeAll` y `afterAll` de
Bun. Su transporte Nodemailer preconfigurado apunta al puerto SMTP seleccionado dinámicamente y se
verifica antes de que empiecen las pruebas.

## Aislamiento y limpieza

Llama a `createInbox()` dentro de cada prueba. Cada llamada genera un destinatario único, por lo
que las pruebas pueden compartir el servidor sin compartir mensajes. El proceso de cierre
registrado detiene el transporte y ambos procesos de escucha de InboxTap aunque falle una prueba.

## Solución de problemas

- **InboxTap solo está disponible después de `beforeAll`**: declara `setupInboxTap()` en el
  ámbito del módulo, pero llama a sus métodos desde una prueba o una función posterior del ciclo de
  vida.
- **Se agotó el tiempo de espera**: comprueba que el mensaje se enviara a la dirección
  `inbox.address` de esa prueba.
- **El proceso no termina**: evita crear otro transporte o servidor fuera del fixture gestionado,
  salvo que también lo cierres.
