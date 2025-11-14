// components/GoogleAnalytics.js - Next.js optimized Analytics component
import { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';

const GoogleAnalytics = ({ gaId }) => {
  const router = useRouter();

  useEffect(() => {
    if (!gaId) return;

    const handleRouteChange = (url) => {
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', gaId, {
          page_location: url,
          page_title: document.title,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('hashChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('hashChangeComplete', handleRouteChange);
    };
  }, [router.events, gaId]);

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('config', '${gaId}', {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true
          });

          // Enhanced ecommerce and conversion tracking
          gtag('config', '${gaId}', {
            custom_map: {
              'custom_parameter_1': 'vehicle_search',
              'custom_parameter_2': 'report_download'
            }
          });
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics;