// components/PerformanceMonitor.js - Next.js optimized Core Web Vitals and performance tracking
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const PerformanceMonitor = () => {
  const router = useRouter();

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals with dynamic import for Next.js
    const initializeWebVitals = async () => {
      try {
        const { getLCP, getFID, getFCP, getCLS, getTTFB } = await import('web-vitals');
        
        // Generic tracking function for all Web Vitals
        const trackWebVital = (metric) => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'performance',
              event_label: metric.name,
              value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
              custom_parameters: {
                metric_name: metric.name.toLowerCase(),
                metric_value: metric.value,
                metric_rating: metric.rating,
                page_path: router.pathname
              }
            });
          }
        };
        // Initialize all Web Vitals tracking
        getLCP(trackWebVital);
        getFID(trackWebVital);
        getFCP(trackWebVital);
        getCLS(trackWebVital);
        getTTFB(trackWebVital);

      } catch (error) {
        console.warn('Failed to load web-vitals:', error);
      }
    };

    // Track page performance on load
    const trackPagePerformance = () => {
      if (window.performance && window.performance.getEntriesByType) {
        const perfData = window.performance.getEntriesByType('navigation')[0];
        
        if (perfData && window.gtag) {
          window.gtag('event', 'page_load_performance', {
            event_category: 'performance',
            custom_parameters: {
              dns_time: perfData.domainLookupEnd - perfData.domainLookupStart,
              connect_time: perfData.connectEnd - perfData.connectStart,
              response_time: perfData.responseEnd - perfData.requestStart,
              dom_load_time: perfData.domContentLoadedEventEnd - perfData.navigationStart,
              total_load_time: perfData.loadEventEnd - perfData.navigationStart,
              page_path: router.pathname
            }
          });
        }
      }
    };

    // Initialize on load
    if (document.readyState === 'complete') {
      initializeWebVitals();
      trackPagePerformance();
    } else {
      window.addEventListener('load', () => {
        initializeWebVitals();
        setTimeout(trackPagePerformance, 1000);
      });
    }

    // Track performance on Next.js route changes
    const handleRouteChange = () => {
      setTimeout(() => {
        initializeWebVitals();
        trackPagePerformance();
      }, 100);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Error tracking
    const errorHandler = (event) => {
      if (window.gtag) {
        window.gtag('event', 'javascript_error', {
          event_category: 'error',
          event_label: event.message,
          custom_parameters: {
            error_message: event.message,
            error_filename: event.filename,
            error_line: event.lineno,
            error_column: event.colno,
            page_path: router.pathname
          }
        });
      }
    };

    const rejectionHandler = (event) => {
      if (window.gtag) {
        window.gtag('event', 'promise_rejection', {
          event_category: 'error',
          event_label: event.reason?.message || 'Unknown Promise Rejection',
          custom_parameters: {
            error_reason: event.reason?.message || 'Unknown',
            error_stack: event.reason?.stack || '',
            page_path: router.pathname
          }
        });
      }
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // Cleanup
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };

  }, [router.pathname, router.events]);

  return null; // This component doesn't render anything
};

// Export as dynamic component to ensure client-side only rendering
export default dynamic(() => Promise.resolve(PerformanceMonitor), {
  ssr: false
});