// pages/_document.js - Custom Document component for HTML structure with SEO optimization
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          
          {/* SEO Meta tags */}
          <meta name="description" content="Check any car's reliability score free forever. Get instant used car reliability reports, reliability scores, and avoid buying lemons. Malta's #1 car reliability checker." />
          <meta name="keywords" content="used car reliability check, car reliability score, is my car reliable, vehicle reliability report, car problems check, Malta cars, avoid lemon cars, car buying Malta, vehicle inspection" />
          <meta name="author" content="Lemnaed" />
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="theme-color" content="#0070f3" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Lemnaed - Car Reliability Checker" />
          <meta property="og:locale" content="en_US" />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:creator" content="@Lemnaed" />
          
          {/* Canonical URL - will be overridden by individual pages */}
          <link rel="canonical" href="https://lemnaed.com" />
          
          {/* Structured Data - Organization */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Lemnaed",
                "description": "Malta's leading car reliability checker and vehicle analysis platform",
                "url": "https://lemnaed.com",
                "logo": "https://lemnaed.com/logo.png",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "availableLanguage": ["English", "Maltese"]
                },
                "areaServed": {
                  "@type": "Country",
                  "name": "Malta"
                },
                "serviceType": "Vehicle Reliability Analysis"
              })
            }}
          />
          
          {/* Web fonts with performance optimization */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          
          {/* Performance and SEO optimizations */}
          <link rel="dns-prefetch" href="//fonts.googleapis.com" />
          <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;