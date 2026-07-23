# Envoi programmé d’e-mails avec Vitest

Cet exemple conserve la planification dans le code de l’application, tandis qu’InboxTap observe la
livraison SMTP réelle. Un simulateur de `MailProvider` à capacité bornée expose `send`, `schedule`
et `cancel` ; une horloge virtuelle injectée rend l’exécution des tâches arrivées à échéance
déterministe ; et Nodemailer envoie chaque message immédiat ou échu dans une boîte InboxTap isolée.

## Prérequis

- Bun 1.3 ou version ultérieure
- InboxTap 1.4.1

## Configuration

```bash
cd examples/scheduled-email-vitest
bun install --frozen-lockfile
```

## Lancer les tests

```bash
bun run test
```

La configuration de test démarre InboxTap sur des ports dynamiques, crée une nouvelle boîte pour
chaque test, puis ferme le transport SMTP et les deux serveurs d’écoute à la fin du fichier.

## Ce que démontre l’exemple

Les cinq cas de test Vitest couvrent l’intégralité du contrat local :

- `send` livre immédiatement le message par Nodemailer.
- Un message programmé reste absent avant son échéance.
- Avancer l’horloge jusqu’à l’échéance livre le message une seule fois.
- L’annulation retire une tâche en attente avant sa livraison.
- À échéance égale, l’ordre d’insertion est respecté ; les échéances antérieures sont toujours
  traitées en premier.
- La file d’attente rejette les entrées qui dépassent sa capacité configurée et libère de nouveau
  cette capacité après une annulation.

## Contrat du fournisseur

`src/mail-provider.ts` définit l’interface dont l’application est responsable :

```ts
export interface MailProvider {
  cancel(id: string): boolean;
  schedule(message: MailMessage, scheduledAt: Date): string;
  send(message: MailMessage): Promise<void>;
}
```

`FakeMailProvider` copie chaque message avant de le conserver et limite la file d’attente à
100 entrées. Les tests peuvent choisir une limite inférieure. Les identifiants progressent de
manière déterministe au sein d’une même instance du fournisseur, et l’annulation d’un identifiant
inconnu ou déjà annulé renvoie `false`. `schedule()` exige une échéance postérieure à l’heure de
l’horloge virtuelle ; utilisez `send()` pour un envoi immédiat.

## Horloge virtuelle

`VirtualClock` conserve une `Date` courante et avertit les fonctions abonnées lorsqu’un test appelle
`advanceTo()` ou `advanceBy()`. Elle rejette les dates non valides, les retours en arrière, les
durées négatives et les avancées simultanées. Elle ne dépend d’aucun minuteur global ni d’aucune
attente en temps réel.

Le fournisseur s’abonne aux avancées de l’horloge, retire les entrées arrivées à échéance avant de
les envoyer, les trie d’abord par échéance puis par ordre d’insertion, et attend successivement
chaque livraison Nodemailer. Lorsque l’avancée de l’horloge se termine, chaque livraison échue qui a
réussi est déjà visible dans InboxTap.

## Livraison unique et annulation

Le fournisseur supprime une entrée avant d’appeler Nodemailer. Une nouvelle avancée de l’horloge ne
peut donc pas livrer deux fois le même élément programmé. Ce simulateur illustre volontairement une
seule tentative de livraison ; les stratégies de nouvelle tentative et de persistance restent sous
la responsabilité de l’application.

L’annulation s’applique uniquement aux tâches en attente. Dès que la livraison a commencé, l’entrée
n’est plus en attente et `cancel()` renvoie `false`.

## Limites de responsabilité

SMTP ne définit ni champ standard `scheduledAt` ni opération d’annulation. InboxTap n’en invente
donc pas. Cet exemple prend en charge la planification, l’ordre, la capacité et l’annulation, puis
franchit la même frontière entre Nodemailer et SMTP que l’envoi immédiat d’un email.

Le simulateur se trouve volontairement dans `examples/`, et non dans le paquet public InboxTap. Il
constitue un contrat que chaque application peut copier ou adapter, et non la promesse que tous les
fournisseurs d’emails proposent une planification aux règles identiques.

## Dépannage

- **Un message apparaît avant son échéance** — vérifiez que le code de l’application utilise
  l’horloge injectée plutôt que `Date.now()`.
- **La file d’attente est pleine** — annulez une tâche en attente, avancez l’horloge pour livrer les
  tâches échues ou augmentez la limite propre au test, sans dépasser 100.
- **Un test ne se termine pas** — attendez la fin de l’avancée de l’horloge ; celle-ci attend la
  livraison Nodemailer sous-jacente.
- **Un envoi programmé échoue** — l’erreur de Nodemailer est propagée. Définissez le comportement de
  nouvelle tentative dans le contrat de l’application au lieu de le dissimuler dans le simulateur.
