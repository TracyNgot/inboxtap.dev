import {
  betterAuthCallbackSnippet,
  cypressTaskSnippet,
  nodemailerFixtureSnippet,
  playwrightFixtureSnippet,
  supabaseMagicLinkSnippet,
  vitestFixtureSnippet,
} from "../../snippets";
import type { ResourceContentDictionary } from "../../types";

export const integrationsFr = {
  "integrations/playwright": {
    cta: {
      description:
        "Consultez le parcours navigateur complet, avec démarrage des services sur des ports fixes, saisie des OTP, processus parallèles et dépannage.",
      label: "Lire le guide Playwright",
      title: "Construire le parcours Playwright complet",
    },
    description:
      "Démarrez InboxTap dans une ressource de processus Playwright, attribuez une boîte unique à chaque test et testez en parallèle les liens de vérification, les OTP et les réinitialisations de mot de passe.",
    eyebrow: "Intégration Playwright",
    intro:
      "InboxTap relie les actions du navigateur Playwright à l’email produit par la véritable application. Son adaptateur gère un serveur SMTP/API local par processus d’exécution et injecte un nouveau destinataire dans chaque test : les parcours email parallèles restent ainsi déterministes sans boîte hébergée partagée.",
    kind: "integrations",
    relatedDocKey: "guides/playwright",
    section: "integrations",
    sections: [
      {
        id: "adapter-la-ressource-au-cycle-de-vie",
        title: "Adapter la ressource au cycle de vie de Playwright",
        paragraphs: [
          "Importez l’adaptateur depuis inboxtap/fixtures/playwright et étendez votre test Playwright existant. La valeur inboxTap injectée a la portée du processus d’exécution, tandis qu’inbox a la portée du test. Playwright démarre donc le service local une fois par processus tout en donnant à chaque test un destinataire d’enveloppe SMTP distinct.",
          "Ce fonctionnement suit le modèle de dépendances natif de Playwright : une ressource n’est préparée que lorsqu’un test ou une autre ressource en a besoin, et une dépendance démarre avant son consommateur puis s’arrête après lui. InboxTap s’appuie sur cet ordre pour fermer son transport Nodemailer vérifié et ses écouteurs, même en cas d’échec du test.",
        ],
        links: [
          {
            href: "https://playwright.dev/docs/test-fixtures",
            label: "Documentation de Playwright sur les ressources de test",
          },
        ],
      },
      {
        code: {
          filename: "tests/fixtures.ts",
          language: "typescript",
          source: playwrightFixtureSnippet,
        },
        id: "demarrer-lapplication-apres-inboxtap",
        title: "Démarrer l’application après InboxTap",
        paragraphs: [
          "Lorsque l’application a besoin d’un port SMTP sélectionné automatiquement, démarrez-la dans une ressource de processus qui dépend d’inboxTap. Lisez inboxTap.smtp au moment de créer le processus ou le transport d’email : cette valeur contient l’hôte et le port attribués, ainsi que secure: false et ignoreTLS: true.",
          "La configuration webServer de Playwright démarre avant l’existence des ressources de test. Une application lancée de cette façon ne peut pas utiliser un port choisi plus tard par la ressource InboxTap. Employez des ressources dépendantes pour les ports dynamiques, ou choisissez délibérément des ports fixes et démarrez les deux services avec webServer.",
        ],
      },
      {
        id: "piloter-le-vrai-parcours-email",
        title: "Piloter le vrai parcours email",
        paragraphs: [
          "Renseignez inbox.address dans le formulaire de l’application, envoyez-le depuis le navigateur, puis attendez dans le test côté Node le lien, le code ou le message complet attendu. Le navigateur n’a besoin ni d’identifiants de boîte ni d’importer le SDK InboxTap.",
          "Utilisez waitForLink() pour les URL de vérification, de lien magique et de réinitialisation ; waitForCode() pour les codes numériques ; et waitForMessage() lorsque l’assertion porte sur les en-têtes, le HTML ou les destinataires de l’enveloppe. Validez l’origine et le chemin attendus d’une URL capturée avant de demander à la page de l’ouvrir.",
        ],
        bullets: [
          "Créez le destinataire dans chaque test ou utilisez la valeur inbox injectée.",
          "Fixez le délai d’InboxTap en dessous de celui du test Playwright afin d’obtenir d’abord l’erreur email la plus utile.",
          "Filtrez les messages par un sujet stable ou un chemin de lien lorsque le modèle contient plusieurs URL.",
        ],
      },
      {
        id: "isoler-les-processus-paralleles",
        title: "Isoler les processus parallèles",
        paragraphs: [
          "L’isolation repose sur le destinataire de l’enveloppe SMTP, et non sur le vidage d’une boîte globale. Chaque valeur inbox injectée possède une adresse générée, et tous ses appels au SDK filtrent sur cette adresse. Des tests simultanés peuvent donc partager le service d’un processus sans récupérer les messages des autres.",
          "Ne créez pas une seule TestInbox au niveau du module pour toute la suite. Évitez aussi le vidage global pendant l’exécution d’autres tests : supprimer l’état partagé du serveur peut retirer un message qu’un autre destinataire attend encore.",
        ],
      },
      {
        id: "verifier-la-livraison-sans-divulguer-les-secrets",
        title: "Vérifier la livraison sans divulguer les secrets",
        paragraphs: [
          "L’adaptateur d’assertions Playwright renvoie un objet expect étendu. Utilisez-le avec toHaveDeliveredOnce(), toHaveRecipient() et toContainLink() lorsqu’une assertion concise est plus claire qu’une inspection manuelle des champs.",
          "toHaveDeliveredOnce() observe l’instantané actuel de la boîte ; il n’attend pas le premier message. Attendez la livraison de l’application ou appelez d’abord waitForMessage() lorsque l’email part en arrière-plan. Les échecs d’assertion omettent volontairement le corps du message, les valeurs des destinataires et les liens porteurs de jetons.",
        ],
      },
      {
        id: "laisser-le-comportement-metier-au-test-applicatif",
        title: "Laisser le comportement métier au test applicatif",
        paragraphs: [
          "InboxTap prouve ce qui a atteint la frontière SMTP locale et aide à extraire la valeur nécessaire au navigateur. Le test Playwright reste responsable des assertions du produit : usage unique d’un jeton, rejet d’un lien expiré, absence de doublons métier après une nouvelle tentative et droits attendus de la session finale.",
        ],
      },
    ],
    slug: "playwright",
    title: "Tester les emails avec Playwright et InboxTap",
  },
  "integrations/cypress": {
    cta: {
      description:
        "Suivez la configuration Cypress complète avec les tâches de lien et d’OTP, la coordination des délais, l’isolation parallèle et les solutions HTTP directes.",
      label: "Lire le guide Cypress",
      title: "Relier les tâches à un parcours navigateur",
    },
    description:
      "Utilisez le SDK Node d’InboxTap via cy.task(), conservez des données sérialisables en JSON et testez les liens et OTP avec une nouvelle adresse par test.",
    eyebrow: "Intégration Cypress",
    intro:
      "Les fichiers de test Cypress s’exécutent dans un contexte navigateur, tandis que le SDK InboxTap effectue des requêtes HTTP locales depuis Node. Quelques gestionnaires cy.task() établissent une frontière explicite entre ces environnements sans intégrer de code réservé au serveur dans l’application testée.",
    kind: "integrations",
    relatedDocKey: "guides/cypress",
    section: "integrations",
    sections: [
      {
        id: "respecter-la-frontiere-entre-navigateur-et-node",
        title: "Respecter la frontière entre navigateur et Node",
        paragraphs: [
          "Créez InboxTapClient dans cypress.config.ts, au sein du processus Node de Cypress. Enregistrez les tâches dans setupNodeEvents, puis appelez-les depuis le fichier de test pour créer un destinataire et attendre une valeur capturée.",
          "N’importez pas directement inboxtap/client dans un fichier exécuté par le navigateur. En gardant l’accès réseau dans le processus des tâches, l’API locale n’a besoin ni de prendre en charge CORS ni d’être exposée à la page testée.",
        ],
      },
      {
        code: {
          filename: "cypress.config.ts",
          language: "typescript",
          source: cypressTaskSnippet,
        },
        id: "enregistrer-des-taches-simples-et-serialisables",
        title: "Enregistrer des tâches simples et sérialisables",
        paragraphs: [
          "Renvoyez des chaînes simples, comme l’adresse générée, l’URL capturée ou l’OTP. Cypress sérialise chaque argument et chaque résultat de tâche : transmettez donc les filtres de sujet et les motifs d’expression régulière sous forme de chaînes, et non comme des objets RegExp, des fonctions ou des instances de classe.",
          "Un gestionnaire de tâche doit renvoyer une valeur ou une promesse qui se résout en valeur. Cypress interprète undefined comme une tâche non gérée ; renvoyez explicitement null pour une commande sans résultat.",
        ],
        links: [
          {
            href: "https://docs.cypress.io/api/commands/task",
            label: "Documentation Cypress sur cy.task()",
          },
        ],
      },
      {
        id: "creer-une-adresse-par-test",
        title: "Créer une adresse par test",
        paragraphs: [
          "Appelez la tâche createInbox dans chaque test, puis saisissez exactement cette adresse dans l’application. Les tâches d’attente suivantes reconstruisent une TestInbox à partir de l’adresse et appliquent le filtrage par destinataire sur le serveur.",
          "Une nouvelle adresse est plus fiable que le vidage d’une boîte partagée dans beforeEach. Elle conserve les éléments utiles au diagnostic et empêche les fichiers de test parallèles de supprimer ou de lire les messages des autres.",
        ],
      },
      {
        id: "coordonner-les-deux-delais",
        title: "Coordonner les deux délais",
        paragraphs: [
          "La méthode d’attente d’InboxTap possède son propre timeoutMs, tandis que cy.task() applique un délai de commande Cypress. Accordez au délai externe de Cypress un peu plus de temps qu’à l’attente InboxTap. En cas d’échec de livraison, la tâche renvoie alors le contexte propre à l’email au lieu d’être remplacée par une expiration générique de Cypress.",
          "Gardez les deux attentes bornées. Un test lent doit échouer avec assez de contexte pour déterminer si l’application n’a rien envoyé, a utilisé le mauvais port SMTP ou a choisi un autre destinataire.",
        ],
      },
      {
        id: "choisir-le-sdk-ou-lacces-http-direct",
        title: "Choisir le SDK ou l’accès HTTP direct",
        paragraphs: [
          "cy.request() peut atteindre l’API HTTP d’InboxTap sur l’interface de bouclage via le mandataire côté Node de Cypress ; cette approche suffit pour une petite assertion sur un point de terminaison. Les tâches du SDK restent généralement préférables, car TestInbox parcourt les messages existants et nouveaux, filtre par destinataire et extrait les liens ou les codes.",
          "Quelle que soit l’approche, conservez InboxTap sur l’interface de bouclage et démarrez-le avec l’application avant Cypress. Cette intégration concerne des processus locaux ou CI sur la même machine d’exécution ; elle ne sert pas à exposer un service de boîte sans authentification.",
        ],
      },
    ],
    slug: "cypress",
    title: "Tester les emails avec Cypress et InboxTap",
  },
  "integrations/vitest": {
    cta: {
      description:
        "Découvrez dans un même guide tous les adaptateurs de lanceurs, le comportement des assertions, le contrôleur de pannes, les rapports et les garanties de nettoyage.",
      label: "Lire le guide des lanceurs de tests",
      title: "Utiliser le reste des outils Vitest",
    },
    description:
      "Utilisez un serveur InboxTap propre au fichier, une boîte propre au test, des assertions natives et un nettoyage automatique dans les tests d’email Vitest simultanés.",
    eyebrow: "Intégration Vitest",
    intro:
      "L’adaptateur Vitest d’InboxTap attribue le cycle de vie coûteux du service au fichier et l’isolation du destinataire au test. Les tests reçoivent un transport Nodemailer vérifié, des paramètres de connexion dynamiques et une nouvelle adresse de boîte sans maintenir eux-mêmes de fonctions beforeAll et afterAll.",
    kind: "integrations",
    relatedDocKey: "guides/test-runners",
    section: "integrations",
    sections: [
      {
        id: "utiliser-ladaptateur-officiel",
        title: "Utiliser l’adaptateur officiel de Vitest",
        paragraphs: [
          "Installez InboxTap, Nodemailer 9 et Vitest, puis étendez le test de base depuis inboxtap/fixtures/vitest. L’adaptateur démarre les écouteurs SMTP et HTTP sur des ports attribués par le système d’exploitation, vérifie son transport avant de rendre la main et ferme l’état de démarrage, partiel ou complet, à la fin du fichier.",
          "Le paquet garde Vitest derrière un sous-chemin optionnel. Importer la racine d’InboxTap ou le SDK client ne charge ni Vitest ni Nodemailer dans les projets qui n’emploient pas cette configuration.",
        ],
        links: [
          {
            href: "https://vitest.dev/guide/test-context.html",
            label: "Documentation Vitest sur les ressources et le contexte de test",
          },
        ],
      },
      {
        code: {
          filename: "email.test.ts",
          language: "typescript",
          source: vitestFixtureSnippet,
        },
        id: "associer-les-ressources-et-les-assertions-natives",
        title: "Associer les ressources et les assertions natives",
        paragraphs: [
          "La valeur inboxTap injectée n’est partagée que par les tests d’un même fichier. Son transport convient aux tests directs d’un modèle d’email, tandis qu’inboxTap.smtp peut configurer une instance de l’application qui doit exercer toute la frontière d’intégration.",
          "Enregistrez l’adaptateur d’assertions auprès de l’objet expect de Vitest. Attendez toHaveDeliveredOnce(), car cette assertion peut observer une courte fenêtre bornée ; les assertions de destinataire et de lien sur un message restent synchrones.",
        ],
      },
      {
        id: "attendre-avant-de-prendre-un-instantane",
        title: "Attendre avant de prendre un instantané de livraison",
        paragraphs: [
          "toHaveDeliveredOnce() inspecte les messages déjà présents. L’envoi par le transport fourni ne se termine qu’après l’acceptation et le stockage de la transaction par InboxTap : l’instantané immédiat de l’exemple est donc valide. Lorsque l’application place l’email dans une file d’attente et rend la main plus tôt, attendez d’abord inbox.waitForMessage(), puis vérifiez le nombre de livraisons.",
          "quietMs peut détecter une livraison supplémentaire pendant cette fenêtre d’observation explicite, mais ne prouve pas qu’aucune nouvelle tentative n’aura lieu plus tard. L’idempotence à long terme reste une assertion applicative.",
        ],
      },
      {
        id: "executer-des-tests-simultanes-en-securite",
        title: "Exécuter des tests simultanés en sécurité",
        paragraphs: [
          "Chaque test reçoit une adresse générée, même lorsque des cas test.concurrent partagent le même serveur propre au fichier. Le filtrage par destinataire sépare les lectures de boîte : nul besoin de sérialiser les tests ni de vider l’état global entre eux.",
          "Ciblez les règles de panne SMTP sur inbox.address lorsque des tests simultanés partagent une configuration. Une règle non ciblée portant sur la prochaine transaction peut légitimement être consommée par la première livraison qui atteint DATA.",
        ],
      },
      {
        id: "exercer-les-chemins-dechec",
        title: "Exercer les chemins d’échec à la frontière SMTP",
        paragraphs: [
          "Utilisez inboxTap.server.faults pour renvoyer une erreur transitoire 451, une erreur permanente 550, un délai borné, une barrière de pause ou une déconnexion par bloc. Les transactions échouées ou déconnectées ne créent aucun message partiellement capturé.",
          "InboxTap contrôle le comportement de livraison, pas la couche de persistance. Les tests doivent encore vérifier la limite de tentatives, le délai progressif, la déduplication, l’état présenté à l’utilisateur et les enregistrements métier de l’application.",
        ],
      },
      {
        id: "definir-soigneusement-la-portee-des-collecteurs",
        title: "Définir soigneusement la portée des collecteurs de rapport",
        paragraphs: [
          "L’adaptateur d’assertions Vitest étend un objet expect sur place. Ne rattachez pas différents collecteurs propres aux tests à un même expect partagé pendant une exécution simultanée. Utilisez l’expect lié au test fourni par Vitest, enregistrez explicitement les messages ou créez délibérément un seul rapport pour la suite.",
        ],
      },
    ],
    slug: "vitest",
    title: "Tester les emails avec Vitest et InboxTap",
  },
  "integrations/better-auth": {
    cta: {
      description:
        "Suivez la configuration complète de Next.js et Playwright pour la vérification, la connexion par lien magique, l’envoi d’OTP et le renvoi.",
      label: "Lire le guide Better Auth",
      title: "Exécuter les parcours d’authentification de bout en bout",
    },
    description:
      "Acheminez vers InboxTap les fonctions de rappel Better Auth de vérification, de lien magique, d’OTP et de réinitialisation, puis testez le vrai parcours d’authentification avec des boîtes isolées.",
    eyebrow: "Intégration Better Auth",
    intro:
      "Better Auth fournit à l’application des fonctions de rappel pour produire les emails d’authentification ; il ne choisit pas le transport SMTP à votre place. Pointez l’expéditeur utilisé par ces fonctions vers InboxTap, puis pilotez les véritables points de terminaison d’inscription, de connexion, de vérification et de réinitialisation depuis un navigateur ou un test d’intégration.",
    kind: "integrations",
    relatedDocKey: "guides/better-auth",
    section: "integrations",
    sections: [
      {
        id: "associer-chaque-fonction-de-rappel",
        title: "Associer chaque fonction de rappel d’email",
        paragraphs: [
          "La vérification utilise emailVerification.sendVerificationEmail, la réinitialisation du mot de passe emailAndPassword.sendResetPassword, et les extensions de lien magique et d’OTP par email exposent sendMagicLink et sendVerificationOTP. Faites passer chaque fonction par le même expéditeur local afin que le test observe le modèle réellement construit par l’application.",
          "Conservez sans modification l’URL ou l’OTP généré. Reconstruire une URL d’authentification dans le test peut masquer des erreurs de configuration dans les URL de rappel, les listes de redirections autorisées, l’encodage du jeton et les modèles.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/concepts/email",
            label: "Documentation Better Auth sur les emails",
          },
          {
            href: "https://better-auth.com/docs/plugins/magic-link",
            label: "Documentation Better Auth sur les liens magiques",
          },
          {
            href: "https://better-auth.com/docs/plugins/email-otp",
            label: "Documentation Better Auth sur les OTP par email",
          },
        ],
      },
      {
        code: {
          filename: "lib/auth.ts",
          language: "typescript",
          source: betterAuthCallbackSnippet,
        },
        id: "envoyer-par-le-transport-local",
        title: "Envoyer par le transport local",
        paragraphs: [
          "Implémentez sendLocalEmail avec un transport Nodemailer configuré pour InboxTap : localhost, le port SMTP choisi, secure: false, ignoreTLS: true et aucun champ auth. Dans un test fondé sur une configuration injectée, transmettez inboxTap.smtp au lieu de recopier un port dynamique.",
          "L’extrait renvoie la promesse de livraison afin de rendre les échecs déterministes dans un exemple local. Better Auth recommande un envoi en arrière-plan en production pour réduire les canaux auxiliaires temporels. Si vous suivez ce modèle, utilisez le mécanisme de tâche en arrière-plan pris en charge par la plateforme et laissez l’attente bornée d’InboxTap observer la fin de l’envoi.",
        ],
      },
      {
        id: "traiter-les-liens-comme-des-secrets",
        title: "Traiter les liens comme des secrets",
        paragraphs: [
          "Créez un nouveau destinataire InboxTap pour le test, déclenchez l’opération Better Auth et attendez un lien grâce à un filtre stable de sujet ou de chemin. Avant de naviguer, analysez l’URL et vérifiez l’origine et le chemin de rappel attendus sans afficher son jeton.",
          "Un lien magique peut créer un utilisateur par défaut. Activez disableSignUp lorsque le produit doit autoriser la connexion uniquement aux utilisateurs existants, puis couvrez explicitement les cas acceptés et refusés.",
        ],
      },
      {
        id: "respecter-la-configuration-des-otp",
        title: "Respecter la configuration des OTP",
        paragraphs: [
          "L’extension d’OTP par email de Better Auth génère six chiffres par défaut, ce qui correspond au motif standard de waitForCode() dans InboxTap. Si otpLength ou generateOTP modifie le format, fournissez un motif propre au projet au lieu de supposer que tous les fournisseurs émettent six chiffres.",
          "Pour tester un renvoi, attendez le second message complet en définissant afterId sur l’identifiant du premier, puis extrayez le nouveau code du message renvoyé. Cette méthode distingue les livraisons et permet au test applicatif de prouver si l’ancien code a été invalidé.",
        ],
      },
      {
        id: "couvrir-le-contrat-du-produit",
        title: "Couvrir le contrat du produit",
        paragraphs: [
          "La capture de l’email n’est que le milieu du parcours. Poursuivez et vérifiez l’état validé, la création de session, la destination de redirection, le traitement des jetons invalides ou expirés, la limite de tentatives et le remplacement du mot de passe selon la configuration de l’application.",
          "Évitez de placer des secrets dans les noms de test, les journaux, les instantanés ou les captures d’écran. Les assertions d’InboxTap suppriment les valeurs porteuses de jetons, et le masquage de ses rapports reste une protection au mieux, pas une autorisation de publier des éléments d’authentification non relus.",
        ],
      },
    ],
    slug: "better-auth",
    title: "Tester les emails de Better Auth avec InboxTap",
  },
  "integrations/supabase": {
    cta: {
      description:
        "Utilisez la référence du client pour choisir la méthode adaptée aux liens, aux codes, aux messages ou aux motifs personnalisés une fois la connexion SMTP établie.",
      label: "Explorer le SDK client",
      title: "Automatiser le message capturé",
    },
    description:
      "Découvrez comment InboxTap complète le Mailpit intégré de Supabase Auth, quand une connexion SMTP locale est possible et ce qu’un projet hébergé ne peut pas faire avec l’interface de bouclage.",
    eyebrow: "Intégration Supabase",
    intro:
      "Supabase fournit déjà un outil visuel de capture pour sa pile Auth locale. InboxTap devient utile lorsqu’un test a besoin d’un SDK typé et propre au destinataire, d’une extraction déterministe, d’une injection de pannes ou d’un livrable masqué, mais uniquement si le processus Auth peut réellement atteindre l’écouteur SMTP local.",
    kind: "integrations",
    relatedDocKey: "reference/client-sdk",
    section: "integrations",
    sections: [
      {
        id: "choisir-mailpit-ou-inboxtap",
        title: "Choisir Mailpit ou InboxTap selon le besoin",
        paragraphs: [
          "La CLI Supabase inclut Mailpit et expose par défaut son interface web sur localhost:54324. Conservez ce choix lorsqu’un développeur souhaite surtout examiner visuellement les modèles Auth locaux.",
          "Choisissez InboxTap lorsque les tests automatisés tirent parti d’une adresse unique par cas, de waitForLink() ou waitForCode(), d’assertions sans contenu sensible, de règles de panne déterministes ou de preuves HTML et JSON bornées. Il s’agit d’un choix de méthode de test, pas d’une affirmation selon laquelle Supabase ne capturerait pas les emails locaux.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/local-development/cli/testing-and-linting",
            label: "Tests des emails Auth locaux avec Supabase",
          },
        ],
      },
      {
        id: "resoudre-dabord-la-topologie-reseau",
        title: "Résoudre d’abord la topologie réseau",
        paragraphs: [
          "InboxTap se lie par défaut aux adresses de bouclage de la machine hôte. Un processus Supabase Auth exécuté dans un conteneur possède sa propre interface de bouclage : localhost dans ce conteneur ne désigne donc pas le processus InboxTap de l’hôte.",
          "Ne configurez un SMTP personnalisé que dans une topologie où Auth peut atteindre l’écouteur sans exposer largement un service de capture sans authentification. Ne recopiez pas une liaison à 0.0.0.0 sur un poste partagé ou un réseau CI. De même, un projet Supabase hébergé ne peut pas joindre l’adresse de bouclage d’un ordinateur de développement.",
        ],
      },
      {
        code: {
          filename: "auth-email.test.ts",
          language: "typescript",
          source: supabaseMagicLinkSnippet,
        },
        id: "tester-le-message-apres-la-connexion-smtp",
        title: "Tester le message après la connexion SMTP",
        paragraphs: [
          "Une fois que la topologie Auth locale ou auto-hébergée choisie peut atteindre InboxTap, créez un destinataire et déclenchez signInWithOtp() par le véritable client Supabase. Malgré son nom, cette méthode envoie un lien magique par défaut ; le modèle d’email décide si l’utilisateur reçoit une URL de confirmation ou un code.",
          "Supabase crée par défaut un utilisateur lorsque l’adresse est inconnue. Définissez shouldCreateUser sur false lorsque le produit réserve la connexion sans mot de passe aux comptes existants, et créez ce compte avant de demander son message.",
          "Le lien de confirmation standard contient normalement le chemin de vérification Auth présenté dans l’extrait. Si le projet utilise un modèle PKCE personnalisé ou un autre point de rappel, filtrez et validez l’URL exigée par ce modèle plutôt que de coder la valeur par défaut en dur.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/auth/auth-email-passwordless",
            label: "Documentation Supabase sur l’authentification par email sans mot de passe",
          },
        ],
      },
      {
        id: "respecter-les-modeles-et-les-parametres-des-otp",
        title: "Respecter les modèles et les paramètres des OTP",
        paragraphs: [
          "La variable Token dans un modèle d’email Supabase produit un parcours OTP, tandis que l’URL de confirmation produit un parcours par lien. Testez le contrat rendu au lieu de le déduire du nom de la méthode cliente.",
          "Supabase autorise les OTP par email de six à dix chiffres. waitForCode() dans InboxTap recherche exactement six chiffres par défaut : fournissez donc un motif pour une autre longueur. Le tableau pratique CapturedEmail.codes se limite aux séquences de quatre à huit chiffres ; un motif personnalisé de waitForCode() parcourt le corps et convient aux codes de neuf ou dix chiffres.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/auth/auth-email-templates",
            label: "Documentation Supabase sur les modèles d’email Auth",
          },
          {
            href: "https://supabase.com/docs/guides/local-development/cli/config",
            label: "Configuration Auth de la CLI Supabase",
          },
        ],
      },
      {
        id: "separer-les-tests-locaux-et-heberges",
        title: "Séparer les tests locaux et hébergés",
        paragraphs: [
          "Le service d’envoi standard de Supabase hébergé restreint les destinataires et limite le débit, tandis qu’un SMTP personnalisé hébergé attend un serveur joignable sur le réseau avec des identifiants. InboxTap ne fournit volontairement ni accès public ni authentification SMTP : ce n’est donc pas un fournisseur SMTP pour un projet hébergé.",
          "Utilisez InboxTap dans un environnement local ou CI isolé dont vous maîtrisez la frontière réseau. Choisissez un fournisseur de test ou de livraison authentifié adapté lorsqu’un projet Supabase hébergé doit envoyer sur le réseau public.",
        ],
        links: [
          {
            href: "https://supabase.com/docs/guides/auth/auth-smtp",
            label: "Documentation Supabase sur le SMTP personnalisé",
          },
        ],
      },
    ],
    slug: "supabase",
    title: "Tester les emails Supabase Auth avec InboxTap",
  },
  "integrations/nodemailer": {
    cta: {
      description:
        "Poursuivez avec un parcours Express et Vitest exécutable qui teste les liens, les jetons personnalisés, les OTP, les destinataires et les en-têtes.",
      label: "Lire le guide Nodemailer",
      title: "Relier un véritable expéditeur applicatif",
    },
    description:
      "Pointez Nodemailer vers un transport InboxTap local vérifié, envoyez de vrais messages SMTP et vérifiez les destinataires, les liens, les codes et les en-têtes.",
    eyebrow: "Intégration Nodemailer",
    intro:
      "InboxTap accepte le même message SMTP qu’une application Nodemailer enverrait à un fournisseur de livraison, mais le capture dans une mémoire locale bornée au lieu de le relayer. La configuration officielle fournit un transport prêt à l’emploi et des paramètres SMTP dynamiques afin que les tests exercent la véritable construction du message sans ports fixes.",
    kind: "integrations",
    relatedDocKey: "guides/nodemailer",
    section: "integrations",
    sections: [
      {
        id: "configurer-correctement-le-smtp-local-simple",
        title: "Configurer correctement le SMTP local simple",
        paragraphs: [
          "Un transport Nodemailer manuel pour InboxTap utilise l’hôte et le port locaux, secure: false, ignoreTLS: true et aucun objet auth. secure: false signifie que TLS n’est pas actif à l’ouverture de la connexion ; cette option seule n’empêche pas Nodemailer de tenter ensuite un passage à STARTTLS.",
          "InboxTap désactive l’authentification et STARTTLS, car il s’agit d’un serveur de capture limité à l’interface de bouclage. Séparez ces paramètres de développement du transport authentifié et chiffré utilisé pour les livraisons en production.",
        ],
        links: [
          {
            href: "https://nodemailer.com/smtp",
            label: "Documentation du transport SMTP Nodemailer",
          },
        ],
      },
      {
        code: {
          filename: "email.test.ts",
          language: "typescript",
          source: nodemailerFixtureSnippet,
        },
        id: "preferer-la-configuration-verifiee",
        title: "Préférer la configuration vérifiée",
        paragraphs: [
          "startInboxTapFixture() choisit des ports SMTP et API libres, démarre le serveur, crée un transport Nodemailer, appelle verify() et contrôle le point d’état d’InboxTap avant de rendre la main. Sa méthode close() peut être appelée plusieurs fois sans risque et nettoie le transport comme les écouteurs.",
          "Le transport fourni convient aux tests d’intégration centrés sur les modèles. Pour tester le service d’email détenu par l’application, configurez-le avec inboxTap.smtp et déclenchez l’envoi depuis l’API applicative.",
        ],
      },
      {
        id: "comprendre-ce-que-prouve-verify",
        title: "Comprendre ce que prouve la vérification du transport",
        paragraphs: [
          "La méthode verify() de Nodemailer contrôle la résolution DNS, la connexion TCP, l’éventuelle montée en TLS et l’authentification sans envoyer de message. Elle ne prouve pas qu’un serveur acceptera un expéditeur d’enveloppe ou un message particulier.",
          "Conservez au moins une véritable transaction sendMail() dans le test. InboxTap ne stocke le message qu’après la réussite complète de SMTP DATA : le CapturedEmail obtenu représente donc une livraison acceptée, et pas seulement un transport disponible.",
        ],
        links: [
          {
            href: "https://nodemailer.com/smtp#verifying-the-configuration",
            label: "Vérification du transport Nodemailer",
          },
        ],
      },
      {
        id: "verifier-lenveloppe-et-le-contenu",
        title: "Vérifier l’enveloppe et le contenu",
        paragraphs: [
          "Utilisez toHaveRecipient() lorsque l’acheminement compte, car cette assertion compare l’enveloppe SMTP plutôt qu’une adresse d’affichage extraite de l’en-tête. Utilisez toContainLink() pour les URL HTTP ou HTTPS extraites et waitForCode() pour une valeur numérique.",
          "Choisissez waitForMessage() lorsque le test a besoin du sujet, des en-têtes normalisés, du texte, du HTML, de la source brute ou de tous les liens extraits. Évitez d’afficher le corps ou les URL porteuses de jetons dans les diagnostics courants.",
        ],
      },
      {
        id: "fermer-chaque-proprietaire-de-ressource",
        title: "Fermer chaque propriétaire de ressource",
        paragraphs: [
          "Placez fixture.close() dans un bloc finally lorsque vous gérez explicitement le cycle de vie. Si l’application crée son propre transport Nodemailer, sa configuration de test doit fermer ce transport avant l’arrêt d’InboxTap.",
          "Les adaptateurs natifs de Bun, Vitest et Playwright automatisent cet ordre. Une attribution explicite de chaque ressource empêche des connexions ouvertes de maintenir le processus de test en vie après un échec.",
        ],
      },
    ],
    slug: "nodemailer",
    title: "Tester les emails Nodemailer avec InboxTap",
  },
} satisfies Partial<ResourceContentDictionary>;
