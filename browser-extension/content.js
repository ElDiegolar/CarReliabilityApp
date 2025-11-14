// browser-extension/content.js - Inject reliability scores into marketplace listings
(function() {
  'use strict';

  // Parse vehicle data from listing pages
  const parseVehicleFromPage = () => {
    const vehicleData = {};

    // Facebook Marketplace patterns
    const fbTitle = document.querySelector('[data-testid="post_title"]')?.textContent;
    if (fbTitle) {
      const match = fbTitle.match(/(\d{4})\s+([A-Za-z]+)\s+([A-Za-z0-9 ]+?)(?:\s+-|\s+\d+|$)/);
      if (match) {
        vehicleData.year = match[1];
        vehicleData.make = match[2];
        vehicleData.model = match[3].trim();
      }
    }

    // Craigslist patterns
    const clTitle = document.querySelector('#titletextonly')?.textContent;
    if (clTitle) {
      const match = clTitle.match(/(\d{4})\s+([A-Za-z]+)\s+([A-Za-z0-9 ]+)/);
      if (match) {
        vehicleData.year = match[1];
        vehicleData.make = match[2];
        vehicleData.model = match[3].trim();
      }
    }

    // Autotrader patterns
    const atTitle = document.querySelector('h1[class*="title"]')?.textContent;
    if (atTitle) {
      const match = atTitle.match(/(\d{4})\s+([A-Za-z]+)\s+([A-Za-z0-9 ]+)/);
      if (match) {
        vehicleData.year = match[1];
        vehicleData.make = match[2];
        vehicleData.model = match[3].trim();
      }
    }

    return vehicleData;
  };

  // Fetch reliability score from API
  const fetchReliabilityScore = async (vehicleData) => {
    try {
      const response = await fetch('https://lemnaed.com/api/car-reliability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData)
      });

      if (response.ok) {
        const data = await response.json();
        return data.reliability_score || null;
      }
    } catch (error) {
      console.error('Error fetching reliability score:', error);
    }
    return null;
  };

  // Create and inject reliability badge
  const injectReliabilityBadge = (score) => {
    if (score === null) return;

    // Determine color and status
    let color, status;
    if (score >= 85) {
      color = '#4caf50';
      status = 'TRUSTED';
    } else if (score >= 70) {
      color = '#ff9800';
      status = 'FAIR';
    } else {
      color = '#f44336';
      status = '⚠️ LEMON ALERT';
    }

    // Create badge element
    const badge = document.createElement('div');
    badge.id = 'lemnaed-reliability-badge';
    badge.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
    `;

    badge.innerHTML = `
      <div style="font-size: 12px; margin-bottom: 4px;">Lemnaed</div>
      <div style="font-size: 24px; font-weight: bold;">${score}/100</div>
      <div style="font-size: 11px; margin-top: 4px;">${status}</div>
    `;

    // Click handler to open full report
    badge.addEventListener('click', () => {
      const vehicleData = parseVehicleFromPage();
      const searchUrl = `https://lemnaed.com/search?year=${vehicleData.year}&make=${vehicleData.make}&model=${vehicleData.model}`;
      window.open(searchUrl, '_blank');
    });

    document.body.appendChild(badge);
  };

  // Main execution
  const init = async () => {
    const vehicleData = parseVehicleFromPage();

    if (vehicleData.year && vehicleData.make && vehicleData.model) {
      const score = await fetchReliabilityScore(vehicleData);
      injectReliabilityBadge(score);
    }
  };

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run on dynamic content updates
  const observer = new MutationObserver(init);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();