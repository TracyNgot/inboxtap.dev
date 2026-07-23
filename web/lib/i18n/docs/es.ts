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
      description: "Ejecuta la CLI de InboxTap y añade el SDK de pruebas a un proyecto Bun o Node.",
      slug: "instalacion",
      title: "Instalación",
      toc: [
        { id: "requisitos", label: "Requisitos" },
        { id: "ejecutar-el-servidor", label: "Ejecutar el servidor" },
        { id: "instalar-el-sdk", label: "Instalar el SDK" },
        { id: "configurar-tu-aplicación", label: "Configura tu aplicación" },
      ],
    },
    "quick-start": {
      description:
        "Captura un correo de registro y sigue su enlace de verificación desde una prueba.",
      slug: "inicio-rapido",
      title: "Inicio rápido",
      toc: [
        { id: "iniciar-inboxtap", label: "Iniciar InboxTap" },
        { id: "crear-un-buzón-aislado", label: "Crear un buzón" },
        {
          id: "iniciar-el-envío-del-correo",
          label: "Iniciar el envío del correo",
        },
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
        "Compara InboxTap con MailHog, Mailpit, smtp4dev, Mailtrap y Ethereal para probar correos.",
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
        { id: "documentación-y-correcciones", label: "Documentación y correcciones" },
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
        { id: "estado-del-servicio", label: "Estado del servicio" },
        { id: "listar-correos", label: "Listar correos" },
        { id: "último-correo", label: "Último correo" },
        { id: "esperar-un-correo", label: "Esperar un correo" },
        { id: "obtener-por-id", label: "Obtener por ID" },
        { id: "limpiar-correos", label: "Limpiar correos" },
      ],
    },
    "reference/client-sdk": {
      description:
        "Referencia del SDK cliente, recursos de prueba, comparadores, informes con datos sensibles ocultos, fallos SMTP y mensajes capturados.",
      slug: "referencia/sdk-cliente",
      title: "SDK cliente",
      toc: [
        { id: "crear-un-cliente", label: "Crear un cliente" },
        { id: "crear-un-buzón", label: "Crear un buzón" },
        {
          id: "puntos-de-entrada-para-recursos-de-prueba",
          label: "Recursos de prueba",
        },
        {
          id: "puntos-de-entrada-para-comparadores",
          label: "Comparadores",
        },
        { id: "informes-de-prueba", label: "Informes de prueba" },
        { id: "controlador-de-fallos-smtp", label: "Controlador de fallos SMTP" },
        { id: "métodos-de-testinbox", label: "Métodos de TestInbox" },
        { id: "métodos-de-bajo-nivel", label: "Métodos de bajo nivel" },
        { id: "capturedemail", label: "CapturedEmail" },
        { id: "errores", label: "Errores" },
      ],
    },
    "guides/playwright": {
      description:
        "Captura y prueba enlaces de verificación, enlaces mágicos, restablecimientos y códigos OTP con Playwright.",
      slug: "guias/playwright",
      title: "Probar enlaces mágicos y códigos OTP por correo con Playwright",
      toc: [
        { id: "iniciar-los-servicios", label: "Iniciar los servicios" },
        { id: "probar-un-enlace-de-correo", label: "Probar un enlace" },
        { id: "probar-un-código-otp-por-correo", label: "Probar un código OTP" },
        {
          id: "elegir-la-función-auxiliar-adecuada",
          label: "Elegir la función auxiliar",
        },
        { id: "procesos-de-trabajo-paralelos", label: "Procesos paralelos" },
        { id: "preguntas-frecuentes", label: "Preguntas frecuentes" },
      ],
    },
    "guides/cypress": {
      description:
        "Maneja flujos de verificación por correo desde archivos de prueba de Cypress con cy.task() y el SDK.",
      slug: "guias/cypress",
      title: "Probar correos de verificación con Cypress",
      toc: [
        { id: "iniciar-los-servicios", label: "Iniciar los servicios" },
        { id: "registrar-las-tareas", label: "Registrar las tareas" },
        { id: "escribir-la-prueba", label: "Escribir la prueba" },
        { id: "aislamiento-en-paralelo", label: "Aislamiento en paralelo" },
        { id: "acceso-http-directo", label: "Acceso HTTP directo" },
      ],
    },
    "guides/test-runners": {
      description:
        "Usa recursos de prueba, comparadores nativos, informes con datos sensibles ocultos y fallos SMTP con Bun, Vitest y Playwright.",
      slug: "guias/ejecutores-de-pruebas",
      title: "Probar correos con Bun, Vitest y Playwright",
      toc: [
        { id: "instalar-las-dependencias-opcionales", label: "Instalar dependencias" },
        { id: "recurso-de-prueba-compartido", label: "Recurso de prueba compartido" },
        { id: "pruebas-con-bun", label: "Pruebas con Bun" },
        { id: "vitest", label: "Vitest" },
        { id: "playwright", label: "Playwright" },
        {
          id: "comparadores-nativos-de-los-ejecutores",
          label: "Comparadores nativos",
        },
        {
          id: "escribir-un-informe-de-prueba-con-datos-sensibles-ocultos",
          label: "Escribir un informe",
        },
        { id: "aislamiento-y-limpieza", label: "Aislamiento y limpieza" },
        { id: "probar-rutas-de-fallo", label: "Probar rutas de fallo" },
        {
          id: "elegir-la-función-auxiliar-adecuada",
          label: "Elegir la función auxiliar",
        },
      ],
    },
    "guides/better-auth": {
      description:
        "Verifica los correos de registro de Better Auth en una aplicación Next.js con Playwright.",
      slug: "guias/better-auth",
      title: "Probar correos de verificación de Better Auth",
      toc: [
        { id: "conectar-better-auth-con-inboxtap", label: "Conectar Better Auth" },
        { id: "manejar-los-flujos-con-playwright", label: "Manejar los flujos" },
        { id: "ejecutar-el-ejemplo", label: "Ejecutar el ejemplo" },
      ],
    },
    "guides/nodemailer": {
      description: "Prueba el envío de correos con Nodemailer desde una API Express con Vitest.",
      slug: "guias/nodemailer",
      title: "Probar correos de Nodemailer con Vitest",
      toc: [
        { id: "apuntar-nodemailer-a-inboxtap", label: "Apuntar Nodemailer" },
        { id: "probar-con-vitest", label: "Probar con Vitest" },
        { id: "ejecutar-el-ejemplo", label: "Ejecutar el ejemplo" },
      ],
    },
    "guides/ci": {
      description:
        "Ejecuta InboxTap en CI con un paso en segundo plano, una comprobación de estado o un servidor programático.",
      slug: "guias/ci",
      title: "CI y GitHub Actions",
      toc: [
        { id: "dos-formas-de-ejecutarlo", label: "Dos formas de ejecutarlo" },
        {
          id: "esperar-a-la-comprobación-de-estado",
          label: "Esperar a la comprobación de estado",
        },
        {
          id: "flujo-de-trabajo-de-github-actions",
          label: "Flujo de trabajo de GitHub Actions",
        },
        { id: "puertos-y-otros-proveedores", label: "Puertos y otros proveedores" },
      ],
    },
    "guides/troubleshooting": {
      description:
        "Diagnostica conexiones rechazadas, correos que no llegan, tiempos de espera y lecturas cruzadas.",
      slug: "guias/solucion-de-problemas",
      title: "Solución de problemas",
      toc: [
        { id: "conexión-rechazada", label: "Conexión rechazada" },
        { id: "puerto-ya-en-uso", label: "Puerto ya en uso" },
        { id: "el-correo-nunca-llega", label: "El correo nunca llega" },
        { id: "se-agota-el-tiempo-de-espera", label: "Tiempo de espera agotado" },
        { id: "las-pruebas-leen-mensajes-ajenos", label: "Lecturas cruzadas" },
        { id: "los-mensajes-desaparecen", label: "Los mensajes desaparecen" },
        { id: "mensaje-rechazado-por-tamaño", label: "Mensaje demasiado grande" },
      ],
    },
    changelog: {
      description:
        "Historial de versiones de InboxTap, con enlaces a las versiones de GitHub y las comparaciones completas.",
      slug: "changelog",
      title: "Historial de cambios",
      toc: [],
    },
  },
};
