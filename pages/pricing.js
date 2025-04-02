// components/PricingPlans.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function PricingPlans() {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const plans = [
    {
      name: 'Premium',
      price: 9.99,
      paymentUrl: 'https://buy.stripe.com/test_7sI6qEg7N6601b2289',
      period: 'month',
      isPopular: true,
      features: [
        'Comprehensive reliability scores',
        'All vehicle systems data',
        'Common issues with repair costs',
        'Priority support',
        'Limited search history',
      ],
    },
    {
      name: 'Professional',
      price: 19.99,
      paymentUrl: 'https://buy.stripe.com/test_fZe2ao3l12TO4nebIL',
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
    },
  ];

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      router.push({
        pathname: '/login',
        query: { returnUrl: '/pricing' },
      });
      return;
    }

    setLoading(true);
    try {
      window.location.href = plan.paymentUrl;
    } catch (err) {
      console.error('Redirect error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
