import { magicLinkSnippet, otpResendSnippet, passwordResetSnippet } from "../../snippets";
import type { ResourceContentDictionary } from "../../types";

export const guidesFr = {
  "guides/test-magic-links": {
    cta: {
      description:
        "Intégrez le lien à un vrai parcours navigateur avec des destinataires isolés, des processus parallèles, des attentes bornées et un nettoyage géré par le lanceur de tests.",
      label: "Lire le guide Playwright",
      title: "Ouvrir le lien dans le navigateur",
    },
    description:
      "Capturez chaque email de lien magique en local, validez sa destination de confiance, ouvrez-le dans le navigateur et testez son usage unique sans exposer les jetons.",
    eyebrow: "Guide de test de l’authentification",
    intro:
      "Un test complet de lien magique prouve davantage que la livraison. Il vérifie que l’application a généré un lien pour le bon destinataire, que l’URL pointe vers une destination autorisée et que l’utilisation du secret crée exactement la session et la redirection promises par le produit.",
    kind: "guides",
    relatedDocKey: "guides/playwright",
    section: "guides",
    sections: [
      {
        id: "definir-le-contrat-avant-le-test",
        title: "Définir le contrat avant le test",
        paragraphs: [
          "Consignez l’expéditeur attendu, la famille de sujets, l’origine et le chemin de rappel, la durée de validité, le comportement d’inscription et la destination après connexion. Un fournisseur peut regrouper plusieurs mécanismes sans mot de passe sous le terme de lien magique, mais l’application reste responsable de l’URL exacte et de la politique de compte.",
          "Décidez si une adresse inconnue peut créer un compte. Par exemple, l’extension de lien magique de Better Auth autorise l’inscription par défaut, sauf si disableSignUp est activé. Le test doit exprimer la décision du produit, et non hériter accidentellement d’une valeur par défaut du fournisseur.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/plugins/magic-link",
            label: "Comportement des liens magiques dans Better Auth",
          },
          {
            href: "https://supabase.com/docs/guides/auth/auth-email-passwordless",
            label: "Authentification Supabase sans mot de passe par email",
          },
        ],
      },
      {
        id: "utiliser-un-nouveau-destinataire-pour-chaque-cas",
        title: "Utiliser un nouveau destinataire pour chaque cas",
        paragraphs: [
          "Créez la boîte InboxTap dans le test et saisissez inbox.address dans le véritable formulaire ou la véritable requête API de connexion. Le destinataire généré permet aux tests simultanés de partager un serveur de capture tout en filtrant chaque lecture sur leur propre enveloppe SMTP.",
          "Évitez une boîte unique pour toute la suite et ne videz pas tous les messages dans beforeEach. Un nettoyage global crée des conflits entre les tests, tandis qu’une adresse unique conserve les éléments nécessaires au diagnostic d’une mauvaise redirection ou d’une livraison en double.",
        ],
      },
      {
        code: {
          filename: "magic-link.spec.ts",
          language: "typescript",
          source: magicLinkSnippet,
        },
        id: "extraire-et-valider-avant-de-naviguer",
        title: "Extraire et valider avant de naviguer",
        paragraphs: [
          "waitForLink() recherche les liens HTTP ou HTTPS dans le texte et le HTML capturés et peut exiger un fragment de chemin stable. Les modèles contiennent souvent des URL d’assistance, de confidentialité, de logo et de désinscription : un filtre contains empêche donc le test de suivre le premier lien sans rapport.",
          "Traitez la valeur renvoyée comme un identifiant secret. Analysez-la avec URL, comparez l’origine attendue complète, puis le chemin de rappel avant de naviguer. N’utilisez pas une vérification approximative du suffixe de l’hôte, n’affichez pas la chaîne de requête et ne placez pas le jeton dans le nom du test.",
        ],
      },
      {
        id: "verifier-la-session-et-pas-seulement-la-page",
        title: "Vérifier la session, et pas seulement la page",
        paragraphs: [
          "Après l’ouverture du lien, vérifiez l’URL finale et un indicateur de l’identité authentifiée provenant du serveur. Un message de réussite visible peut s’afficher alors que le cookie de session, l’identité de l’utilisateur ou les autorisations sont erronés.",
          "Contrôlez aussi la redirection prévue et la validation éventuelle de l’adresse lorsque le fournisseur d’authentification associe la preuve de propriété à la vérification. Ces résultats relèvent de l’assertion applicative ; InboxTap prouve uniquement ce qui a franchi la frontière SMTP.",
        ],
      },
      {
        id: "couvrir-la-reutilisation-lexpiration-et-le-mauvais-destinataire",
        title: "Couvrir la réutilisation, l’expiration et le mauvais destinataire",
        paragraphs: [
          "Utilisez la même URL une seconde fois et vérifiez le comportement à usage unique configuré. Exercez l’expiration avec l’horloge prise en charge par le fournisseur ou une courte durée propre au test, plutôt qu’avec une attente non bornée. Un jeton altéré ou mal formé doit échouer sans créer de session.",
          "Si le produit lie un lien à un email ou à une transaction en attente, prouvez qu’il ne peut pas authentifier un autre compte. Échanger uniquement des adresses InboxTap ne suffit pas : réalisez l’assertion sur la session et l’identité stockée par l’application.",
        ],
        bullets: [
          "Un lien valide établit uniquement le compte et la redirection attendus.",
          "Un jeton réutilisé, expiré ou modifié est rejeté.",
          "Les pages d’échec et les journaux n’affichent pas la valeur secrète.",
        ],
      },
      {
        id: "conserver-des-preuves-sans-jetons",
        title: "Conserver des preuves sans jetons",
        paragraphs: [
          "Les diagnostics des assertions InboxTap n’incluent ni le corps des messages ni les URL porteuses de jetons. Les rapports masqués retirent les surfaces secrètes courantes et remplacent les adresses par des pseudonymes, mais ce masquage reste une protection au mieux. Relisez tout livrable avant de le partager hors de l’environnement de test.",
          "Préférez des assertions sur l’origine et le chemin de l’URL, la présence d’un paramètre et l’état final de l’application. Évitez les instantanés de l’email brut, de la barre d’adresse ou du lien capturé complet lorsqu’une assertion structurelle plus petite prouve le même comportement.",
        ],
      },
    ],
    slug: "tester-les-liens-magiques",
    title: "Comment tester les liens magiques de bout en bout",
  },
  "guides/test-email-otp": {
    cta: {
      description:
        "Utilisez la référence du SDK pour choisir le bon motif d’attente, distinguer les messages successifs, inspecter le contenu capturé et ajouter des diagnostics d’assertion sûrs.",
      label: "Explorer le SDK client",
      title: "Adapter la méthode à votre format d’OTP",
    },
    description:
      "Capturez les OTP par email sous forme de chaînes, soumettez-les dans le vrai parcours applicatif et testez l’expiration, les tentatives et le renvoi de façon déterministe.",
    eyebrow: "Guide de test de l’authentification",
    intro:
      "Un test d’OTP par email doit conserver le code exactement comme il a été livré, le soumettre par le même point de terminaison ou formulaire qu’un utilisateur et vérifier les règles d’expiration, de tentatives et de renvoi du fournisseur. InboxTap apporte le destinataire isolé et l’attente bornée ; le test applicatif prouve le résultat d’authentification.",
    kind: "guides",
    relatedDocKey: "reference/client-sdk",
    section: "guides",
    sections: [
      {
        id: "consigner-le-contrat-de-lotp",
        title: "Consigner le contrat de l’OTP",
        paragraphs: [
          "Confirmez la longueur et l’alphabet du code, sa durée de validité, le nombre maximal de tentatives, la stratégie de renvoi et l’invalidation éventuelle du premier code par la demande d’un second. Ne présentez pas les six chiffres comme une norme universelle : Better Auth en produit six par défaut, mais reste configurable, et Supabase accepte des longueurs de six à dix chiffres.",
          "Conservez la valeur sous forme de chaîne pendant tout le test. Une conversion numérique supprime les zéros initiaux et peut rendre impossible la saisie exacte d’un code pourtant valide.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/plugins/email-otp",
            label: "Options des OTP par email dans Better Auth",
          },
          {
            href: "https://supabase.com/docs/guides/local-development/cli/config#authemailotp_length",
            label: "Longueur des OTP par email dans Supabase",
          },
        ],
      },
      {
        id: "capturer-le-premier-code",
        title: "Capturer le premier code",
        paragraphs: [
          "Créez une boîte pour le test, déclenchez l’action d’envoi de code dans l’application, puis appelez waitForCode() avec un filtre de sujet. Son expression par défaut recherche une valeur de six chiffres dans le texte ou le HTML capturés ; fournissez une expression régulière ou une chaîne de motif lorsque l’application emploie un autre format.",
          "Soumettez la chaîne renvoyée dans le véritable formulaire ou point de terminaison de vérification, puis contrôlez l’identité authentifiée et la session. Trouver des chiffres dans un email ne prouve pas à lui seul que le service dorsal accepte le bon code.",
        ],
      },
      {
        code: {
          filename: "email-otp.test.ts",
          language: "typescript",
          source: otpResendSnippet,
        },
        id: "distinguer-un-message-renvoye",
        title: "Distinguer un message renvoyé",
        paragraphs: [
          "Capturez le premier message complet et conservez son identifiant. Après avoir demandé un autre code, waitForMessage() avec afterId renvoie une livraison ultérieure ; extrayez le nouveau code de ce message précis, comme dans l’extrait.",
          "N’utilisez pas waitForCode({ afterId }) pour cette assertion. Cette méthode commence par parcourir les messages existants afin de trouver une valeur correspondante : elle peut donc renvoyer l’ancien code avant que sa requête d’attente n’applique afterId. Attendre le second message rend la frontière de livraison explicite.",
        ],
      },
      {
        id: "tester-la-rotation-et-la-limite-de-tentatives",
        title: "Tester la rotation et la limite de tentatives",
        paragraphs: [
          "Lorsque la stratégie de renvoi configurée remplace les codes, prouvez que le premier échoue et que le second réussit. Si le fournisseur réutilise volontairement un code encore valide, vérifiez plutôt ce comportement. Ne transformez pas en garantie produit la valeur par défaut de la version installée.",
          "Soumettez des valeurs invalides jusqu’à la limite configurée et confirmez que la tentative suivante est rejetée comme prévu. Appuyez cette assertion sur les réponses de l’application et l’état de session stocké : InboxTap n’implémente ni n’observe le compteur de vérifications du fournisseur.",
        ],
      },
      {
        id: "prendre-en-charge-les-codes-longs-et-personnalises",
        title: "Prendre en charge les codes longs et personnalisés",
        paragraphs: [
          "CapturedEmail.codes est un raccourci d’analyse pour les séquences uniques de quatre à huit chiffres. Un motif personnalisé de waitForCode() parcourt directement le corps du message : utilisez-le pour un code Supabase de neuf ou dix chiffres ou pour un format alphanumérique propre à l’application.",
          "Restreignez assez l’expression régulière pour éviter les dates, les numéros d’assistance et les identifiants sans rapport présents dans le modèle. Un sujet stable associé à une délimitation propre au format est plus sûr que le choix de la première suite de chiffres.",
        ],
      },
      {
        id: "tester-lexpiration-avec-une-horloge-maitrisee",
        title: "Tester l’expiration avec une horloge maîtrisée",
        paragraphs: [
          "Préférez une horloge virtuelle prise en charge par le fournisseur, une source de temps injectée ou une courte durée réservée aux tests. Attendre toute la durée de production ralentit la suite sans supprimer les conditions de concurrence au voisinage de l’échéance.",
          "Le code expiré doit échouer sans créer ni prolonger de session. La demande d’un nouveau code après l’expiration doit suivre la stratégie de renvoi documentée et produire une livraison distincte.",
        ],
      },
      {
        id: "eviter-laffichage-des-secrets",
        title: "Éviter l’affichage des secrets",
        paragraphs: [
          "N’incluez pas l’OTP dans les noms de test, les messages d’assertion, les captures d’écran ou les journaux courants. Vérifiez sa forme et l’état applicatif obtenu au lieu de prendre un instantané du corps complet de l’email.",
          "Si un livrable CI est nécessaire, utilisez le collecteur de rapports borné d’InboxTap avec des motifs de masquage propres au projet, puis relisez le résultat. La détection au mieux des jetons ne peut garantir que toutes les données personnelles ou secrètes personnalisées ont été trouvées.",
        ],
      },
    ],
    slug: "tester-les-otp-par-email",
    title: "Comment tester les parcours OTP par email",
  },
  "guides/test-password-reset-emails": {
    cta: {
      description:
        "Utilisez le guide Playwright pour relier le destinataire isolé, l’URL capturée, le formulaire du navigateur et les assertions finales sur la session.",
      label: "Lire le guide Playwright",
      title: "Exercer la réinitialisation dans un vrai navigateur",
    },
    description:
      "Testez tout le parcours de réinitialisation en local : réponse publique sûre, lien fiable, remplacement du mot de passe, réutilisation du jeton et comportement des sessions.",
    eyebrow: "Guide de test de l’authentification",
    intro:
      "L’email de réinitialisation du mot de passe constitue un canal privilégié de récupération de compte. Un test utile couvre la réponse publique à la demande, le message envoyé au véritable utilisateur connu, la frontière de confiance de l’URL, le changement de mot de passe ainsi que le devenir du jeton et des sessions existantes.",
    kind: "guides",
    relatedDocKey: "guides/playwright",
    section: "guides",
    sections: [
      {
        id: "commencer-par-deux-cas-de-demande-publique",
        title: "Commencer par deux cas de demande publique",
        paragraphs: [
          "Créez un utilisateur connu dont l’adresse est un nouveau destinataire InboxTap, puis soumettez une demande de réinitialisation pour ce compte. Soumettez le même formulaire public avec une autre adresse inconnue et comparez le code d’état HTTP et la réponse présentée à l’utilisateur.",
          "Le point de terminaison ne doit pas révéler l’existence d’un compte. Évitez d’exiger des durées exactement égales dans une suite navigateur : l’ordonnancement et la base de données rendent cette assertion fragile. Appuyez-vous plutôt sur les recommandations de sécurité du fournisseur et sur des tests ciblés de plus bas niveau pour les protections contre les attaques temporelles.",
        ],
        links: [
          {
            href: "https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html",
            label: "Fiche OWASP sur les mots de passe oubliés",
          },
        ],
      },
      {
        code: {
          filename: "password-reset.spec.ts",
          language: "typescript",
          source: passwordResetSnippet,
        },
        id: "valider-la-destination-de-reinitialisation",
        title: "Valider la destination de réinitialisation",
        paragraphs: [
          "Attendez une URL contenant le chemin de réinitialisation de l’application, puis analysez-la avant de naviguer. Comparez exactement l’origine et le chemin attendus afin qu’une URL de base erronée, un hôte non fiable ou un mauvais rappel ne puisse pas être masqué par une redirection du navigateur.",
          "Traitez l’URL complète comme un identifiant secret. Ne l’affichez pas, ne l’insérez pas dans le nom du test et ne joignez pas une capture d’écran non masquée qui expose la barre d’adresse.",
        ],
      },
      {
        id: "prouver-le-remplacement-du-mot-de-passe",
        title: "Prouver le remplacement du mot de passe",
        paragraphs: [
          "Remplissez le véritable formulaire de réinitialisation avec un mot de passe conforme à la politique actuelle de l’application. Déconnectez-vous ensuite ou créez un contexte navigateur vierge, confirmez que l’ancien mot de passe échoue, puis que le nouveau authentifie le même compte.",
          "Contrôlez l’identité ou l’état de session provenant du serveur au lieu de vous fier uniquement à une bannière de réussite. Vérifiez aussi le refus d’un nouveau mot de passe faible ou dont la confirmation diffère lorsque cette logique appartient à la page de réinitialisation.",
        ],
      },
      {
        id: "rejeter-la-reutilisation-lexpiration-et-lalteration",
        title: "Rejeter la réutilisation, l’expiration et l’altération",
        paragraphs: [
          "Tentez de réutiliser l’URL déjà consommée et vérifiez qu’elle ne peut pas changer une nouvelle fois le mot de passe. Exercez un jeton expiré avec une horloge maîtrisée ou une durée propre au test, puis modifiez le jeton pour prouver le rejet des entrées mal formées.",
          "L’échec ne doit exposer ni le jeton, ni les détails internes de la politique de mot de passe, ni les informations du compte dans la page ou les journaux courants du serveur. L’utilisateur peut recevoir un chemin sûr pour demander une nouvelle réinitialisation.",
        ],
      },
      {
        id: "verifier-la-politique-de-session",
        title: "Vérifier la politique de session",
        paragraphs: [
          "Décidez si une réinitialisation révoque toutes les sessions existantes, uniquement les autres sessions, ou aucune. Better Auth, par exemple, expose revokeSessionsOnPasswordReset au lieu d’imposer le même résultat à toutes les applications.",
          "Créez les sessions antérieures nécessaires et inspectez-les après le changement. InboxTap ne peut pas déduire cette politique de l’email ; elle doit être vérifiée auprès du système d’authentification.",
        ],
        links: [
          {
            href: "https://better-auth.com/docs/concepts/email#password-reset-email",
            label: "Documentation Better Auth sur l’email de réinitialisation",
          },
        ],
      },
      {
        id: "separer-la-livraison-de-la-deduplication-metier",
        title: "Séparer la livraison de la déduplication métier",
        paragraphs: [
          "Utilisez toHaveDeliveredOnce() après avoir confirmé l’existence du premier message de réinitialisation lorsque le produit promet une livraison par demande. Sa fenêtre d’observation facultative peut détecter une nouvelle tentative immédiate, mais ne prouve pas qu’aucune tâche ultérieure ne s’exécutera.",
          "La persistance de la file, les clés d’idempotence, la limitation de débit et la déduplication relèvent des tests applicatifs. InboxTap peut injecter une erreur 451 ou une déconnexion pour déclencher ces parcours et montrer quelles tentatives SMTP ont abouti, mais ne possède pas le système de tâches.",
        ],
      },
      {
        id: "produire-une-preuve-minimale-et-sure",
        title: "Produire une preuve minimale et sûre",
        paragraphs: [
          "Préférez des éléments qui consignent le résultat de l’assertion, des participants pseudonymisés, la forme de l’URL et le résultat applicatif final sans conserver le secret réutilisable. Excluez la source RFC brute, sauf si un besoin précis de diagnostic l’emporte sur le risque de divulgation.",
          "Les rapports InboxTap masquent les emplacements courants où apparaissent les jetons et les adresses, échappent le balisage capturé et restent bornés, mais le masquage demeure explicitement une protection au mieux. Ajoutez des motifs propres au projet et relisez le livrable avant de le partager.",
        ],
      },
    ],
    slug: "tester-les-emails-de-reinitialisation-de-mot-de-passe",
    title: "Comment tester les emails de réinitialisation de mot de passe de bout en bout",
  },
} satisfies Partial<ResourceContentDictionary>;
