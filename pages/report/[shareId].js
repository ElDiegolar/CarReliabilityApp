// pages/report/[shareId].js - Public shared report view
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import RevCounterGauge from '../../components/RevCounterGauge';
import CarTimeline from '../../components/CarTimeline';
import DownloadPdfButton from '../../components/DownloadPdfButton';

export default function SharedReport() {
  const router = useRouter();
  const { shareId } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (!shareId) return;

    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/get-shared?shareId=${shareId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Report not found or has expired');
          } else {
            setError('Failed to load report');
          }
          return;
        }

        const data = await response.json();
        setReportData(data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [shareId]);

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading report...</p>
        </div>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            gap: 1rem;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #0070f3;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Layout>
    );
  }

  if (error || !reportData) {
    return (
      <Layout>
        <SEO title="Report Not Found" />
        <div className="error-container">
          <h1>😕 {error || 'Report not found'}</h1>
          <p>This report may have expired or the link is invalid.</p>
          <Link href="/" className="home-btn">
            Go to Homepage
          </Link>
        </div>
        <style jsx>{`
          .error-container {
            text-align: center;
            padding: 4rem 2rem;
            max-width: 600px;
            margin: 0 auto;
          }
          .error-container h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #333;
          }
          .error-container p {
            color: #666;
            margin-bottom: 2rem;
          }
          .home-btn {
            display: inline-block;
            padding: 0.75rem 2rem;
            background: #0070f3;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.2s;
          }
          .home-btn:hover {
            background: #005fc2;
          }
        `}</style>
      </Layout>
    );
  }

  const reportType = reportData.report_type || 'vehicle';
  const { year, make, model, mileage, category, product_data, reliability_data, specifications_data, timeline_data } = reportData;
  const overallScore = reliability_data?.overallScore || 0;
  
  // Generate title based on report type
  const reportTitle = reportType === 'vehicle' 
    ? `${year} ${make} ${model}`
    : `${product_data?.brand || ''} ${product_data?.model || 'Product'}`;

  return (
    <Layout>
      <SEO 
        title={`${reportTitle} Reliability Report`}
        description={`Detailed reliability report for ${reportTitle}. Overall reliability score: ${overallScore}/100`}
      />

      <div className="shared-report-container">
        <div className="report-header">
          <div className="shared-badge">📊 Shared Report</div>
          <h1>{reportTitle}</h1>
          {reportType === 'vehicle' && mileage && (
            <p className="mileage">Mileage: {parseInt(mileage).toLocaleString()} miles</p>
          )}
          {reportType === 'product' && category && (
            <p className="mileage">Category: {category}</p>
          )}
          <div style={{ marginTop: '1rem' }}>
            <DownloadPdfButton
              reportType={reportType}
              vehicleData={reportType === 'vehicle' ? reliability_data : undefined}
              searchParams={reportType === 'vehicle' ? { year, make, model, mileage } : undefined}
              category={reportType === 'product' ? category : undefined}
              productData={reportType === 'product' ? product_data : undefined}
              reliabilityData={reportType === 'product' ? reliability_data : undefined}
              specifications={specifications_data}
              timelineData={timeline_data}
            />
          </div>
        </div>

        <div className="overall-score-section">
          <h2>Overall Reliability Score</h2>
          <RevCounterGauge score={overallScore} />
          {reliability_data?.overallAnalysis && (
            <div className="analysis-text">
              <p>{reliability_data.overallAnalysis}</p>
            </div>
          )}
        </div>

        {reliability_data?.categoryScores && (
          <div className="category-scores">
            <h2>Category Breakdown</h2>
            <div className="categories-grid">
              {Object.entries(reliability_data.categoryScores).map(([category, score]) => (
                <div key={category} className="category-card">
                  <h3>{category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}</h3>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${score}%` }}></div>
                  </div>
                  <p className="score-value">{score}/100</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {reliability_data?.commonIssues && reliability_data.commonIssues.length > 0 && (
          <div className="common-issues">
            <h2>Common Issues</h2>
            <div className="issues-list">
              {reliability_data.commonIssues.map((issue, index) => (
                <div key={index} className="issue-card">
                  <h3>{issue.issue}</h3>
                  <div className="issue-details">
                    {issue.costToFix && <span className="detail">💰 {issue.costToFix}</span>}
                    {issue.occurrence && <span className="detail">📊 {issue.occurrence}</span>}
                    {issue.typicalMileage && <span className="detail">🔧 {issue.typicalMileage}</span>}
                  </div>
                  {issue.description && <p className="issue-description">{issue.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {timeline_data && timeline_data.length > 0 && (
          <div className="timeline-section">
            <h2>{reportType === 'vehicle' ? 'Vehicle Timeline' : 'Product Timeline'}</h2>
            <CarTimeline timelineData={timeline_data} />
          </div>
        )}

        {specifications_data && (
          <div className="specifications">
            <h2>Specifications</h2>
            <div className="specs-grid">
              {Object.entries(specifications_data).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="cta-section">
          <h3>{reportType === 'vehicle' ? 'Get Your Own Vehicle Report' : 'Get Your Own Product Report'}</h3>
          <p>Check the reliability of any {reportType === 'vehicle' ? 'vehicle' : 'product'} with Lemnaed</p>
          <Link href={reportType === 'vehicle' ? '/search' : '/product-search'} className="cta-btn">
            Check Another {reportType === 'vehicle' ? 'Vehicle' : 'Product'}
          </Link>
        </div>
      </div>

      <style jsx>{`
        .shared-report-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .report-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .shared-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: #f0f9ff;
          color: #0070f3;
          border-radius: 20px;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .report-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .mileage {
          font-size: 1.1rem;
          color: #666;
        }

        .overall-score-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
          text-align: center;
        }

        .overall-score-section h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .analysis-text {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .analysis-text p {
          color: #666;
          line-height: 1.6;
        }

        .category-scores,
        .common-issues,
        .timeline-section,
        .specifications {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }

        .category-scores h2,
        .common-issues h2,
        .timeline-section h2,
        .specifications h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .category-card {
          padding: 1.5rem;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .category-card h3 {
          margin-bottom: 1rem;
          font-size: 1.1rem;
          color: #333;
        }

        .score-bar {
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff5e62, #ff9800, #4caf50);
          transition: width 0.3s ease;
        }

        .score-value {
          font-weight: 600;
          color: #666;
        }

        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .issue-card {
          padding: 1.5rem;
          background: #f9f9f9;
          border-radius: 8px;
          border-left: 4px solid #ff9800;
        }

        .issue-card h3 {
          margin-bottom: 0.75rem;
          color: #333;
        }

        .issue-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .detail {
          font-size: 0.9rem;
          color: #666;
        }

        .issue-description {
          color: #666;
          line-height: 1.6;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .spec-item {
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .spec-item strong {
          color: #333;
          font-size: 0.9rem;
        }

        .spec-item span {
          color: #666;
        }

        .cta-section {
          text-align: center;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, #0284c7 0%, #075985 100%);
          border-radius: 12px;
          color: white;
        }

        .cta-section h3 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .cta-section p {
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .cta-btn {
          display: inline-block;
          padding: 1rem 2rem;
          background: white;
          color: #0070f3;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .report-header h1 {
            font-size: 1.75rem;
          }

          .categories-grid,
          .specs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}
