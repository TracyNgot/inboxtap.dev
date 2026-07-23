# Better Auth + Next.js + InboxTap

Una aplicación mínima de Next.js que usa [Better Auth](https://better-auth.com) para verificar
direcciones de correo, iniciar sesión mediante enlaces mágicos y enviar códigos OTP por correo
electrónico. Incluye un conjunto de pruebas de Playwright que recorre cada flujo con mensajes
reales capturados por [InboxTap](https://inboxtap.dev).

## Requisitos previos

- Node.js 20 o posterior
- `npx playwright install chromium` (descarga única del navegador)
- `better-sqlite3` compila un módulo nativo durante la instalación; si el proceso falla, necesitas
  una cadena de herramientas de C++ funcional (Xcode Command Line Tools en macOS o
  `build-essential` en Debian/Ubuntu)

## Configuración

```bash
npm install
npx playwright install chromium
```

## Ejecutar las pruebas

```bash
npm test
```

Las propias pruebas inician InboxTap y la aplicación, por lo que no hace falta abrir otra
terminal. La configuración `webServer` de Playwright inicia `npx inboxtap` (SMTP en `:1025` y la
API HTTP en `:8025`) y `next dev` (`:3000`), espera a que ambos puntos de comprobación de estado
estén disponibles y detiene todos los procesos al terminar.

## Ejecutar en modo interactivo

```bash
npx inboxtap
```

Después, en una segunda terminal:

```bash
npm run db:migrate
npm run dev
```

Abre http://localhost:3000, regístrate con cualquier dirección y consulta el mensaje capturado:

```bash
curl http://localhost:8025/api/emails/latest
```

## Cómo funciona

- `lib/mailer.ts` es el único punto de configuración SMTP: Nodemailer se conecta a
  `localhost:1025` (`secure: false`, `ignoreTLS: true`; InboxTap usa SMTP sin cifrado ni
  autenticación).
- Todas las devoluciones de llamada de Better Auth relacionadas con el correo
  (`sendVerificationEmail`, `sendMagicLink`, `sendVerificationOTP`) pasan por la misma función
  auxiliar `sendMail`. Cada mensaje contiene texto sin formato con exactamente un enlace o un
  código de seis cifras, por lo que su extracción es determinista.
- Las pruebas llaman a `inboxTap.createInbox()` dentro de cada caso. Cada buzón recibe una
  dirección única, de modo que los procesos paralelos de Playwright comparten un servidor
  InboxTap sin leer los mensajes de otros procesos y no es necesario limpiar `auth.db` entre
  ejecuciones.
- `inbox.waitForLink()` y `inbox.waitForCode()` consultan la API de InboxTap hasta que llega el
  mensaje. El filtro por asunto garantiza que la aserción apunte a un único mensaje.

Para desarrollar con una copia local de InboxTap en lugar de la versión de npm, genera un paquete
desde la raíz del repositorio (`bun run build && bun pm pack`) e instala aquí el archivo `.tgz`
resultante con `npm install`.

## Solución de problemas

- **`waitForLink` o `waitForCode` agota el tiempo de espera**: revisa los registros de la
  aplicación en busca de errores SMTP y comprueba que InboxTap está escuchando:
  `curl http://localhost:8025/health`.
- **El puerto ya está en uso**: otro proceso ocupa `:1025`, `:8025` o `:3000`. En local, la
  configuración reutiliza los servidores existentes, por lo que una instancia antigua de
  `next dev` de otro proyecto también cuenta.
- **Errores de esquema después de actualizar Better Auth**: elimina `auth.db` y vuelve a ejecutar
  `npm run db:migrate`; la base de datos contiene datos de prueba desechables.
