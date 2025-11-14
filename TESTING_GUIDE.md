# 🧪 Analytics & Performance Testing Guide

## Prerequisites
- Development server running at http://localhost:3000
- Browser Developer Tools open (F12)
- Google Analytics 4 property set up (if testing real GA4)

## 1. 🔍 Console Analytics Testing

### Open Browser Console and monitor for these events:

```javascript
// In browser console, you can manually trigger events to test:

// Test page view tracking
trackPageView('/test-page', 'Test Page Title');

// Test vehicle search tracking
trackVehicleSearch({
  make: 'Toyota',
  model: 'Camry',
  year: '2020',
  results_count: 5
});

// Test report download tracking
trackReportDownload('Toyota_Camry_2020', 'reliability_report');

// Test email capture
trackEmailCapture('test@example.com', 'newsletter_signup');
```

### Expected Console Output:
```
[Analytics] Page view tracked: /test-page
[Analytics] Vehicle search tracked: Toyota Camry 2020
[Analytics] Report download tracked: Toyota_Camry_2020
[Analytics] Email capture tracked: test@example.com
```

## 2. 📊 Web Vitals Testing

### In Console, check for Web Vitals events:
```javascript
// These should appear automatically as you navigate:
// - LCP (Largest Contentful Paint)
// - FID (First Input Delay) 
// - FCP (First Contentful Paint)
// - CLS (Cumulative Layout Shift)
// - TTFB (Time to First Byte)
```

### Expected Console Output:
```
[Performance] LCP: 1234ms (good/needs-improvement/poor)
[Performance] FID: 56ms (good/needs-improvement/poor)
[Performance] CLS: 0.05 (good/needs-improvement/poor)
```

## 3. 🌐 Network Tab Verification

### Check for these requests in Network tab:
- `www.google-analytics.com/mp/collect` (GA4 events)
- `www.googletagmanager.com/gtag/js` (GA4 library)

### Filter by "analytics" or "google" to see GA4 traffic

## 4. 🎯 User Journey Testing

### Test these user flows:

#### A. Homepage → Search → Results
1. Load homepage
2. Search for a vehicle
3. View results
4. Check console for events

#### B. Navigation Testing
1. Navigate between pages
2. Check for route change tracking
3. Verify page view events

#### C. Conversion Testing
1. Download a PDF report
2. Sign up for newsletter
3. Check conversion tracking

## 5. 🚀 Performance Monitoring

### Test Core Web Vitals:
1. **LCP**: Load a page with images
2. **FID**: Click buttons/interactions
3. **CLS**: Check for layout shifts
4. **Performance**: Monitor loading times

### Use Lighthouse:
1. Open DevTools → Lighthouse tab
2. Run performance audit
3. Check Web Vitals scores

## 6. 🔄 Route Change Testing

### Test Next.js routing:
1. Navigate using Next.js Link components
2. Use browser back/forward buttons
3. Direct URL navigation
4. Check analytics for each method

## 7. 📱 Mobile Testing

### Test responsive analytics:
1. Toggle device simulation
2. Test touch interactions
3. Check mobile-specific events

## 8. 🛠️ Debug Mode Testing

### Enable debug mode in console:
```javascript
// Enable GA4 debug mode
gtag('config', 'GA_MEASUREMENT_ID', {
  debug_mode: true
});
```

## 9. ⚡ Performance Baseline

### Expected Performance Metrics:
- **LCP**: < 2.5s (Good)
- **FID**: < 100ms (Good) 
- **CLS**: < 0.1 (Good)
- **TTFB**: < 600ms (Good)

## 10. 🚨 Error Testing

### Test error tracking:
1. Trigger JavaScript errors
2. Cause unhandled promise rejections
3. Check error reporting

---

## Testing Checklist ✅

- [ ] Development server running
- [ ] Console shows analytics events
- [ ] Network requests to GA4 visible
- [ ] Web Vitals being tracked
- [ ] Route changes tracked
- [ ] Conversion events working
- [ ] Error tracking functional
- [ ] Performance monitoring active
- [ ] Mobile responsive testing
- [ ] Cross-browser testing

## Troubleshooting 🔧

### Common Issues:
1. **No console events**: Check if `NEXT_PUBLIC_GA_ID` is set
2. **No network requests**: Verify GA4 configuration
3. **Missing Web Vitals**: Check web-vitals package installation
4. **Route tracking fails**: Verify Next.js router integration

### Debug Commands:
```javascript
// Check if gtag is loaded
console.log(typeof gtag);

// Check analytics functions
console.log(window.trackPageView);
console.log(window.trackVehicleSearch);

// Check Web Vitals
console.log(window.webVitals);
```