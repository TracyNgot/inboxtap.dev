# Better Auth + Next.js + InboxTap

Une application Next.js minimale qui utilise [Better Auth](https://better-auth.com) pour la
vérification des adresses e-mail, la connexion par lien magique et les codes OTP reçus par e-mail.
Sa suite Playwright exécute chaque parcours à partir des vrais e-mails capturés par
[InboxTap](https://inboxtap.dev).

## Prérequis

- Node.js 20 ou version ultérieure
- `npx playwright install chromium` (téléchargement unique du navigateur)
- `better-sqlite3` compile un module natif pendant l’installation. En cas d’échec, installez une
  chaîne de compilation C++ fonctionnelle : Xcode Command Line Tools sous macOS ou
  `build-essential` sous Debian et Ubuntu

## Installation

```bash
npm install
npx playwright install chromium
```

## Lancer les tests

```bash
npm test
```

Les tests démarrent eux-mêmes InboxTap et l’application : aucun autre terminal n’est nécessaire. La
configuration `webServer` de Playwright lance `npx inboxtap` (SMTP sur `:1025`, API HTTP sur
`:8025`) et `next dev` (`:3000`), attend que les deux URL de contrôle d’état répondent, puis arrête
tous les processus.

## Lancer l’exemple en mode interactif

```bash
npx inboxtap
```

Puis, dans un deuxième terminal :

```bash
npm run db:migrate
npm run dev
```

Ouvrez http://localhost:3000, inscrivez-vous avec l’adresse de votre choix, puis consultez l’e-mail
capturé :

```bash
curl http://localhost:8025/api/emails/latest
```

## Fonctionnement

- `lib/mailer.ts` est l’unique point de configuration SMTP : Nodemailer y est dirigé vers
  `localhost:1025` (`secure: false`, `ignoreTLS: true` — InboxTap utilise le SMTP sans chiffrement
  ni authentification).
- Toutes les fonctions de rappel d’envoi de Better Auth (`sendVerificationEmail`, `sendMagicLink`,
  `sendVerificationOTP`) passent par la même fonction utilitaire `sendMail`. Chaque e-mail contient
  du texte brut avec exactement un lien ou un code à six chiffres, ce qui rend l’extraction
  déterministe.
- Les tests appellent `inboxTap.createInbox()` dans chaque test. Chaque boîte reçoit une adresse
  unique : les processus Playwright parallèles partagent ainsi un serveur InboxTap sans lire les
  messages des autres, et `auth.db` n’a pas besoin d’être nettoyé entre les exécutions.
- `inbox.waitForLink()` et `inbox.waitForCode()` interrogent l’API InboxTap jusqu’à l’arrivée de
  l’e-mail. Le filtre sur l’objet garantit que l’assertion vise un seul message.

Pour développer avec une copie locale d’InboxTap plutôt qu’avec la version publiée sur npm, créez
une archive depuis la racine du dépôt (`bun run build && bun pm pack`), puis installez ici le fichier
`.tgz` généré avec `npm install`.

## Dépannage

- **`waitForLink` ou `waitForCode` dépasse le délai imparti** — consultez les journaux de
  l’application pour repérer d’éventuelles erreurs SMTP et vérifiez qu’InboxTap écoute bien :
  `curl http://localhost:8025/health`.
- **Un port est déjà utilisé** — un autre processus occupe `:1025`, `:8025` ou `:3000`. En local,
  la configuration réutilise les serveurs existants ; un ancien processus `next dev` lancé depuis
  un autre projet compte donc également.
- **Des erreurs de schéma apparaissent après une mise à jour de Better Auth** — supprimez `auth.db`,
  puis relancez `npm run db:migrate`. Cette base ne contient que des données de test jetables.
