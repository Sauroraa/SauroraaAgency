export const locales = ['fr', 'en', 'nl'] as const;
export type Locale = (typeof locales)[number];

type Dictionary = {
  nav: {
    artists: string;
    about: string;
    curated: string;
    contact: string;
    agency: string;
    agencyLogin: string;
  };
  footer: {
    description: string;
    navigate: string;
    agency: string;
    login: string;
    rights: string;
    location: string;
  };
  home: {
    heroTag: string;
    heroSubtitle: string;
    discoverArtists: string;
    bookNow: string;
    ambientOn: string;
    ambientOff: string;
    featuredTag: string;
    featuredTitle: string;
    viewAll: string;
    noFeatured: string;
    viewAllArtists: string;
    statsArtists: string;
    statsEvents: string;
    statsCountries: string;
    statsYears: string;
    rosterTag: string;
    rosterTitle: string;
    loadingArtists: string;
    bookingTag: string;
    bookingTitle: string;
    bookingSubtitle: string;
    selectArtist: string;
    selectArtistPlaceholder: string;
    yourName: string;
    email: string;
    eventName: string;
    eventDate: string;
    city: string;
    eventType: string;
    message: string;
    messagePlaceholder: string;
    sendBooking: string;
    fullForm: string;
    bookingSuccess: string;
    bookingError: string;
  };
  auth: {
    platform: string;
    signIn: string;
    email: string;
    password: string;
    forgotPassword: string;
    backToSite: string;
    invitationOnly: string;
    welcomeBack: string;
    invalidCredentials: string;
    resetPassword: string;
    forgotTitle: string;
    forgotText: string;
    sendReset: string;
    checkEmail: string;
    resetSent: string;
    resetError: string;
    tryAnotherEmail: string;
    backToLogin: string;
  };
  dashboard: {
    search: string;
    logout: string;
    dashboard: string;
    artists: string;
    myArtists: string;
    presskits: string;
    bookings: string;
    analytics: string;
    managers: string;
    invitations: string;
    security: string;
    settings: string;
  };
};

export const translations: Record<Locale, Dictionary> = {
  fr: {
    nav: {
      artists: 'Artistes',
      about: 'À propos',
      curated: 'Sélection',
      contact: 'Contact',
      agency: 'Agency',
      agencyLogin: 'Connexion Agency',
    },
    footer: {
      description:
        "Management premium d'artistes de musique électronique. Nous sélectionnons des talents d'exception et créons des expériences inoubliables.",
      navigate: 'Navigation',
      agency: 'Agency',
      login: 'Connexion',
      rights: 'Tous droits réservés.',
      location: 'Bruxelles, Belgique',
    },
    home: {
      heroTag: 'Management premium d’artistes',
      heroSubtitle:
        'Nous sélectionnons des talents électroniques d’exception et créons des expériences inoubliables.',
      discoverArtists: 'Découvrir les artistes',
      bookNow: 'Booker maintenant',
      ambientOn: 'Ambiance ON',
      ambientOff: 'Ambiance OFF',
      featuredTag: 'En vedette',
      featuredTitle: 'Nos artistes',
      viewAll: 'Voir tout',
      noFeatured: 'Aucun artiste en vedette pour le moment.',
      statsArtists: 'Artistes',
      statsEvents: 'Événements bookés',
      statsCountries: 'Pays',
      statsYears: 'Années d’activité',
      rosterTag: 'Artistes',
      rosterTitle: 'Découvrir tout le roster',
      viewAllArtists: 'Voir tous les artistes',
      loadingArtists: 'Chargement des artistes...',
      bookingTag: 'Booking',
      bookingTitle: 'Booker un artiste directement',
      bookingSubtitle: 'Envoyez votre demande maintenant. Notre équipe répond rapidement.',
      selectArtist: 'Artiste *',
      selectArtistPlaceholder: 'Sélectionnez un artiste...',
      yourName: 'Votre nom *',
      email: 'Email *',
      eventName: 'Nom de l’événement *',
      eventDate: 'Date de l’événement *',
      city: 'Ville *',
      eventType: 'Type d’événement *',
      message: 'Message',
      messagePlaceholder: 'Parlez-nous de votre événement...',
      sendBooking: 'Envoyer la demande',
      fullForm: 'Besoin du formulaire complet ?',
      bookingSuccess: 'Demande envoyée avec succès.',
      bookingError: "Impossible d'envoyer la demande. Réessayez.",
    },
    auth: {
      platform: 'Plateforme Agency',
      signIn: 'Connexion',
      email: 'Email',
      password: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      backToSite: 'Retour au site',
      invitationOnly: "Accès uniquement sur invitation.",
      welcomeBack: 'Bon retour',
      invalidCredentials: 'Identifiants invalides. Réessayez.',
      resetPassword: 'Réinitialiser le mot de passe',
      forgotTitle: 'Mot de passe oublié',
      forgotText: 'Entrez votre email et nous vous enverrons un lien de réinitialisation.',
      sendReset: 'Envoyer le lien',
      checkEmail: 'Vérifiez votre email',
      resetSent: 'Lien envoyé à votre adresse email',
      resetError: "Échec de l'envoi du lien. Vérifiez votre email.",
      tryAnotherEmail: 'Essayer un autre email',
      backToLogin: 'Retour à la connexion',
    },
    dashboard: {
      search: 'Rechercher...',
      logout: 'Déconnexion',
      dashboard: 'Tableau de bord',
      artists: 'Artistes',
      myArtists: 'Mes artistes',
      presskits: 'Presskits',
      bookings: 'Bookings',
      analytics: 'Analytics',
      managers: 'Managers',
      invitations: 'Invitations',
      security: 'Sécurité',
      settings: 'Paramètres',
    },
  },
  en: {
    nav: {
      artists: 'Artists',
      about: 'About',
      curated: 'Curated',
      contact: 'Contact',
      agency: 'Agency',
      agencyLogin: 'Agency Login',
    },
    footer: {
      description:
        'Premium electronic music artist management. We curate exceptional talent and deliver unforgettable experiences.',
      navigate: 'Navigate',
      agency: 'Agency',
      login: 'Login',
      rights: 'All rights reserved.',
      location: 'Brussels, Belgium',
    },
    home: {
      heroTag: 'Premium artist management',
      heroSubtitle:
        'We curate exceptional electronic talent and craft unforgettable experiences.',
      discoverArtists: 'Discover artists',
      bookNow: 'Book now',
      ambientOn: 'Ambient On',
      ambientOff: 'Ambient Off',
      featuredTag: 'Featured',
      featuredTitle: 'Our artists',
      viewAll: 'View all',
      noFeatured: 'No featured artists yet.',
      statsArtists: 'Artists',
      statsEvents: 'Events booked',
      statsCountries: 'Countries',
      statsYears: 'Years active',
      rosterTag: 'Artists',
      rosterTitle: 'Explore the full roster',
      viewAllArtists: 'View all artists',
      loadingArtists: 'Loading artists...',
      bookingTag: 'Booking',
      bookingTitle: 'Book an artist directly',
      bookingSubtitle: 'Send your request now. Our team responds quickly.',
      selectArtist: 'Artist *',
      selectArtistPlaceholder: 'Select an artist...',
      yourName: 'Your name *',
      email: 'Email *',
      eventName: 'Event name *',
      eventDate: 'Event date *',
      city: 'City *',
      eventType: 'Event type *',
      message: 'Message',
      messagePlaceholder: 'Tell us about your event...',
      sendBooking: 'Send booking request',
      fullForm: 'Need the full form?',
      bookingSuccess: 'Booking request sent successfully.',
      bookingError: 'Unable to submit booking. Please try again.',
    },
    auth: {
      platform: 'Agency Platform',
      signIn: 'Sign in',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      backToSite: 'Back to site',
      invitationOnly: 'Access is by invitation only.',
      welcomeBack: 'Welcome back',
      invalidCredentials: 'Invalid credentials. Please try again.',
      resetPassword: 'Reset password',
      forgotTitle: 'Forgot password',
      forgotText: "Enter your email and we'll send a reset link.",
      sendReset: 'Send reset link',
      checkEmail: 'Check your email',
      resetSent: 'Reset link sent to your email',
      resetError: 'Failed to send reset link. Please check your email.',
      tryAnotherEmail: 'Try another email',
      backToLogin: 'Back to login',
    },
    dashboard: {
      search: 'Search...',
      logout: 'Logout',
      dashboard: 'Dashboard',
      artists: 'Artists',
      myArtists: 'My artists',
      presskits: 'Presskits',
      bookings: 'Bookings',
      analytics: 'Analytics',
      managers: 'Managers',
      invitations: 'Invitations',
      security: 'Security',
      settings: 'Settings',
    },
  },
  nl: {
    nav: {
      artists: 'Artiesten',
      about: 'Over',
      curated: 'Selectie',
      contact: 'Contact',
      agency: 'Agency',
      agencyLogin: 'Agency Login',
    },
    footer: {
      description:
        'Premium management voor elektronische muziekartiesten. Wij cureren uitzonderlijk talent en leveren onvergetelijke ervaringen.',
      navigate: 'Navigatie',
      agency: 'Agency',
      login: 'Inloggen',
      rights: 'Alle rechten voorbehouden.',
      location: 'Brussel, België',
    },
    home: {
      heroTag: 'Premium artiestenmanagement',
      heroSubtitle:
        'Wij selecteren uitzonderlijk elektronisch talent en creëren onvergetelijke ervaringen.',
      discoverArtists: 'Artiesten ontdekken',
      bookNow: 'Nu boeken',
      ambientOn: 'Ambient aan',
      ambientOff: 'Ambient uit',
      featuredTag: 'Uitgelicht',
      featuredTitle: 'Onze artiesten',
      viewAll: 'Bekijk alles',
      noFeatured: 'Nog geen uitgelichte artiesten.',
      statsArtists: 'Artiesten',
      statsEvents: 'Geboekte events',
      statsCountries: 'Landen',
      statsYears: 'Jaren actief',
      rosterTag: 'Artiesten',
      rosterTitle: 'Ontdek de volledige roster',
      viewAllArtists: 'Bekijk alle artiesten',
      loadingArtists: 'Artiesten laden...',
      bookingTag: 'Booking',
      bookingTitle: 'Boek rechtstreeks een artiest',
      bookingSubtitle: 'Stuur nu je aanvraag. Ons team reageert snel.',
      selectArtist: 'Artiest *',
      selectArtistPlaceholder: 'Selecteer een artiest...',
      yourName: 'Jouw naam *',
      email: 'E-mail *',
      eventName: 'Naam evenement *',
      eventDate: 'Datum evenement *',
      city: 'Stad *',
      eventType: 'Type evenement *',
      message: 'Bericht',
      messagePlaceholder: 'Vertel ons over je evenement...',
      sendBooking: 'Verstuur aanvraag',
      fullForm: 'Volledig formulier nodig?',
      bookingSuccess: 'Boekingsaanvraag succesvol verzonden.',
      bookingError: 'Verzenden mislukt. Probeer opnieuw.',
    },
    auth: {
      platform: 'Agency Platform',
      signIn: 'Inloggen',
      email: 'E-mail',
      password: 'Wachtwoord',
      forgotPassword: 'Wachtwoord vergeten?',
      backToSite: 'Terug naar site',
      invitationOnly: 'Toegang enkel op uitnodiging.',
      welcomeBack: 'Welkom terug',
      invalidCredentials: 'Ongeldige gegevens. Probeer opnieuw.',
      resetPassword: 'Wachtwoord resetten',
      forgotTitle: 'Wachtwoord vergeten',
      forgotText: 'Voer je e-mail in en we sturen een resetlink.',
      sendReset: 'Resetlink versturen',
      checkEmail: 'Controleer je e-mail',
      resetSent: 'Resetlink naar je e-mail verzonden',
      resetError: 'Versturen mislukt. Controleer je e-mail.',
      tryAnotherEmail: 'Probeer een andere e-mail',
      backToLogin: 'Terug naar login',
    },
    dashboard: {
      search: 'Zoeken...',
      logout: 'Uitloggen',
      dashboard: 'Dashboard',
      artists: 'Artiesten',
      myArtists: 'Mijn artiesten',
      presskits: 'Presskits',
      bookings: 'Bookings',
      analytics: 'Analytics',
      managers: 'Managers',
      invitations: 'Uitnodigingen',
      security: 'Beveiliging',
      settings: 'Instellingen',
    },
  },
};
