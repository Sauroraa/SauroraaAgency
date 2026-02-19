const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agency.sauroraa.be';
const URL = `${SITE_URL}/mentions-legales`;

export default function Head() {
  return (
    <>
      <title>Mentions Legales | Sauroraa Agency</title>
      <meta
        name="description"
        content="Mentions legales, informations societaires, hebergement et protection des donnees de Sauroraa Agency."
      />
      <link rel="canonical" href={URL} />
      <meta property="og:title" content="Mentions Legales | Sauroraa Agency" />
      <meta
        property="og:description"
        content="Informations legales officielles de Sauroraa Agency."
      />
      <meta property="og:url" content={URL} />
    </>
  );
}
