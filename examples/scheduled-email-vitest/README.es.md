# Entrega programada de correos con Vitest

Este ejemplo mantiene la programación en el código de la aplicación mientras InboxTap observa la
entrega SMTP real. Un doble de prueba acotado de `MailProvider` expone `send`, `schedule` y
`cancel`; un reloj virtual inyectado hace que el trabajo pendiente sea determinista; y Nodemailer
envía cada mensaje inmediato o programado a una bandeja aislada de InboxTap.

## Requisitos previos

- Bun 1.3 o posterior
- InboxTap 1.4.1

## Configuración

```bash
cd examples/scheduled-email-vitest
bun install --frozen-lockfile
```

## Ejecutar las pruebas

```bash
bun run test
```

La infraestructura de pruebas inicia InboxTap en puertos dinámicos, crea una bandeja nueva para
cada prueba y cierra el transporte SMTP y ambos servidores cuando finaliza el archivo de pruebas.

## Qué demuestra el ejemplo

Los casos de Vitest abarcan todo el contrato local:

- `send` entrega el mensaje inmediatamente mediante Nodemailer.
- Un mensaje programado permanece ausente antes de la hora prevista.
- Avanzar el reloj hasta la hora prevista entrega el mensaje exactamente una vez.
- Cancelar elimina el trabajo pendiente antes de la entrega.
- Cuando varias entregas tienen la misma hora prevista, se conserva el orden de inserción; las que
  tienen una hora anterior siempre se procesan primero.
- La cola de pendientes rechaza entradas que superen el límite configurado y recupera capacidad
  después de una cancelación.

## Contrato del proveedor

`src/mail-provider.ts` define la interfaz que queda bajo la responsabilidad de la aplicación:

```ts
export interface MailProvider {
  cancel(id: string): boolean;
  schedule(message: MailMessage, scheduledAt: Date): string;
  send(message: MailMessage): Promise<void>;
}
```

`FakeMailProvider` copia cada mensaje antes de conservarlo y limita la cola de pendientes a 100
entradas. Las pruebas pueden elegir un límite menor. Los identificadores aumentan de forma
determinista dentro de cada instancia del proveedor, y cancelar un identificador desconocido o ya
cancelado devuelve `false`. `schedule()` exige una hora posterior a la del reloj virtual; usa
`send()` para los envíos inmediatos.

## Reloj virtual

`VirtualClock` mantiene la fecha actual y avisa a las funciones registradas cuando una prueba llama
a `advanceTo()` o `advanceBy()`. Rechaza fechas no válidas, retrocesos en el tiempo, duraciones
negativas y avances simultáneos. No intervienen temporizadores globales ni esperas basadas en el
reloj real.

El proveedor se suscribe a los avances del reloj, retira antes del envío las entradas que ya deben
procesarse, las ordena primero por hora prevista y después por orden de inserción, y espera cada
entrega de Nodemailer de forma secuencial. Cuando finaliza el avance del reloj, InboxTap ya muestra
todas las entregas programadas que hayan terminado correctamente.

## Entrega única y cancelación

El proveedor elimina una entrada antes de llamar a Nodemailer, por lo que volver a avanzar el reloj
no puede entregar dos veces el mismo elemento programado. Este doble de prueba demuestra
deliberadamente un único intento de entrega; las políticas de reintentos y persistencia siguen
siendo responsabilidad de la aplicación.

La cancelación solo se aplica al trabajo pendiente. Una vez iniciada la entrega, la entrada deja de
estar pendiente y `cancel()` devuelve `false`.

## Límites de responsabilidad

SMTP no define operaciones estándar para `scheduledAt` ni para la cancelación. Por eso InboxTap no
inventa ninguna. El ejemplo se encarga de la programación, el orden, la capacidad y la cancelación,
y después cruza el mismo límite entre Nodemailer y SMTP que utiliza un correo inmediato.

El doble de prueba se encuentra deliberadamente en `examples/`, no en el paquete público de
InboxTap. Es un contrato que una aplicación puede copiar o adaptar, no una promesa de que todos los
proveedores de correo ofrezcan la misma semántica de programación.

## Solución de problemas

- **Un mensaje aparece antes de la hora prevista**: comprueba que el código de la aplicación use el
  reloj inyectado en lugar de `Date.now()`.
- **La cola está llena**: cancela trabajo pendiente, avanza el reloj para entregar el trabajo que
  ya corresponda o aumenta el límite específico de la prueba hasta un máximo de 100.
- **Una prueba no termina**: espera a que finalice el avance del reloj; este espera a su vez la
  entrega subyacente de Nodemailer.
- **Falla un envío programado**: el error se propaga desde Nodemailer. Define el comportamiento de
  reintento en el contrato de la aplicación en lugar de ocultarlo en el doble de prueba.
