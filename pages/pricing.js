// components/PricingPlans.js - Pricing plans component
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function PricingPlans() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
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
      price: isAnnual ? 49.99 : 4.99,
      priceId: isAnnual ? 'price_premium_annual' : 'price_premium_monthly',
      period: isAnnual ? 'year' : 'month',
      isPopular: true,
      features: [
        'Comprehensive reliability scores',
        'All vehicle systems data',
        'Common issues with repair costs',
        'Unlimited search history',
        'Priority support',
        'Export reports as PDF'
      ]
    },
    {
      name: 'Professional',
      price: isAnnual ? 99.99 : 9.99,
      priceId: isAnnual ? 'price_professional_annual' : 'price_professional_monthly',
      period: isAnnual ? 'year' : 'month',
      features: [
        'Everything in Premium',
        'Batch vehicle analysis',
        'Comparison tools',
        'Market value analysis',
        'Dealership integration',
        'API access',
        '24/7 priority support'
      ]
    }
  ];

  const handleSelectPlan = async (plan) => {
    if (plan.isFree) {
      // Redirect to search page for free plan
      router.push('/search');
      return;
    }
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with returnUrl
      router.push({
        pathname: '/login',
        query: { returnUrl: '/pricing', plan: plan.priceId }
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId: plan.priceId
        })
      });
      
      const data = await response.json();
      
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
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
            {plan.isPopular && (
              <div className="popular-badge">Most Popular</div>
            )}
            
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
      
      <style jsx>{`
        .pricing-container {
          margin: 3rem 0;
        }
        
        .billing-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
        }
        
        .billing-toggle span {
          margin: 0 0.5rem;
          color: #666;
        }
        
        .billing-toggle span.active {
          color: #333;
          font-weight: bold;
        }
        
        .discount {
          display: inline-block;
          background-color: #e5f6ff;
          color: #0070f3;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }
        
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background-color: #0070f3;
        }
        
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .plan-card {
          background-color: #fff;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
        }
        
        .plan-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        
        .plan-card.popular {
          border: 2px solid #0070f3;
          padding-top: 3rem;
        }
        
        .popular-badge {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #0070f3;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: bold;
        }
        
        .plan-name {
          text-align: center;
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }
        
        .plan-price {
          text-align: center;
          font-size: 2.5rem;
          font-weight: bold;
          color: #333;
        }
        
        .currency {
          font-size: 1.5rem;
          vertical-align: top;
          margin-right: 0.25rem;
        }
        
        .free {
          color: #0070f3;
        }
        
        .plan-period {
          text-align: center;
          color: #666;
          margin-bottom: 2rem;
        }
        
        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem;
          flex-grow: 1;
        }
        
        .plan-features li {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .plan-features svg {
          color: #0070f3;
          margin-right: 0.75rem;
          flex-shrink: 0;
        }
        
        .plan-button {
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          background-color: #f5f5f5;
          color: #333;
        }
        
        .plan-button:hover {
          background-color: #eaeaea;
        }
        
        .plan-button.popular {
          background-color: #0070f3;
          color: white;
        }
        
        .plan-button.popular:hover {
          background-color: #0060df;
        }
        
        .plan-button.free {
          background-color: #e5f6ff;
          color: #0070f3;
        }
        
        .plan-button.free:hover {
          background-color: #d1e9ff;
        }
        
        .plan-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .plans-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
    </div>
  );
}