# Fixtures de test Bun avec InboxTap

Utilisez l’adaptateur Bun d’InboxTap pour démarrer un serveur local de capture SMTP par fichier de
test, tout en créant une boîte propre à chaque test. Les deux écouteurs utilisent des ports
dynamiques et la fixture les ferme à la fin du fichier.

## Prérequis

- [Bun](https://bun.sh) 1.3 ou version ultérieure

## Installation

```bash
npm install
```

## Lancer les tests

```bash
bun test
```

Les tests démarrent InboxTap automatiquement. Aucun processus CLI distinct ni aucun port fixe n’est
nécessaire.

## Fonctionnement

```ts
import { expect, test } from "bun:test";
import { setupInboxTap } from "inboxtap/fixtures/bun";

const inboxTap = setupInboxTap();

test("captures an email", async () => {
  const inbox = await inboxTap.createInbox();
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

`setupInboxTap()` enregistre les fonctions asynchrones `beforeAll` et `afterAll` de Bun. Son
transport Nodemailer préconfiguré utilise le port SMTP sélectionné dynamiquement et est vérifié avant
le début des tests.

## Isolation et nettoyage

Appelez `createInbox()` dans chaque test. Chaque appel génère un destinataire unique : les tests
peuvent donc partager le serveur sans partager leurs messages. Le nettoyage enregistré ferme le
transport et les deux écouteurs InboxTap, même en cas d’échec d’un test.

## Dépannage

- **InboxTap n’est disponible qu’après `beforeAll`** — déclarez `setupInboxTap()` au niveau du
  module, mais appelez ses méthodes depuis un test ou une fonction de cycle de vie ultérieure.
- **Une attente dépasse le délai imparti** — vérifiez que le message a été envoyé à l’adresse
  `inbox.address` de ce test.
- **Le processus reste ouvert** — évitez de créer un deuxième transport ou serveur hors de la
  fixture gérée, sauf si vous le fermez également.
