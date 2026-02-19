const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agency.sauroraa.be';
const URL = `${SITE_URL}/artists`;
const IMAGE = `${SITE_URL}/images/header.png`;

export default function Head() {
  return (
    <>
      <title>Artistes | Sauroraa Agency</title>
      <meta
        name="description"
        content="Parcourez le roster Sauroraa Agency: artistes electroniques, profils complets, disponibilites et booking."
      />
      <link rel="canonical" href={URL} />
      <meta property="og:title" content="Artistes | Sauroraa Agency" />
      <meta
        property="og:description"
        content="Roster officiel des artistes representes par Sauroraa Agency."
      />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content={IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Artistes | Sauroraa Agency" />
      <meta name="twitter:description" content="Roster officiel des artistes Sauroraa Agency." />
      <meta name="twitter:image" content={IMAGE} />
    </>
  );
}
