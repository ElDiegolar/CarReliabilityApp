// lib/url-helpers.js - Production-safe URL utilities

/**
 * Get the base URL for the application
 * Works correctly in both development and production (including Vercel)
 */
export const getBaseUrl = () => {
  // Browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Check for explicit site URL environment variable (most reliable)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Server environment - check for Vercel environment variables
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to production domain
  if (process.env.NODE_ENV === 'production') {
    return 'https://www.lemnaed.com';
  }

  // Development fallback
  return 'http://localhost:3000';
};

/**
 * Build a shareable URL with query parameters
 */
export const buildShareUrl = (params = {}) => {
  const baseUrl = getBaseUrl();
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Build vehicle search URL
 */
export const buildVehicleUrl = ({ year, make, model }) => {
  return buildShareUrl({ year, make, model });
};

/**
 * Build product search URL
 */
export const buildProductUrl = (params) => {
  return buildShareUrl(params);
};

/**
 * Get social share URLs
 */
export const getSocialShareUrls = (text, url) => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    email: `mailto:?subject=${encodedText}&body=${encodedText}%20${encodedUrl}`,
    // Note: TikTok and Instagram don't have direct web share URLs
    tiktok: `https://www.tiktok.com/upload?text=${encodedText}`,
    instagram: `https://www.instagram.com/?url=${encodedUrl}`
  };
};

/**
 * Use native Web Share API if available, with fallback
 */
export const shareWithWebAPI = async (title, text, url) => {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
      return true;
    } catch (error) {
      // User cancelled or browser doesn't support
      console.log('Web Share API failed:', error);
      return false;
    }
  }
  return false;
};

/**
 * Copy text to clipboard with fallback
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
