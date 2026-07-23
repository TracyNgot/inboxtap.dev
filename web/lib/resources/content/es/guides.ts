import { magicLinkSnippet, otpResendSnippet, passwordResetSnippet } from "../../snippets";
import type { ResourceContentDictionary } from "../../types";

export const guidesEs = {
  "guides/test-magic-links": {
    cta: {
      description:
        "Lleva el enlace a un flujo real del navegador con destinatarios aislados, procesos paralelos, esperas acotadas y limpieza gestionada por el ejecutor.",
      label: "Leer la guía de Playwright",
      title: "Recorre el enlace en el navegador",
    },
    description:
      "Captura localmente cada correo con enlace mágico, valida su destino de confianza, ábrelo en el navegador y comprueba su uso único sin exponer tokens.",
    eyebrow: "Guía de pruebas de autenticación",
    intro:
      "Una prueba completa de un enlace mágico demuestra más que la entrega. Verifica que la aplicación generó un enlace para el destinatario previsto, que la URL apunta a un destino permitido y que canjear el secreto crea exactamente la sesión y la redirección prometidas por el producto.",
    kind: "guides",
    relatedDocKey: "guides/playwright",
    section: "guias",
    sections: [
      {
        id: "definir-el-contrato-antes-de-la-prueba",
        title: "Define el contrato antes de la prueba",
        paragraphs: [
          "Anota el remitente esperado, la familia de asuntos, el origen y la ruta de retorno, la caducidad, el comportamiento de registro y el destino posterior al acceso. Un proveedor puede llamar enlace mágico a varios mecanismos sin contraseña, pero la aplicación sigue siendo responsable de la URL exacta y de la política de cuentas.",
          "Decide si una dirección desconocida puede crear una cuenta. Por ejemplo, el complemento de enlace mágico de Better Auth permite el registro de forma predeterminada salvo que se active disableSignUp. La prueba debe codificar la decisión del producto y no heredar por accidente el valor predeterminado de un proveedor.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/plugins/magic-link",
            label: "Comportamiento de los enlaces mágicos en Better Auth",
          },
          {
            href: "https://supabase.com/docs/guides/auth/auth-email-passwordless",
            label: "Comportamiento del correo sin contraseña en Supabase",
          },
        ],
      },
      {
        id: "usar-un-destinatario-nuevo-en-cada-caso",
        title: "Usa un destinatario nuevo en cada caso",
        paragraphs: [
          "Crea el buzón de InboxTap dentro de la prueba e introduce inbox.address en el formulario real de acceso o en la solicitud de API. El destinatario generado permite que pruebas simultáneas compartan un servidor de captura mientras cada lectura permanece filtrada por su propio sobre SMTP.",
          "Evita un buzón para toda la batería y no borres todos los mensajes en beforeEach. La limpieza global crea condiciones de carrera, mientras que una dirección única conserva las pruebas necesarias para diagnosticar una redirección fallida o una entrega duplicada.",
        ],
      },
      {
        code: {
          filename: "magic-link.spec.ts",
          language: "typescript",
          source: magicLinkSnippet,
        },
        id: "extraer-y-validar-antes-de-navegar",
        title: "Extrae y valida antes de navegar",
        paragraphs: [
          "waitForLink() busca enlaces HTTP o HTTPS en el texto y el HTML capturados y puede exigir un fragmento estable de la ruta. Las plantillas suelen contener URL de asistencia, privacidad, logotipos y cancelación de suscripción, por lo que un filtro contains impide que la prueba siga el primer enlace no relacionado.",
          "Trata el valor devuelto como una credencial. Analízalo con URL, compara el origen esperado completo y la ruta de retorno antes de navegar. No uses una comprobación imprecisa del sufijo del host, no imprimas la cadena de consulta ni incluyas el token en el título de la prueba.",
        ],
      },
      {
        id: "comprobar-la-sesion-y-no-solo-la-pagina",
        title: "Comprueba la sesión, no solo la página",
        paragraphs: [
          "Después de abrir el enlace, verifica la URL final y un indicador respaldado por el servidor de la identidad autenticada. Un mensaje visible de éxito puede pasar aunque sean incorrectos la cookie de sesión, la identidad del usuario o el estado de autorización.",
          "Comprueba también la redirección prevista y si la dirección de correo quedó verificada cuando el proveedor de autenticación combina la prueba de propiedad con la verificación. Esos resultados pertenecen a la comprobación de la aplicación; InboxTap solo demuestra qué cruzó SMTP.",
        ],
      },
      {
        id: "cubrir-reutilizacion-caducidad-y-destinatario-incorrecto",
        title: "Cubre la reutilización, la caducidad y el destinatario incorrecto",
        paragraphs: [
          "Canjea la misma URL por segunda vez y comprueba el comportamiento configurado de uso único. Ejercita la caducidad con el reloj admitido por el proveedor o con una configuración de prueba breve, no con una espera sin límite. Un token mal formado o modificado debe fallar sin crear una sesión.",
          "Si el producto vincula un enlace a un correo o a una transacción pendiente, demuestra que no puede autenticar otra cuenta. No intentes probarlo cambiando únicamente las direcciones de InboxTap; realiza la comprobación sobre la sesión y la identidad almacenada por la aplicación.",
        ],
        bullets: [
          "Un enlace válido solo establece la cuenta y la redirección esperadas.",
          "Un token reutilizado, caducado o modificado se rechaza.",
          "Las páginas de error y los registros no muestran el valor secreto.",
        ],
      },
      {
        id: "mantener-seguras-las-pruebas",
        title: "Mantén las pruebas libres de tokens",
        paragraphs: [
          "Los diagnósticos de los comparadores de InboxTap no incluyen cuerpos ni valores de URL con tokens. Los informes eliminan superficies de secretos habituales y seudonimizan direcciones, pero esa protección no ofrece garantías absolutas. Revisa cada artefacto antes de compartirlo fuera del entorno de pruebas.",
          "Prefiere comprobaciones sobre el origen, la ruta, la presencia de parámetros y el estado final de la aplicación. Evita instantáneas del correo sin procesar, de la barra de direcciones del navegador o del enlace capturado completo cuando una comprobación estructural menor demuestre lo mismo.",
        ],
      },
    ],
    slug: "probar-enlaces-magicos",
    title: "Cómo probar enlaces mágicos de principio a fin",
  },
  "guides/test-email-otp": {
    cta: {
      description:
        "Usa la referencia del SDK para elegir el patrón de espera adecuado, distinguir mensajes sucesivos, inspeccionar el contenido capturado y añadir diagnósticos seguros a los comparadores.",
      label: "Explorar el SDK de cliente",
      title: "Adapta la receta al formato de tu OTP",
    },
    description:
      "Captura los OTP recibidos por correo como cadenas, introdúcelos en el flujo real de la aplicación y comprueba de forma determinista la caducidad, los reintentos y los reenvíos.",
    eyebrow: "Guía de pruebas de autenticación",
    intro:
      "Una prueba de OTP por correo debe conservar el código exactamente como se entregó, enviarlo mediante el mismo endpoint o formulario que usaría una persona y verificar las reglas del proveedor sobre caducidad, intentos y reenvíos. InboxTap aporta el destinatario aislado y la espera acotada; la prueba de la aplicación demuestra el resultado de autenticación.",
    kind: "guides",
    relatedDocKey: "reference/client-sdk",
    section: "guias",
    sections: [
      {
        id: "anotar-el-contrato-del-otp",
        title: "Anota el contrato del OTP",
        paragraphs: [
          "Confirma la longitud y el alfabeto del código, su periodo de validez, el máximo de intentos, la estrategia de reenvío y si solicitar un segundo código invalida el primero. No presentes seis dígitos como una norma universal de OTP: Better Auth usa seis de forma predeterminada, pero permite configurarlos, y Supabase acepta longitudes de seis a diez dígitos.",
          "Conserva el valor como cadena durante toda la prueba. Convertirlo a número elimina los ceros iniciales y puede impedir que se introduzca un código válido exactamente como lo recibió el usuario.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/plugins/email-otp",
            label: "Opciones de OTP por correo de Better Auth",
          },
          {
            href: "https://supabase.com/docs/guides/local-development/cli/config#authemailotp_length",
            label: "Longitud del OTP por correo en Supabase",
          },
        ],
      },
      {
        id: "capturar-el-primer-codigo",
        title: "Captura el primer código",
        paragraphs: [
          "Crea un buzón para la prueba, inicia la acción de envío de código de la aplicación y llama a waitForCode() con un filtro de asunto. Su expresión predeterminada encuentra un valor de seis dígitos en el texto o el HTML capturados; proporciona una expresión regular o un patrón de cadena cuando la aplicación use otro formato.",
          "Envía la cadena devuelta mediante el formulario o endpoint real de verificación y comprueba después la identidad autenticada y la sesión. Una prueba que solo encuentra dígitos en un correo no demuestra que el servidor acepte el código previsto.",
        ],
      },
      {
        code: {
          filename: "email-otp.test.ts",
          language: "typescript",
          source: otpResendSnippet,
        },
        id: "distinguir-un-mensaje-reenviado",
        title: "Distingue un mensaje reenviado",
        paragraphs: [
          "Captura el primer mensaje completo y conserva su identificador. Después de solicitar otro código, waitForMessage() con afterId devuelve una entrega posterior; extrae el código nuevo de ese mensaje concreto como se muestra.",
          "No uses waitForCode({ afterId }) para esta comprobación. El ayudante examina primero los mensajes existentes en busca de un valor coincidente, por lo que puede devolver el código anterior antes de que su solicitud de espera prolongada aplique afterId. Esperar el segundo mensaje hace explícito el límite de entrega.",
        ],
      },
      {
        id: "probar-rotacion-y-limites-de-intentos",
        title: "Prueba la rotación y los límites de intentos",
        paragraphs: [
          "Cuando la estrategia de reenvío configurada rote los códigos, demuestra que el primero falla y el segundo funciona. Si el proveedor reutiliza deliberadamente un código que aún no ha caducado, comprueba ese comportamiento. No conviertas en garantía del producto el valor predeterminado que estuviera instalado.",
          "Envía valores no válidos hasta alcanzar el límite configurado y confirma que el intento siguiente se rechaza como se documenta. Usa las respuestas de la aplicación y el estado almacenado de la sesión; InboxTap no implementa ni observa el contador de verificación del proveedor.",
        ],
      },
      {
        id: "gestionar-codigos-largos-y-personalizados",
        title: "Gestiona códigos más largos y personalizados",
        paragraphs: [
          "CapturedEmail.codes es una ayuda de análisis para secuencias únicas de entre cuatro y ocho dígitos. Un patrón personalizado de waitForCode() examina directamente el cuerpo del mensaje; úsalo para un código de Supabase de nueve o diez dígitos o para un formato alfanumérico propio de la aplicación.",
          "Haz que la expresión regular sea lo bastante precisa para no confundir fechas, números de asistencia ni otros identificadores de la plantilla. Un asunto estable junto con un límite específico del formato es más seguro que elegir la primera secuencia de dígitos.",
        ],
      },
      {
        id: "probar-la-caducidad-con-un-reloj-controlado",
        title: "Prueba la caducidad con un reloj controlado",
        paragraphs: [
          "Prefiere un reloj virtual admitido por el proveedor, una fuente de tiempo inyectada o una caducidad breve exclusiva de las pruebas. Esperar durante toda la vigencia de producción ralentiza la batería y todavía deja condiciones de carrera cerca del límite.",
          "El código caducado debe fallar sin crear ni ampliar una sesión. Solicitar uno nuevo después de la caducidad debe seguir la política de reenvío documentada y producir una entrega distinguible.",
        ],
      },
      {
        id: "evitar-mostrar-secretos",
        title: "Evita mostrar secretos",
        paragraphs: [
          "No incluyas el OTP en nombres de pruebas, mensajes de comprobación, capturas de pantalla ni registros habituales. Comprueba su forma y el estado resultante de la aplicación en vez de tomar una instantánea del cuerpo completo del correo.",
          "Si necesitas un artefacto de CI, usa el recopilador acotado de informes de InboxTap con patrones propios del proyecto para ocultar datos sensibles y revisa el resultado. La detección de tokens no garantiza que se encuentren todos los valores personales o secretos personalizados.",
        ],
      },
    ],
    slug: "probar-otp-por-correo",
    title: "Cómo probar flujos de OTP por correo",
  },
  "guides/test-password-reset-emails": {
    cta: {
      description:
        "Usa la guía de Playwright para conectar el destinatario aislado del restablecimiento, la URL capturada, el formulario del navegador y las comprobaciones finales de la sesión.",
      label: "Leer la guía de Playwright",
      title: "Ejercita el restablecimiento en un navegador real",
    },
    description:
      "Prueba localmente todo el flujo de restablecimiento de contraseña: respuestas públicas seguras, enlaces de confianza, sustitución de la contraseña, reutilización del token y comportamiento de la sesión.",
    eyebrow: "Guía de pruebas de autenticación",
    intro:
      "El correo de restablecimiento de contraseña es un canal privilegiado de recuperación de cuentas. Una buena prueba cubre la respuesta pública a la solicitud, el mensaje enviado al usuario conocido real, el límite de confianza de la URL, el cambio de contraseña y el destino del token y de las sesiones existentes.",
    kind: "guides",
    relatedDocKey: "guides/playwright",
    section: "guias",
    sections: [
      {
        id: "empezar-con-dos-casos-de-solicitud-publica",
        title: "Empieza con dos casos de solicitud pública",
        paragraphs: [
          "Crea un usuario conocido cuya dirección sea un destinatario nuevo de InboxTap y envía una solicitud de restablecimiento para esa cuenta. Envía el mismo formulario público con otra dirección desconocida y compara el estado y la respuesta visible para el usuario.",
          "El endpoint no debe revelar si existe una cuenta. Evita exigir tiempos transcurridos exactamente iguales en una batería de navegador, porque el planificador y la base de datos introducen ruido y vuelven frágil esa comprobación; sigue las recomendaciones de seguridad del proveedor y usa pruebas específicas de nivel inferior para las mitigaciones temporales.",
        ],
        links: [
          {
            href: "https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html",
            label: "Guía de OWASP para contraseñas olvidadas",
          },
        ],
      },
      {
        code: {
          filename: "password-reset.spec.ts",
          language: "typescript",
          source: passwordResetSnippet,
        },
        id: "validar-el-destino-del-restablecimiento",
        title: "Valida el destino del restablecimiento",
        paragraphs: [
          "Espera una URL que contenga la ruta de restablecimiento de la aplicación y analízala antes de navegar. Compara el origen y la ruta exactos esperados para que una URL base mal formada, un host no fiable o un retorno incorrecto no queden ocultos por una redirección del navegador.",
          "Trata la URL completa como una credencial al portador. No la imprimas, no la interpoles en el título de la prueba ni adjuntes una captura de pantalla sin protección que muestre la barra de direcciones.",
        ],
      },
      {
        id: "demostrar-que-la-contrasena-se-sustituyo",
        title: "Demuestra que la contraseña se sustituyó",
        paragraphs: [
          "Completa el formulario real de restablecimiento con una contraseña que cumpla la política actual de la aplicación. Después, cierra la sesión o crea un contexto de navegador limpio, confirma que la contraseña anterior falla y que la nueva autentica la misma cuenta.",
          "Comprueba la identidad o el estado de la sesión respaldados por el servidor en lugar de depender solo de un aviso de éxito. Verifica también la validación de una contraseña nueva débil o que no coincida cuando esa lógica forme parte de la página de restablecimiento.",
        ],
      },
      {
        id: "rechazar-reutilizacion-caducidad-y-manipulacion",
        title: "Rechaza la reutilización, la caducidad y la manipulación",
        paragraphs: [
          "Intenta reutilizar la URL ya canjeada y verifica que no pueda volver a cambiar la contraseña. Ejercita un token caducado con un reloj controlado o una vigencia específica de prueba y modifica el token para demostrar que se rechaza una entrada mal formada.",
          "El fallo no debe exponer el token, detalles internos de la política de contraseñas ni datos de la cuenta en la página o en los registros habituales del servidor. Se puede ofrecer al usuario una ruta segura para solicitar otro restablecimiento.",
        ],
      },
      {
        id: "comprobar-la-politica-de-sesiones",
        title: "Comprueba la política de sesiones",
        paragraphs: [
          "Decide si un restablecimiento de contraseña revoca todas las sesiones existentes, solo las demás o ninguna. Better Auth, por ejemplo, ofrece revokeSessionsOnPasswordReset en lugar de imponer un único resultado a todas las aplicaciones.",
          "Crea las sesiones pertinentes antes del restablecimiento e inspecciónalas después del cambio. InboxTap no puede deducir esta política del correo; hay que comprobarla en el sistema de autenticación.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/concepts/email#password-reset-email",
            label: "Documentación del correo de restablecimiento en Better Auth",
          },
        ],
      },
      {
        id: "separar-la-entrega-de-la-deduplicacion-de-negocio",
        title: "Separa la entrega de la deduplicación de negocio",
        paragraphs: [
          "Usa toHaveDeliveredOnce() después de saber que existe el primer mensaje de restablecimiento cuando el producto prometa una entrega por solicitud. Su intervalo de calma opcional puede observar un reintento inmediato, pero no demuestra que ningún trabajo posterior vaya a ejecutarse.",
          "La persistencia de colas, las claves de idempotencia, la limitación de frecuencia y la deduplicación pertenecen a las pruebas de la aplicación. InboxTap puede inyectar un 451 o una desconexión para activar esas rutas y mostrar qué intentos SMTP terminaron, pero no controla el sistema de trabajos.",
        ],
      },
      {
        id: "generar-pruebas-minimas-y-seguras",
        title: "Genera pruebas mínimas y seguras",
        paragraphs: [
          "Prefiere pruebas que registren el resultado de la comprobación, participantes seudonimizados, la forma de la URL y el resultado final de la aplicación sin conservar el secreto reutilizable. Excluye la fuente RFC sin procesar salvo que una necesidad concreta de diagnóstico compense el riesgo de divulgación.",
          "Los informes de InboxTap ocultan superficies habituales de tokens y direcciones, escapan el marcado capturado y mantienen límites de tamaño, pero esa protección no ofrece garantías absolutas. Añade patrones propios del proyecto y revisa el artefacto antes de compartirlo.",
        ],
      },
    ],
    slug: "probar-correos-de-restablecimiento-de-contrasena",
    title: "Cómo probar correos de restablecimiento de contraseña de principio a fin",
  },
} satisfies Partial<ResourceContentDictionary>;
