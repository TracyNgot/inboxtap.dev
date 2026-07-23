import type { ResourceContentDictionary } from "../../types";

type SpanishComparisonKey = "compare/mailhog" | "compare/mailpit" | "compare/mailtrap";

export const compareResourcesEs = {
  "compare/mailhog": {
    cta: {
      description:
        "Sitúa InboxTap, las herramientas de captura consultables en el navegador y los entornos alojados entre las opciones para desarrollo local y pruebas automatizadas.",
      label: "Explorar alternativas para probar correos",
      title: "Comparar un abanico más amplio de alternativas",
    },
    description:
      "Compara InboxTap y MailHog para captura SMTP local, pruebas automatizadas, inspección visual, simulación de fallos, almacenamiento e integración continua.",
    eyebrow: "Guía comparativa",
    intro:
      "InboxTap y MailHog capturan correo SMTP en local, pero optimizan formas de trabajo diferentes. InboxTap convierte la batería de pruebas en la interfaz principal. MailHog da prioridad a una bandeja en el navegador y a una API HTTP.",
    kind: "compare",
    relatedDocKey: "alternatives",
    section: "comparar",
    sections: [
      {
        id: "respuesta-breve",
        title: "Respuesta breve",
        paragraphs: [
          "Elige InboxTap cuando una prueba automatizada de TypeScript, Bun o Node deba iniciar el servidor, crear un destinatario aislado, esperar un enlace o código, provocar un fallo SMTP preciso y generar una evidencia de integración continua con los datos sensibles ocultos. Sus configuraciones oficiales abarcan Bun test, Vitest y Playwright.",
          "Elige MailHog cuando las personas necesiten una bandeja en el navegador, inspección de partes MIME, opciones de almacenamiento persistente, entrega mediante un servidor SMTP real o el modelo de caos Jim para todo el proceso. MailHog también dispone de una API JSON, por lo que no debe describirse como una herramienta exclusivamente manual.",
        ],
      },
      {
        id: "comparacion-funciones",
        title: "Comparación entre InboxTap y MailHog",
        paragraphs: [
          "La diferencia importante no es si ambos productos pueden capturar un correo. La cuestión es si el código de prueba o una bandeja visual compartida debe controlar la forma de trabajo.",
        ],
        table: {
          headers: ["Aspecto", "InboxTap", "MailHog"],
          rows: [
            [
              "Uso principal",
              "Pruebas automatizadas controladas por código para recorridos de la aplicación que dependen del correo.",
              "Captura local interactiva mediante una interfaz web, con una API HTTP para automatización.",
            ],
            [
              "Ejecución y distribución",
              "CLI de npm y paquete TypeScript; funciona con Node 20 o Bun sin exigir Docker.",
              "Binario de Go, paquete de Homebrew o imagen de Docker.",
            ],
            [
              "Interfaz web",
              "Sin panel para los mensajes capturados; el sitio web solo contiene documentación.",
              "Bandeja en el navegador para inspeccionar texto sin formato, HTML, código fuente y partes MIME.",
            ],
            [
              "Automatización",
              "Cliente tipado, funciones de espera larga, configuraciones nativas para las herramientas de prueba, aserciones especializadas y recopilación de informes HTML o JSON.",
              "API JSON y bibliotecas cliente de la comunidad enumeradas por el proyecto.",
            ],
            [
              "Aislamiento en pruebas paralelas",
              "Crea una dirección destinataria única para cada prueba y filtra el almacén por el destinatario del sobre SMTP.",
              "Utiliza un almacén de mensajes compartido; las baterías de pruebas deben dividir o filtrar sus propios mensajes.",
            ],
            [
              "Pruebas de escenarios fallidos",
              "Encola una regla acotada para la siguiente transacción DATA coincidente: fallo, demora, pausa y liberación o desconexión.",
              "Jim aplica probabilidades configuradas a las conexiones, la velocidad, la autenticación, los remitentes y los destinatarios.",
            ],
            [
              "Almacenamiento",
              "Almacén FIFO acotado solo en memoria; 100 mensajes de forma predeterminada.",
              "Memoria de forma predeterminada, con opciones documentadas de persistencia en MongoDB y Maildir.",
            ],
            [
              "Inspección de mensajes",
              "Texto, HTML, cabeceras, fuente sin procesar, destinatarios del sobre, enlaces HTTP y códigos de entre 4 y 8 dígitos; sin API para adjuntos.",
              "Texto sin formato, HTML, fuente, contenido MIME multiparte y partes MIME descargables en la interfaz web.",
            ],
            [
              "Comportamiento de salida",
              "Nunca retransmite ni reenvía los mensajes capturados.",
              "Puede entregar un mensaje almacenado mediante un servidor SMTP externo configurado.",
            ],
            [
              "Escucha de red predeterminada",
              "Escucha de forma predeterminada en las direcciones de bucle local IPv4 e IPv6.",
              "Los valores documentados de SMTP, API e interfaz escuchan en 0.0.0.0; la autenticación HTTP Basic está disponible para la interfaz y la API.",
            ],
            ["Licencia", "MIT.", "MIT."],
            [
              "Actividad oficial de versiones",
              "Publicado y versionado mediante npm.",
              "La página oficial todavía señala la versión 1.0.1 de agosto de 2020 como la más reciente; los últimos cambios visibles de la rama predeterminada son de agosto de 2022.",
            ],
          ],
        },
      },
      {
        id: "pruebas-de-fallos",
        title: "Los fallos deterministas y el caos general responden a necesidades distintas",
        paragraphs: [
          "Jim de MailHog es una función real para probar fallos. Puede rechazar conexiones, autenticación, remitentes o destinatarios, interrumpir sesiones y limitar la velocidad. Sus ajustes son probabilidades aplicadas a todo el proceso. Una probabilidad puede convertir un comportamiento en sistemático, pero Jim no es una cola propia de cada prueba para la siguiente transacción dirigida a un destinatario aislado.",
          "InboxTap registra los fallos directamente en la prueba. Un filtro de destinatario compara el sobre SMTP sin distinguir mayúsculas de minúsculas, y la siguiente transacción coincidente que alcanza DATA consume una regla. Las entregas fallidas o interrumpidas no entran en el almacén; los correos demorados o en pausa solo aparecen después de completarse correctamente.",
          "Por tanto, Jim resulta útil para experimentos generales de caos, mientras que InboxTap sirve para aserciones precisas sobre reintentos, eliminación de duplicados, latencia y envíos simultáneos. Ningún modelo es siempre mejor: responden a preguntas de prueba diferentes.",
        ],
      },
      {
        id: "que-herramienta",
        title: "¿Qué herramienta deberías elegir?",
        paragraphs: [
          "Un equipo también puede utilizar ambas: MailHog para obtener información visual durante el desarrollo e InboxTap dentro de la batería automatizada.",
        ],
        bullets: [
          "Elige InboxTap cuando la herramienta de ejecución de pruebas deba controlar el inicio, la limpieza, el aislamiento de destinatarios, las aserciones y los fallos.",
          "Elige InboxTap cuando el envío externo de cualquier mensaje capturado deba quedar fuera del alcance del producto.",
          "Elige MailHog cuando una bandeja en el navegador sea la forma principal de inspeccionar los mensajes.",
          "Elige MailHog cuando un proceso existente dependa del almacenamiento en MongoDB o Maildir, de la descarga de partes MIME o de la entrega de mensajes.",
          "Si el ritmo de mantenimiento importa a tu organización, contrasta las fechas publicadas de las versiones y cambios de MailHog con tu propia política, sin depender de calificativos como «muerto» o «abandonado».",
        ],
      },
      {
        id: "fuentes-verificadas",
        title: "Fuentes verificadas el 23 de julio de 2026",
        paragraphs: [
          "Esta comparación utiliza los repositorios y la documentación de los propios productos. Las funciones y el estado de las versiones pueden cambiar después de la fecha de revisión.",
        ],
        links: [
          {
            href: "https://github.com/TracyNgot/inboxtap.dev/blob/main/README.md",
            label: "README de InboxTap y alcance público de sus funciones",
          },
          {
            href: "https://github.com/mailhog/MailHog",
            label: "README de MailHog y lista de funciones",
          },
          {
            href: "https://github.com/mailhog/MailHog/blob/master/docs/JIM.md",
            label: "Documentación de la función de caos Jim de MailHog",
          },
          {
            href: "https://github.com/mailhog/MailHog/blob/master/docs/CONFIG.md",
            label: "Configuración y direcciones de escucha predeterminadas de MailHog",
          },
          {
            href: "https://github.com/mailhog/MailHog/releases",
            label: "Versiones oficiales de MailHog",
          },
          {
            href: "https://github.com/mailhog/MailHog/commits/master/",
            label: "Historial de cambios de la rama predeterminada de MailHog",
          },
        ],
      },
    ],
    slug: "mailhog",
    title: "InboxTap o MailHog: ¿qué herramienta local encaja en tus pruebas de correo?",
  },
  "compare/mailpit": {
    cta: {
      description:
        "Compara SDK de pruebas específicos, servidores de correo locales con interfaz y entornos alojados antes de elegir una forma de trabajo.",
      label: "Explorar alternativas para probar correos",
      title: "Consultar la guía completa de alternativas",
    },
    description:
      "Compara InboxTap y Mailpit para pruebas automatizadas de correo, inspección web, fallos SMTP, almacenamiento, evidencias de integración continua y desarrollo local.",
    eyebrow: "Guía comparativa",
    intro:
      "Mailpit es un servidor completo y mantenido activamente para probar correo, con una amplia interfaz web y una API. InboxTap es un servidor de captura SMTP y un SDK de pruebas más específicos, distribuidos mediante npm. Ambos automatizan pruebas de correo y simulan fallos SMTP, pero en niveles distintos.",
    kind: "compare",
    relatedDocKey: "alternatives",
    section: "comparar",
    sections: [
      {
        id: "respuesta-breve",
        title: "Respuesta breve",
        paragraphs: [
          "Elige Mailpit si necesitas un entorno visual completo con adjuntos, búsqueda avanzada, comprobación de HTML y enlaces, análisis opcional de correo no deseado, capturas de pantalla, almacenamiento persistente, POP3, retransmisión, reenvío y notificaciones HTTP.",
          "Elige InboxTap cuando el código de prueba deba controlar el ciclo de vida del servidor, disponer de un destinatario nuevo por prueba, efectuar aserciones tipadas, provocar fallos deterministas en la siguiente entrega y generar evidencias de integración continua con datos sensibles ocultos. Mailpit también dispone de una API REST y de la función Chaos: no es exclusivamente manual ni está limitado a entregas correctas.",
        ],
      },
      {
        id: "comparacion-funciones",
        title: "Comparación entre InboxTap y Mailpit",
        paragraphs: [
          "Mailpit cubre más usos operativos y visuales para probar el correo. InboxTap mantiene deliberadamente un ámbito más reducido en torno a pruebas deterministas de la aplicación.",
        ],
        table: {
          headers: ["Aspecto", "InboxTap", "Mailpit"],
          rows: [
            [
              "Uso principal",
              "Pruebas de integración y de extremo a extremo que dependen del correo, controladas desde TypeScript.",
              "Inspección visual del correo y pruebas de integración controladas mediante API.",
            ],
            [
              "Ejecución y distribución",
              "CLI de npm y paquete TypeScript para Node 20 o Bun; Docker no es necesario ni se proporciona.",
              "Un único binario estático o una imagen de Docker para varias arquitecturas.",
            ],
            [
              "Interfaz web",
              "Sin interfaz para los mensajes capturados.",
              "Interfaz moderna con búsqueda de mensajes, vistas HTML y de código fuente, adjuntos, etiquetas, capturas de pantalla y actualizaciones en directo.",
            ],
            [
              "Automatización",
              "SDK tipado, espera larga acotada, configuraciones para Bun, Vitest y Playwright, aserciones especializadas y recopilador de informes.",
              "API REST, puntos de acceso para mensajes representados y opciones documentadas de pruebas de integración, incluido un paquete para Cypress.",
            ],
            [
              "Aislamiento en pruebas paralelas",
              "Un destinatario de sobre único generado por prueba, sin registro en el servidor.",
              "Una instancia y un almacén compartidos; utiliza filtros, etiquetas, configuración de inquilino o instancias distintas para dividir el trabajo.",
            ],
            [
              "Pruebas de escenarios fallidos",
              "Una regla en cola se aplica a la siguiente transacción DATA coincidente y puede hacer que falle, demorarla, pausarla o desconectarla.",
              "Chaos aplica, según una probabilidad, errores configurables de 400 a 599 en las etapas de remitente, destinatario o autenticación.",
            ],
            [
              "Almacenamiento",
              "FIFO acotado solo en memoria, con 100 mensajes conservados de forma predeterminada.",
              "SQLite temporal de forma predeterminada, con SQLite persistente o rqlite como opciones y eliminación automática por encima de 500 mensajes de forma predeterminada.",
            ],
            [
              "Inspección de mensajes",
              "Texto, HTML, cabeceras, fuente sin procesar, enlaces y códigos numéricos cortos; los adjuntos quedan fuera del alcance.",
              "Adjuntos, compatibilidad HTML, comprobación de enlaces, análisis opcional con SpamAssassin, capturas de pantalla y validación de List-Unsubscribe.",
            ],
            [
              "Comportamiento de salida",
              "Sin retransmisión, reenvío, notificaciones HTTP ni comprobación externa de enlaces.",
              "Retransmisión SMTP, reenvío, notificaciones HTTP, POP3 y solicitudes HTTP para comprobar enlaces como opciones.",
            ],
            [
              "Red y transporte",
              "Bucle local de forma predeterminada; la autenticación SMTP y STARTTLS están desactivados de forma intencionada.",
              "HTTP y SMTP escuchan en 0.0.0.0 de forma predeterminada, con autenticación, HTTPS, STARTTLS y TLS configurables.",
            ],
            [
              "Evidencias de integración continua",
              "Informes HTML autónomos y deterministas o JSON versionados, con ocultación acotada de datos sensibles aplicada en la medida de lo posible.",
              "Capturas de pantalla de la interfaz y resultados de la API; la documentación pública consultada no describe un recopilador equivalente de artefactos con datos sensibles ocultos.",
            ],
            ["Licencia", "MIT.", "MIT."],
          ],
        },
      },
      {
        id: "pruebas-de-fallos",
        title: "Diferencias entre los dos modelos de fallo",
        paragraphs: [
          "Mailpit Chaos puede devolver un código de error SMTP elegido entre 400 y 599 en la etapa del remitente, del destinatario o de la autenticación. Sus activadores se basan en probabilidades, pero un valor del 100 % puede hacer que una etapa falle siempre. Después de iniciar Mailpit con Chaos habilitado, la interfaz web y la API pueden modificar esos activadores durante la ejecución.",
          "InboxTap toma una regla acotada cuando la siguiente transacción coincidente alcanza DATA. La regla puede dirigirse al destinatario de sobre único creado para una prueba y provocar un fallo, una demora artificial, una barrera de pausa aislada o un corte de conexión. El restablecimiento y el apagado interrumpen las esperas activas.",
          "El modelo de Mailpit resulta adecuado para cambiar el comportamiento de un entorno en ejecución y probar errores en distintas etapas SMTP. El modelo de InboxTap permite que una prueba prepare una transacción precisa antes de activar el código de la aplicación. Sería inexacto afirmar que Mailpit no puede probar los reintentos o que su función Chaos siempre es aleatoria.",
        ],
      },
      {
        id: "que-herramienta",
        title: "¿Qué herramienta deberías elegir?",
        paragraphs: [
          "Los productos pueden complementarse. Un equipo puede utilizar Mailpit como bandeja visual durante el desarrollo e InboxTap para pruebas automatizadas específicas que necesiten un ciclo de vida tipado y aserciones.",
        ],
        bullets: [
          "Elige InboxTap cuando una herramienta de ejecución de TypeScript deba iniciar y detener el servicio SMTP en puertos dinámicos.",
          "Elige InboxTap para escenarios deterministas de demora, pausa, desconexión y fallo en la siguiente entrega, dirigidos por destinatario.",
          "Elige Mailpit cuando el equipo de desarrollo necesite una bandeja cuidada, inspección de adjuntos, comprobaciones de compatibilidad HTML o de enlaces, capturas de pantalla o análisis de correo no deseado.",
          "Elige Mailpit si necesitas almacenamiento persistente, POP3, retransmisión, reenvío, notificaciones HTTP, autenticación o TLS.",
          "Cuando ejecutes Mailpit en una red compartida, revisa los ajustes de escucha, autenticación y TLS en lugar de suponer que solo escucha en el bucle local.",
        ],
      },
      {
        id: "fuentes-verificadas",
        title: "Fuentes verificadas el 23 de julio de 2026",
        paragraphs: [
          "La versión oficial más reciente de Mailpit durante esta revisión era la v1.30.5, publicada el 20 de julio de 2026. Los números de versión y los detalles de las funciones deben volver a comprobarse cuando esta página reciba una actualización importante.",
        ],
        links: [
          {
            href: "https://github.com/TracyNgot/inboxtap.dev/blob/main/README.md",
            label: "README de InboxTap y alcance público de sus funciones",
          },
          {
            href: "https://mailpit.axllent.org/docs/",
            label: "Documentación oficial de las funciones de Mailpit",
          },
          {
            href: "https://mailpit.axllent.org/docs/integration/",
            label: "Documentación de las pruebas de integración con Mailpit",
          },
          {
            href: "https://mailpit.axllent.org/docs/integration/chaos/",
            label: "Documentación de la función Chaos de Mailpit",
          },
          {
            href: "https://mailpit.axllent.org/docs/configuration/email-storage/",
            label: "Documentación del almacenamiento de Mailpit",
          },
          {
            href: "https://mailpit.axllent.org/docs/configuration/runtime-options/",
            label: "Opciones de ejecución y direcciones de escucha actuales de Mailpit",
          },
          {
            href: "https://github.com/axllent/mailpit/releases/latest",
            label: "Versión oficial más reciente de Mailpit",
          },
        ],
      },
    ],
    slug: "mailpit",
    title: "InboxTap o Mailpit: ¿SDK de pruebas o entorno completo para el correo?",
  },
  "compare/mailtrap": {
    cta: {
      description:
        "Compara SDK de pruebas locales, capturadores visuales de correo y servicios colaborativos alojados en la guía completa de alternativas.",
      label: "Explorar alternativas para probar correos",
      title: "Elegir la forma de trabajo, no solo la marca",
    },
    description:
      "Compara InboxTap, Mailtrap Local y Email Sandbox alojado para automatización, inspección visual, colaboración, fallos, privacidad y coste.",
    eyebrow: "Guía comparativa",
    intro:
      "Mailtrap ya no se limita a un servicio alojado. Mailtrap Local es un entorno en localhost con licencia MIT, interfaz web integrada y API REST, mientras que Mailtrap Email Sandbox sigue siendo el servicio colaborativo alojado. InboxTap es el SDK de pruebas más específico distribuido mediante npm.",
    kind: "compare",
    relatedDocKey: "alternatives",
    section: "comparar",
    sections: [
      {
        id: "tres-productos",
        title: "Tres productos para tres formas de trabajo principales",
        paragraphs: [
          "Elige InboxTap cuando el código de prueba automatizado deba controlar el ciclo de vida SMTP, los destinatarios aislados, las aserciones, los fallos deterministas y los artefactos con datos sensibles ocultos.",
          "Elige Mailtrap Local cuando una persona que desarrolla quiera inspeccionar visualmente los mensajes sin conexión, trabajar con adjuntos, comprobar la compatibilidad HTML, conservar un historial SQLite y utilizar una API REST local.",
          "Elige Mailtrap Email Sandbox alojado cuando un equipo necesite proyectos y entornos compartidos, perfiles de usuario, acceso remoto desde preproducción, reenvío, análisis alojados y colaboración según el plan.",
        ],
      },
      {
        id: "comparacion-funciones",
        title: "Comparación entre InboxTap, Mailtrap Local y Email Sandbox",
        paragraphs: [
          "Separar Mailtrap Local del producto alojado evita la afirmación desactualizada de que cualquier uso de Mailtrap envía los datos de prueba a un servicio remoto.",
        ],
        table: {
          headers: ["Aspecto", "InboxTap", "Mailtrap Local", "Email Sandbox alojado"],
          rows: [
            [
              "Uso principal",
              "Pruebas automatizadas, deterministas, de integración y de extremo a extremo.",
              "Desarrollo visual local e inspección individual de mensajes.",
              "Desarrollo compartido, control de calidad, preproducción y colaboración en equipo.",
            ],
            [
              "Ejecución y distribución",
              "CLI de npm y paquete TypeScript para Node 20 o Bun.",
              "Homebrew, Docker o un único binario para macOS o Linux; Windows todavía no era compatible en el README revisado.",
              "Servicio SMTP y API alojado al que se accede con las credenciales del entorno.",
            ],
            [
              "Interfaz web",
              "Sin panel para los mensajes capturados.",
              "Bandeja React integrada con búsqueda, HTML, texto, fuente sin procesar, cabeceras y adjuntos.",
              "Bandeja alojada con vistas previas, comprobación HTML, cabeceras, adjuntos e información Bcc según el plan.",
            ],
            [
              "Automatización",
              "SDK tipado, configuraciones explícitas y nativas para las herramientas de prueba, aserciones especializadas, fallos programables y recopilación de informes.",
              "API REST JSON con una especificación OpenAPI.",
              "API autenticada para mensajes, contenido, proyectos, entornos, usuarios, reenvío y automatización de pruebas.",
            ],
            [
              "Aislamiento y colaboración",
              "Un destinatario de sobre generado por prueba; sin cuentas de usuario ni panel compartido.",
              "Un entorno local para una sola persona con categorías; explícitamente sin cuentas, autenticación, arquitectura multiinquilina, entornos compartidos ni perfiles de usuario.",
              "Proyectos y entornos con usuarios, permisos, uso compartido e inicio de sesión único según el plan.",
            ],
            [
              "Pruebas de escenarios fallidos",
              "Fallo, demora, pausa y liberación o desconexión de la siguiente entrega dirigida por destinatario en la etapa DATA.",
              "El README público y la especificación OpenAPI revisados no documentan un mecanismo equivalente para provocar fallos SMTP.",
              "El emulador de rechazos SMTP devuelve el código y la respuesta solicitados cuando el correo se envía a una dirección destinataria construida especialmente.",
            ],
            [
              "Almacenamiento",
              "Almacén FIFO acotado solo en memoria.",
              "SQLite local con conservación configurable de mensajes.",
              "El almacenamiento alojado y los límites mensuales, de velocidad, tamaño y por entorno varían según el plan; los entornos llenos eliminan mensajes mediante FIFO.",
            ],
            [
              "Inspección de mensajes",
              "Texto, HTML, cabeceras, fuente sin procesar, destinatarios del sobre, enlaces y códigos de entre 4 y 8 dígitos; sin adjuntos.",
              "Adjuntos, contenido integrado, fuente sin procesar, cabeceras y comprobación de compatibilidad HTML con clientes de correo.",
              "Inspección de HTML y fuente sin procesar, comprobación HTML, adjuntos, cabeceras, análisis de correo no deseado y otras herramientas según el plan.",
            ],
            [
              "Comportamiento de salida",
              "Nunca retransmite ni reenvía correos.",
              "Puede entregar mediante una retransmisión SMTP genérica, copiar al servicio de Mailtrap y enviar notificaciones HTTP firmadas.",
              "Permite el reenvío manual y automático dentro de los límites del plan.",
            ],
            [
              "Red y ubicación de los datos",
              "Bucle local IPv4 e IPv6 de forma predeterminada; una escucha más amplia exige una opción explícita.",
              "SMTP en 127.0.0.1:3535 e interfaz/API en 127.0.0.1:3550 de forma predeterminada.",
              "Servicio remoto alojado que utiliza SMTP autenticado o HTTPS.",
            ],
            [
              "Licencia y coste",
              "Software de código abierto con licencia MIT.",
              "Software de código abierto con licencia MIT.",
              "Servicio alojado con planes gratuitos y de pago; los precios y las cuotas pueden cambiar.",
            ],
          ],
        },
      },
      {
        id: "pruebas-de-fallos",
        title: "Probar fallos no es una comparación de todo o nada",
        paragraphs: [
          "InboxTap permite que una prueba encole el siguiente fallo para un destinatario de sobre generado. Puede devolver una respuesta 4xx o 5xx, añadir una latencia acotada, suspender una transacción hasta que la prueba la libere o cortar la conexión durante DATA. Los mensajes fallidos o interrumpidos no se capturan.",
          "Email Sandbox alojado dispone de un verdadero emulador de rechazos SMTP. La dirección destinataria codifica la respuesta deseada y el servicio SMTP devuelve ese rechazo a la aplicación. Funciona mediante SMTP en lugar de la API de envío. Permite probar el tratamiento de rechazos, pero su contrato difiere de demorar, suspender o desconectar la siguiente entrega al destinatario habitual de la prueba de la aplicación.",
          "En la fecha de revisión, el README público y la especificación OpenAPI de Mailtrap Local describían captura, inspección, entrega, copia al servicio alojado y notificaciones HTTP, pero no enumeraban una API equivalente para inyectar fallos. Es una observación fechada sobre la documentación, no una promesa sobre versiones futuras.",
        ],
      },
      {
        id: "estado-mailtrap-local",
        title: "Mailtrap Local es reciente y debe evaluarse por separado",
        paragraphs: [
          "El historial de cambios de Mailtrap Local registra su primera publicación pública el 3 de julio de 2026 y la v0.2.0 el 22 de julio de 2026. El proyecto se presenta como complemento del producto Mailtrap alojado, no como sustituto de sus funciones de equipo.",
          "Sus valores locales predeterminados son deliberadamente limitados: escucha en el bucle local, SQLite, sin autenticación y sin modelo multiusuario. Aun así, su ámbito visual y operativo es más amplio que el de InboxTap, con adjuntos, comprobación de compatibilidad HTML, categorías de mensajes, entrega, notificaciones HTTP y modo de sustitución de sendmail.",
          "Los equipos no deberían tratar la marca Mailtrap compartida como un solo producto. La inspección local, la colaboración alojada y las pruebas deterministas controladas por código son decisiones de compra o arquitectura distintas.",
        ],
      },
      {
        id: "que-herramienta",
        title: "¿Qué opción deberías elegir?",
        paragraphs: [
          "Una forma de trabajo mixta resulta razonable: InboxTap en las baterías automatizadas, Mailtrap Local para el trabajo visual con plantillas y Email Sandbox alojado para preproducción o control de calidad compartido.",
        ],
        bullets: [
          "Elige InboxTap por el ciclo de vida nativo de npm, el aislamiento de destinatarios por prueba, las aserciones especializadas, los escenarios deterministas de demora y desconexión y los informes de integración continua con datos sensibles ocultos.",
          "Elige Mailtrap Local para una bandeja visual limitada a localhost, adjuntos, comprobaciones HTML, historial SQLite, entrega o notificaciones HTTP sin utilizar una bandeja alojada.",
          "Elige Email Sandbox alojado para entornos remotos, proyectos compartidos, control de acceso, reenvío, herramientas de entregabilidad y formas de trabajo en equipo.",
          "No fijes en el código una comparación de precios de Mailtrap. Los precios, cuotas, límites de reenvío y funciones de colaboración de los planes alojados pueden cambiar.",
        ],
      },
      {
        id: "fuentes-verificadas",
        title: "Fuentes verificadas el 23 de julio de 2026",
        paragraphs: [
          "La revisión distingue Mailtrap Local v0.2.0 de Email Sandbox alojado y se basa en el repositorio actual, el centro de ayuda y la página de precios de Mailtrap. Vuelve a comprobar la separación de productos y los detalles de los planes cuando se actualice esta página.",
        ],
        links: [
          {
            href: "https://github.com/TracyNgot/inboxtap.dev/blob/main/README.md",
            label: "README de InboxTap y alcance público de sus funciones",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local",
            label: "README oficial de Mailtrap Local",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local/blob/main/CHANGELOG.md",
            label: "Historial de cambios de Mailtrap Local",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local/releases/tag/v0.2.0",
            label: "Versión v0.2.0 de Mailtrap Local",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local/blob/main/docs/api/openapi.yaml",
            label: "Especificación OpenAPI de Mailtrap Local",
          },
          {
            href: "https://docs.mailtrap.io/getting-started/email-sandbox",
            label: "Presentación de Email Sandbox alojado",
          },
          {
            href: "https://docs.mailtrap.io/email-sandbox/setup/sandbox-api-integration",
            label: "Funciones de la API del entorno alojado",
          },
          {
            href: "https://docs.mailtrap.io/email-sandbox/testing/bounce-rate",
            label: "Emulador de rechazos SMTP de Mailtrap",
          },
          {
            href: "https://docs.mailtrap.io/email-sandbox/help/features-and-limits",
            label: "Funciones y límites de Email Sandbox según el plan",
          },
          {
            href: "https://mailtrap.io/pricing/",
            label: "Precios y cuadro actual de planes de Mailtrap",
          },
        ],
      },
    ],
    slug: "mailtrap",
    title: "InboxTap o Mailtrap: ¿SDK local, entorno visual o servicio alojado?",
  },
} as const satisfies Pick<ResourceContentDictionary, SpanishComparisonKey>;
