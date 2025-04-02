// components/PricingPlans.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function PricingPlans() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, getToken } = useAuth();
  const router = useRouter();

  const plans = [
    {
      name: 'Basic',
      price: isAnnual ? 0 : 0,
      priceId: 'free',
      period: 'forever',
      isFree: true,
      features: [
        'Basic reliability scores',
        'Engine & transmission data',
        'Limited search history',
        'Standard support'
      ]
    },
    {
      name: 'Premium',
      price: isAnnual ? 99.99 : 9.99,
      priceId: isAnnual ? 'price_premium_annual' : 'price_premium_monthly',
      paymentUrl: isAnnual
        ? 'https://buy.stripe.com/test_7sI6qEg7N6601b2289'
        : 'https://buy.stripe.com/test_7sI6qEg7N6601b2289', // Replace if you have a separate monthly link
      period: isAnnual ? 'year' : 'month',
      isPopular: true,
      features: [
        'Comprehensive reliability scores',
        'All vehicle systems data',
        'Common issues with repair costs',
        'Priority support',
        'Limited search history',
      ]
    },
    {
      name: 'Professional',
      price: isAnnual ? 99.99 : 19.99,
      priceId: isAnnual ? 'price_professional_annual' : 'price_professional_monthly',
      paymentUrl: isAnnual
        ? 'https://buy.stripe.com/test_fZe2ao3l12TO4nebIL'
        : 'https://buy.stripe.com/test_fZe2ao3l12TO4nebIL',
      period: isAnnual ? 'year' : 'month',
      features: [
        'Everything in Premium',
        'Batch vehicle analysis',
        'Comparison tools',
        'Market value analysis',
        'Dealership integration',
        'Unlimited search history',
        'API access',
        '24/7 priority support'
      ]
    }
  ];

  const handleSelectPlan = async (plan) => {
    if (plan.isFree) {
      router.push('/search');
      return;
    }

    if (!isAuthenticated) {
      router.push({
        pathname: '/login',
        query: { returnUrl: '/pricing', plan: plan.priceId }
      });
      return;
    }

    setLoading(true);
    try {
      if (plan.paymentUrl) {
        window.location.href = plan.paymentUrl;
      } else {
        alert('No payment link found for this plan.');
      }
    } catch (err) {
      console.error('Redirect error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pricing-container">
      <div className="billing-toggle">
        <span className={!isAnnual ? 'active' : ''}>Monthly</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={isAnnual}
            onChange={() => setIsAnnual(!isAnnual)}
          />
          <span className="slider"></span>
        </label>
        <span className={isAnnual ? 'active' : ''}>
          Annual <span className="discount">Save 15%</span>
        </span>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`plan-card ${plan.isPopular ? 'popular' : ''}`}
          >
            {plan.isPopular && <div className="popular-badge">Most Popular</div>}

            <h3 className="plan-name">{plan.name}</h3>

            <div className="plan-price">
              {plan.isFree ? (
                <span className="free">Free</span>
              ) : (
                <>
                  <span className="currency">$</span>
                  <span className="amount">{plan.price}</span>
                </>
              )}
            </div>

            <div className="plan-period">
              {!plan.isFree && `per ${plan.period}`}
            </div>

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
              className={`plan-button ${plan.isPopular ? 'popular' : ''} ${plan.isFree ? 'free' : ''}`}
              onClick={() => handleSelectPlan(plan)}
              disabled={loading}
            >
              {loading ? 'Processing...' : plan.isFree ? 'Get Started' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <p>Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
          <p>Token Exists: {getToken() ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
}
