const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agency.sauroraa.be';
const IMAGE = `${SITE_URL}/images/header.png`;

export default function Head() {
  return (
    <>
      <link rel="canonical" href={SITE_URL} />
      <meta property="og:image" content={IMAGE} />
      <meta name="twitter:image" content={IMAGE} />
      <link rel="icon" href="/icons/favicon.png?v=5" type="image/png" />
      <link rel="shortcut icon" href="/icons/favicon.png?v=5" type="image/png" />
      <link rel="apple-touch-icon" href="/icons/favicon.png?v=5" />
    </>
  );
}
