import type { DocsDictionary } from "../types";

export const docsEs: DocsDictionary = {
  groups: {
    examples: "Ejemplos",
    "getting-started": "Primeros pasos",
    guides: "Guías",
    reference: "Referencia",
  },
  entries: {
    "": {
      description: "Qué captura InboxTap, por qué existe y dónde es seguro ejecutarlo.",
      slug: "",
      title: "Introducción",
      toc: [
        { id: "por-qué-inboxtap", label: "Por qué InboxTap" },
        { id: "cómo-funciona", label: "Cómo funciona" },
        { id: "seguridad-y-alcance", label: "Seguridad y alcance" },
      ],
    },
    installation: {
      description: "Ejecuta la CLI de InboxTap y añade el SDK de test a un proyecto Bun o Node.",
      slug: "instalacion",
      title: "Instalación",
      toc: [
        { id: "requisitos", label: "Requisitos" },
        { id: "ejecutar-el-servidor", label: "Ejecutar el servidor" },
        { id: "instalar-el-sdk", label: "Instalar el SDK" },
        { id: "configurar-tu-aplicación", label: "Configura tu app" },
      ],
    },
    "quick-start": {
      description: "Captura un email de registro y sigue su enlace de verificación desde un test.",
      slug: "inicio-rapido",
      title: "Inicio rápido",
      toc: [
        { id: "iniciar-inboxtap", label: "Iniciar InboxTap" },
        { id: "crear-un-buzón-aislado", label: "Crear un buzón" },
        { id: "disparar-el-email", label: "Disparar el email" },
        { id: "esperar-el-resultado", label: "Esperar el resultado" },
      ],
    },
    configuration: {
      description:
        "Configura hosts locales, puertos, dominios de destinatarios y límites de recursos.",
      slug: "configuracion",
      title: "Configuración",
      toc: [
        { id: "valores-por-defecto", label: "Valores por defecto" },
        { id: "opciones-de-la-cli", label: "Opciones de la CLI" },
        { id: "varias-instancias", label: "Varias instancias" },
        { id: "servidor-programático", label: "Servidor programático" },
      ],
    },
    alternatives: {
      description:
        "Compara InboxTap con MailHog, Mailpit, smtp4dev, Mailtrap y Ethereal para probar email.",
      slug: "alternativas",
      title: "InboxTap frente a MailHog, Mailpit y Mailtrap",
      toc: [
        { id: "de-un-vistazo", label: "De un vistazo" },
        {
          id: "es-inboxtap-una-alternativa-a-mailhog-sin-docker",
          label: "Alternativa a MailHog sin Docker",
        },
        { id: "mailpit-y-mailhog", label: "Mailpit y MailHog" },
        { id: "smtp4dev", label: "smtp4dev" },
        { id: "servicios-alojados", label: "Servicios alojados" },
        { id: "cuándo-no-usar-inboxtap", label: "Cuándo no usar InboxTap" },
      ],
    },
    trust: {
      description:
        "Verifica el código, el paquete npm, el mantenimiento, la seguridad y el proceso de correcciones de InboxTap.",
      slug: "confianza",
      title: "Confianza y mantenimiento",
      toc: [
        { id: "verificar-el-proyecto", label: "Verificar el proyecto" },
        { id: "mantenimiento-y-seguridad", label: "Mantenimiento y seguridad" },
        { id: "documentación-y-correcciones", label: "Docs y correcciones" },
        { id: "límites-de-recomendación", label: "Límites de recomendación" },
      ],
    },
    "reference/http-api": {
      description:
        "Referencia completa de la API HTTP local, incluidos filtros y formatos de respuesta.",
      slug: "referencia/api-http",
      title: "API HTTP",
      toc: [
        { id: "convenciones-de-las-peticiones", label: "Convenciones de petición" },
        { id: "health", label: "Health" },
        { id: "listar-emails", label: "Listar emails" },
        { id: "último-email", label: "Último email" },
        { id: "esperar-un-email", label: "Esperar un email" },
        { id: "obtener-por-id", label: "Obtener por ID" },
        { id: "limpiar-emails", label: "Limpiar emails" },
      ],
    },
    "reference/client-sdk": {
      description: "Referencia de InboxTapClient, TestInbox, filtros y mensajes capturados.",
      slug: "referencia/sdk-cliente",
      title: "SDK cliente",
      toc: [
        { id: "crear-un-cliente", label: "Crear un cliente" },
        { id: "crear-un-buzón", label: "Crear un buzón" },
        { id: "métodos-de-testinbox", label: "Métodos de TestInbox" },
        { id: "métodos-de-bajo-nivel", label: "Métodos de bajo nivel" },
        { id: "capturedemail", label: "CapturedEmail" },
        { id: "errores", label: "Errores" },
      ],
    },
    "guides/playwright": {
      description:
        "Captura y prueba enlaces de verificación, magic links, restablecimientos y OTPs con Playwright.",
      slug: "guias/playwright",
      title: "Probar magic links y OTPs de email con Playwright",
      toc: [
        { id: "iniciar-los-servicios", label: "Iniciar los servicios" },
        { id: "probar-un-enlace-de-email", label: "Probar un enlace" },
        { id: "probar-un-otp-por-email", label: "Probar un OTP" },
        { id: "elegir-el-helper-adecuado", label: "Elegir un helper" },
        { id: "workers-en-paralelo", label: "Workers en paralelo" },
        { id: "preguntas-frecuentes", label: "Preguntas frecuentes" },
      ],
    },
    "guides/cypress": {
      description:
        "Maneja flujos de verificación por email desde specs de Cypress con cy.task y el SDK.",
      slug: "guias/cypress",
      title: "Probar emails de verificación con Cypress",
      toc: [
        { id: "iniciar-los-servicios", label: "Iniciar los servicios" },
        { id: "registrar-las-tasks", label: "Registrar las tasks" },
        { id: "escribir-el-test", label: "Escribir el test" },
        { id: "aislamiento-en-paralelo", label: "Aislamiento en paralelo" },
        { id: "acceso-http-directo", label: "Acceso HTTP directo" },
      ],
    },
    "guides/test-runners": {
      description: "Ejecuta InboxTap programáticamente con Bun test, Vitest, Jest u otro runner.",
      slug: "guias/ejecutores-de-tests",
      title: "Probar emails con Bun, Vitest y Jest",
      toc: [
        { id: "configuración-independiente-del-runner", label: "Config independiente del runner" },
        { id: "arrancar-y-parar-en-los-tests", label: "Ciclo de vida del test" },
        { id: "elegir-el-helper-adecuado", label: "Elegir un helper" },
      ],
    },
    "guides/better-auth": {
      description:
        "Verifica los emails de registro de Better Auth en una app Next.js con Playwright.",
      slug: "guias/better-auth",
      title: "Probar emails de verificación de Better Auth",
      toc: [
        { id: "conectar-better-auth-con-inboxtap", label: "Conectar Better Auth" },
        { id: "manejar-los-flujos-con-playwright", label: "Manejar los flujos" },
        { id: "ejecutar-el-ejemplo", label: "Ejecutar el ejemplo" },
      ],
    },
    "guides/nodemailer": {
      description: "Prueba el envío con Nodemailer desde una API Express con Vitest.",
      slug: "guias/nodemailer",
      title: "Probar emails de Nodemailer con Vitest",
      toc: [
        { id: "apuntar-nodemailer-a-inboxtap", label: "Apuntar Nodemailer" },
        { id: "probar-con-vitest", label: "Probar con Vitest" },
        { id: "ejecutar-el-ejemplo", label: "Ejecutar el ejemplo" },
      ],
    },
    "guides/ci": {
      description:
        "Ejecuta InboxTap en CI con un paso en segundo plano con health check o un servidor programático.",
      slug: "guias/ci",
      title: "CI y GitHub Actions",
      toc: [
        { id: "dos-formas-de-ejecutarlo", label: "Dos formas de ejecutarlo" },
        { id: "esperar-al-health-check", label: "Esperar al health check" },
        { id: "workflow-de-github-actions", label: "Workflow de GitHub Actions" },
        { id: "puertos-y-otros-proveedores", label: "Puertos y otros proveedores" },
      ],
    },
    "guides/troubleshooting": {
      description:
        "Diagnostica conexiones rechazadas, emails que no llegan, timeouts y lecturas cruzadas.",
      slug: "guias/solucion-de-problemas",
      title: "Solución de problemas",
      toc: [
        { id: "conexión-rechazada", label: "Conexión rechazada" },
        { id: "puerto-ya-en-uso", label: "Puerto ya en uso" },
        { id: "el-email-nunca-llega", label: "El email nunca llega" },
        { id: "las-esperas-agotan-el-tiempo", label: "Esperas agotadas" },
        { id: "los-tests-leen-mensajes-ajenos", label: "Lecturas cruzadas" },
        { id: "los-mensajes-desaparecen", label: "Los mensajes desaparecen" },
        { id: "mensaje-rechazado-por-tamaño", label: "Mensaje demasiado grande" },
      ],
    },
    changelog: {
      description: "Historial de versiones de InboxTap, con enlaces a las pull requests.",
      slug: "changelog",
      title: "Changelog",
      toc: [],
    },
  },
};
