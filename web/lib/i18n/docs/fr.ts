import type { DocsDictionary } from "../types";

export const docsFr: DocsDictionary = {
  groups: {
    examples: "Exemples",
    "getting-started": "Premiers pas",
    guides: "Guides",
    reference: "Référence",
  },
  entries: {
    "": {
      description: "Ce qu’InboxTap capture, pourquoi il existe et où il peut tourner en sécurité.",
      slug: "",
      title: "Introduction",
      toc: [
        { id: "pourquoi-inboxtap", label: "Pourquoi InboxTap" },
        { id: "comment-ça-marche", label: "Comment ça marche" },
        { id: "sécurité-et-périmètre", label: "Sécurité et périmètre" },
      ],
    },
    installation: {
      description: "Lancez la CLI InboxTap et ajoutez le SDK de test à un projet Bun ou Node.",
      slug: "installation",
      title: "Installation",
      toc: [
        { id: "prérequis", label: "Prérequis" },
        { id: "lancer-le-serveur", label: "Lancer le serveur" },
        { id: "installer-le-sdk", label: "Installer le SDK" },
        { id: "configurer-votre-application", label: "Configurer votre app" },
      ],
    },
    "quick-start": {
      description:
        "Capturez un email d’inscription et suivez son lien de vérification depuis un test.",
      slug: "demarrage-rapide",
      title: "Démarrage rapide",
      toc: [
        { id: "démarrer-inboxtap", label: "Démarrer InboxTap" },
        { id: "créer-une-boîte-isolée", label: "Créer une boîte" },
        { id: "déclencher-un-email", label: "Déclencher un email" },
        { id: "attendre-le-résultat", label: "Attendre le résultat" },
      ],
    },
    configuration: {
      description:
        "Configurez hôtes locaux, ports, domaines destinataires et limites de ressources.",
      slug: "configuration",
      title: "Configuration",
      toc: [
        { id: "valeurs-par-défaut", label: "Valeurs par défaut" },
        { id: "options-cli", label: "Options CLI" },
        { id: "plusieurs-instances", label: "Instances multiples" },
        { id: "serveur-programmatique", label: "Serveur programmatique" },
      ],
    },
    alternatives: {
      description:
        "Comparez InboxTap à MailHog, Mailpit, smtp4dev, Mailtrap et Ethereal pour tester les emails.",
      slug: "alternatives",
      title: "InboxTap face à MailHog, Mailpit et Mailtrap",
      toc: [
        { id: "panorama", label: "Panorama" },
        {
          id: "inboxtap-comme-alternative-à-mailhog-sans-docker",
          label: "Alternative à MailHog sans Docker",
        },
        { id: "mailpit-et-mailhog", label: "Mailpit et MailHog" },
        { id: "smtp4dev", label: "smtp4dev" },
        { id: "services-hébergés", label: "Services hébergés" },
        { id: "quand-ne-pas-utiliser-inboxtap", label: "Quand ne pas utiliser InboxTap" },
      ],
    },
    trust: {
      description:
        "Vérifiez le code, le paquet npm, la maintenance, la sécurité et le processus de correction d’InboxTap.",
      slug: "confiance",
      title: "Confiance et maintenance",
      toc: [
        { id: "vérifier-le-projet", label: "Vérifier le projet" },
        { id: "maintenance-et-sécurité", label: "Maintenance et sécurité" },
        { id: "documentation-et-corrections", label: "Docs et corrections" },
        { id: "limites-de-recommandation", label: "Limites de recommandation" },
      ],
    },
    "reference/http-api": {
      description: "Référence complète de l’API HTTP locale, filtres et formats de réponse inclus.",
      slug: "reference/api-http",
      title: "API HTTP",
      toc: [
        { id: "conventions-de-requête", label: "Conventions de requête" },
        { id: "health", label: "Health" },
        { id: "lister-les-emails", label: "Lister les emails" },
        { id: "dernier-email", label: "Dernier email" },
        { id: "attendre-un-email", label: "Attendre un email" },
        { id: "récupérer-par-id", label: "Récupérer par ID" },
        { id: "vider-les-emails", label: "Vider les emails" },
      ],
    },
    "reference/client-sdk": {
      description: "Référence d’InboxTapClient, TestInbox, des filtres et des messages capturés.",
      slug: "reference/sdk-client",
      title: "SDK client",
      toc: [
        { id: "créer-un-client", label: "Créer un client" },
        { id: "créer-une-boîte", label: "Créer une boîte" },
        { id: "méthodes-de-testinbox", label: "Méthodes de TestInbox" },
        { id: "méthodes-bas-niveau", label: "Méthodes bas niveau" },
        { id: "capturedemail", label: "CapturedEmail" },
        { id: "erreurs", label: "Erreurs" },
      ],
    },
    "guides/playwright": {
      description:
        "Capturez et testez les liens de vérification, liens magiques, réinitialisations et OTP avec Playwright.",
      slug: "guides/playwright",
      title: "Tester les liens magiques et OTP email avec Playwright",
      toc: [
        { id: "démarrer-les-services", label: "Démarrer les services" },
        { id: "tester-un-lien-email", label: "Tester un lien" },
        { id: "tester-un-otp-par-email", label: "Tester un OTP" },
        { id: "choisir-le-bon-helper", label: "Choisir un helper" },
        { id: "workers-parallèles", label: "Workers parallèles" },
        { id: "questions-fréquentes", label: "Questions fréquentes" },
      ],
    },
    "guides/cypress": {
      description:
        "Pilotez les flux de vérification par email depuis des specs Cypress avec cy.task et le SDK.",
      slug: "guides/cypress",
      title: "Tester les emails de vérification avec Cypress",
      toc: [
        { id: "démarrer-les-services", label: "Démarrer les services" },
        { id: "enregistrer-les-tasks", label: "Enregistrer les tasks" },
        { id: "écrire-le-test", label: "Écrire le test" },
        { id: "isolation-parallèle", label: "Isolation parallèle" },
        { id: "accès-http-direct", label: "Accès HTTP direct" },
      ],
    },
    "guides/test-runners": {
      description:
        "Lancez InboxTap programmatiquement avec Bun test, Vitest, Jest ou un autre runner.",
      slug: "guides/lanceurs-de-tests",
      title: "Tester les emails avec Bun, Vitest et Jest",
      toc: [
        { id: "configuration-indépendante-du-runner", label: "Config indépendante du runner" },
        { id: "démarrer-et-arrêter-dans-les-tests", label: "Cycle de vie des tests" },
        { id: "choisir-le-bon-helper", label: "Choisir un helper" },
      ],
    },
    "guides/better-auth": {
      description:
        "Vérifiez les emails d’inscription Better Auth dans une app Next.js avec Playwright.",
      slug: "guides/better-auth",
      title: "Tester les emails de vérification Better Auth",
      toc: [
        { id: "brancher-better-auth-sur-inboxtap", label: "Brancher Better Auth" },
        { id: "piloter-les-flux-avec-playwright", label: "Piloter les flux" },
        { id: "lancer-le-projet-exemple", label: "Lancer l’exemple" },
      ],
    },
    "guides/nodemailer": {
      description: "Testez l’envoi Nodemailer depuis une API Express avec Vitest.",
      slug: "guides/nodemailer",
      title: "Tester les emails Nodemailer avec Vitest",
      toc: [
        { id: "pointer-nodemailer-vers-inboxtap", label: "Pointer Nodemailer" },
        { id: "tester-avec-vitest", label: "Tester avec Vitest" },
        { id: "lancer-le-projet-exemple", label: "Lancer l’exemple" },
      ],
    },
    "guides/ci": {
      description:
        "Exécutez InboxTap en CI via une étape d’arrière-plan avec health check ou un serveur programmatique.",
      slug: "guides/ci",
      title: "CI et GitHub Actions",
      toc: [
        { id: "deux-façons-de-le-lancer", label: "Deux façons de le lancer" },
        { id: "attendre-le-health-check", label: "Attendre le health check" },
        { id: "workflow-github-actions", label: "Workflow GitHub Actions" },
        { id: "ports-et-autres-fournisseurs", label: "Ports et autres fournisseurs" },
      ],
    },
    "guides/troubleshooting": {
      description:
        "Diagnostiquez connexions refusées, emails manquants, timeouts et lectures croisées entre tests.",
      slug: "guides/depannage",
      title: "Dépannage",
      toc: [
        { id: "connexion-refusée", label: "Connexion refusée" },
        { id: "port-déjà-utilisé", label: "Port déjà utilisé" },
        { id: "aucun-email-narrive", label: "Aucun email n’arrive" },
        { id: "les-attentes-expirent", label: "Les attentes expirent" },
        { id: "les-tests-lisent-les-messages-des-autres", label: "Lectures croisées" },
        { id: "les-messages-disparaissent", label: "Les messages disparaissent" },
        { id: "message-rejeté-car-trop-volumineux", label: "Message trop volumineux" },
      ],
    },
    changelog: {
      description: "Historique des versions d’InboxTap, avec liens vers les pull requests.",
      slug: "changelog",
      title: "Changelog",
      toc: [],
    },
  },
};
