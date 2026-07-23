# Rapports de test expurgés avec Vitest

Produisez des preuves HTML et JSON déterministes à partir d’une vraie livraison SMTP. Ce projet
Vitest autonome enregistre les observations des matchers InboxTap, une assertion de l’application et
le message capturé, tout en masquant les secrets courants et les adresses personnelles.

## Prérequis

- Bun 1.3 ou version ultérieure

## Installation

```bash
bun install --frozen-lockfile
```

Cet exemple utilise précisément InboxTap `1.4.1`, qui comprend l’API de rapports et le renforcement
de l’expurgation des URL par motifs personnalisés.

## Lancer les tests

```bash
bun run test
```

Le test conserve ses artefacts les plus récents dans `artifacts/verification-email.html` et
`artifacts/verification-email.json`. Git ignore ce répertoire.

## Ce que démontre l’exemple

Le test envoie un e-mail de vérification par le transport Nodemailer dynamique, puis :

- enregistre les observations de `toHaveDeliveredOnce`, `toHaveRecipient` et `toContainLink` ;
- ajoute une assertion explicite de l’application ;
- capture le message sans inclure sa source RFC brute ;
- écrit un fichier HTML autonome et déterministe ainsi qu’un fichier JSON déterministe et
  versionné ;
- vérifie que les adresses, les secrets d’URL, un en-tête sensible et un motif fourni par l’appelant
  sont absents des deux artefacts.

## Recueillir les observations des matchers

Créez un collecteur pour le test et transmettez-le à l’adaptateur de matchers Vitest :

```ts
const report = new InboxTapReport({
  redaction: {
    additionalSensitiveHeaders: ["X-Workflow-Secret"],
    patterns: [/account-\d+/giu],
  },
});

extendInboxTapExpect(expect, { recorder: report });

await expect(inbox).toHaveDeliveredOnce({ subject: /verify/i });
expect(email).toHaveRecipient(inbox.address);
expect(email).toContainLink("/verify/");
```

Les tests qui remplacent le collecteur d’observations des matchers ne doivent pas être concurrents.
Une instance `expect` Vitest partagée ne peut pas diriger en toute sécurité des tests concurrents
vers différents collecteurs.

## Ajouter des messages et des assertions

Les assertions de l’application peuvent faire référence au message capturé et inclure des détails
structurés. Le collecteur associe les identifiants des messages sources à des identifiants de rapport
sûrs et expurge les valeurs détaillées :

```ts
report.addAssertion({
  details: {
    link: email.links[0],
    recipient: inbox.address,
  },
  messageId: email.id,
  name: "Application verification state",
  passed: true,
});

for (const message of await inbox.messages()) {
  report.addMessage(message);
}
```

## Écrire les fichiers HTML et JSON

Écrivez les artefacts depuis `finally` afin qu’un matcher en échec puisse tout de même laisser une
preuve dans l’environnement d’intégration continue :

```ts
try {
  await expect(inbox).toHaveDeliveredOnce({ subject: /verify/i });
} finally {
  for (const message of await inbox.messages()) report.addMessage(message);
  await Promise.all([
    report.write("artifacts/verification-email.json"),
    report.write("artifacts/verification-email.html"),
  ]);
}
```

`render()` et `write()` produisent les mêmes octets déterministes lorsque l’état du collecteur est
identique. Le HTML est statique et autonome ; le balisage capturé est échappé et une politique de
sécurité du contenu restrictive est appliquée.

## Limites de l’expurgation

Par défaut, les rapports excluent la source RFC brute, attribuent systématiquement des pseudonymes
aux adresses e-mail et masquent les en-têtes sensibles, les identifiants de connexion intégrés aux
URL, toutes les valeurs de requête, les fragments, les secrets explicites ou opaques dans les
chemins, les jetons courants et les motifs fournis par l’appelant. L’option `includeRaw: true`
n’inclut qu’une projection expurgée de la source.

L’expurgation est appliquée sans garantie d’exhaustivité : elle ne peut pas toujours détecter des
données personnelles arbitraires. Examinez chaque artefact avant de le partager, définissez les
motifs personnalisés et les noms d’en-têtes sensibles au plus près de l’application et ne considérez
jamais un rapport comme un emplacement sûr pour conserver des secrets.

## Cycle de vie des artefacts

L’exemple supprime les anciens artefacts au début de l’exécution suivante, conserve l’exécution la
plus récente pour l’inspection locale ou le téléversement en intégration continue, et fait ignorer le
répertoire par Git. Configurez explicitement la durée de conservation dans votre environnement
d’intégration continue et supprimez les rapports dès qu’ils ne sont plus nécessaires.

## Dépannage

- **Aucun artefact n’apparaît après l’échec d’une assertion** — conservez la collecte des messages et
  les deux appels à `write()` dans `finally`.
- **Une valeur privée reste visible** — ajoutez un motif d’expurgation personnalisé ou le nom d’un
  en-tête sensible, relancez le test et examinez de nouveau les deux formats.
- **Des tests concurrents enregistrent les observations des autres** — utilisez un fichier de test
  distinct ou exécutez en série les tests qui installent des collecteurs différents sur la même
  instance `expect` de Vitest.
- **L’exemple résout une API qui n’est pas encore publiée** — installez les dépendances avec le
  fichier de verrouillage versionné et conservez la version exacte `1.4.1` d’`inboxtap`.
