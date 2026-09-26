/**
 * Documents légaux, accessibles depuis les pieds de page (landing et profil).
 * SportMates est un projet étudiant non commercial : les textes reflètent le fonctionnement
 * réel de l'app (données stockées, cookie unique, services tiers). À mettre à jour à chaque
 * changement de ces points.
 */

/** Date de dernière mise à jour affichée sur chaque document. */
export const LEGAL_LAST_UPDATED = "26 septembre 2026";

/**
 * Adresse de contact publique (demandes RGPD, signalement d'un contenu illicite).
 * null tant que l'équipe n'a pas choisi d'adresse : les documents renvoient alors vers les
 * fonctions de l'app (modifier le profil, supprimer le compte, signaler un membre).
 */
export const LEGAL_CONTACT_EMAIL: string | null = null;

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalPage {
  slug: string;
  title: string;
  accent: string;
  summary: string;
  sections: LegalSection[];
}

const CONTACT_SENTENCE = LEGAL_CONTACT_EMAIL
  ? `Pour toute question, écris-nous à ${LEGAL_CONTACT_EMAIL}.`
  : "Pour toute question, utilise les fonctions de l'app (profil, signalement) ; une adresse de contact sera publiée ici prochainement.";

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "mentions-legales",
    title: "Mentions",
    accent: "légales.",
    summary: "Éditeur du site, hébergement et contact.",
    sections: [
      {
        heading: "Éditeur",
        paragraphs: [
          "SportMates (sport-mates.vercel.app) est un projet étudiant, gratuit et non commercial, conçu et édité à titre non professionnel par l'équipe étudiante SportMates.",
          "Conformément à l'article 6, III, 2 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, les éditeurs non professionnels peuvent ne tenir à la disposition du public que les coordonnées de l'hébergeur, qui dispose des éléments d'identification de l'éditeur.",
          CONTACT_SENTENCE,
        ],
      },
      {
        heading: "Hébergement",
        paragraphs: [
          "Site : Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis — vercel.com.",
          "Base de données : Turso (ChiselStrike Inc.), serveurs situés dans l'Union européenne (Irlande) — turso.tech.",
        ],
      },
      {
        heading: "Propriété intellectuelle",
        paragraphs: [
          "Le nom SportMates, le logo et l'interface sont la propriété de l'équipe SportMates. Les photos de sport sont sous licence libre (voir la page Crédits photos). Les contenus publiés par les membres (annonces, messages, avis) restent la propriété de leurs auteurs.",
        ],
      },
    ],
  },
  {
    slug: "cgu",
    title: "Conditions générales",
    accent: "d'utilisation.",
    summary: "Les règles du jeu pour organiser, rejoindre et vivre des séances en confiance.",
    sections: [
      {
        heading: "1. Objet",
        paragraphs: [
          "SportMates met en relation des personnes qui veulent pratiquer un sport ensemble : un membre publie une séance, d'autres membres candidatent, l'organisateur accepte ou refuse, puis une discussion s'ouvre. En créant un compte, tu acceptes ces conditions.",
        ],
      },
      {
        heading: "2. Inscription",
        paragraphs: [
          "L'inscription est gratuite et réservée aux personnes âgées de 18 ans ou plus. Tu t'engages à fournir des informations exactes, à garder ton mot de passe secret et à n'avoir qu'un seul compte.",
        ],
      },
      {
        heading: "3. Séances",
        paragraphs: [
          "L'organisateur est seul responsable de l'annonce qu'il publie (lieu, horaire, niveau, prix, matériel) et de son exactitude. Il prévient les participants de tout changement ; l'app le fait automatiquement quand l'annonce est modifiée ou annulée.",
          "Un éventuel prix par personne correspond uniquement au partage de frais (location d'un terrain, d'un court…) et se règle sur place, directement entre membres. SportMates ne perçoit aucun paiement et n'intervient pas dans ces échanges.",
          "Les séances « entre femmes » ou « entre hommes » sont réservées aux membres qui ont indiqué le genre correspondant dans leur profil. Déclarer un faux genre pour y accéder est interdit.",
          "Si tu as un empêchement, désiste-toi dans l'app le plus tôt possible pour libérer ta place.",
        ],
      },
      {
        heading: "4. Comportement",
        paragraphs: [
          "Le respect est la règle, en ligne comme sur le terrain. Sont interdits : le harcèlement, les propos haineux ou discriminatoires, les contenus sexuels ou violents, l'usurpation d'identité, la publicité, la revente de places et toute utilisation de l'app à d'autres fins que la pratique sportive.",
          "Les avis doivent être sincères et porter sur une séance réellement partagée.",
        ],
      },
      {
        heading: "5. Sécurité et modération",
        paragraphs: [
          "Tu peux bloquer un membre (vos activités et vos échanges sont alors masqués dans les deux sens) ou le signaler depuis son profil. L'équipe peut supprimer un contenu ou suspendre un compte qui ne respecte pas ces règles.",
          "Les rencontres ont lieu sous la responsabilité de chacun. Privilégie les lieux publics, préviens un proche et adapte l'effort à ta condition physique. En cas de danger, appelle le 112.",
        ],
      },
      {
        heading: "6. Responsabilité",
        paragraphs: [
          "SportMates est un projet étudiant fourni « en l'état », sans garantie de disponibilité. L'équipe n'est pas partie aux séances et ne peut être tenue responsable de leur déroulement, des blessures, des dommages ou des litiges entre membres.",
        ],
      },
      {
        heading: "7. Suppression du compte",
        paragraphs: [
          "Tu peux supprimer ton compte à tout moment depuis Profil › Zone sensible. Tes données sont alors effacées (voir la politique de confidentialité).",
          "Ces conditions peuvent évoluer ; la date de mise à jour figure en haut de la page. Elles sont soumises au droit français.",
        ],
      },
    ],
  },
  {
    slug: "confidentialite",
    title: "Politique de",
    accent: "confidentialité.",
    summary: "Quelles données on garde, pourquoi, combien de temps, et comment exercer tes droits.",
    sections: [
      {
        heading: "Responsable du traitement",
        paragraphs: [
          "L'équipe étudiante SportMates (voir les mentions légales). Nous ne vendons ni ne louons aucune donnée, et n'utilisons aucune publicité ni aucun outil de mesure d'audience.",
        ],
      },
      {
        heading: "Données collectées",
        paragraphs: [
          "Compte : pseudo, prénom, email, mot de passe (jamais stocké en clair : seule une empreinte chiffrée bcrypt est conservée).",
          "Profil : niveau, sports favoris, bio et photo si tu les ajoutes, ville choisie à l'accueil et sa position approximative (centre de la ville), genre si tu le renseignes.",
          "Activité : séances publiées (lieu, horaire, description), candidatures, messages, avis, blocages et signalements.",
          "Ta position GPS n'est jamais enregistrée : elle reste dans ton navigateur pour calculer les distances et afficher le nom de ta ville.",
        ],
      },
      {
        heading: "Ce que voient les autres membres",
        paragraphs: [
          "Ton pseudo, ta photo, ton niveau, tes sports favoris, ta bio, tes avis et les séances que tu organises. Jamais ton email, ton prénom ni ton genre (il sert uniquement à l'accès aux séances entre femmes ou entre hommes).",
        ],
      },
      {
        heading: "Ce qui est visible sans compte",
        paragraphs: [
          "Pour pouvoir être partagées (WhatsApp, réseaux), les séances à venir ont une page publique : sport, date, durée, niveau, prix, nombre de places, ville, ainsi que le pseudo, la photo et la note de l'organisateur. L'adresse et le lieu exacts, la description, l'identité des participants et les messages restent réservés aux membres.",
        ],
      },
      {
        heading: "Finalités et base légale",
        paragraphs: [
          "Ces données servent uniquement à faire fonctionner le service que tu demandes en créant un compte (exécution des conditions d'utilisation) : afficher les séances, gérer les candidatures, la messagerie, les avis, et assurer la sécurité (blocage, signalement, protection contre les tentatives de connexion abusives).",
        ],
      },
      {
        heading: "Durée de conservation",
        paragraphs: [
          "Tes données sont conservées tant que ton compte existe. La suppression du compte efface immédiatement ton profil, tes séances, candidatures, messages, avis, blocages et signalements.",
          "Sessions de connexion : 30 jours maximum. Liens de réinitialisation du mot de passe : 1 heure. Traces des tentatives de connexion : 24 heures au plus.",
        ],
      },
      {
        heading: "Services tiers",
        paragraphs: [
          "Hébergement du site : Vercel (États-Unis, encadré par les clauses contractuelles types de la Commission européenne). Base de données : Turso, serveurs en Irlande.",
          "Recherche d'adresse : Géoplateforme de l'IGN (France) et, hors de France, Nominatim / OpenStreetMap. Fond de carte : OpenFreeMap. Ces services reçoivent l'adresse recherchée ou une position, sans aucune donnée de compte.",
          "Envoi d'e-mails (réinitialisation du mot de passe) : prestataire SMTP de l'équipe.",
        ],
      },
      {
        heading: "Tes droits",
        paragraphs: [
          "Conformément au RGPD, tu disposes d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. Tu peux modifier ton profil et supprimer ton compte à tout moment depuis l'app. " +
            CONTACT_SENTENCE,
          "Tu peux aussi introduire une réclamation auprès de la CNIL (cnil.fr).",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Gestion des",
    accent: "cookies.",
    summary: "Un seul cookie, indispensable pour rester connecté. Aucun cookie publicitaire.",
    sections: [
      {
        heading: "Le cookie de session",
        paragraphs: [
          "Quand tu te connectes, SportMates dépose un seul cookie (sportbud_session) qui contient un jeton aléatoire permettant de te reconnaître. Il est inaccessible aux scripts de la page, envoyé uniquement en HTTPS, et expire après 30 jours sans utilisation ou à la déconnexion.",
          "Ce cookie est strictement nécessaire au fonctionnement du service : il est donc exempté de consentement (article 82 de la loi Informatique et Libertés), et aucun bandeau n'est affiché.",
        ],
      },
      {
        heading: "Stockage local",
        paragraphs: [
          "Le navigateur retient, le temps de l'onglet, que tu as fermé la demande d'accès à ta position, pour ne pas te la reposer.",
        ],
      },
      {
        heading: "Aucun traceur",
        paragraphs: [
          "Pas de publicité, pas de mesure d'audience, pas de bouton de réseau social : aucun cookie tiers n'est déposé.",
          "Tu peux supprimer les cookies à tout moment dans les réglages de ton navigateur ; tu seras simplement déconnecté.",
        ],
      },
    ],
  },
];

export function getLegalPage(slug: string) {
  return LEGAL_PAGES.find((page) => page.slug === slug);
}
