// components/SEO.js - Dynamic SEO component for meta tags
import Head from 'next/head';
import { useRouter } from 'next/router';

const SEO = ({
  title = "Lemnaed - Free Car Reliability Checker | Check Any Vehicle's Reliability Score",
  description = "Check any car's reliability score free forever. Get instant used car reliability reports worldwide. Avoid buying lemons with our comprehensive vehicle analysis tool.",
  keywords = "used car reliability check, car reliability score, is my car reliable, vehicle reliability report, car problems check, avoid lemon cars, car buying guide, Toyota Honda BMW Mercedes reliability",
  ogImage = "/images/og-image.png",
  ogType = "website",
  canonicalUrl,
  structuredData,
  noindex = false
}) => {
  const router = useRouter();
  const currentUrl = `https://lemnaed.com${router.asPath}`;
  const canonical = canonicalUrl || currentUrl;

  // Clean up title - remove site name if already included
  const cleanTitle = title.includes('Lemnaed') ? title : `${title} | Lemnaed`;

  return (
    <Head>
      <title>{cleanTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={cleanTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={ogType} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={cleanTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
};

export default SEO;