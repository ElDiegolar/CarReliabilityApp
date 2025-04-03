// components/PricingPlans.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function PricingPlans() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const plans = [
    {
      name: 'Premium',
      price: 9.99,
      period: 'month',
      isPopular: true,
      features: [
        'Comprehensive reliability scores',
        'All vehicle systems data',
        'Common issues with repair costs',
        'Priority support',
        'Limited search history',
      ],
      priceId: 'price_1R9oOTCroJxwl2Z2BZAL2z8B',
    },
    {
      name: 'Professional',
      price: 19.99,
      period: 'month',
      features: [
        'Everything in Premium',
        'Batch vehicle analysis',
        'Comparison tools',
        'Market value analysis',
        'Dealership integration',
        'Unlimited search history',
        'API access',
        '24/7 priority support',
      ],
      priceId: 'price_1R9oNVCroJxwl2Z2DvMMLELN' ,
    },
  ];

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      router.push({
        pathname: '/login',
        query: { returnUrl: '/pricing' },
      });
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.name);
    
    try {
      // Create a checkout session on the server
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const { sessionId, url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="pricing-container">
      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.name} className={`plan-card ${plan.isPopular ? 'popular' : ''}`}>
            {plan.isPopular && <div className="popular-badge">Most Popular</div>}
            <h3 className="plan-name">{plan.name}</h3>
            <div className="plan-price">
              <span className="currency">$</span>
              <span className="amount">{plan.price}</span>
            </div>
            <div className="plan-period">per {plan.period}</div>
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`plan-button ${plan.isPopular ? 'popular' : ''}`}
              onClick={() => handleSelectPlan(plan)}
              disabled={loading}
            >
              {loading && selectedPlan === plan.name ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .pricing-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .plan-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          position: relative;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .plan-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .plan-card.popular {
          border: 2px solid #0070f3;
          box-shadow: 0 5px 15px rgba(0, 112, 243, 0.1);
        }
        
        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #0070f3;
          color: white;
          padding: 0.25rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .plan-name {
          text-align: center;
          font-size: 1.5rem;
          margin: 0.5rem 0 1.5rem;
        }
        
        .plan-price {
          text-align: center;
          margin-bottom: 0.25rem;
        }
        
        .currency {
          font-size: 1.25rem;
          vertical-align: top;
          position: relative;
          top: 0.5rem;
        }
        
        .amount {
          font-size: 3rem;
          font-weight: 700;
        }
        
        .plan-period {
          text-align: center;
          color: #666;
          margin-bottom: 1.5rem;
        }
        
        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem;
        }
        
        .plan-features li {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        
        .plan-features svg {
          flex-shrink: 0;
          color: #0070f3;
          margin-right: 0.75rem;
        }
        
        .plan-button {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 4px;
          background-color: #f5f5f5;
          color: #333;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .plan-button:hover {
          background-color: #e5e5e5;
        }
        
        .plan-button.popular {
          background-color: #0070f3;
          color: white;
        }
        
        .plan-button.popular:hover {
          background-color: #0060df;
        }
        
        .plan-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}