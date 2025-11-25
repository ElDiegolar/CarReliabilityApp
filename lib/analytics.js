// lib/analytics.js - Next.js optimized analytics and tracking utilities

// Google Analytics 4 Configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Event tracking for key conversions
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: parameters.category || 'general',
      event_label: parameters.label || '',
      value: parameters.value || 0,
      ...parameters
    });
  }
};

// Key conversion events
export const trackVehicleSearch = (year, make, model, mileage) => {
  trackEvent('vehicle_search', {
    category: 'engagement',
    label: `${year} ${make} ${model}`,
    custom_parameters: {
      vehicle_year: year,
      vehicle_make: make,
      vehicle_model: model,
      vehicle_mileage: mileage
    }
  });
};

export const trackReportDownload = (vehicleInfo, reportType = 'pdf') => {
  trackEvent('report_download_pdf', {
    category: 'conversion',
    label: `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`,
    value: 1,
    custom_parameters: {
      report_type: reportType,
      vehicle_info: `${vehicleInfo.year}_${vehicleInfo.make}_${vehicleInfo.model}`
    }
  });
};

export const trackSignup = (method = 'email') => {
  trackEvent('signup', {
    category: 'conversion',
    label: method,
    value: 10, // Assign value to signup
    custom_parameters: {
      signup_method: method
    }
  });
};

export const trackShare = (content, platform) => {
  trackEvent('share', {
    category: 'engagement',
    label: `${platform}_${content}`,
    custom_parameters: {
      content_type: content,
      platform: platform
    }
  });
};

export const trackEmailCapture = (source = 'modal') => {
  trackEvent('email_capture', {
    category: 'lead_generation',
    label: source,
    value: 5,
    custom_parameters: {
      capture_source: source
    }
  });
};

export const trackMicroConversion = (action, source) => {
  trackEvent('micro_conversion', {
    category: 'engagement',
    label: `${action}_${source}`,
    custom_parameters: {
      conversion_action: action,
      conversion_source: source
    }
  });
};

// Page view tracking for Next.js client-side routing
export const trackPageView = (url, title) => {
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: title,
      page_location: window.location.origin + url,
    });
  }
};

// UTM parameter tracking
export const getUTMParams = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || '',
      utm_medium: urlParams.get('utm_medium') || '',
      utm_campaign: urlParams.get('utm_campaign') || '',
      utm_term: urlParams.get('utm_term') || '',
      utm_content: urlParams.get('utm_content') || ''
    };
  }
  return {};
};

// Store UTM parameters in localStorage for attribution
export const storeUTMParams = () => {
  if (typeof window !== 'undefined') {
    const utmParams = getUTMParams();
    if (Object.values(utmParams).some(value => value !== '')) {
      localStorage.setItem('utm_params', JSON.stringify(utmParams));
    }
  }
};

// Get stored UTM parameters for conversion attribution
export const getStoredUTMParams = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('utm_params');
    return stored ? JSON.parse(stored) : {};
  }
  return {};
};