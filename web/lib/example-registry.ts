import type { ComponentType } from "react";
import BetterAuthNextjs from "../../examples/better-auth-nextjs/README.md";
import ExpressNodemailer from "../../examples/express-nodemailer/README.md";
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
        { id: "troubleshooting", label: "Troubleshooting" },
      ],
      es: [
        ...sharedToc.es,
        { id: "run-interactively", label: "Ejecutar de forma interactiva" },
        { id: "how-it-works", label: "Cómo funciona" },
        { id: "troubleshooting", label: "Solución de problemas" },
      ],
      fr: [
        ...sharedToc.fr,
        { id: "run-interactively", label: "Lancer en mode interactif" },
        { id: "how-it-works", label: "Fonctionnement" },
        { id: "troubleshooting", label: "Dépannage" },
      ],
    },
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
