# Inyección de fallos SMTP + Vitest

Prueba las rutas de reintento, concurrencia y recuperación de conexiones en el límite SMTP real.
Este proyecto independiente de Vitest usa el fixture de InboxTap para el entorno de pruebas, un
transporte local dinámico de Nodemailer y un buzón nuevo en cada prueba.

## Requisitos previos

- Bun 1.3 o posterior

## Configuración

```bash
bun install --frozen-lockfile
```

InboxTap está fijado en la versión `1.2.0`, la primera que incluye `server.faults`.

## Ejecutar las pruebas

```bash
bun run test
```

El conjunto de pruebas inicia InboxTap en puertos dinámicos de la interfaz de bucle local y cierra
el transporte y los procesos de escucha cuando termina el archivo.

## Qué demuestra el ejemplo

Las tres pruebas ejercitan el comportamiento SMTP en el nivel de entrega:

- una respuesta `451` que el código de la aplicación reintenta una vez;
- una pausa dirigida a un destinatario mientras se completa una transacción no relacionada; y
- una interrupción de la conexión seguida de una entrega correcta mediante una conexión nueva.

Las entregas fallidas o desconectadas nunca llegan al buzón. Un mensaje pausado solo aparece
después de liberar su compuerta.

## Reintento transitorio

Registra el fallo antes de activar la aplicación. La siguiente transacción que coincida consume la
regla cuando alcanza `DATA`:

```ts
inboxTap.server.faults.failNext({
  code: 451,
  message: "Temporary local failure",
  to: inbox.address,
});

const attempts = await sendWithOneRetry(() =>
  inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Retry receipt",
    text: "The application retries this delivery once.",
  }),
);
```

`sendWithOneRetry()` pertenece a la aplicación de este ejemplo. InboxTap devuelve la respuesta
SMTP configurada; no reintenta, conserva ni elimina duplicados del trabajo de la aplicación.

## Pausar y liberar

`pauseNext()` devuelve una compuerta aislada. Esperar hasta que la transacción esté en pausa hace
que el punto de concurrencia sea determinista:

```ts
const gate = inboxTap.server.faults.pauseNext({ to: inbox.address });
const pausedDelivery = inboxTap.transport.sendMail({
  from: "app@local.test",
  to: inbox.address,
  subject: "Paused receipt",
  text: "This message is not captured until release.",
});

await gate.waitUntilPaused();
expect(await inbox.messages()).toHaveLength(0);

await sendUnrelatedMessage();
gate.release();
await pausedDelivery;
```

La prueba libera la compuerta en `finally`, de modo que un fallo de aserción no pueda dejar la
transacción SMTP en espera.

## Recuperación tras una desconexión

Los umbrales de desconexión se aplican por fragmentos de datos. Un umbral de cero intenta cerrar
la conexión en cuanto empieza el procesamiento de `DATA`:

```ts
inboxTap.server.faults.disconnectNext({
  afterBytes: 0,
  to: inbox.address,
});

await expect(sendInterruptedMessage()).rejects.toBeInstanceOf(Error);
expect(await inbox.messages()).toHaveLength(0);

await sendRecoveredMessage();
expect(await inbox.messages()).toHaveLength(1);
```

El segundo envío demuestra la recuperación del transporte: es una transacción SMTP nueva y no
hereda el fallo ya consumido.

## Límites de responsabilidad

InboxTap se ocupa de capturar SMTP en local y de aplicar fallos de entrega deterministas. La
aplicación sigue siendo responsable de la política de reintentos, los trabajos duraderos, la
idempotencia y la eliminación de duplicados según la lógica de negocio. La función auxiliar de
reintento de este ejemplo es deliberadamente pequeña para que esas responsabilidades sean
visibles.

## Solución de problemas

- **La regla de fallo afecta a otra prueba**: dirígela siempre a la dirección
  `inbox.address` inyectada; cada prueba recibe un buzón nuevo.
- **Una prueba en pausa agota el tiempo de espera**: llama a `waitUntilPaused()` antes de
  inspeccionar el estado y libera la compuerta en `finally`.
- **Una aserción de desconexión espera un estado SMTP**: las interrupciones de conexión no
  incluyen una respuesta SMTP; comprueba que la promesa se rechace y verifica después la
  recuperación.
- **Una dependencia resuelve una API que aún no se ha publicado**: instala con el archivo de
  bloqueo incluido y conserva `inboxtap` fijado exactamente en la versión `1.2.0`.
