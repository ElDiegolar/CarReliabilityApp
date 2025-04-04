// components/PricingPlans.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function PricingPlans() {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, getToken } = useAuth();
  const router = useRouter();

  const plans = [
    {
      name: 'Premium',
      price: 9.99,
      priceId: 'price_1R9oNVCroJxw12Z2DvMMlELN', // Use your actual Stripe price IDs
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
      priceId: 'price_2R9oNVCroJxw12Z2DvMMlELN', // Use your actual Stripe price IDs
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

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      router.push({
        pathname: '/login',
        query: { returnUrl: '/pricing' },
      });
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          priceId: plan.priceId
        })
      });
      
      if (response.status === 401) {
        // Token expired, redirect to login
        router.push({
          pathname: '/login',
          query: { returnUrl: '/pricing' }
        });
        return;
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || data.error);
      }
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(`Something went wrong. Please try again. ${err.message}`);
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