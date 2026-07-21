import type { Dictionary } from "../types";

export const fr: Dictionary = {
  chrome: {
    footerGitHubAria: "InboxTap sur GitHub",
    footerTagline: "Licence MIT · Local par conception",
    languageSwitcherAria: "Langue",
    navAria: "Navigation principale",
    navDocs: "Docs",
    navFeatures: "Fonctionnalités",
    supportLabel: "Offrez-moi un café",
    themeSwitchToDark: "Passer au thème sombre",
    themeSwitchToLight: "Passer au thème clair",
    themeToggleAria: "Changer de thème",
    wordmarkAria: "Accueil InboxTap",
  },
  docsChrome: {
    browse: "Parcourir la documentation",
    changelogFull: "Changelog complet",
    changelogRelease: "Release GitHub",
    closeAria: "Fermer la navigation",
    closeOverlayAria: "Fermer la navigation de la documentation",
    copied: "Copié",
    copy: "Copier",
    copyAria: "Copier le code",
    heading: "Documentation",
    navAria: "Navigation de la documentation",
    next: "Suivant",
    pagerAria: "Documentation adjacente",
    previous: "Précédent",
    tocHeading: "Sur cette page",
  },
  landing: {
    closingCta: "Explorer le dépôt",
    closingEyebrow: "Gratuit · Open source · Licence MIT",
    closingHeading: "Gardez les emails de test locaux et observables.",
    closingLede: "Utilisez-le, inspectez le code source ou participez à la prochaine version.",
    codeEyebrow: "De l’action navigateur à l’assertion d’inbox",
    codeHeading: "Testez le flux d’emails que vos utilisateurs reçoivent vraiment",
    codeLede:
      "Créez une adresse isolée, soumettez-la dans votre app, puis attendez la valeur attendue. InboxTap fonctionne avec Playwright, Vitest, Jest et les autres runners Bun ou Node.",
    ctaPrimary: "Commencer",
    ctaSecondary: "Voir sur npm",
    eyebrow: "Capture SMTP locale pour tests automatisés",
    featuresHeading: "Conçu pour des suites de tests déterministes",
    features: [
      [
        "Local par défaut",
        "SMTP et HTTP écoutent sur localhost. InboxTap ne relaie jamais de mail.",
      ],
      [
        "Boîtes parallèles sûres",
        "Des adresses uniques générées côté client isolent les workers de test concurrents.",
      ],
      ["API REST", "Listez, récupérez, attendez et videz les messages capturés via HTTP local."],
      [
        "Extraction automatique",
        "Détecte les liens HTTP(S) et les codes uniques de 4 à 8 chiffres dans le mail parsé.",
      ],
      [
        "SDK de test",
        "Attendez messages, liens, codes et correspondances regex depuis vos tests Bun ou Node.",
      ],
      [
        "Ressources bornées",
        "Stockage, taille des messages et attentes longues ont des limites prévisibles.",
      ],
    ],
    headline1: "Capturez chaque email",
    headline2: "Extrayez chaque code",
    installEyebrow: "Node 20+ · Bun ou npm",
    installLink: "Lire le guide d’installation →",
    installReady: "SMTP sur localhost:1025. API sur localhost:8025. Prêt.",
    lede: "Lancez un serveur SMTP local, déclenchez le vrai flux d’emails de votre application et attendez les liens de vérification ou codes OTP directement depuis le test qui en a besoin.",
    steps: [
      {
        code: "SMTP_HOST=localhost\nSMTP_PORT=1025",
        description: "Le même chemin SMTP qu’en production, dirigé vers une adresse locale sûre.",
        number: "01",
        title: "Pointez votre app vers InboxTap",
      },
      {
        code: "verify@app.dev → signup-…@local.test\n✓ capturé en local",
        description: "Chaque destinataire est accepté et chaque message reste sur votre machine.",
        number: "02",
        title: "Déclenchez le vrai flux d’emails",
      },
      {
        code: "await inbox.waitForCode()\n→ 482910",
        description:
          "Attendez le lien, le code, le message ou la correspondance que votre test attend.",
        number: "03",
        title: "Vérifiez depuis le SDK de test",
      },
    ],
    stepsHeading: "Trois étapes. Aucun compte cloud.",
  },
  meta: {
    breadcrumbDocs: "Documentation",
    breadcrumbHome: "Accueil",
    description:
      "Serveur SMTP 100 % local et SDK de test pour vos tests d’emails de bout en bout — attendez liens de vérification, codes OTP et assertions depuis vos tests.",
    docsTitle: "Documentation",
    docsTitleTemplate: "%s · Docs InboxTap",
    ogDescription:
      "Capturez les messages SMTP locaux et attendez liens de vérification, codes et correspondances directement depuis vos tests.",
    ogImage: {
      alt: "InboxTap — capturez chaque email, extrayez chaque code",
      line1: "Capturez chaque email",
      line2: "Extrayez chaque code",
      tagline: "Capture SMTP locale pour des tests d’emails déterministes.",
    },
    title: "InboxTap — tests de flux d’emails déterministes",
    titleTemplate: "%s · InboxTap",
    twitterDescription: "Capture SMTP locale pour des tests de flux d’emails déterministes.",
  },
  notFound: {
    eyebrow: "404 · Message non capturé",
    goHome: "Retour à l’accueil",
    readDocs: "Lire la documentation",
    text: "La route a peut-être été déplacée, ou l’adresse est incomplète.",
    title: "Cette page n’est pas dans la boîte de réception.",
  },
};
