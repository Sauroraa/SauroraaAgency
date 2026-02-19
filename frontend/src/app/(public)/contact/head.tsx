const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agency.sauroraa.be';
const URL = `${SITE_URL}/contact`;
const IMAGE = `${SITE_URL}/images/header.png`;

export default function Head() {
  return (
    <>
      <title>Contact & Booking | Sauroraa Agency</title>
      <meta
        name="description"
        content="Contactez Sauroraa Agency pour une demande de booking, un devis ou une collaboration."
      />
      <link rel="canonical" href={URL} />
      <meta property="og:title" content="Contact & Booking | Sauroraa Agency" />
      <meta
        property="og:description"
        content="Formulaire de contact et booking pour les artistes Sauroraa Agency."
      />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content={IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Contact & Booking | Sauroraa Agency" />
      <meta name="twitter:description" content="Contact et booking des artistes Sauroraa Agency." />
      <meta name="twitter:image" content={IMAGE} />
    </>
  );
}
