'use client';

import { useI18n } from '@/hooks/useI18n';

export default function LegalNoticePage() {
  const { locale } = useI18n();

  const copy = {
    fr: {
      title: 'Mentions légales',
      intro: 'Informations officielles de publication et de contact de la plateforme SAURORAA Agency.',
      companyTitle: 'Éditeur du site',
      companyName: 'SAURORAA SNC',
      companyNumber: 'N° d’entreprise : 1031.598.463',
      region: 'Région : Liège, Belgique',
      contactTitle: 'Contact',
      booking: 'Email booking : booking@sauroraa.be',
      contact: 'Email contact : contact@sauroraa.be',
      hostingTitle: 'Hébergement et infrastructure',
      hosting: 'Application web exploitée sur une infrastructure cloud/VPS sécurisée (UE).',
      privacyTitle: 'Données personnelles',
      privacy:
        'Les données envoyées via les formulaires sont utilisées uniquement pour le traitement des demandes artistiques et commerciales. Vous pouvez demander la rectification ou la suppression de vos données via contact@sauroraa.be.',
      liabilityTitle: 'Responsabilité',
      liability:
        'SAURORAA met en oeuvre tous les moyens raisonnables pour assurer la disponibilité et la sécurité du service, sans garantir une disponibilité continue sans interruption.',
    },
    en: {
      title: 'Legal notice',
      intro: 'Official publication and contact details for the SAURORAA Agency platform.',
      companyTitle: 'Website publisher',
      companyName: 'SAURORAA SNC',
      companyNumber: 'Company number: 1031.598.463',
      region: 'Region: Liège, Belgium',
      contactTitle: 'Contact',
      booking: 'Booking email: booking@sauroraa.be',
      contact: 'Contact email: contact@sauroraa.be',
      hostingTitle: 'Hosting and infrastructure',
      hosting: 'Web platform operated on secure cloud/VPS infrastructure (EU).',
      privacyTitle: 'Personal data',
      privacy:
        'Data submitted through forms is used only to process artistic and commercial requests. You can request correction or deletion of your data via contact@sauroraa.be.',
      liabilityTitle: 'Liability',
      liability:
        'SAURORAA implements reasonable means to ensure service availability and security, without guaranteeing uninterrupted availability.',
    },
    nl: {
      title: 'Juridische vermeldingen',
      intro: 'Officiële publicatie- en contactgegevens van het SAURORAA Agency-platform.',
      companyTitle: 'Uitgever van de website',
      companyName: 'SAURORAA SNC',
      companyNumber: 'Ondernemingsnummer: 1031.598.463',
      region: 'Regio: Luik, België',
      contactTitle: 'Contact',
      booking: 'Booking e-mail: booking@sauroraa.be',
      contact: 'Contact e-mail: contact@sauroraa.be',
      hostingTitle: 'Hosting en infrastructuur',
      hosting: 'Webplatform op beveiligde cloud/VPS-infrastructuur (EU).',
      privacyTitle: 'Persoonsgegevens',
      privacy:
        'Gegevens die via formulieren worden verzonden, worden enkel gebruikt voor artistieke en commerciële aanvragen. Correctie of verwijdering kan via contact@sauroraa.be.',
      liabilityTitle: 'Aansprakelijkheid',
      liability:
        'SAURORAA zet redelijke middelen in om beschikbaarheid en veiligheid te garanderen, zonder ononderbroken beschikbaarheid te waarborgen.',
    },
  }[locale];

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <div className="rounded-3xl border border-[var(--border-color)] bg-dark-900/40 backdrop-blur p-8 md:p-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-aurora mb-4">{copy.title}</h1>
        <p className="text-[var(--text-secondary)] mb-10">{copy.intro}</p>

        <div className="space-y-8">
          <div>
            <h2 className="font-display text-xl font-semibold mb-3">{copy.companyTitle}</h2>
            <p className="text-[var(--text-secondary)]">{copy.companyName}</p>
            <p className="text-[var(--text-secondary)]">{copy.companyNumber}</p>
            <p className="text-[var(--text-secondary)]">{copy.region}</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold mb-3">{copy.contactTitle}</h2>
            <p className="text-[var(--text-secondary)]">{copy.booking}</p>
            <p className="text-[var(--text-secondary)]">{copy.contact}</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold mb-3">{copy.hostingTitle}</h2>
            <p className="text-[var(--text-secondary)]">{copy.hosting}</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold mb-3">{copy.privacyTitle}</h2>
            <p className="text-[var(--text-secondary)]">{copy.privacy}</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold mb-3">{copy.liabilityTitle}</h2>
            <p className="text-[var(--text-secondary)]">{copy.liability}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
