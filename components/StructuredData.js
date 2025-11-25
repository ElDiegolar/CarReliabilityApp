// components/StructuredData.js - Enhanced structured data for better SEO
import Head from 'next/head';

export const OrganizationStructuredData = () => (
  <Head>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Lemnaed",
          "description": "Leading car reliability checker and vehicle analysis platform worldwide",
          "url": "https://lemnaed.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://lemnaed.com/logo.png",
            "width": 400,
            "height": 400
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["English"],
            "url": "https://lemnaed.com/contact"
          },
          "areaServed": {
            "@type": "Place",
            "name": "Worldwide"
          },
          "serviceType": "Vehicle Reliability Analysis",
          "foundingDate": "2025",
          "sameAs": [
            "https://facebook.com/lemnaed",
            "https://twitter.com/lemnaed",
            "https://linkedin.com/company/lemnaed"
          ]
        })
      }}
    />
  </Head>
);

export const FAQStructuredData = ({ faqs }) => (
  <Head>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })
      }}
    />
  </Head>
);

export const ProductStructuredData = ({ vehicle, reliabilityScore }) => (
  <Head>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          "description": `Reliability analysis and score for ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          "brand": {
            "@type": "Brand",
            "name": vehicle.make
          },
          "model": vehicle.model,
          "productionDate": vehicle.year,
          "category": "Automobile",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": (reliabilityScore / 20).toFixed(1),
            "bestRating": "5",
            "worstRating": "1",
            "ratingCount": "1",
            "reviewCount": "1"
          },
          "review": {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": (reliabilityScore / 20).toFixed(1),
              "bestRating": "5",
              "worstRating": "1"
            },
            "author": {
              "@type": "Organization",
              "name": "Lemnaed"
            },
            "reviewBody": `Comprehensive reliability analysis for ${vehicle.year} ${vehicle.make} ${vehicle.model} based on multiple data sources and expert evaluation.`
          }
        })
      }}
    />
  </Head>
);

export const WebsiteStructuredData = () => (
  <Head>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Lemnaed",
          "description": "Free car reliability checker worldwide",
          "url": "https://lemnaed.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://lemnaed.com/search?year={year}&make={make}&model={model}"
            },
            "query-input": [
              "required name=year",
              "required name=make", 
              "required name=model"
            ]
          }
        })
      }}
    />
  </Head>
);

export const BreadcrumbStructuredData = ({ breadcrumbs }) => (
  <Head>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.label,
            "item": crumb.href ? `https://lemnaed.com${crumb.href}` : undefined
          }))
        })
      }}
    />
  </Head>
);