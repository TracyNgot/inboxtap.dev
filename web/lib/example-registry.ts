import type { ComponentType } from "react";
import BetterAuthNextjs from "../../examples/better-auth-nextjs/README.md";
import ExpressNodemailer from "../../examples/express-nodemailer/README.md";
import FaultInjectionVitest from "../../examples/fault-injection-vitest/README.md";
import TestFixtureBun from "../../examples/test-fixture-bun/README.md";
import TestFixturePlaywright from "../../examples/test-fixture-playwright/README.md";
import TestFixtureVitest from "../../examples/test-fixture-vitest/README.md";
import TestReportingVitest from "../../examples/test-reporting-vitest/README.md";
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
    notice: "This example README is currently available in English.",
    openExample: "Open example",
    slug: "examples",
    title: "Examples",
  },
  es: {
    description:
      "Proyectos ejecutables que muestran InboxTap en el límite SMTP real con stacks populares de aplicación y testing.",
    intro:
      "Cada guía se genera directamente desde el README del ejemplo, para que la documentación siga alineada con el código ejecutable.",
    notice: "El README de este ejemplo está disponible actualmente en inglés.",
    openExample: "Abrir ejemplo",
    slug: "ejemplos",
    title: "Ejemplos",
  },
  fr: {
    description:
      "Des projets exécutables qui montrent InboxTap à la vraie frontière SMTP avec des stacks d’application et de test courantes.",
    intro:
      "Chaque guide est rendu directement depuis le README de l’exemple, afin que la documentation reste alignée sur le code exécutable.",
    notice: "Le README de cet exemple est actuellement disponible en anglais.",
    openExample: "Ouvrir l’exemple",
    slug: "exemples",
    title: "Exemples",
  },
} as const satisfies Record<
  Locale,
  {
    description: string;
    intro: string;
    notice: string;
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
    { id: "prerequisites", label: "Requisitos previos" },
    { id: "setup", label: "Configuración" },
    { id: "run-the-tests", label: "Ejecutar los tests" },
  ],
  fr: [
    { id: "prerequisites", label: "Prérequis" },
    { id: "setup", label: "Installation" },
    { id: "run-the-tests", label: "Lancer les tests" },
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
    { id: "how-it-works", label: "Cómo funciona" },
    { id: "isolation-and-cleanup", label: "Aislamiento y limpieza" },
    { id: "troubleshooting", label: "Solución de problemas" },
  ],
  fr: [
    ...sharedToc.fr,
    { id: "how-it-works", label: "Fonctionnement" },
    { id: "isolation-and-cleanup", label: "Isolation et nettoyage" },
    { id: "troubleshooting", label: "Dépannage" },
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
    { id: "what-the-example-proves", label: "Qué demuestra el ejemplo" },
    { id: "transient-retry", label: "Reintento transitorio" },
    { id: "pause-and-release", label: "Pausa y liberación" },
    { id: "disconnect-recovery", label: "Recuperación tras desconexión" },
    { id: "ownership-boundaries", label: "Límites de responsabilidad" },
    { id: "troubleshooting", label: "Solución de problemas" },
  ],
  fr: [
    ...sharedToc.fr,
    { id: "what-the-example-proves", label: "Ce que démontre l’exemple" },
    { id: "transient-retry", label: "Nouvelle tentative transitoire" },
    { id: "pause-and-release", label: "Pause et libération" },
    { id: "disconnect-recovery", label: "Reprise après déconnexion" },
    { id: "ownership-boundaries", label: "Limites de responsabilité" },
    { id: "troubleshooting", label: "Dépannage" },
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
    { id: "what-the-example-proves", label: "Qué demuestra el ejemplo" },
    { id: "collect-matcher-observations", label: "Recopilar observaciones de matchers" },
    { id: "add-messages-and-assertions", label: "Añadir mensajes y aserciones" },
    { id: "write-html-and-json", label: "Escribir HTML y JSON" },
    { id: "redaction-boundaries", label: "Límites de la redacción" },
    { id: "artifact-lifecycle", label: "Ciclo de vida de los artefactos" },
    { id: "troubleshooting", label: "Solución de problemas" },
  ],
  fr: [
    ...sharedToc.fr,
    { id: "what-the-example-proves", label: "Ce que démontre l’exemple" },
    {
      id: "collect-matcher-observations",
      label: "Collecter les observations des matchers",
    },
    { id: "add-messages-and-assertions", label: "Ajouter des messages et assertions" },
    { id: "write-html-and-json", label: "Écrire le HTML et le JSON" },
    { id: "redaction-boundaries", label: "Limites de l’expurgation" },
    { id: "artifact-lifecycle", label: "Cycle de vie des artefacts" },
    { id: "troubleshooting", label: "Dépannage" },
  ],
} as const satisfies Record<Locale, readonly TocItem[]>;

export const exampleReadmes = [
  {
    Content: BetterAuthNextjs,
    directory: "better-auth-nextjs",
    strings: {
      en: {
        description:
          "Run Better Auth email verification, magic-link, and OTP flows through InboxTap with Playwright.",
        title: "Better Auth + Next.js + InboxTap",
      },
      es: {
        description:
          "Ejecuta flujos de verificación, magic link y OTP de Better Auth mediante InboxTap con Playwright.",
        title: "Better Auth + Next.js + InboxTap",
      },
      fr: {
        description:
          "Testez les flux de vérification, magic link et OTP de Better Auth via InboxTap avec Playwright.",
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
        { id: "run-it-interactively", label: "Ejecutarlo de forma interactiva" },
        { id: "how-it-works", label: "Cómo funciona" },
        { id: "troubleshooting", label: "Solución de problemas" },
      ],
      fr: [
        ...sharedToc.fr,
        { id: "run-it-interactively", label: "Lancer en mode interactif" },
        { id: "how-it-works", label: "Fonctionnement" },
        { id: "troubleshooting", label: "Dépannage" },
      ],
    },
  },
  {
    Content: ExpressNodemailer,
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
        { id: "run-interactively", label: "Ejecutar de forma interactiva" },
        { id: "how-it-works", label: "Cómo funciona" },
        { id: "register-the-matchers", label: "Registrar los matchers" },
        { id: "troubleshooting", label: "Solución de problemas" },
      ],
      fr: [
        ...sharedToc.fr,
        { id: "run-interactively", label: "Lancer en mode interactif" },
        { id: "how-it-works", label: "Fonctionnement" },
        { id: "register-the-matchers", label: "Enregistrer les matchers" },
        { id: "troubleshooting", label: "Dépannage" },
      ],
    },
  },
  {
    Content: FaultInjectionVitest,
    directory: "fault-injection-vitest",
    strings: {
      en: {
        description:
          "Test transient SMTP failures, paused deliveries, and connection recovery with Vitest.",
        title: "SMTP fault injection + Vitest",
      },
      es: {
        description:
          "Prueba fallos SMTP transitorios, entregas en pausa y recuperación de conexión con Vitest.",
        title: "Inyección de fallos SMTP + Vitest",
      },
      fr: {
        description:
          "Testez les erreurs SMTP transitoires, les livraisons en pause et la reprise de connexion avec Vitest.",
        title: "Injection de pannes SMTP + Vitest",
      },
    },
    toc: faultInjectionToc,
  },
  {
    Content: TestFixtureBun,
    directory: "test-fixture-bun",
    strings: {
      en: {
        description:
          "Use Bun lifecycle hooks with a dynamic InboxTap server and an explicit fresh inbox per test.",
        title: "Bun test fixtures + InboxTap",
      },
      es: {
        description:
          "Usa los hooks de ciclo de vida de Bun con un servidor InboxTap dinámico y un buzón nuevo por test.",
        title: "Fixtures de Bun + InboxTap",
      },
      fr: {
        description:
          "Utilisez les hooks de cycle de vie de Bun avec un serveur InboxTap dynamique et une nouvelle boîte par test.",
        title: "Fixtures Bun test + InboxTap",
      },
    },
    toc: fixtureToc,
  },
  {
    Content: TestFixtureVitest,
    directory: "test-fixture-vitest",
    strings: {
      en: {
        description:
          "Run concurrent Vitest cases through one file-scoped InboxTap server with isolated test inboxes.",
        title: "Vitest fixtures + InboxTap",
      },
      es: {
        description:
          "Ejecuta casos concurrentes de Vitest con un servidor InboxTap por archivo y buzones aislados por test.",
        title: "Fixtures de Vitest + InboxTap",
      },
      fr: {
        description:
          "Exécutez des cas Vitest concurrents avec un serveur InboxTap par fichier et des boîtes isolées par test.",
        title: "Fixtures Vitest + InboxTap",
      },
    },
    toc: fixtureToc,
  },
  {
    Content: TestFixturePlaywright,
    directory: "test-fixture-playwright",
    strings: {
      en: {
        description:
          "Compose Playwright worker fixtures so an application consumes InboxTap's dynamic SMTP settings.",
        title: "Playwright fixtures + InboxTap",
      },
      es: {
        description:
          "Compón fixtures worker de Playwright para que una aplicación use la configuración SMTP dinámica de InboxTap.",
        title: "Fixtures de Playwright + InboxTap",
      },
      fr: {
        description:
          "Composez des fixtures worker Playwright pour qu’une application utilise la configuration SMTP dynamique d’InboxTap.",
        title: "Fixtures Playwright + InboxTap",
      },
    },
    toc: fixtureToc,
  },
  {
    Content: TestReportingVitest,
    directory: "test-reporting-vitest",
    strings: {
      en: {
        description:
          "Generate redacted HTML and JSON artifacts from matcher observations, captured messages, and application assertions.",
        title: "Redacted test reports + Vitest",
      },
      es: {
        description:
          "Genera artefactos HTML y JSON redactados a partir de observaciones de matchers, mensajes capturados y aserciones de la aplicación.",
        title: "Informes de prueba redactados + Vitest",
      },
      fr: {
        description:
          "Générez des artefacts HTML et JSON expurgés à partir d’observations de matchers, de messages capturés et d’assertions de l’application.",
        title: "Rapports de test expurgés + Vitest",
      },
    },
    toc: testReportingToc,
  },
] as const satisfies readonly {
  Content: ComponentType;
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
