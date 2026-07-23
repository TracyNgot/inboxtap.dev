import {
  betterAuthCallbackSnippet,
  cypressTaskSnippet,
  nodemailerFixtureSnippet,
  playwrightFixtureSnippet,
  supabaseMagicLinkSnippet,
  vitestFixtureSnippet,
} from "../../snippets";
import type { ResourceContentDictionary } from "../../types";

export const integrationsEs = {
  "integrations/playwright": {
    cta: {
      description:
        "Consulta la receta completa para el flujo del navegador, incluido el inicio de servicios con puertos fijos, la introducción de OTP, los procesos paralelos y la solución de problemas.",
      label: "Leer la guía de Playwright",
      title: "Construye el flujo completo con Playwright",
    },
    description:
      "Inicia InboxTap en un recurso de Playwright, asigna un buzón único a cada prueba y comprueba en paralelo enlaces de verificación, OTP y restablecimientos de contraseña.",
    eyebrow: "Integración con Playwright",
    intro:
      "InboxTap conecta las acciones del navegador de Playwright con el correo que genera la aplicación real. Su adaptador gestiona un servidor SMTP y API local por proceso de trabajo e inyecta un destinatario nuevo en cada prueba, para que los flujos de correo paralelos sean deterministas sin compartir un buzón alojado.",
    kind: "integrations",
    relatedDocKey: "guides/playwright",
    section: "integraciones",
    sections: [
      {
        id: "ajustar-el-recurso-al-ciclo-de-vida",
        title: "Ajusta el recurso al ciclo de vida de Playwright",
        paragraphs: [
          "Importa el adaptador desde inboxtap/fixtures/playwright y amplía tu prueba de Playwright existente. El valor inyectado inboxTap tiene ámbito de proceso de trabajo, mientras que inbox tiene ámbito de prueba. Así, Playwright inicia el servicio local una vez por proceso, pero proporciona a cada prueba un destinatario distinto en el sobre SMTP.",
          "Esto sigue el modelo nativo de dependencias de Playwright: un recurso se prepara solo cuando lo necesita una prueba u otro recurso, y una dependencia se inicia antes que quien la consume y se desmonta después. InboxTap aprovecha ese orden para cerrar el transporte Nodemailer verificado y sus escuchas aunque falle una prueba.",
        ],
        links: [
          {
            href: "https://playwright.dev/docs/test-fixtures",
            label: "Documentación de recursos de Playwright",
          },
        ],
      },
      {
        code: {
          filename: "tests/fixtures.ts",
          language: "typescript",
          source: playwrightFixtureSnippet,
        },
        id: "iniciar-la-aplicacion-despues-de-inboxtap",
        title: "Inicia la aplicación después de InboxTap",
        paragraphs: [
          "Cuando la aplicación necesita un puerto SMTP elegido automáticamente, iníciala como un recurso de proceso de trabajo que dependa de inboxTap. Lee inboxTap.smtp al crear el proceso o el transporte de correo; contiene el host y el puerto asignados, además de secure: false e ignoreTLS: true.",
          "La configuración webServer de Playwright se inicia antes de que existan los recursos de prueba. Una aplicación iniciada allí no puede consumir un puerto que el recurso de InboxTap seleccione más tarde. Usa recursos dependientes para los puertos dinámicos o elige deliberadamente puertos fijos e inicia ambos servicios mediante webServer.",
        ],
      },
      {
        id: "ejecutar-el-flujo-de-correo-real",
        title: "Ejecuta el flujo de correo real",
        paragraphs: [
          "Rellena el formulario de la aplicación con inbox.address, envíalo desde el navegador y espera desde la prueba ejecutada en Node el enlace, código o mensaje completo esperado. El navegador no necesita credenciales del buzón ni importa el SDK de InboxTap.",
          "Usa waitForLink() para URL de verificación, acceso mediante enlace y restablecimiento; waitForCode() para códigos numéricos; y waitForMessage() cuando la comprobación necesite cabeceras, HTML o destinatarios del sobre. Valida el origen y la ruta esperados de una URL capturada antes de pedir a la página que la abra.",
        ],
        bullets: [
          "Crea el destinatario dentro de cada prueba o usa el recurso inbox inyectado.",
          "Configura el tiempo límite de InboxTap por debajo del de Playwright para que aparezca primero el error útil del correo.",
          "Filtra los mensajes por un asunto estable o una ruta de enlace cuando una plantilla contenga varias URL.",
        ],
      },
      {
        id: "mantener-aislados-los-procesos-paralelos",
        title: "Mantén aislados los procesos paralelos",
        paragraphs: [
          "El aislamiento procede del destinatario del sobre SMTP, no de vaciar un buzón global. Cada inbox inyectado tiene una dirección generada y todas sus llamadas al SDK filtran por ella. Por eso, las pruebas simultáneas pueden compartir un servicio del proceso sin apropiarse de mensajes ajenos.",
          "No crees un único TestInbox en el ámbito del módulo para toda una batería. Evita también el borrado global mientras haya otras pruebas activas: eliminar el estado compartido del servidor puede borrar un mensaje que otro destinatario todavía espera.",
        ],
      },
      {
        id: "comprobar-la-entrega-sin-filtrar-secretos",
        title: "Comprueba la entrega sin filtrar secretos",
        paragraphs: [
          "El adaptador de comparadores de Playwright devuelve un objeto expect ampliado. Usa toHaveDeliveredOnce(), toHaveRecipient() y toContainLink() cuando una comprobación concisa sea más clara que inspeccionar campos manualmente.",
          "toHaveDeliveredOnce() observa la instantánea actual del buzón; no espera el primer mensaje. Espera la entrega de la aplicación o llama antes a waitForMessage() cuando el correo se envíe en segundo plano. Los fallos de los comparadores omiten de forma intencionada el cuerpo, los valores de destinatarios y los enlaces que contienen tokens.",
        ],
      },
      {
        id: "mantener-el-comportamiento-en-la-prueba-de-la-aplicacion",
        title: "Mantén el comportamiento de la aplicación en su propia prueba",
        paragraphs: [
          "InboxTap demuestra qué llegó al límite SMTP local y ayuda a extraer el valor que necesita el navegador. La prueba de Playwright sigue siendo responsable de las garantías del producto: si un token es de un solo uso, si se rechaza un enlace caducado, si un reintento crea registros de negocio duplicados y si la sesión final tiene los permisos esperados.",
        ],
      },
    ],
    slug: "playwright",
    title: "Pruebas de correo con Playwright e InboxTap",
  },
  "integrations/cypress": {
    cta: {
      description:
        "Sigue la configuración completa de Cypress con tareas de enlaces y OTP, coordinación de tiempos límite, aislamiento en paralelo y alternativas mediante HTTP directo.",
      label: "Leer la guía de Cypress",
      title: "Conecta las tareas con un flujo del navegador",
    },
    description:
      "Ejecuta el SDK de Node de InboxTap mediante cy.task(), conserva cargas compatibles con JSON y comprueba enlaces y OTP de correo con una dirección nueva por prueba.",
    eyebrow: "Integración con Cypress",
    intro:
      "El código de las pruebas de Cypress se ejecuta en el navegador, mientras que el SDK de InboxTap realiza solicitudes HTTP locales desde Node. Un conjunto pequeño de controladores cy.task() crea un puente deliberado entre ambos entornos sin incorporar código exclusivo del servidor a la aplicación examinada.",
    kind: "integrations",
    relatedDocKey: "guides/cypress",
    section: "integraciones",
    sections: [
      {
        id: "respetar-el-limite-entre-el-navegador-y-node",
        title: "Respeta el límite entre el navegador y Node",
        paragraphs: [
          "Crea InboxTapClient en cypress.config.ts, dentro del proceso de Node de Cypress. Registra las tareas en setupNodeEvents y llámalas después desde la prueba para crear un destinatario y esperar un valor capturado.",
          "No importes inboxtap/client directamente en una prueba del navegador. Mantener el acceso de red en el proceso de tareas también evita que la API local necesite CORS o exponerse a la página examinada.",
        ],
      },
      {
        code: {
          filename: "cypress.config.ts",
          language: "typescript",
          source: cypressTaskSnippet,
        },
        id: "registrar-tareas-pequenas-y-serializables",
        title: "Registra tareas pequeñas y serializables",
        paragraphs: [
          "Devuelve cadenas simples, como la dirección generada, la URL capturada o el OTP. Cypress serializa todos los argumentos y resultados de las tareas, así que pasa los filtros de asunto y los patrones de expresiones regulares como cadenas, no como objetos RegExp, funciones ni instancias de clases.",
          "El controlador de una tarea debe devolver un valor o una promesa que se resuelva con uno. Cypress interpreta undefined como una tarea no controlada; devuelve null de forma explícita en una orden sin resultado.",
        ],
        links: [
          {
            href: "https://docs.cypress.io/api/commands/task",
            label: "Documentación de cy.task() de Cypress",
          },
        ],
      },
      {
        id: "crear-una-direccion-por-prueba",
        title: "Crea una dirección por prueba",
        paragraphs: [
          "Llama a la tarea createInbox dentro de cada prueba e introduce esa dirección exacta en la aplicación. Las tareas de espera posteriores reconstruyen un TestInbox a partir de la dirección y aplican el filtrado por destinatario en el servidor.",
          "Un destinatario nuevo es más fiable que vaciar un buzón compartido en beforeEach. Conserva las pruebas útiles para el diagnóstico e impide que las ejecuciones paralelas eliminen o lean mensajes ajenos.",
        ],
      },
      {
        id: "coordinar-los-dos-tiempos-limite",
        title: "Coordina los dos tiempos límite",
        paragraphs: [
          "El ayudante de espera de InboxTap tiene su propio timeoutMs, mientras que cy.task() dispone de un tiempo límite de orden de Cypress. Concede al tiempo exterior de Cypress un margen algo mayor que a la espera de InboxTap. Si la entrega falla, la tarea se rechazará con el contexto específico del correo en vez de que Cypress lo sustituya por un tiempo límite genérico.",
          "Mantén ambas esperas acotadas. Una prueba lenta debe fallar con contexto suficiente para saber si la aplicación omitió el envío, usó un puerto SMTP incorrecto o envió a otro destinatario.",
        ],
      },
      {
        id: "elegir-entre-el-sdk-y-http-directo",
        title: "Elige entre el SDK y HTTP directo",
        paragraphs: [
          "cy.request() puede acceder a la API HTTP de loopback de InboxTap mediante el proxy de Cypress en Node y basta para comprobar un pequeño endpoint. Las tareas del SDK suelen ser preferibles porque TestInbox examina mensajes existentes y recién llegados, filtra por destinatario y extrae enlaces o códigos.",
          "Elijas el enfoque que elijas, mantén InboxTap enlazado a loopback e inícialo junto con la aplicación antes de que comience Cypress. La integración está pensada para procesos locales y de CI en el mismo ejecutor, no para exponer un servicio de buzón sin autenticación.",
        ],
      },
    ],
    slug: "cypress",
    title: "Pruebas de correo con Cypress e InboxTap",
  },
  "integrations/vitest": {
    cta: {
      description:
        "Consulta en una sola guía todos los adaptadores de ejecutores, el comportamiento de los comparadores, el controlador de fallos, el flujo de informes y las garantías de limpieza.",
      label: "Leer la guía de ejecutores de pruebas",
      title: "Usa el resto de las herramientas de Vitest",
    },
    description:
      "Usa un servidor InboxTap por archivo, un buzón por prueba, comparadores nativos y limpieza automática en pruebas simultáneas de correo con Vitest.",
    eyebrow: "Integración con Vitest",
    intro:
      "El adaptador de Vitest de InboxTap asigna el costoso ciclo de vida del servicio al ámbito del archivo y el aislamiento de destinatarios al ámbito de cada prueba. Las pruebas reciben un transporte Nodemailer verificado, parámetros dinámicos de conexión y una dirección de buzón nueva sin mantener funciones personalizadas beforeAll y afterAll.",
    kind: "integrations",
    relatedDocKey: "guides/test-runners",
    section: "integraciones",
    sections: [
      {
        id: "usar-el-adaptador-oficial",
        title: "Usa el adaptador oficial",
        paragraphs: [
          "Instala InboxTap, Nodemailer 9 y Vitest, y amplía la prueba base desde inboxtap/fixtures/vitest. El adaptador inicia escuchas SMTP y HTTP en puertos asignados por el sistema operativo, verifica su transporte antes de ceder el control y cierra el estado parcial o completo del inicio cuando termina el ámbito del archivo.",
          "El paquete mantiene Vitest detrás de una subruta opcional. Importar la raíz de InboxTap o el SDK de cliente no carga Vitest ni Nodemailer en proyectos que no usan este recurso.",
        ],
        links: [
          {
            href: "https://vitest.dev/guide/test-context.html",
            label: "Documentación de recursos y contexto de prueba de Vitest",
          },
        ],
      },
      {
        code: {
          filename: "email.test.ts",
          language: "typescript",
          source: vitestFixtureSnippet,
        },
        id: "combinar-recursos-y-comparadores-nativos",
        title: "Combina recursos y comparadores nativos",
        paragraphs: [
          "El recurso inboxTap inyectado solo se comparte entre las pruebas de un archivo. Su transporte sirve para comprobar directamente una plantilla de correo, mientras que inboxTap.smtp puede configurar una instancia de la aplicación que deba recorrer todo el límite de integración.",
          "Registra el adaptador de comparadores con el objeto expect de Vitest. Espera toHaveDeliveredOnce() porque puede observar un intervalo de calma acotado; los comparadores de destinatarios y enlaces de cada mensaje siguen siendo síncronos.",
        ],
      },
      {
        id: "esperar-antes-de-tomar-una-instantanea",
        title: "Espera antes de tomar una instantánea",
        paragraphs: [
          "toHaveDeliveredOnce() comprueba los mensajes que ya existen. El envío mediante el transporte proporcionado se resuelve después de que InboxTap acepte y almacene la transacción, por lo que la instantánea inmediata del ejemplo es válida. Cuando la aplicación encola el correo y responde antes, espera primero inbox.waitForMessage() y comprueba después el recuento de entregas.",
          "quietMs puede detectar una entrega adicional durante ese intervalo explícito de observación, pero no demuestra que nunca vaya a producirse un reintento posterior. La idempotencia a largo plazo continúa siendo una garantía de la aplicación.",
        ],
      },
      {
        id: "ejecutar-pruebas-simultaneas-con-seguridad",
        title: "Ejecuta pruebas simultáneas con seguridad",
        paragraphs: [
          "Cada prueba recibe una dirección generada, incluso cuando los casos test.concurrent comparten el mismo servidor del archivo. El filtrado por destinatario mantiene independientes las lecturas de los buzones, así que no hace falta serializar las pruebas ni borrar el estado global entre ellas.",
          "Dirige las reglas de fallos SMTP a inbox.address cuando las pruebas simultáneas compartan un recurso. Una regla sin destinatario para la siguiente transacción puede ser consumida legítimamente por la entrega que alcance DATA en primer lugar.",
        ],
      },
      {
        id: "ejercitar-las-rutas-de-fallo",
        title: "Ejercita las rutas de fallo en el límite SMTP",
        paragraphs: [
          "Usa inboxTap.server.faults para devolver un 451 transitorio, un 550 permanente, un retraso acotado, una compuerta de pausa o una desconexión por bloques. Las transacciones fallidas o desconectadas no generan mensajes parciales capturados.",
          "InboxTap controla el comportamiento de entrega, no la capa de persistencia. Las pruebas todavía deben verificar el límite de reintentos, la espera incremental, la deduplicación, el estado visible para el usuario y los registros de negocio de la aplicación.",
        ],
      },
      {
        id: "delimitar-con-cuidado-los-recopiladores-de-informes",
        title: "Delimita con cuidado los recopiladores de informes",
        paragraphs: [
          "El adaptador de comparadores de Vitest amplía un objeto expect en el sitio. No adjuntes recopiladores de informes distintos para cada prueba a un mismo expect compartido mientras haya pruebas simultáneas. Usa el expect ligado a la prueba que ofrece Vitest, registra mensajes de forma explícita o crea deliberadamente un único informe para la batería.",
        ],
      },
    ],
    slug: "vitest",
    title: "Pruebas de correo con Vitest e InboxTap",
  },
  "integrations/better-auth": {
    cta: {
      description:
        "Sigue la configuración completa con Next.js y Playwright para la verificación, el acceso mediante enlace, la entrega de OTP y los reenvíos.",
      label: "Leer la guía de Better Auth",
      title: "Ejecuta los flujos de autenticación de principio a fin",
    },
    description:
      "Dirige a InboxTap las funciones de Better Auth para verificación, acceso mediante enlace, OTP y restablecimiento de contraseña, y comprueba después el flujo real con buzones aislados.",
    eyebrow: "Integración con Better Auth",
    intro:
      "Better Auth proporciona a la aplicación funciones para generar correos de autenticación, pero no elige por ella un transporte SMTP. Configura el emisor usado por esas funciones para que apunte a InboxTap y recorre los endpoints reales de registro, acceso, verificación y restablecimiento desde el navegador o una prueba de integración.",
    kind: "integrations",
    relatedDocKey: "guides/better-auth",
    section: "integraciones",
    sections: [
      {
        id: "asignar-cada-funcion-de-correo",
        title: "Asigna cada función de correo",
        paragraphs: [
          "La verificación usa emailVerification.sendVerificationEmail, el restablecimiento de contraseña usa emailAndPassword.sendResetPassword, y los complementos de enlace mágico y OTP por correo exponen sendMagicLink y sendVerificationOTP. Dirige cada función al mismo emisor local para que la prueba observe la plantilla que construye realmente la aplicación.",
          "Conserva sin cambios la URL generada o el OTP. Reconstruir una URL de autenticación dentro de la prueba puede ocultar errores de configuración en las URL de retorno, las listas de redirecciones permitidas, la codificación de tokens y las plantillas.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/concepts/email",
            label: "Documentación de correo de Better Auth",
          },
          {
            href: "https://better-auth.com/docs/plugins/magic-link",
            label: "Documentación de enlaces mágicos de Better Auth",
          },
          {
            href: "https://better-auth.com/docs/plugins/email-otp",
            label: "Documentación de OTP por correo de Better Auth",
          },
        ],
      },
      {
        code: {
          filename: "lib/auth.ts",
          language: "typescript",
          source: betterAuthCallbackSnippet,
        },
        id: "enviar-mediante-el-transporte-local",
        title: "Envía mediante el transporte local",
        paragraphs: [
          "Implementa sendLocalEmail con un transporte Nodemailer configurado para InboxTap: localhost, el puerto SMTP seleccionado, secure: false, ignoreTLS: true y sin campo auth. En una prueba basada en recursos, inyecta inboxTap.smtp en lugar de copiar un puerto dinámico.",
          "El fragmento devuelve la promesa de entrega para que los fallos sean deterministas en un ejemplo local. Better Auth recomienda el envío en segundo plano para reducir los canales laterales temporales en producción. Si sigues ese patrón, usa el mecanismo de tareas en segundo plano admitido por la plataforma y deja que la espera acotada de InboxTap observe la finalización.",
        ],
      },
      {
        id: "tratar-los-enlaces-como-secretos",
        title: "Trata los enlaces como secretos",
        paragraphs: [
          "Crea un destinatario nuevo de InboxTap para la prueba, inicia la operación de Better Auth y espera un enlace con un asunto o una ruta estable. Antes de navegar, analiza la URL y comprueba el origen y la ruta de retorno esperados sin imprimir el token.",
          "Un enlace mágico puede crear un usuario de forma predeterminada. Configura disableSignUp cuando el producto solo deba permitir el acceso a usuarios existentes y cubre de forma explícita los casos permitidos y rechazados.",
        ],
      },
      {
        id: "respetar-la-configuracion-del-otp",
        title: "Respeta la configuración del OTP",
        paragraphs: [
          "El complemento de OTP por correo de Better Auth usa seis dígitos de forma predeterminada, lo que coincide con el patrón inicial de waitForCode() de InboxTap. Si otpLength o generateOTP cambia el formato, pasa un patrón propio del proyecto en vez de suponer que todos los proveedores emiten seis dígitos.",
          "Para comprobar un reenvío, espera el segundo mensaje completo con afterId establecido en el identificador del primero y extrae el código nuevo del mensaje devuelto. Así distingues las entregas y la prueba de la aplicación puede demostrar si se invalidó el código anterior.",
        ],
      },
      {
        id: "cubrir-el-contrato-del-producto",
        title: "Cubre el contrato del producto",
        paragraphs: [
          "Capturar el correo es solo el punto intermedio. Continúa el flujo y comprueba el estado de verificación, la creación de la sesión, el destino de redirección, el tratamiento de tokens no válidos o caducados, los límites de intentos y la sustitución de la contraseña según la configuración de la aplicación.",
          "No incluyas secretos en títulos de pruebas, registros, instantáneas ni capturas de pantalla. Los comparadores de InboxTap ocultan valores con tokens y sus informes eliminan datos sensibles en la medida de lo posible; esto no autoriza a publicar artefactos de autenticación sin revisar.",
        ],
      },
    ],
    slug: "better-auth",
    title: "Prueba los correos de Better Auth con InboxTap",
  },
  "integrations/supabase": {
    cta: {
      description:
        "Consulta la referencia del cliente para elegir el ayudante adecuado de enlace, código, mensaje o patrón personalizado una vez establecida la conectividad SMTP.",
      label: "Explorar el SDK de cliente",
      title: "Automatiza el mensaje capturado",
    },
    description:
      "Descubre dónde encaja InboxTap junto a Mailpit, incluido en Supabase Auth, cuándo es posible la conectividad SMTP local y qué no pueden hacer los proyectos alojados con loopback.",
    eyebrow: "Integración con Supabase",
    intro:
      "Supabase ya incluye un receptor visual de correo para su entorno local de Auth. InboxTap resulta útil cuando una prueba necesita un SDK tipado y limitado al destinatario, extracción determinista, inyección de fallos o un artefacto con datos sensibles eliminados, pero solo si el proceso de Auth puede alcanzar realmente la escucha SMTP local.",
    kind: "integrations",
    relatedDocKey: "reference/client-sdk",
    section: "integraciones",
    sections: [
      {
        id: "elegir-mailpit-o-inboxtap",
        title: "Elige Mailpit o InboxTap según la tarea",
        paragraphs: [
          "La CLI de Supabase incluye Mailpit y expone de forma predeterminada su interfaz web en localhost:54324. Mantén esa opción cuando la necesidad principal sea inspeccionar visualmente las plantillas locales de Auth.",
          "Elige InboxTap cuando las pruebas automáticas se beneficien de una dirección única por caso, waitForLink() o waitForCode(), comparadores que no revelan contenido sensible, reglas de fallos deterministas o pruebas acotadas en HTML y JSON. Es una elección de flujo de pruebas, no una afirmación de que Supabase carezca de captura local de correo.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/local-development/cli/testing-and-linting",
            label: "Pruebas locales del correo de Auth en Supabase",
          },
        ],
      },
      {
        id: "resolver-primero-la-topologia-de-red",
        title: "Resuelve primero la topología de red",
        paragraphs: [
          "InboxTap se enlaza de forma predeterminada a las direcciones loopback del host. Un proceso de Supabase Auth dentro de un contenedor tiene su propia interfaz loopback, de modo que localhost dentro del contenedor no corresponde al proceso de InboxTap del host.",
          "Configura SMTP personalizado solo en una topología donde Auth pueda alcanzar la escucha sin exponer ampliamente un servicio de captura sin autenticación. No copies un enlace a 0.0.0.0 en una estación compartida ni en una red de CI. Del mismo modo, un proyecto alojado de Supabase no puede conectarse a la dirección loopback del portátil de una persona desarrolladora.",
        ],
      },
      {
        code: {
          filename: "auth-email.test.ts",
          language: "typescript",
          source: supabaseMagicLinkSnippet,
        },
        id: "comprobar-el-mensaje-despues-de-conectar-smtp",
        title: "Comprueba el mensaje después de conectar SMTP",
        paragraphs: [
          "Cuando la topología local o autoalojada elegida para Auth pueda alcanzar InboxTap, crea un destinatario e inicia signInWithOtp() mediante el cliente real de Supabase. A pesar de su nombre, este método envía de forma predeterminada un enlace mágico; la plantilla de correo decide si el usuario recibe una URL de confirmación o un código.",
          "Supabase crea de forma predeterminada un usuario cuando la dirección es desconocida. Configura shouldCreateUser como false si el producto solo permite el acceso sin contraseña a una cuenta existente y prepara esa cuenta antes de solicitar el mensaje.",
          "El enlace de confirmación predeterminado suele contener la ruta de verificación de Auth mostrada en el fragmento. Si el proyecto usa una plantilla PKCE personalizada o un endpoint de retorno propio, filtra y valida la URL que exige esa plantilla en lugar de fijar el valor predeterminado.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/auth/auth-email-passwordless",
            label: "Documentación de correo sin contraseña de Supabase",
          },
        ],
      },
      {
        id: "respetar-los-ajustes-de-plantillas-y-otp",
        title: "Respeta los ajustes de plantillas y OTP",
        paragraphs: [
          "Usar la variable Token en una plantilla de correo de Supabase genera un flujo OTP, mientras que la URL de confirmación genera un flujo de enlace. Comprueba el contrato representado, no lo deduzcas del nombre del método cliente.",
          "Supabase permite una longitud de OTP por correo de seis a diez dígitos. waitForCode() de InboxTap busca exactamente seis de forma predeterminada, así que proporciona un patrón para la longitud configurada. El arreglo de conveniencia CapturedEmail.codes se limita a valores de cuatro a ocho dígitos; un patrón personalizado de waitForCode() examina el cuerpo y es la opción adecuada para códigos de nueve o diez dígitos.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/auth/auth-email-templates",
            label: "Documentación de plantillas de correo de Supabase Auth",
          },
          {
            href: "https://supabase.com/docs/guides/local-development/cli/config",
            label: "Configuración de Auth en la CLI de Supabase",
          },
        ],
      },
      {
        id: "separar-las-pruebas-locales-de-las-alojadas",
        title: "Separa las pruebas locales de las alojadas",
        paragraphs: [
          "El servicio de correo predeterminado de Supabase alojado restringe los destinatarios y limita la frecuencia de entrega, mientras que su SMTP personalizado espera un servidor accesible por red y con credenciales. InboxTap no ofrece deliberadamente acceso público ni autenticación SMTP, por lo que no es un proveedor SMTP para proyectos alojados.",
          "Usa InboxTap en un entorno local o de CI aislado cuyo límite de red controles. Usa un proveedor autenticado adecuado para pruebas o entrega cuando un proyecto alojado de Supabase deba enviar a través de la red pública.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/auth/auth-smtp",
            label: "Documentación de SMTP personalizado de Supabase",
          },
        ],
      },
    ],
    slug: "supabase",
    title: "Prueba los correos de Supabase Auth con InboxTap",
  },
  "integrations/nodemailer": {
    cta: {
      description:
        "Continúa con un flujo ejecutable de Express y Vitest que comprueba enlaces, tokens personalizados, OTP, destinatarios y cabeceras.",
      label: "Leer la guía de Nodemailer",
      title: "Conecta un emisor real de la aplicación",
    },
    description:
      "Configura Nodemailer con un transporte local de InboxTap verificado, envía mensajes SMTP reales y comprueba destinatarios, enlaces, códigos y cabeceras.",
    eyebrow: "Integración con Nodemailer",
    intro:
      "InboxTap acepta el mismo mensaje SMTP que una aplicación Nodemailer envía a un proveedor de entrega, pero lo captura en memoria local acotada en lugar de retransmitirlo. El recurso oficial proporciona un transporte listo y parámetros SMTP dinámicos para que las pruebas ejerciten la construcción real del mensaje sin puertos fijos.",
    kind: "integrations",
    relatedDocKey: "guides/nodemailer",
    section: "integraciones",
    sections: [
      {
        id: "configurar-smtp-local-sin-cifrado",
        title: "Configura correctamente SMTP local sin cifrado",
        paragraphs: [
          "Un transporte Nodemailer manual para InboxTap usa el host y el puerto locales, secure: false, ignoreTLS: true y ningún objeto auth. secure: false indica que TLS no está activo al conectar; por sí solo, no impide que Nodemailer intente después una actualización STARTTLS.",
          "InboxTap desactiva la autenticación y STARTTLS porque es un servidor de captura limitado a loopback. Mantén esos ajustes de desarrollo separados del transporte autenticado y cifrado que se usa para la entrega en producción.",
        ],
        links: [
          {
            href: "https://nodemailer.com/smtp",
            label: "Documentación del transporte SMTP de Nodemailer",
          },
        ],
      },
      {
        code: {
          filename: "email.test.ts",
          language: "typescript",
          source: nodemailerFixtureSnippet,
        },
        id: "preferir-el-recurso-verificado",
        title: "Prefiere el recurso verificado",
        paragraphs: [
          "startInboxTapFixture() elige puertos SMTP y API libres, inicia el servidor, crea un transporte Nodemailer, llama a verify() y comprueba el endpoint de salud de InboxTap antes de devolver el control. Su método close() es idempotente y limpia tanto el transporte como las escuchas.",
          "El transporte del recurso resulta práctico en pruebas de integración de plantillas. Para comprobar el componente de correo de la aplicación, configúralo con inboxTap.smtp y envía mediante la API de la aplicación.",
        ],
      },
      {
        id: "entender-que-demuestra-la-verificacion",
        title: "Entiende qué demuestra la verificación del transporte",
        paragraphs: [
          "verify() de Nodemailer comprueba la resolución DNS, la conexión TCP, cualquier actualización TLS y la autenticación sin enviar un mensaje. No demuestra que un servidor acepte un remitente de sobre o un mensaje concretos.",
          "Conserva al menos una transacción sendMail() real en la prueba. InboxTap almacena el mensaje solo cuando SMTP DATA termina correctamente, por lo que el CapturedEmail resultante representa una entrega aceptada y no solo la disponibilidad del transporte.",
        ],
        links: [
          {
            href: "https://nodemailer.com/smtp#verifying-the-configuration",
            label: "Verificación del transporte de Nodemailer",
          },
        ],
      },
      {
        id: "comprobar-el-sobre-y-el-contenido",
        title: "Comprueba el sobre y el contenido",
        paragraphs: [
          "Usa toHaveRecipient() cuando importe el enrutamiento de entrega, porque compara el sobre SMTP y no una dirección visible analizada desde la cabecera del mensaje. Usa toContainLink() para URL HTTP o HTTPS extraídas y waitForCode() para un valor numérico.",
          "Usa waitForMessage() cuando la prueba necesite el asunto, las cabeceras normalizadas, el texto, el HTML, la fuente sin procesar o todos los enlaces extraídos. Evita imprimir el cuerpo o URL con tokens en los diagnósticos habituales.",
        ],
      },
      {
        id: "cerrar-cada-recurso-responsable",
        title: "Cierra cada recurso responsable",
        paragraphs: [
          "Coloca fixture.close() en un bloque finally cuando gestiones el ciclo de vida de forma explícita. Si la aplicación crea su propio transporte Nodemailer, su recurso debe cerrarlo antes de apagar InboxTap.",
          "Los adaptadores nativos para Bun, Vitest y Playwright automatizan este orden. Hacer explícita la responsabilidad evita que conexiones abiertas mantengan vivo el proceso de pruebas después de un fallo.",
        ],
      },
    ],
    slug: "nodemailer",
    title: "Prueba el correo de Nodemailer con InboxTap",
  },
} satisfies Partial<ResourceContentDictionary>;
