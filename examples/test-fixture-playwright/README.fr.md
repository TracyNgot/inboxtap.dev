# Fixtures Playwright avec InboxTap

Démarrez InboxTap dans une fixture de processus Playwright, puis démarrez une fixture d’application
qui utilise ses paramètres SMTP dynamiques. Chaque test Playwright reçoit une nouvelle boîte, sans
réserver de ports fixes ni démarrer de navigateur.

## Prérequis

- Node.js 20 ou version ultérieure

## Installation

```bash
npm install
```

Aucun téléchargement de navigateur n’est nécessaire, car cet exemple illustre la composition des
fixtures sans utiliser la fixture `page`.

## Lancer les tests

```bash
npm test
```

Playwright démarre puis arrête toute la chaîne de dépendances des fixtures pour chaque processus
d’exécution.

## Fonctionnement

```ts
import { test as base } from "@playwright/test";
import { extendInboxTap } from "inboxtap/fixtures/playwright";
import nodemailer from "nodemailer";

interface App {
  sendWelcome(to: string): Promise<void>;
}

const withInboxTap = extendInboxTap(base);

export const test = withInboxTap.extend<object, { app: App }>({
  app: [
    async ({ inboxTap }, use) => {
      const transport = nodemailer.createTransport(inboxTap.smtp);
      await transport.verify();
      try {
        await use({
          async sendWelcome(to) {
            await transport.sendMail({
              from: "app@local.test",
              to,
              subject: "Welcome",
              text: "Your account is ready.",
            });
          },
        });
      } finally {
        transport.close();
      }
    },
    { scope: "worker" },
  ],
});
```

La fixture de processus `app` dépend de la fixture de processus `inboxTap`. Playwright démarre donc
InboxTap en premier et le ferme en dernier. Pour rendre le cycle de vie facile à comprendre,
l’exemple exécutable remplace l’application web par un petit objet chargé d’envoyer les e-mails.

## Isolation et nettoyage

InboxTap n’est partagé qu’à l’échelle du processus d’exécution ; l’adaptateur injecte une nouvelle
valeur `inbox` dans chaque test. La fixture de l’application possède son transport et l’ordre des
dépendances garantit que ce transport est fermé avant l’arrêt d’InboxTap.

N’utilisez pas l’option `webServer` de Playwright lorsque l’application a besoin du port SMTP
dynamique d’InboxTap : `webServer` démarre avant la création des fixtures de test. Démarrez
l’application dans une fixture de processus qui dépend d’InboxTap, comme le fait cet exemple.

## Dépannage

- **L’application ne parvient pas à se connecter** — créez son transport à partir de
  `inboxTap.smtp` ; ne recopiez pas un port fixe dans la configuration.
- **L’application démarre avant InboxTap** — indiquez `inboxTap` dans les arguments de dépendance de
  la fixture `app`.
- **L’exécutable d’un navigateur est introuvable** — cet exemple n’utilise pas `page`. Retirez les
  fixtures de navigateur des tests copiés ou installez le navigateur requis par votre application.
