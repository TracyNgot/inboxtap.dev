import type { ComponentType } from "react";
import BetterAuthNextjsEs from "../../examples/better-auth-nextjs/README.es.md";
import BetterAuthNextjsFr from "../../examples/better-auth-nextjs/README.fr.md";
import BetterAuthNextjsEn from "../../examples/better-auth-nextjs/README.md";
import ExpressNodemailerEs from "../../examples/express-nodemailer/README.es.md";
import ExpressNodemailerFr from "../../examples/express-nodemailer/README.fr.md";
import ExpressNodemailerEn from "../../examples/express-nodemailer/README.md";
import FaultInjectionVitestEs from "../../examples/fault-injection-vitest/README.es.md";
import FaultInjectionVitestFr from "../../examples/fault-injection-vitest/README.fr.md";
import FaultInjectionVitestEn from "../../examples/fault-injection-vitest/README.md";
import ScheduledEmailVitestEs from "../../examples/scheduled-email-vitest/README.es.md";
import ScheduledEmailVitestFr from "../../examples/scheduled-email-vitest/README.fr.md";
import ScheduledEmailVitestEn from "../../examples/scheduled-email-vitest/README.md";
import TestFixtureBunEs from "../../examples/test-fixture-bun/README.es.md";
import TestFixtureBunFr from "../../examples/test-fixture-bun/README.fr.md";
import TestFixtureBunEn from "../../examples/test-fixture-bun/README.md";
import TestFixturePlaywrightEs from "../../examples/test-fixture-playwright/README.es.md";
import TestFixturePlaywrightFr from "../../examples/test-fixture-playwright/README.fr.md";
import TestFixturePlaywrightEn from "../../examples/test-fixture-playwright/README.md";
import TestFixtureVitestEs from "../../examples/test-fixture-vitest/README.es.md";
import TestFixtureVitestFr from "../../examples/test-fixture-vitest/README.fr.md";
import TestFixtureVitestEn from "../../examples/test-fixture-vitest/README.md";
import TestReportingVitestEs from "../../examples/test-reporting-vitest/README.es.md";
import TestReportingVitestFr from "../../examples/test-reporting-vitest/README.fr.md";
import TestReportingVitestEn from "../../examples/test-reporting-vitest/README.md";
import type { Locale } from "./i18n/config";
import type { DocStrings, TocItem } from "./i18n/types";

export interface ExampleStrings {
  description: string;
  title: string;
}

export const examplesLanding = {
  en: {
    description:
      "Runnable projects that show InboxTap at the real SMTP boundary with popular application and test stacks.",
    intro:
      "Each walkthrough below is rendered directly from the example's README, so the documentation stays aligned with the code you can run.",
    openExample: "Open example",
    slug: "examples",
    title: "Examples",
  },
  es: {
    description:
      "Proyectos ejecutables que muestran InboxTap en el límite SMTP real con entornos populares de aplicaciones y pruebas.",
    intro:
      "Cada guía se muestra directamente desde el README localizado del ejemplo, para que la documentación siga alineada con el código ejecutable.",
    openExample: "Abrir ejemplo",
    slug: "ejemplos",
    title: "Ejemplos",
  },
  fr: {
    description:
      "Des projets exécutables qui montrent InboxTap à la véritable frontière SMTP avec des environnements d’application et de test courants.",
    intro:
      "Chaque guide est affiché directement depuis le README localisé de l’exemple, afin que la documentation reste alignée sur le code exécutable.",
    openExample: "Ouvrir l’exemple",
    slug: "exemples",
    title: "Exemples",
  },
} as const satisfies Record<
  Locale,
  {
    description: string;
    intro: string;
    openExample: string;
    slug: string;
    title: string;
  }
>;

const sharedToc = {
  en: [
    { id: "prerequisites", label: "Prerequisites" },
    { id: "setup", label: "Setup" },
    { id: "run-the-tests", label: "Run the tests" },
  ],
  es: [
    { id: "requisitos-previos", label: "Requisitos previos" },
    { id: "configuración", label: "Configuración" },
    { id: "ejecutar-las-pruebas", label: "Ejecutar las pruebas" },
  ],
  fr: [
    { id: "prérequis", label: "Prérequis" },
    { id: "installation", label: "Installation" },
    { id: "lancer-les-tests", label: "Lancer les tests" },
  ],
} as const satisfies Record<Locale, readonly TocItem[]>;

const fixtureToc = {
  en: [
    ...sharedToc.en,
    { id: "how-it-works", label: "How it works" },
    { id: "isolation-and-cleanup", label: "Isolation and cleanup" },
    { id: "troubleshooting", label: "Troubleshooting" },
  ],
  es: [
    ...sharedToc.es,
    { id: "cómo-funciona", label: "Cómo funciona" },
    { id: "aislamiento-y-limpieza", label: "Aislamiento y limpieza" },
    { id: "solución-de-problemas", label: "Solución de problemas" },
  ],
  fr: [
    ...sharedToc.fr,
    { id: "fonctionnement", label: "Fonctionnement" },
    { id: "isolation-et-nettoyage", label: "Isolation et nettoyage" },
    { id: "dépannage", label: "Dépannage" },
  ],
} as const satisfies Record<Locale, readonly TocItem[]>;

const faultInjectionToc = {
  en: [
    ...sharedToc.en,
    { id: "what-the-example-proves", label: "What the example proves" },
    { id: "transient-retry", label: "Transient retry" },
    { id: "pause-and-release", label: "Pause and release" },
    { id: "disconnect-recovery", label: "Disconnect recovery" },
    { id: "ownership-boundaries", label: "Ownership boundaries" },
    { id: "troubleshooting", label: "Troubleshooting" },
  ],
  es: [
    ...sharedToc.es,
    { id: "qué-demuestra-el-ejemplo", label: "Qué demuestra el ejemplo" },
    { id: "reintento-transitorio", label: "Reintento transitorio" },
    { id: "pausar-y-liberar", label: "Pausar y liberar" },
    {
      id: "recuperación-tras-una-desconexión",
      label: "Recuperación tras una desconexión",
    },
    { id: "límites-de-responsabilidad", label: "Límites de responsabilidad" },
    { id: "solución-de-problemas", label: "Solución de problemas" },
  ],
  fr: [
    ...sharedToc.fr,
    { id: "ce-que-démontre-lexemple", label: "Ce que démontre l’exemple" },
    {
      id: "nouvelle-tentative-après-une-erreur-transitoire",
      label: "Nouvelle tentative après une erreur transitoire",
    },
    { id: "mise-en-pause-et-libération", label: "Mise en pause et libération" },
    {
      id: "rétablissement-après-une-déconnexion",
      label: "Rétablissement après une déconnexion",
    },
    { id: "limites-de-responsabilité", label: "Limites de responsabilité" },
    { id: "dépannage", label: "Dépannage" },
  ],
} as const satisfies Record<Locale, readonly TocItem[]>;

const testReportingToc = {
  en: [
    ...sharedToc.en,
    { id: "what-the-example-proves", label: "What the example proves" },
    { id: "collect-matcher-observations", label: "Collect matcher observations" },
    { id: "add-messages-and-assertions", label: "Add messages and assertions" },
    { id: "write-html-and-json", label: "Write HTML and JSON" },
    { id: "redaction-boundaries", label: "Redaction boundaries" },
    { id: "artifact-lifecycle", label: "Artifact lifecycle" },
    { id: "troubleshooting", label: "Troubleshooting" },
  ],
  es: [
    ...sharedToc.es,
    { id: "qué-demuestra-el-ejemplo", label: "Qué demuestra el ejemplo" },
    {
      id: "recopilar-observaciones-de-los-matchers",
      label: "Recopilar observaciones de los matchers",
    },
    { id: "añadir-mensajes-y-aserciones", label: "Añadir mensajes y aserciones" },
    { id: "escribir-html-y-json", label: "Escribir HTML y JSON" },
    {
      id: "alcance-de-la-ocultación-de-datos-sensibles",
      label: "Alcance de la ocultación de datos sensibles",
    },
    { id: "ciclo-de-vida-de-los-artefactos", label: "Ciclo de vida de los artefactos" },
    { id: "solución-de-problemas", label: "Solución de problemas" },
  ],
  fr: [
    ...sharedToc.fr,
    { id: "ce-que-démontre-lexemple", label: "Ce que démontre l’exemple" },
    {
      id: "recueillir-les-observations-des-matchers",
      label: "Collecter les observations des matchers",
    },
    {
      id: "ajouter-des-messages-et-des-assertions",
      label: "Ajouter des messages et assertions",
    },
    { id: "écrire-les-fichiers-html-et-json", label: "Écrire les fichiers HTML et JSON" },
    { id: "limites-de-lexpurgation", label: "Limites de l’expurgation" },
    { id: "cycle-de-vie-des-artefacts", label: "Cycle de vie des artefacts" },
    { id: "dépannage", label: "Dépannage" },
  ],
} as const satisfies Record<Locale, readonly TocItem[]>;

const scheduledDeliveryToc = {
  en: [
    { id: "prerequisites", label: "Prerequisites" },
    { id: "setup", label: "Setup" },
    { id: "run-the-tests", label: "Run the tests" },
    { id: "what-the-example-proves", label: "What the example proves" },
    { id: "provider-contract", label: "Provider contract" },
    { id: "virtual-clock", label: "Virtual clock" },
    {
      id: "exactly-once-delivery-and-cancellation",
      label: "Exactly-once delivery and cancellation",
    },
    { id: "ownership-boundaries", label: "Ownership boundaries" },
    { id: "troubleshooting", label: "Troubleshooting" },
  ],
  es: [
    { id: "requisitos-previos", label: "Requisitos previos" },
    { id: "configuración", label: "Configuración" },
    { id: "ejecutar-las-pruebas", label: "Ejecutar las pruebas" },
    { id: "qué-demuestra-el-ejemplo", label: "Qué demuestra el ejemplo" },
    { id: "contrato-del-proveedor", label: "Contrato del proveedor" },
    { id: "reloj-virtual", label: "Reloj virtual" },
    { id: "entrega-única-y-cancelación", label: "Entrega única y cancelación" },
    { id: "límites-de-responsabilidad", label: "Límites de responsabilidad" },
    { id: "solución-de-problemas", label: "Solución de problemas" },
  ],
  fr: [
    { id: "prérequis", label: "Prérequis" },
    { id: "configuration", label: "Configuration" },
    { id: "lancer-les-tests", label: "Lancer les tests" },
    { id: "ce-que-démontre-lexemple", label: "Ce que démontre l’exemple" },
    { id: "contrat-du-fournisseur", label: "Contrat du fournisseur" },
    { id: "horloge-virtuelle", label: "Horloge virtuelle" },
    {
      id: "livraison-unique-et-annulation",
      label: "Livraison unique et annulation",
    },
    { id: "limites-de-responsabilité", label: "Limites de responsabilité" },
    { id: "dépannage", label: "Dépannage" },
  ],
} as const satisfies Record<Locale, readonly TocItem[]>;

export const exampleReadmes = [
  {
    content: { en: BetterAuthNextjsEn, es: BetterAuthNextjsEs, fr: BetterAuthNextjsFr },
    directory: "better-auth-nextjs",
    strings: {
      en: {
        description:
          "Run Better Auth email verification, magic-link, and OTP flows through InboxTap with Playwright.",
        title: "Better Auth + Next.js + InboxTap",
      },
      es: {
        description:
          "Ejecuta flujos de verificación, enlace mágico y OTP de Better Auth mediante InboxTap con Playwright.",
        title: "Better Auth + Next.js + InboxTap",
      },
      fr: {
        description:
          "Testez les flux de vérification, lien magique et OTP de Better Auth via InboxTap avec Playwright.",
        title: "Better Auth + Next.js + InboxTap",
      },
    },
    toc: {
      en: [
        ...sharedToc.en,
        { id: "run-it-interactively", label: "Run it interactively" },
        { id: "how-it-works", label: "How it works" },
        { id: "troubleshooting", label: "Troubleshooting" },
      ],
      es: [
        ...sharedToc.es,
        { id: "ejecutar-en-modo-interactivo", label: "Ejecutar en modo interactivo" },
        { id: "cómo-funciona", label: "Cómo funciona" },
        { id: "solución-de-problemas", label: "Solución de problemas" },
      ],
      fr: [
        ...sharedToc.fr,
        { id: "lancer-lexemple-en-mode-interactif", label: "Lancer en mode interactif" },
        { id: "fonctionnement", label: "Fonctionnement" },
        { id: "dépannage", label: "Dépannage" },
      ],
    },
  },
  {
    content: { en: ExpressNodemailerEn, es: ExpressNodemailerEs, fr: ExpressNodemailerFr },
    directory: "express-nodemailer",
    strings: {
      en: {
        description:
          "Send transactional email from Express through Nodemailer and assert it with Vitest.",
        title: "Express + Nodemailer + InboxTap",
      },
      es: {
        description:
          "Envía email transaccional desde Express mediante Nodemailer y compruébalo con Vitest.",
        title: "Express + Nodemailer + InboxTap",
      },
      fr: {
        description:
          "Envoyez des emails transactionnels depuis Express via Nodemailer et vérifiez-les avec Vitest.",
        title: "Express + Nodemailer + InboxTap",
      },
    },
    toc: {
      en: [
        ...sharedToc.en,
        { id: "run-interactively", label: "Run interactively" },
        { id: "how-it-works", label: "How it works" },
        { id: "register-the-matchers", label: "Register the matchers" },
        { id: "troubleshooting", label: "Troubleshooting" },
      ],
      es: [
        ...sharedToc.es,
        { id: "ejecutar-en-modo-interactivo", label: "Ejecutar en modo interactivo" },
        { id: "cómo-funciona", label: "Cómo funciona" },
        { id: "registrar-los-matchers", label: "Registrar los matchers" },
        { id: "solución-de-problemas", label: "Solución de problemas" },
      ],
      fr: [
        ...sharedToc.fr,
        { id: "lancer-lexemple-en-mode-interactif", label: "Lancer en mode interactif" },
        { id: "fonctionnement", label: "Fonctionnement" },
        { id: "enregistrer-les-matchers", label: "Enregistrer les matchers" },
        { id: "dépannage", label: "Dépannage" },
      ],
    },
  },
  {
    content: {
      en: FaultInjectionVitestEn,
      es: FaultInjectionVitestEs,
      fr: FaultInjectionVitestFr,
    },
    directory: "fault-injection-vitest",
    strings: {
      en: {
        description:
          "Test transient SMTP failures, paused deliveries, and connection recovery with Vitest.",
        title: "SMTP fault injection with Vitest",
      },
      es: {
        description:
          "Prueba fallos SMTP transitorios, entregas en pausa y recuperación de conexión con Vitest.",
        title: "Inyección de fallos SMTP + Vitest",
      },
      fr: {
        description:
          "Testez les erreurs SMTP transitoires, les livraisons en pause et la reprise de connexion avec Vitest.",
        title: "Injection de pannes SMTP avec Vitest",
      },
    },
    toc: faultInjectionToc,
  },
  {
    content: { en: TestFixtureBunEn, es: TestFixtureBunEs, fr: TestFixtureBunFr },
    directory: "test-fixture-bun",
    strings: {
      en: {
        description:
          "Use Bun lifecycle hooks with a dynamic InboxTap server and an explicit fresh inbox per test.",
        title: "Bun test fixtures + InboxTap",
      },
      es: {
        description:
          "Usa las funciones del ciclo de vida de Bun con un servidor InboxTap dinámico y un buzón nuevo por prueba.",
        title: "Fixtures de Bun + InboxTap",
      },
      fr: {
        description:
          "Utilisez les fonctions de cycle de vie de Bun avec un serveur InboxTap dynamique et une nouvelle boîte par test.",
        title: "Fixtures de test Bun avec InboxTap",
      },
    },
    toc: fixtureToc,
  },
  {
    content: { en: TestFixtureVitestEn, es: TestFixtureVitestEs, fr: TestFixtureVitestFr },
    directory: "test-fixture-vitest",
    strings: {
      en: {
        description:
          "Run concurrent Vitest cases through one file-scoped InboxTap server with isolated test inboxes.",
        title: "Vitest fixtures + InboxTap",
      },
      es: {
        description:
          "Ejecuta pruebas Vitest en paralelo con un servidor InboxTap por archivo y buzones aislados para cada prueba.",
        title: "Fixtures de Vitest + InboxTap",
      },
      fr: {
        description:
          "Exécutez des cas Vitest concurrents avec un serveur InboxTap par fichier et des boîtes isolées par test.",
        title: "Fixtures Vitest avec InboxTap",
      },
    },
    toc: fixtureToc,
  },
  {
    content: {
      en: TestFixturePlaywrightEn,
      es: TestFixturePlaywrightEs,
      fr: TestFixturePlaywrightFr,
    },
    directory: "test-fixture-playwright",
    strings: {
      en: {
        description:
          "Compose Playwright worker fixtures so an application consumes InboxTap's dynamic SMTP settings.",
        title: "Playwright fixtures + InboxTap",
      },
      es: {
        description:
          "Configura los procesos de Playwright para que una aplicación use la configuración SMTP dinámica de InboxTap.",
        title: "Fixtures de Playwright + InboxTap",
      },
      fr: {
        description:
          "Composez les configurations de processus Playwright pour qu’une application utilise les paramètres SMTP dynamiques d’InboxTap.",
        title: "Fixtures Playwright avec InboxTap",
      },
    },
    toc: fixtureToc,
  },
  {
    content: {
      en: TestReportingVitestEn,
      es: TestReportingVitestEs,
      fr: TestReportingVitestFr,
    },
    directory: "test-reporting-vitest",
    strings: {
      en: {
        description:
          "Generate redacted HTML and JSON artifacts from matcher observations, captured messages, and application assertions.",
        title: "Redacted test reports with Vitest",
      },
      es: {
        description:
          "Genera archivos HTML y JSON sin datos sensibles a partir de observaciones de aserciones, mensajes capturados y comprobaciones de la aplicación.",
        title: "Informes de prueba con datos sensibles ocultos + Vitest",
      },
      fr: {
        description:
          "Générez des fichiers HTML et JSON expurgés à partir d’observations d’assertion, de messages capturés et de vérifications de l’application.",
        title: "Rapports de test expurgés avec Vitest",
      },
    },
    toc: testReportingToc,
  },
  {
    content: {
      en: ScheduledEmailVitestEn,
      es: ScheduledEmailVitestEs,
      fr: ScheduledEmailVitestFr,
    },
    directory: "scheduled-email-vitest",
    strings: {
      en: {
        description:
          "Test immediate sends, scheduled delivery, cancellation, and deterministic ordering with a bounded provider fake and an injected virtual clock.",
        title: "Scheduled email delivery with Vitest",
      },
      es: {
        description:
          "Prueba los envíos inmediatos, la entrega programada, la cancelación y el orden determinista con un doble de prueba del proveedor de capacidad limitada y un reloj virtual inyectado.",
        title: "Entrega programada de correos con Vitest",
      },
      fr: {
        description:
          "Testez les envois immédiats, la livraison programmée, l’annulation et l’ordre déterministe avec un simulateur de fournisseur à capacité bornée et une horloge virtuelle injectée.",
        title: "Envoi programmé d’e-mails avec Vitest",
      },
    },
    toc: scheduledDeliveryToc,
  },
] as const satisfies readonly {
  content: Record<Locale, ComponentType>;
  directory: string;
  strings: Record<Locale, ExampleStrings>;
  toc: Record<Locale, readonly TocItem[]>;
}[];

export type ExampleDirectory = (typeof exampleReadmes)[number]["directory"];
export type ExampleDocKey = `examples/${ExampleDirectory}`;

export function isExampleDocKey(key: string): key is ExampleDocKey {
  return exampleReadmes.some((example) => `examples/${example.directory}` === key);
}

export function getExampleByKey(key: ExampleDocKey) {
  const directory = key.slice("examples/".length);
  const example = exampleReadmes.find((candidate) => candidate.directory === directory);
  if (!example) throw new Error(`Unknown example documentation key: ${key}`);
  return example;
}

export function getExampleDocStrings(locale: Locale, key: ExampleDocKey): DocStrings {
  const example = getExampleByKey(key);
  return {
    description: example.strings[locale].description,
    slug: `${examplesLanding[locale].slug}/${example.directory}`,
    title: example.strings[locale].title,
    toc: example.toc[locale],
  };
}

export function getExamplesLandingStrings(locale: Locale): DocStrings {
  const strings = examplesLanding[locale];
  return {
    description: strings.description,
    slug: strings.slug,
    title: strings.title,
    toc: [{ id: "runnable-examples", label: strings.title }],
  };
}
