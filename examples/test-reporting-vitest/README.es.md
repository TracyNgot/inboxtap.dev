# Informes de prueba con datos sensibles ocultos + Vitest

Genera pruebas deterministas en HTML y JSON a partir de una entrega SMTP real. Este proyecto
independiente de Vitest registra las observaciones de los matchers de InboxTap, una aserción de la
aplicación y el mensaje capturado, al tiempo que oculta secretos habituales y direcciones
personales.

## Requisitos previos

- Bun 1.3 o posterior

## Configuración

```bash
bun install --frozen-lockfile
```

InboxTap está fijado en la versión `1.4.1`, que incluye la API de informes y la protección
adicional para ocultar patrones personalizados en las URL.

## Ejecutar las pruebas

```bash
bun run test
```

La prueba deja los artefactos más recientes en `artifacts/verification-email.html` y
`artifacts/verification-email.json`. Git ignora el directorio.

## Qué demuestra el ejemplo

La prueba envía un mensaje de verificación mediante el transporte Nodemailer dinámico y, después:

- registra las observaciones de `toHaveDeliveredOnce`, `toHaveRecipient` y `toContainLink`;
- añade una aserción explícita de la aplicación;
- captura el mensaje sin incluir su fuente RFC sin procesar;
- escribe un documento HTML determinista y autónomo, además de un JSON con versión; y
- verifica que las direcciones, los secretos de las URL, una cabecera confidencial y un patrón
  proporcionado por quien llama no aparezcan en ninguno de los artefactos.

## Recopilar observaciones de los matchers

Crea un recopilador para la prueba y pásalo al adaptador de matchers de Vitest:

```ts
const report = new InboxTapReport({
  redaction: {
    additionalSensitiveHeaders: ["X-Workflow-Secret"],
    patterns: [/account-\d+/giu],
  },
});

extendInboxTapExpect(expect, { recorder: report });

await expect(inbox).toHaveDeliveredOnce({ subject: /verify/i });
expect(email).toHaveRecipient(inbox.address);
expect(email).toContainLink("/verify/");
```

No ejecutes de forma concurrente las pruebas que sustituyan el recopilador de los matchers. Una
instancia compartida de `expect` de Vitest no puede apuntar de forma segura a recopiladores
distintos en pruebas concurrentes.

## Añadir mensajes y aserciones

Las aserciones de la aplicación pueden hacer referencia al mensaje capturado e incluir detalles
estructurados. El recopilador asigna los identificadores de los mensajes de origen a
identificadores seguros para el informe y oculta los valores de los detalles:

```ts
report.addAssertion({
  details: {
    link: email.links[0],
    recipient: inbox.address,
  },
  messageId: email.id,
  name: "Application verification state",
  passed: true,
});

for (const message of await inbox.messages()) {
  report.addMessage(message);
}
```

## Escribir HTML y JSON

Escribe los artefactos desde `finally` para conservar pruebas de CI aunque falle un matcher:

```ts
try {
  await expect(inbox).toHaveDeliveredOnce({ subject: /verify/i });
} finally {
  for (const message of await inbox.messages()) report.addMessage(message);
  await Promise.all([
    report.write("artifacts/verification-email.json"),
    report.write("artifacts/verification-email.html"),
  ]);
}
```

`render()` y `write()` producen los mismos bytes deterministas para un mismo estado del
recopilador. El HTML es estático y autónomo, el marcado capturado está escapado y se aplica una
política restrictiva de seguridad de contenido.

## Alcance de la ocultación de datos sensibles

De forma predeterminada, los informes excluyen la fuente RFC sin procesar, seudonimizan de forma
coherente las direcciones de correo y ocultan las cabeceras confidenciales, las credenciales de
URL, todos los valores de las consultas, los fragmentos, los secretos semánticos u opacos de las
rutas, los tokens habituales y los patrones proporcionados por quien llama. Si estableces
`includeRaw: true`, solo se incluye una representación de la fuente en la que se han ocultado los
datos sensibles.

La ocultación de datos sensibles se realiza con el mayor cuidado posible, pero no garantiza que
siempre pueda detectarse cualquier información personal. Revisa todos los artefactos antes de
compartirlos, conserva los patrones personalizados y los nombres de cabeceras confidenciales cerca
de la aplicación y no consideres un informe como un almacén seguro de secretos.

## Ciclo de vida de los artefactos

El ejemplo elimina los artefactos antiguos al iniciar la siguiente ejecución de pruebas, conserva
la ejecución más reciente para inspeccionarla en local o cargarla en CI e ignora el directorio en
Git. Configura explícitamente el periodo de conservación en CI y elimina los informes cuando ya no
sean necesarios.

## Solución de problemas

- **No aparece ningún artefacto después de fallar una aserción**: mantén la recopilación de
  mensajes y ambas llamadas a `write()` dentro de `finally`.
- **Un valor privado sigue visible**: añade un patrón personalizado o un nombre de cabecera
  confidencial, vuelve a ejecutar la prueba y revisa de nuevo ambos formatos.
- **Las pruebas concurrentes registran observaciones ajenas**: usa un archivo de pruebas
  independiente o ejecuta de forma secuencial las pruebas que instalen recopiladores distintos en
  la misma instancia `expect` de Vitest.
- **El ejemplo resuelve una API que aún no se ha publicado**: instala con el archivo de bloqueo
  incluido y conserva `inboxtap` fijado exactamente en la versión `1.4.1`.
