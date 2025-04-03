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
.button

  .features, .how-it-works {
    margin-bottom: 3rem;
  }

  h2 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2.25rem;
    font-weight: 700;
    color: #333;
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
  }
      `}</style>
    </Layout>
  );
}