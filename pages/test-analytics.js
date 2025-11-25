// pages/test-analytics.js - Analytics testing page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ConversionButton from '../components/ConversionButton';
import { 
  trackVehicleSearch, 
  trackReportDownload, 
  trackEmailCapture,
  trackMicroConversion 
} from '../lib/analytics';

export default function TestAnalytics() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [email, setEmail] = useState('');

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const testVehicleSearch = () => {
    const searchData = {
      make: 'Toyota',
      model: 'Camry', 
      year: '2020',
      results_count: 5
    };
    
    trackVehicleSearch(searchData);
    addLog(`Vehicle search tracked: ${JSON.stringify(searchData)}`);
  };

  const testReportDownload = () => {
    trackReportDownload('Toyota_Camry_2020', 'reliability_report');
    addLog('Report download tracked: Toyota_Camry_2020');
  };

  const testEmailCapture = () => {
    if (email) {
      trackEmailCapture(email, 'newsletter_signup');
      addLog(`Email capture tracked: ${email}`);
      setEmail('');
    }
  };

  const testConversionButton = () => {
    addLog('Conversion button clicked - check console for tracking');
  };

  const testErrorTracking = () => {
    // Intentionally trigger an error for testing
    throw new Error('Test error for analytics tracking');
  };

  const testRouteChange = () => {
    router.push('/search');
    addLog('Route changed to /search - check for page view tracking');
  };

  useEffect(() => {
    addLog('Analytics test page loaded');
  }, []);

  return (
    <Layout title="Analytics Testing">
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>🧪 Analytics & Performance Testing</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <h2>📊 Test Analytics Events</h2>
          <p>Open browser DevTools Console to see tracking events.</p>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button 
              onClick={testVehicleSearch}
              style={{ padding: '10px 15px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}
            >
              Test Vehicle Search
            </button>
            
            <button 
              onClick={testReportDownload}
              style={{ padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px' }}
            >
              Test Report Download
            </button>
            
            <button 
              onClick={testRouteChange}
              style={{ padding: '10px 15px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '5px' }}
            >
              Test Route Change
            </button>
            
            <button 
              onClick={testErrorTracking}
              style={{ padding: '10px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px' }}
            >
              Test Error Tracking
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Email Capture Test</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button 
                onClick={testEmailCapture}
                style={{ padding: '8px 15px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '5px' }}
              >
                Test Email Capture
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Conversion Button Test</h3>
            <ConversionButton
              onClick={testConversionButton}
              conversionAction="test_conversion"
              conversionSource="analytics_test_page"
              variant="primary"
            >
              Test Conversion Tracking
            </ConversionButton>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>🚀 Performance Testing</h2>
          <p>Check browser console for Web Vitals measurements (LCP, FID, CLS, etc.)</p>
          
          <div style={{ padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
            <h4>Expected Web Vitals:</h4>
            <ul>
              <li><strong>LCP</strong> (Largest Contentful Paint): &lt; 2.5s</li>
              <li><strong>FID</strong> (First Input Delay): &lt; 100ms</li>
              <li><strong>CLS</strong> (Cumulative Layout Shift): &lt; 0.1</li>
              <li><strong>FCP</strong> (First Contentful Paint): &lt; 1.8s</li>
              <li><strong>TTFB</strong> (Time to First Byte): &lt; 600ms</li>
            </ul>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>🔍 Debug Information</h2>
          <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', fontSize: '14px' }}>
            <p><strong>Next.js Version:</strong> {process.env.npm_package_version || '13.4.0+'}</p>
            <p><strong>Current Route:</strong> {router.asPath}</p>
            <p><strong>GA ID:</strong> {process.env.NEXT_PUBLIC_GA_ID || 'Not Set'}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>

        <div>
          <h2>📝 Event Log</h2>
          <div style={{ 
            border: '1px solid #ccc', 
            borderRadius: '8px', 
            padding: '15px', 
            backgroundColor: '#f9f9f9',
            maxHeight: '300px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {logs.length === 0 ? (
              <p style={{ color: '#666' }}>No events logged yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '5px' }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
          <h3>💡 Testing Tips</h3>
          <ol>
            <li>Open Browser DevTools (F12) → Console tab</li>
            <li>Click the test buttons above</li>
            <li>Watch for analytics events in console</li>
            <li>Check Network tab for Google Analytics requests</li>
            <li>Use Lighthouse (DevTools → Lighthouse) for performance audit</li>
            <li>Test on different devices/browsers</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}