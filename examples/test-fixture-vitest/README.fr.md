# Fixtures Vitest avec InboxTap

Étendez Vitest avec un serveur InboxTap propre au fichier et une nouvelle boîte pour chaque test. Les
deux tests d’exemple s’exécutent en parallèle avec un seul transport SMTP configuré dynamiquement,
tandis que les messages capturés restent isolés.

## Prérequis

- Node.js 20 ou version ultérieure

## Installation

```bash
npm install
```

## Lancer les tests

```bash
npm test
```

La fixture démarre InboxTap et vérifie son transport Nodemailer avant l’exécution du premier test.

## Fonctionnement

```ts
import { extendInboxTap } from "inboxtap/fixtures/vitest";
import { test as base, expect } from "vitest";

const test = extendInboxTap(base);

test.concurrent("captures an isolated email", async ({ inboxTap, inbox }) => {
  await inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Welcome",
    text: "Your account is ready.",
  });

  const message = await inbox.waitForMessage({ subject: "Welcome" });
  expect(message.envelope.to).toEqual([inbox.address]);
});
```

`extendInboxTap()` fournit une fixture `inboxTap` propre au fichier et une fixture `inbox` propre au
test. La fixture partagée expose le serveur, le client, les paramètres SMTP et un transport
Nodemailer prêt à l’emploi.

## Isolation et nettoyage

Vitest crée une nouvelle adresse de boîte pour chaque test concurrent. Le filtrage par destinataire
sépare les messages de chaque test, même si le fichier partage un serveur SMTP. La fixture propre au
fichier ferme son transport et ses écouteurs après le dernier test, y compris lorsqu’un test échoue.

## Dépannage

- **Le type d’un lanceur de tests est introuvable** — importez l’adaptateur depuis
  `inboxtap/fixtures/vitest`, et non depuis l’exportation racine d’InboxTap.
- **Une attente dépasse le délai imparti** — envoyez le message à la valeur `inbox.address` injectée,
  et non à un destinataire codé en dur.
- **Les tests partagent des messages de façon inattendue** — utilisez la fixture `inbox` injectée
  dans chaque test et évitez de créer une boîte au niveau du module.
