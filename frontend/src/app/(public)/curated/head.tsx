const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agency.sauroraa.be';
const URL = `${SITE_URL}/curated`;
const IMAGE = `${SITE_URL}/images/header.png`;

export default function Head() {
  return (
    <>
      <title>Selection Curated | Sauroraa Agency</title>
      <meta
        name="description"
        content="Selection curated Sauroraa Agency: artistes electroniques choisis pour leur vision et performance."
      />
      <link rel="canonical" href={URL} />
      <meta property="og:title" content="Selection Curated | Sauroraa Agency" />
      <meta
        property="og:description"
        content="Une selection exclusive d artistes electroniques curated par Sauroraa Agency."
      />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content={IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Selection Curated | Sauroraa Agency" />
      <meta name="twitter:description" content="Selection exclusive d artistes curated par Sauroraa Agency." />
      <meta name="twitter:image" content={IMAGE} />
    </>
  );
}
