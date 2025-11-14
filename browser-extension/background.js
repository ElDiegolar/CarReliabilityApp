// browser-extension/background.js - Service worker for browser extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchScore') {
    fetch('https://lemnaed.com/api/car-reliability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.vehicleData)
    })
      .then(res => res.json())
      .then(data => sendResponse(data))
      .catch(error => sendResponse({ error: error.message }));

    return true; // Keep channel open for async response
  }

  if (request.action === 'trackShare') {
    fetch('https://lemnaed.com/api/viral/track-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'browser_extension',
        platform: request.platform,
        vehicleData: request.vehicleData
      })
    });
  }
});