// pages/index.js - Home page component
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="hero">
        <h1>Get Reliable Information About Your Vehicle</h1>
        <p className="description">
          Detailed vehicle reliability data, common issues, and expert analysis.
        </p>
        <div className="action-buttons">
          <Link href="/search" className="button primary">
            Search a Vehicle
          </Link>
          <Link href="/login" className="button secondary">
            Sign Up for Premium
          </Link>
        </div>
      </div>

      <div className="features">
        <h2>Our Features</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Reliability Scores</h3>
            <p>Get comprehensive reliability scores for engines, transmissions, electrical systems, and more.</p>
          </div>
          <div className="feature-card">
            <h3>Common Issues</h3>
            <p>Learn about common problems, estimated repair costs, and when they typically occur.</p>
          </div>
          <div className="feature-card">
            <h3>Expert Analysis</h3>
            <p>Access detailed AI-powered analysis of each vehicle's reliability compared to similar models.</p>
          </div>
          <div className="feature-card">
            <h3>Premium Data</h3>
            <p>Subscribe for in-depth reports, recall information, and detailed reliability insights.</p>
          </div>
        </div>
      </div>

      <div className="pricing-section">
        <h2>Choose Your Plan</h2>
        <p className="pricing-description">Access the vehicle reliability data you need with our flexible subscription plans</p>
        
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Free</h3>
              <div className="price">$0</div>
              <div className="price-period">forever</div>
            </div>
            <ul className="pricing-features">
              <li>Basic reliability scores</li>
              <li>Engine & transmission data</li>
              <li>Limited vehicle searches</li>
              <li>Basic analysis</li>
            </ul>
            <div className="pricing-action">
              <Link href="/search" className="pricing-button free">
                Try Now
              </Link>
            </div>
          </div>
          
          <div className="pricing-card popular">
            <div className="popular-badge">Most Popular</div>
            <div className="pricing-header">
              <h3>Premium</h3>
              <div className="price">$9.99</div>
              <div className="price-period">per month</div>
            </div>
            <ul className="pricing-features">
              <li>Comprehensive reliability scores</li>
              <li>All vehicle systems data</li>
              <li>Common issues with repair costs</li>
              <li>10 saved search history</li>
              <li>Detailed AI analysis</li>
              <li>Priority support</li>
            </ul>
            <div className="pricing-action">
              <Link href="/pricing" className="pricing-button premium">
                Subscribe Now
              </Link>
            </div>
          </div>
          
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Professional</h3>
              <div className="price">$19.99</div>
              <div className="price-period">per month</div>
            </div>
            <ul className="pricing-features">
              <li>Everything in Premium</li>
              <li>Unlimited search history</li>
              <li>Batch vehicle analysis</li>
              <li>Market value analysis</li>
              <li>Dealership integration</li>
              <li>API access</li>
              <li>24/7 priority support</li>
            </ul>
            <div className="pricing-action">
              <Link href="/pricing" className="pricing-button pro">
                Get Professional
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Enter Vehicle Details</h3>
            <p>Provide the year, make, model, and mileage of the vehicle you want to research.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Get Instant Results</h3>
            <p>Our AI analyzes data from multiple sources to provide accurate reliability information.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Make Informed Decisions</h3>
            <p>Use the reliability data to make better decisions about buying, selling, or maintaining vehicles.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero {
          text-align: center;
          padding: 3rem 1rem;
          background: linear-gradient(135deg, #0070f3, #00c6ff);
          color: white;
          border-radius: 12px;
          margin-bottom: 3rem;
          box-shadow: 0 10px 30px rgba(0, 112, 243, 0.2);
        }

        h1 {
          font-size: 2.75rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .description {
          font-size: 1.3rem;
          color: #e0f7ff;
          margin-bottom: 2rem;
        }

        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .button {
          display: inline-block;
          padding: 0.9rem 1.8rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s;
          text-decoration: none;
        }

        .button.primary {
          background-color: white;
          color: #0070f3;
          box-shadow: 0 4px 14px rgba(255, 255, 255, 0.4);
        }

        .button.primary:hover {
          background-color: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
        }

        .button.secondary {
          background-color: transparent;
          color: white;
          border: 2px solid white;
        }

        .button.secondary:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .features, .how-it-works, .pricing-section {
          margin-bottom: 5rem;
        }

        h2 {
          text-align: center;
          margin-bottom: 1rem;
          font-size: 2.25rem;
          font-weight: 700;
          color: #333;
        }

        .pricing-description {
          text-align: center;
          color: #666;
          margin-bottom: 3rem;
          font-size: 1.2rem;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
        }

        .feature-card h3 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: #0070f3;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin: 0 auto;
          max-width: 1200px;
        }

        .pricing-card {
          background-color: white;
          border-radius: 12px;
          padding: 2rem;
          position: relative;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #eaeaea;
        }

        .pricing-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
        }

        .pricing-card.popular {
          border-color: #0070f3;
          box-shadow: 0 8px 30px rgba(0, 112, 243, 0.2);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #0070f3;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 20px;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #eaeaea;
        }

        .pricing-header h3 {
          font-weight: 700;
          color: #333;
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .price {
          font-size: 3rem;
          font-weight: 700;
          color: #0070f3;
        }

        .price-period {
          color: #666;
          font-size: 1rem;
        }

        .pricing-features {
          list-style-type: none;
          padding: 0;
          margin: 0 0 2rem;
          flex-grow: 1;
        }

        .pricing-features li {
          padding: 0.6rem 0;
          position: relative;
          padding-left: 1.8rem;
          color: #444;
        }

        .pricing-features li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #0070f3;
          font-weight: bold;
        }

        .pricing-action {
          margin-top: auto;
        }

        .pricing-button {
          display: block;
          text-align: center;
          padding: 0.9rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.3s;
          text-decoration: none;
          width: 100%;
        }

        .pricing-button.free {
          background-color: #e0e0e0;
          color: #444;
        }

        .pricing-button.free:hover {
          background-color: #d0d0d0;
        }

        .pricing-button.premium {
          background-color: #0070f3;
          color: white;
        }

        .pricing-button.premium:hover {
          background-color: #0060df;
        }

        .pricing-button.pro {
          background-color: #333;
          color: white;
        }

        .pricing-button.pro:hover {
          background-color: #222;
        }

        .steps {
          display: flex;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .step {
          flex: 1;
          min-width: 250px;
          text-align: center;
          padding: 2rem;
          border-radius: 12px;
          background-color: #f0f8ff;
          box-shadow: 0 6px 16px rgba(0, 112, 243, 0.07);
        }

        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, #00c6ff, #0070f3);
          color: white;
          border-radius: 50%;
          font-size: 1.4rem;
          font-weight: bold;
          margin: 0 auto 1rem;
        }

        .step h3 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: #0070f3;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .steps {
            flex-direction: column;
          }

          .step {
            width: 100%;
          }
          
          .pricing-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
          }
          
          .pricing-card.popular {
            order: -1;
          }
        }
      `}</style>
    </Layout>
  );
}