const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agency.sauroraa.be';
const URL = `${SITE_URL}/about`;
const IMAGE = `${SITE_URL}/images/header.png`;

export default function Head() {
  return (
    <>
      <title>A propos | Sauroraa Agency</title>
      <meta
        name="description"
        content="Decouvrez la vision de Sauroraa Agency: management premium, strategie artistique et booking international."
      />
      <link rel="canonical" href={URL} />
      <meta property="og:title" content="A propos | Sauroraa Agency" />
      <meta
        property="og:description"
        content="Vision, manifesto et positionnement de Sauroraa Agency pour les artistes electroniques."
      />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content={IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="A propos | Sauroraa Agency" />
      <meta name="twitter:description" content="Vision et positionnement de Sauroraa Agency." />
      <meta name="twitter:image" content={IMAGE} />
    </>
  );
}
