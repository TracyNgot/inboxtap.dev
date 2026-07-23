# Express + Nodemailer + InboxTap

Une petite API Express qui envoie des e-mails transactionnels avec Nodemailer : un message de
bienvenue contenant un lien de vérification, un jeton d’invitation à usage unique et un code de
connexion à usage unique. Une suite Vitest capture et vérifie chaque e-mail avec
[InboxTap](https://inboxtap.dev). Elle utilise l’adaptateur de matchers Vitest d’InboxTap pour
exprimer clairement les assertions sur la livraison, le destinataire, les liens et les en-têtes.

## Prérequis

- Node.js 20 ou version ultérieure

## Installation

```bash
npm install
```

Cet exemple utilise précisément InboxTap `1.3.0`, première version qui fournit les matchers
d’assertion.

## Lancer les tests

```bash
npm test
```

Les tests démarrent eux-mêmes InboxTap et l’application : aucun autre terminal n’est nécessaire.
Chaque fichier de test lance son propre serveur InboxTap et sa propre application sur des ports
éphémères. Les fichiers peuvent donc s’exécuter en parallèle sans conflit de ports.

## Lancer l’exemple en mode interactif

Démarrez InboxTap dans un terminal et l’application dans un autre :

```bash
npx inboxtap
```

```bash
npm run dev
```

Déclenchez ensuite l’envoi d’un e-mail et examinez le message capturé :

```bash
curl -X POST http://localhost:3001/signup \
  -H "content-type: application/json" \
  -d '{"email":"someone@local.test"}'

curl http://localhost:8025/api/emails/latest
```

## Fonctionnement

```
app (Express) → nodemailer → SMTP :1025 → InboxTap → HTTP API :8025 ← InboxTapClient (tests)
```

- `src/mailer.ts` définit l’unique transport Nodemailer : `secure: false`, `ignoreTLS: true` et
  aucune option `auth`, car InboxTap désactive AUTH et STARTTLS.
- `src/app.ts` expose `createApp({ mailer, baseUrl })`. L’injection du module d’envoi et de l’URL de
  base permet aux tests de diriger la même application vers des ports éphémères.
- `test/helpers.ts` démarre toute la pile pour chaque fichier de test : `new InboxTapServer({
  apiPort: 0, smtpPort: 0 })`, un `InboxTapClient` relié à `server.apiUrl`, puis l’application sur le
  port 0.
- `test/setup.ts` enregistre les matchers Vitest d’InboxTap auprès de l’instance `expect` du lanceur
  de tests.
- Chaque test appelle `inboxTap.createInbox()` afin d’obtenir une adresse unique. Les tests ne voient
  jamais les messages des autres et aucun nettoyage n’est nécessaire entre les exécutions.

## Enregistrer les matchers

Importez l’adaptateur Vitest dans un fichier d’initialisation et transmettez-lui l’instance native
`expect` de Vitest :

```ts
import { extendInboxTapExpect } from "inboxtap/matchers/vitest";
import { expect } from "vitest";

extendInboxTapExpect(expect);
```

Le fichier d’initialisation est chargé par `setupFiles` dans `vitest.config.ts`. Le matcher de
livraison asynchrone doit être précédé de `await`, tandis que les matchers appliqués aux messages
restent synchrones :

```ts
await expect(inbox).toHaveDeliveredOnce({ subject: /welcome/i });

const email = await inbox.waitForMessage({ subject: /welcome/i });
expect(email).toHaveRecipient(inbox.address);
expect(email).toContainLink("/verify?token=");
expect(email).not.toHaveUnsubscribeHeader();
```

`toHaveDeliveredOnce()` examine l’état actuel de la boîte. Indiquez explicitement `quietMs` si un
test doit observer brièvement l’arrivée éventuelle d’un doublon, mais cette fenêtre ne prouve pas
qu’une nouvelle tentative ne surviendra pas plus tard.

Pour essayer cet exemple avec une version locale d’InboxTap plutôt qu’avec le paquet publié,
exécutez `bun run build && bun pm pack` à la racine du dépôt, puis installez ici l’archive :
`npm install ../../inboxtap-<version>.tgz`.

## Dépannage

- **Une méthode `waitFor…` dépasse le délai imparti** — l’application n’a probablement pas envoyé
  l’e-mail. Consultez ses journaux et vérifiez que le transport utilise l’hôte et le port SMTP
  affichés par InboxTap au démarrage.
- **Un port est déjà utilisé** — la suite de tests utilise des ports éphémères et n’est pas
  concernée, mais le mode interactif utilise par défaut 1025 et 8025 pour InboxTap, ainsi que 3001
  pour l’application. Arrêtez le processus en conflit ou définissez `PORT` et `SMTP_PORT`.
- **Les e-mails apparaissent dans l’interface, mais pas dans les tests** — effectuez l’assertion sur
  la même adresse que celle utilisée par l’application ; `createInbox()` génère une nouvelle adresse
  à chaque appel.
- **Le type d’un matcher est introuvable** — enregistrez `inboxtap/matchers/vitest` dans le fichier
  d’initialisation configuré. L’adaptateur n’est volontairement pas exporté depuis la racine du
  paquet InboxTap.
