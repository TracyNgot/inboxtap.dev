import type { ResourceContentDictionary } from "../../types";

type FrenchComparisonKey = "compare/mailhog" | "compare/mailpit" | "compare/mailtrap";

export const compareResourcesFr = {
  "compare/mailhog": {
    cta: {
      description:
        "Situez InboxTap, les outils de capture consultables dans un navigateur et les environnements hébergés parmi les solutions de développement local et de tests automatisés.",
      label: "Explorer les autres solutions de test d’emails",
      title: "Comparer un éventail plus large de solutions",
    },
    description:
      "Comparez InboxTap et MailHog pour la capture SMTP locale, les tests automatisés, l’inspection visuelle, la simulation de pannes, le stockage et la CI.",
    eyebrow: "Guide comparatif",
    intro:
      "InboxTap et MailHog capturent tous deux les emails SMTP en local, mais ils privilégient des méthodes de travail différentes. InboxTap place la suite de tests au centre de l’utilisation. MailHog privilégie une boîte de réception dans le navigateur et une API HTTP.",
    kind: "compare",
    relatedDocKey: "alternatives",
    section: "comparer",
    sections: [
      {
        id: "reponse-courte",
        title: "Réponse courte",
        paragraphs: [
          "Choisissez InboxTap lorsqu’un test automatisé TypeScript, Bun ou Node doit démarrer le serveur, créer un destinataire isolé, attendre un lien ou un code, provoquer une panne SMTP précise et produire une preuve de CI expurgée. Ses configurations officielles prennent en charge Bun test, Vitest et Playwright.",
          "Choisissez MailHog lorsque les utilisateurs ont besoin d’une boîte de réception dans le navigateur, d’inspecter les parties MIME, de stocker durablement les messages, de les remettre par un véritable serveur SMTP ou d’utiliser le modèle de chaos Jim à l’échelle du processus. MailHog possède aussi une API JSON et ne doit donc pas être présenté comme un outil exclusivement manuel.",
        ],
      },
      {
        id: "comparaison-fonctions",
        title: "Comparatif d’InboxTap et de MailHog",
        paragraphs: [
          "La différence essentielle n’est pas la capacité à capturer un email. Elle tient au responsable de la méthode de travail : le code de test ou une boîte de réception visuelle partagée.",
        ],
        table: {
          headers: ["Aspect", "InboxTap", "MailHog"],
          rows: [
            [
              "Usage principal",
              "Tests automatisés pilotés par le code pour les parcours applicatifs dépendant d’emails.",
              "Capture locale interactive dans une interface web, avec une API HTTP pour l’automatisation.",
            ],
            [
              "Exécution et distribution",
              "CLI npm et paquet TypeScript ; fonctionne avec Node 20 ou Bun sans imposer Docker.",
              "Binaire Go, paquet Homebrew ou image Docker.",
            ],
            [
              "Interface web",
              "Aucun tableau de bord pour les messages capturés ; le site web sert uniquement à la documentation.",
              "Boîte de réception dans le navigateur pour inspecter le texte brut, le HTML, la source et les parties MIME.",
            ],
            [
              "Automatisation",
              "Client typé, fonctions d’attente longue, configurations natives pour les outils de test, assertions spécialisées et collecte de rapports HTML ou JSON.",
              "API JSON et bibliothèques clientes communautaires recensées par le projet.",
            ],
            [
              "Isolation des tests parallèles",
              "Crée une adresse destinataire unique pour chaque test et filtre le stockage selon le destinataire de l’enveloppe SMTP.",
              "Utilise un stockage de messages partagé ; les suites de tests doivent répartir ou filtrer elles-mêmes leurs messages.",
            ],
            [
              "Tests des scénarios d’échec",
              "Place dans une file une règle bornée pour la prochaine transaction DATA correspondante : échec, délai, pause et libération, ou déconnexion.",
              "Jim applique des probabilités configurées aux connexions, au débit, à l’authentification, aux expéditeurs et aux destinataires.",
            ],
            [
              "Stockage",
              "Stockage FIFO borné uniquement en mémoire ; 100 messages par défaut.",
              "Mémoire par défaut, avec des options documentées de persistance dans MongoDB et Maildir.",
            ],
            [
              "Inspection des messages",
              "Texte, HTML, en-têtes, source brute, destinataires de l’enveloppe, liens HTTP et codes de 4 à 8 chiffres ; aucune API pour les pièces jointes.",
              "Texte brut, HTML, source, contenus MIME multiparties et parties MIME téléchargeables dans l’interface web.",
            ],
            [
              "Comportement sortant",
              "Ne relaie et ne transfère jamais les messages capturés.",
              "Peut remettre un message stocké par un serveur SMTP externe configuré.",
            ],
            [
              "Écoute réseau par défaut",
              "Écoute par défaut sur les adresses de bouclage IPv4 et IPv6.",
              "Les configurations documentées de SMTP, de l’API et de l’interface utilisent 0.0.0.0 ; l’authentification HTTP Basic est disponible pour l’interface et l’API.",
            ],
            ["Licence", "MIT.", "MIT."],
            [
              "Activité officielle des versions",
              "Publié et versionné par npm.",
              "La page officielle indique toujours la version 1.0.1 d’août 2020 comme la plus récente ; les dernières modifications visibles de la branche par défaut datent d’août 2022.",
            ],
          ],
        },
      },
      {
        id: "tests-des-pannes",
        title: "Les pannes déterministes et le chaos général répondent à des besoins différents",
        paragraphs: [
          "Jim de MailHog est bien une fonction de test des défaillances. Il peut refuser les connexions, l’authentification, les expéditeurs ou les destinataires, interrompre des sessions et limiter le débit. Ses réglages sont des probabilités appliquées à l’échelle du processus. Une probabilité peut rendre un comportement systématique, mais Jim ne constitue pas une file propre à chaque test pour la prochaine transaction destinée à un destinataire isolé.",
          "InboxTap enregistre les pannes directement dans le test. Un filtre de destinataire compare l’enveloppe SMTP sans tenir compte de la casse, puis la prochaine transaction correspondante qui atteint DATA consomme une règle. Les livraisons échouées ou interrompues n’entrent pas dans le stockage ; les emails retardés ou mis en pause n’apparaissent qu’après leur achèvement réussi.",
          "Jim convient ainsi aux expériences générales de chaos, tandis qu’InboxTap se prête aux assertions précises sur les nouvelles tentatives, la déduplication, la latence et les envois simultanés. Aucun modèle n’est toujours supérieur à l’autre : ils répondent à des questions de test différentes.",
        ],
      },
      {
        id: "quel-outil",
        title: "Quel outil choisir ?",
        paragraphs: [
          "Une équipe peut aussi employer les deux : MailHog pour le retour visuel pendant le développement et InboxTap dans la suite automatisée.",
        ],
        bullets: [
          "Choisissez InboxTap lorsque l’outil d’exécution des tests doit gérer le démarrage, le nettoyage, l’isolation des destinataires, les assertions et les commandes de panne.",
          "Choisissez InboxTap lorsque l’envoi externe de tout message capturé doit rester hors du périmètre du produit.",
          "Choisissez MailHog lorsqu’une boîte de réception dans le navigateur constitue le principal moyen d’inspection des messages.",
          "Choisissez MailHog lorsqu’une méthode existante dépend du stockage MongoDB ou Maildir, du téléchargement de parties MIME ou de la remise des messages.",
          "Si la cadence de maintenance compte pour votre organisation, comparez les dates publiées des versions et des modifications de MailHog à votre propre politique, sans vous fier à des qualificatifs comme « mort » ou « abandonné ».",
        ],
      },
      {
        id: "sources-verifiees",
        title: "Sources vérifiées le 23 juillet 2026",
        paragraphs: [
          "Ce comparatif repose sur les dépôts et la documentation des produits eux-mêmes. Les fonctions et l’état des versions peuvent évoluer après la date de vérification.",
        ],
        links: [
          {
            href: "https://github.com/TracyNgot/inboxtap.dev/blob/main/README.md",
            label: "README d’InboxTap et périmètre public des fonctions",
          },
          {
            href: "https://github.com/mailhog/MailHog",
            label: "README de MailHog et liste des fonctions",
          },
          {
            href: "https://github.com/mailhog/MailHog/blob/master/docs/JIM.md",
            label: "Documentation de la fonction de chaos Jim de MailHog",
          },
          {
            href: "https://github.com/mailhog/MailHog/blob/master/docs/CONFIG.md",
            label: "Configuration et adresses d’écoute par défaut de MailHog",
          },
          {
            href: "https://github.com/mailhog/MailHog/releases",
            label: "Versions officielles de MailHog",
          },
          {
            href: "https://github.com/mailhog/MailHog/commits/master/",
            label: "Historique des modifications de la branche par défaut de MailHog",
          },
        ],
      },
    ],
    slug: "mailhog",
    title: "InboxTap ou MailHog : quel outil local convient à vos tests d’emails ?",
  },
  "compare/mailpit": {
    cta: {
      description:
        "Comparez les SDK de test ciblés, les serveurs de messagerie locaux avec interface et les environnements hébergés avant de choisir votre méthode.",
      label: "Explorer les autres solutions de test d’emails",
      title: "Consulter le guide complet des autres solutions",
    },
    description:
      "Comparez InboxTap et Mailpit pour les tests automatisés d’emails, l’inspection web, les pannes SMTP, le stockage, les preuves de CI et le développement local.",
    eyebrow: "Guide comparatif",
    intro:
      "Mailpit est un serveur complet et activement maintenu pour tester les emails, avec une riche interface web et une API. InboxTap est un serveur de capture SMTP et un SDK de test plus ciblés, distribués par npm. Les deux automatisent les tests d’emails et simulent des pannes SMTP, mais à des niveaux différents.",
    kind: "compare",
    relatedDocKey: "alternatives",
    section: "comparer",
    sections: [
      {
        id: "reponse-courte",
        title: "Réponse courte",
        paragraphs: [
          "Choisissez Mailpit pour un environnement visuel riche avec pièces jointes, recherche avancée, vérification du HTML et des liens, analyse facultative des indésirables, captures d’écran, stockage persistant, POP3, relais, transfert et notifications HTTP.",
          "Choisissez InboxTap lorsque le code de test doit maîtriser le cycle de vie du serveur, disposer d’un nouveau destinataire par test, effectuer des assertions typées, provoquer des pannes déterministes sur la prochaine livraison et produire des preuves de CI expurgées. Mailpit possède aussi une API REST et la fonction Chaos : il n’est ni exclusivement manuel ni limité aux livraisons réussies.",
        ],
      },
      {
        id: "comparaison-fonctions",
        title: "Comparatif d’InboxTap et de Mailpit",
        paragraphs: [
          "Mailpit couvre davantage d’usages opérationnels et visuels pour tester les emails. InboxTap conserve délibérément un périmètre plus réduit autour des tests applicatifs déterministes.",
        ],
        table: {
          headers: ["Aspect", "InboxTap", "Mailpit"],
          rows: [
            [
              "Usage principal",
              "Tests d’intégration et de bout en bout dépendant d’emails, pilotés depuis TypeScript.",
              "Inspection visuelle des emails et tests d’intégration pilotés par API.",
            ],
            [
              "Exécution et distribution",
              "CLI npm et paquet TypeScript pour Node 20 ou Bun ; Docker n’est ni requis ni fourni.",
              "Binaire statique unique ou image Docker pour plusieurs architectures.",
            ],
            [
              "Interface web",
              "Aucune interface pour les messages capturés.",
              "Interface moderne avec recherche de messages, vues HTML et source, pièces jointes, étiquettes, captures d’écran et mises à jour en direct.",
            ],
            [
              "Automatisation",
              "SDK typé, attente longue bornée, configurations Bun, Vitest et Playwright, assertions spécialisées et collecteur de rapports.",
              "API REST, points d’accès aux messages rendus et possibilités documentées de tests d’intégration, dont un paquet Cypress.",
            ],
            [
              "Isolation des tests parallèles",
              "Un destinataire d’enveloppe unique généré par test, sans inscription côté serveur.",
              "Une instance et un stockage partagés ; utilisez des filtres, des étiquettes, la configuration de locataire ou des instances distinctes pour répartir le travail.",
            ],
            [
              "Tests des scénarios d’échec",
              "Une règle en file s’applique à la prochaine transaction DATA correspondante et peut la faire échouer, la retarder, la mettre en pause ou la déconnecter.",
              "Chaos applique selon une probabilité des erreurs configurables de 400 à 599 aux étapes d’expéditeur, de destinataire ou d’authentification.",
            ],
            [
              "Stockage",
              "FIFO bornée uniquement en mémoire, avec 100 messages conservés par défaut.",
              "SQLite temporaire par défaut, avec SQLite persistant ou rqlite en option et suppression automatique au-delà de 500 messages par défaut.",
            ],
            [
              "Inspection des messages",
              "Texte, HTML, en-têtes, source brute, liens et codes numériques courts ; les pièces jointes sont hors périmètre.",
              "Pièces jointes, compatibilité HTML, vérification des liens, analyse facultative par SpamAssassin, captures d’écran et validation de List-Unsubscribe.",
            ],
            [
              "Comportement sortant",
              "Aucun relais, transfert, notification HTTP ni contrôle externe des liens.",
              "Relais SMTP, transfert, notification HTTP, POP3 et requêtes HTTP de vérification des liens en option.",
            ],
            [
              "Réseau et transport",
              "Bouclage par défaut ; l’authentification SMTP et STARTTLS sont volontairement désactivés.",
              "HTTP et SMTP écoutent sur 0.0.0.0 par défaut, avec authentification, HTTPS, STARTTLS et TLS configurables.",
            ],
            [
              "Preuves de CI",
              "Rapports HTML autonomes et déterministes ou JSON versionnés, avec masquage borné et appliqué au mieux.",
              "Captures d’écran de l’interface et résultats d’API ; la documentation publique consultée ne décrit pas de collecteur équivalent d’artefacts expurgés.",
            ],
            ["Licence", "MIT.", "MIT."],
          ],
        },
      },
      {
        id: "tests-des-pannes",
        title: "Différences entre les deux modèles de panne",
        paragraphs: [
          "Mailpit Chaos peut renvoyer un code d’erreur SMTP choisi de 400 à 599 à l’étape de l’expéditeur, du destinataire ou de l’authentification. Ses déclencheurs reposent sur des probabilités, mais une valeur de 100 % peut rendre l’échec d’une étape systématique. Après le démarrage de Mailpit avec Chaos activé, l’interface web et l’API peuvent modifier ces déclencheurs pendant l’exécution.",
          "InboxTap s’empare d’une règle bornée lorsque la prochaine transaction correspondante atteint DATA. La règle peut viser le destinataire d’enveloppe unique créé pour un test et provoquer un échec, un délai artificiel, une barrière de pause isolée ou une coupure de connexion. La réinitialisation et l’arrêt interrompent les attentes actives.",
          "Le modèle de Mailpit convient bien à la modification du comportement d’un environnement en cours d’exécution et aux erreurs des différentes étapes SMTP. Celui d’InboxTap permet à un test de préparer une transaction précise avant de déclencher le code applicatif. Il serait inexact d’affirmer que Mailpit ne peut pas tester les nouvelles tentatives ou que sa fonction Chaos est toujours aléatoire.",
        ],
      },
      {
        id: "quel-outil",
        title: "Quel outil choisir ?",
        paragraphs: [
          "Les produits peuvent se compléter. Une équipe peut utiliser Mailpit comme boîte de réception visuelle pendant le développement et InboxTap pour les tests automatisés ciblés qui nécessitent un cycle de vie typé et des assertions.",
        ],
        bullets: [
          "Choisissez InboxTap lorsqu’un outil d’exécution TypeScript doit démarrer et arrêter le service SMTP sur des ports dynamiques.",
          "Choisissez InboxTap pour les scénarios déterministes de délai, pause, déconnexion et échec de la prochaine livraison, ciblés par destinataire.",
          "Choisissez Mailpit lorsque les développeurs ont besoin d’une boîte de réception soignée, d’inspecter les pièces jointes, de vérifier la compatibilité HTML ou les liens, de produire des captures d’écran ou d’analyser les indésirables.",
          "Choisissez Mailpit si le stockage persistant, POP3, le relais, le transfert, les notifications HTTP, l’authentification ou TLS sont requis.",
          "Lorsque Mailpit fonctionne sur un réseau partagé, vérifiez ses réglages d’écoute, d’authentification et de TLS au lieu de supposer un bouclage exclusif par défaut.",
        ],
      },
      {
        id: "sources-verifiees",
        title: "Sources vérifiées le 23 juillet 2026",
        paragraphs: [
          "La version officielle la plus récente de Mailpit lors de cette vérification était la v1.30.5, publiée le 20 juillet 2026. Les numéros de version et le détail des fonctions doivent être contrôlés à nouveau lors d’une mise à jour importante de cette page.",
        ],
        links: [
          {
            href: "https://github.com/TracyNgot/inboxtap.dev/blob/main/README.md",
            label: "README d’InboxTap et périmètre public des fonctions",
          },
          {
            href: "https://mailpit.axllent.org/docs/",
            label: "Documentation officielle des fonctions de Mailpit",
          },
          {
            href: "https://mailpit.axllent.org/docs/integration/",
            label: "Documentation des tests d’intégration avec Mailpit",
          },
          {
            href: "https://mailpit.axllent.org/docs/integration/chaos/",
            label: "Documentation de la fonction Chaos de Mailpit",
          },
          {
            href: "https://mailpit.axllent.org/docs/configuration/email-storage/",
            label: "Documentation du stockage de Mailpit",
          },
          {
            href: "https://mailpit.axllent.org/docs/configuration/runtime-options/",
            label: "Options d’exécution et adresses d’écoute actuelles de Mailpit",
          },
          {
            href: "https://github.com/axllent/mailpit/releases/latest",
            label: "Version officielle la plus récente de Mailpit",
          },
        ],
      },
    ],
    slug: "mailpit",
    title: "InboxTap ou Mailpit : SDK de test ou environnement complet pour les emails ?",
  },
  "compare/mailtrap": {
    cta: {
      description:
        "Comparez les SDK de test locaux, les outils visuels de capture et les services collaboratifs hébergés dans le guide complet des autres solutions.",
      label: "Explorer les autres solutions de test d’emails",
      title: "Choisir la méthode, pas seulement la marque",
    },
    description:
      "Comparez InboxTap, Mailtrap Local et Email Sandbox hébergé pour l’automatisation, l’inspection visuelle, la collaboration, les pannes, la confidentialité et le coût.",
    eyebrow: "Guide comparatif",
    intro:
      "Mailtrap ne se limite plus à un service hébergé. Mailtrap Local est un environnement local limité à localhost, sous licence MIT, doté d’une interface web intégrée et d’une API REST, tandis que Mailtrap Email Sandbox reste le service collaboratif hébergé. InboxTap est le SDK de test plus ciblé distribué par npm.",
    kind: "compare",
    relatedDocKey: "alternatives",
    section: "comparer",
    sections: [
      {
        id: "trois-produits",
        title: "Trois produits pour trois méthodes principales",
        paragraphs: [
          "Choisissez InboxTap lorsque le code de test automatisé doit maîtriser le cycle de vie SMTP, les destinataires isolés, les assertions, les pannes déterministes et les artefacts expurgés.",
          "Choisissez Mailtrap Local lorsqu’un développeur souhaite inspecter visuellement les messages hors connexion, gérer les pièces jointes, vérifier la compatibilité HTML, conserver un historique SQLite et utiliser une API REST locale.",
          "Choisissez Mailtrap Email Sandbox hébergé lorsqu’une équipe a besoin de projets et d’environnements partagés, de rôles, d’un accès distant depuis la préproduction, de transfert, d’analyses hébergées et de fonctions collaboratives liées au forfait.",
        ],
      },
      {
        id: "comparaison-fonctions",
        title: "Comparatif d’InboxTap, Mailtrap Local et Email Sandbox",
        paragraphs: [
          "Distinguer Mailtrap Local du produit hébergé évite l’affirmation dépassée selon laquelle toute utilisation de Mailtrap envoie les données de test vers un service distant.",
        ],
        table: {
          headers: ["Aspect", "InboxTap", "Mailtrap Local", "Email Sandbox hébergé"],
          rows: [
            [
              "Usage principal",
              "Tests automatisés d’intégration et de bout en bout déterministes.",
              "Développement visuel local et inspection individuelle des messages.",
              "Développement partagé, contrôle qualité, préproduction et collaboration en équipe.",
            ],
            [
              "Exécution et distribution",
              "CLI npm et paquet TypeScript pour Node 20 ou Bun.",
              "Homebrew, Docker ou binaire unique pour macOS ou Linux ; Windows n’est pas encore pris en charge selon le README consulté.",
              "Service SMTP et API hébergé, accessible avec les identifiants de l’environnement.",
            ],
            [
              "Interface web",
              "Aucun tableau de bord pour les messages capturés.",
              "Boîte de réception React intégrée avec recherche, HTML, texte, source brute, en-têtes et pièces jointes.",
              "Boîte de réception hébergée avec aperçus, vérification HTML, en-têtes, pièces jointes et informations Bcc selon le forfait.",
            ],
            [
              "Automatisation",
              "SDK typé, configurations explicites et natives pour les outils de test, assertions spécialisées, pannes programmables et collecte de rapports.",
              "API REST JSON accompagnée d’une spécification OpenAPI.",
              "API authentifiée pour les messages, le contenu, les projets, les environnements, les utilisateurs, le transfert et l’automatisation des tests.",
            ],
            [
              "Isolation et collaboration",
              "Un destinataire d’enveloppe généré par test ; aucun compte utilisateur ni tableau de bord partagé.",
              "Un environnement local mono-utilisateur avec catégories ; explicitement sans compte, authentification, architecture multilocataire, environnement partagé ni rôle.",
              "Projets et environnements avec utilisateurs, autorisations, partage et authentification unique selon le forfait.",
            ],
            [
              "Tests des scénarios d’échec",
              "Échec, délai, pause et libération ou déconnexion de la prochaine livraison ciblée par destinataire à l’étape DATA.",
              "Le README public et la spécification OpenAPI consultés ne décrivent pas de commande équivalente pour provoquer des pannes SMTP.",
              "L’émulateur de rejets SMTP renvoie le code et la réponse demandés lorsque l’email est envoyé à une adresse destinataire spécialement construite.",
            ],
            [
              "Stockage",
              "Stockage FIFO borné uniquement en mémoire.",
              "SQLite local avec conservation configurable des messages.",
              "Le stockage hébergé ainsi que les limites mensuelles, de débit, de taille et par environnement varient selon le forfait ; les environnements pleins suppriment les messages en FIFO.",
            ],
            [
              "Inspection des messages",
              "Texte, HTML, en-têtes, source brute, destinataires de l’enveloppe, liens et codes de 4 à 8 chiffres ; aucune pièce jointe.",
              "Pièces jointes, contenu intégré, source brute, en-têtes et vérification de la compatibilité HTML avec les logiciels de messagerie.",
              "Inspection du HTML et de la source brute, vérification HTML, pièces jointes, en-têtes, analyse des indésirables et autres outils liés au forfait.",
            ],
            [
              "Comportement sortant",
              "Ne relaie et ne transfère jamais les emails.",
              "Peut remettre un message par un relais SMTP générique, le copier vers le service Mailtrap et envoyer des notifications HTTP signées.",
              "Prend en charge le transfert manuel et automatique dans les limites du forfait.",
            ],
            [
              "Réseau et emplacement des données",
              "Bouclage IPv4 et IPv6 par défaut ; une écoute plus large exige une option explicite.",
              "SMTP sur 127.0.0.1:3535 et interface/API sur 127.0.0.1:3550 par défaut.",
              "Service distant hébergé utilisant SMTP authentifié ou HTTPS.",
            ],
            [
              "Licence et coût",
              "Logiciel à code source ouvert sous licence MIT.",
              "Logiciel à code source ouvert sous licence MIT.",
              "Service hébergé avec des forfaits gratuits et payants ; les tarifs et quotas peuvent évoluer.",
            ],
          ],
        },
      },
      {
        id: "tests-des-pannes",
        title: "Le test des pannes ne se résume pas à une réponse binaire",
        paragraphs: [
          "InboxTap permet à un test de placer dans une file la prochaine panne destinée à un destinataire d’enveloppe généré. Il peut renvoyer une réponse 4xx ou 5xx, ajouter une latence bornée, suspendre une transaction jusqu’à sa libération par le test ou interrompre la connexion pendant DATA. Les messages échoués ou interrompus ne sont pas capturés.",
          "Email Sandbox hébergé possède un véritable émulateur de rejets SMTP. L’adresse destinataire encode la réponse voulue, puis le service SMTP renvoie ce rejet à l’application. Cette fonction passe par SMTP plutôt que par l’API d’envoi. Elle permet de tester la gestion des refus, mais son contrat diffère du délai, de la suspension ou de la déconnexion appliqués à la prochaine livraison vers le destinataire habituel du test applicatif.",
          "À la date de vérification, le README public et la spécification OpenAPI de Mailtrap Local décrivent la capture, l’inspection, la remise, la copie vers le service hébergé et les notifications HTTP, sans mentionner d’API équivalente d’injection de pannes. Il s’agit d’un constat daté sur la documentation, et non d’une promesse concernant les versions futures.",
        ],
      },
      {
        id: "statut-mailtrap-local",
        title: "Mailtrap Local est récent et mérite une évaluation distincte",
        paragraphs: [
          "Le journal des modifications de Mailtrap Local indique une première publication publique le 3 juillet 2026, puis la v0.2.0 le 22 juillet 2026. Le projet se présente comme un complément au produit Mailtrap hébergé, et non comme un remplacement de ses fonctions d’équipe.",
          "Ses valeurs locales par défaut sont volontairement restreintes : écoute sur le bouclage, SQLite, aucune authentification et aucun modèle multi-utilisateur. Son périmètre visuel et opérationnel reste toutefois plus large que celui d’InboxTap, avec les pièces jointes, la vérification de compatibilité HTML, les catégories de messages, la remise, les notifications HTTP et le mode de remplacement de sendmail.",
          "Les équipes ne devraient pas traiter la marque Mailtrap commune comme un produit unique. L’inspection locale, la collaboration hébergée et les tests déterministes pilotés par le code relèvent de décisions d’achat ou d’architecture distinctes.",
        ],
      },
      {
        id: "quelle-solution",
        title: "Quelle solution choisir ?",
        paragraphs: [
          "Une méthode mixte est raisonnable : InboxTap dans les suites automatisées, Mailtrap Local pour le travail visuel sur les modèles et Email Sandbox hébergé pour la préproduction ou le contrôle qualité partagé.",
        ],
        bullets: [
          "Choisissez InboxTap pour le cycle de vie natif de npm, l’isolation du destinataire par test, les assertions spécialisées, les scénarios déterministes de délai et de déconnexion ainsi que les rapports de CI expurgés.",
          "Choisissez Mailtrap Local pour une boîte de réception visuelle limitée à localhost, les pièces jointes, les vérifications HTML, l’historique SQLite, la remise ou les notifications HTTP sans utiliser de boîte hébergée.",
          "Choisissez Email Sandbox hébergé pour les environnements distants, les projets partagés, le contrôle d’accès, le transfert, les outils de délivrabilité et les méthodes de travail en équipe.",
          "Ne figez pas un comparatif tarifaire de Mailtrap dans le code. Les prix, quotas, possibilités de transfert et fonctions collaboratives des forfaits hébergés peuvent évoluer.",
        ],
      },
      {
        id: "sources-verifiees",
        title: "Sources vérifiées le 23 juillet 2026",
        paragraphs: [
          "Cette vérification distingue Mailtrap Local v0.2.0 d’Email Sandbox hébergé et repose sur le dépôt actuel, le centre d’aide et la page tarifaire de Mailtrap. Contrôlez à nouveau la séparation des produits et le détail des forfaits lors de la mise à jour de cette page.",
        ],
        links: [
          {
            href: "https://github.com/TracyNgot/inboxtap.dev/blob/main/README.md",
            label: "README d’InboxTap et périmètre public des fonctions",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local",
            label: "README officiel de Mailtrap Local",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local/blob/main/CHANGELOG.md",
            label: "Journal des modifications de Mailtrap Local",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local/releases/tag/v0.2.0",
            label: "Version v0.2.0 de Mailtrap Local",
          },
          {
            href: "https://github.com/mailtrap/mailtrap-local/blob/main/docs/api/openapi.yaml",
            label: "Spécification OpenAPI de Mailtrap Local",
          },
          {
            href: "https://docs.mailtrap.io/getting-started/email-sandbox",
            label: "Présentation d’Email Sandbox hébergé",
          },
          {
            href: "https://docs.mailtrap.io/email-sandbox/setup/sandbox-api-integration",
            label: "Fonctions de l’API de l’environnement hébergé",
          },
          {
            href: "https://docs.mailtrap.io/email-sandbox/testing/bounce-rate",
            label: "Émulateur de rejets SMTP de Mailtrap",
          },
          {
            href: "https://docs.mailtrap.io/email-sandbox/help/features-and-limits",
            label: "Fonctions et limites d’Email Sandbox selon le forfait",
          },
          {
            href: "https://mailtrap.io/pricing/",
            label: "Tarifs et grille actuels des forfaits Mailtrap",
          },
        ],
      },
    ],
    slug: "mailtrap",
    title: "InboxTap ou Mailtrap : SDK local, environnement visuel ou service hébergé ?",
  },
} as const satisfies Pick<ResourceContentDictionary, FrenchComparisonKey>;
