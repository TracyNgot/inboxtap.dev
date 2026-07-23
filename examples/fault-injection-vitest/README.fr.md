# Injection de pannes SMTP avec Vitest

Testez les chemins de nouvelle tentative, de concurrence et de rétablissement de connexion à la
véritable frontière SMTP. Ce projet Vitest autonome utilise la fixture InboxTap du lanceur de tests,
un transport Nodemailer local configuré dynamiquement et une nouvelle boîte pour chaque test.

## Prérequis

- Bun 1.3 ou version ultérieure

## Installation

```bash
bun install --frozen-lockfile
```

Cet exemple utilise précisément InboxTap `1.2.0`, première version qui fournit `server.faults`.

## Lancer les tests

```bash
bun run test
```

La suite démarre InboxTap sur des ports de bouclage dynamiques, puis ferme son transport et ses
écouteurs à la fin du fichier.

## Ce que démontre l’exemple

Les trois tests couvrent le comportement SMTP au niveau de la livraison :

- une réponse `451` qui déclenche une nouvelle tentative unique du code de l’application ;
- une pause ciblée sur un destinataire pendant qu’une transaction indépendante se termine ;
- une coupure de connexion suivie d’une livraison réussie sur une nouvelle connexion.

Les livraisons échouées ou interrompues n’entrent jamais dans la boîte. Un message mis en pause
n’apparaît qu’après la libération de sa barrière.

## Nouvelle tentative après une erreur transitoire

Enregistrez la panne avant de déclencher l’application. La prochaine transaction correspondante
consomme la règle lorsqu’elle atteint `DATA` :

```ts
inboxTap.server.faults.failNext({
  code: 451,
  message: "Temporary local failure",
  to: inbox.address,
});

const attempts = await sendWithOneRetry(() =>
  inboxTap.transport.sendMail({
    from: "app@local.test",
    to: inbox.address,
    subject: "Retry receipt",
    text: "The application retries this delivery once.",
  }),
);
```

`sendWithOneRetry()` appartient à l’application de cet exemple. InboxTap renvoie la réponse SMTP
configurée ; il ne gère ni les nouvelles tentatives, ni la persistance, ni la déduplication des
opérations applicatives.

## Mise en pause et libération

`pauseNext()` renvoie une barrière isolée. Attendre la mise en pause effective de la transaction rend
le point de concurrence déterministe :

```ts
const gate = inboxTap.server.faults.pauseNext({ to: inbox.address });
const pausedDelivery = inboxTap.transport.sendMail({
  from: "app@local.test",
  to: inbox.address,
  subject: "Paused receipt",
  text: "This message is not captured until release.",
});

await gate.waitUntilPaused();
expect(await inbox.messages()).toHaveLength(0);

await sendUnrelatedMessage();
gate.release();
await pausedDelivery;
```

Le test libère la barrière dans `finally`. Ainsi, l’échec d’une assertion ne peut pas laisser la
transaction SMTP en attente.

## Rétablissement après une déconnexion

Les seuils de déconnexion s’appliquent par blocs de flux. Un seuil nul tente de fermer la connexion
dès le début du traitement de `DATA` :

```ts
inboxTap.server.faults.disconnectNext({
  afterBytes: 0,
  to: inbox.address,
});

await expect(sendInterruptedMessage()).rejects.toBeInstanceOf(Error);
expect(await inbox.messages()).toHaveLength(0);

await sendRecoveredMessage();
expect(await inbox.messages()).toHaveLength(1);
```

Le deuxième envoi démontre le rétablissement du transport. Il s’agit d’une nouvelle transaction SMTP,
qui n’hérite pas de la panne déjà consommée.

## Limites de responsabilité

InboxTap prend en charge la capture SMTP locale et les pannes de livraison déterministes.
L’application reste responsable de sa stratégie de nouvelle tentative, de ses tâches persistantes,
de l’idempotence et de la déduplication métier. La fonction de nouvelle tentative de cet exemple est
volontairement courte afin de rendre ces responsabilités explicites.

## Dépannage

- **La règle de panne affecte un autre test** — ciblez toujours la valeur `inbox.address` injectée ;
  chaque test reçoit une nouvelle boîte.
- **Un test mis en pause dépasse le délai imparti** — appelez `waitUntilPaused()` avant d’examiner
  l’état et libérez la barrière dans `finally`.
- **Une assertion de déconnexion attend un état SMTP** — une coupure de connexion ne transporte
  aucun code de réponse SMTP. Vérifiez le rejet, puis le rétablissement.
- **Une dépendance résout une API qui n’est pas encore publiée** — installez les dépendances avec le
  fichier de verrouillage versionné et conservez la version exacte `1.2.0` d’`inboxtap`.
