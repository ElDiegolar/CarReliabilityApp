import { useEffect } from 'react';// pages/pricing.js - Redirects to search since all features are now free// pages/pricing.js// pages/pricing.js

import { useRouter } from 'next/router';

import { serverSideTranslations } from 'next-i18next/serverSideTranslations';import { useEffect } from 'react';



export default function PricingPlans() {import { useRouter } from 'next/router';import React, { useEffect } from 'react';import React, { useEffect } from 'react';

  const router = useRouter();

  import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

  useEffect(() => {

    router.push('/search');import { useRouter } from 'next/router';import { useRouter } from 'next/router';

  }, [router]);

export default function PricingPlans() {

  return (

    <div style={{  const router = useRouter();import { serverSideTranslations } from 'next-i18next/serverSideTranslations';import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

      display: 'flex',

      alignItems: 'center',  

      justifyContent: 'center',

      minHeight: '100vh',  // Redirect to search since all features are now free

      textAlign: 'center',

      padding: '2rem',  useEffect(() => {

      background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)'

    }}>    router.push('/search');export default function PricingPlans() {export default function PricingPlans() {

      <div>

        <h1>🎉 All Features Now Free!</h1>  }, [router]);

        <p>Redirecting you to the search page...</p>

      </div>  const router = useRouter();  const router = useRouter();

    </div>

  );  return (

}

    <div style={{    

export async function getServerSideProps({ locale }) {

  return {      display: 'flex',

    props: {

      ...(await serverSideTranslations(locale || 'en', ['common'])),      alignItems: 'center',  // Redirect to search since all features are now free  // Redirect to search since all features are now free

    },

  };      justifyContent: 'center',

}
      minHeight: '100vh',  useEffect(() => {  useEffect(() => {

      textAlign: 'center',

      padding: '2rem',    router.push('/search');    router.push('/search');

      background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)'

    }}>  }, [router]);  }, [router]);

      <div>

        <h1>🎉 All Features Now Free!</h1>

        <p>We're redirecting you to the search page where you can access all features at no cost.</p>

        <p>Redirecting...</p>  return (  return (

      </div>

    </div>    <div style={{    <div style={{

  );

}      display: 'flex',      display: 'flex',



export async function getServerSideProps({ locale }) {      alignItems: 'center',      alignItems: 'center',

  return {

    props: {      justifyContent: 'center',      justifyContent: 'center',

      ...(await serverSideTranslations(locale || 'en', ['common'])),

    },      minHeight: '100vh',      minHeight: '100vh',

  };

}      textAlign: 'center',      textAlign: 'center',

      padding: '2rem'      padding: '2rem'

    }}>    }}>

      <div>      <div>

        <h1>🎉 All Features Now Free!</h1>        <h1>🎉 All Features Now Free!</h1>

        <p>We're redirecting you to the search page where you can access all features at no cost.</p>        <p>We're redirecting you to the search page where you can access all features at no cost.</p>

        <p>Redirecting...</p>        <p>Redirecting...</p>

      </div>      </div>

    </div>    </div>

  );  );

}}



export async function getServerSideProps({ locale }) {export async function getServerSideProps({ locale }) {

  return {      price: 4.99,

    props: {      period: t('pricing.premium.period', 'month'),

      ...(await serverSideTranslations(locale || 'en', ['common'])),      isPopular: true,

    },      features: t('pricing.premium.features', { returnObjects: true }) || [

  };        'Comprehensive reliability scores',

}        'All vehicle systems data',
        'Common issues with repair costs',
        'Priority support',
        'Limited search history',
      ],
      priceId: 'price_1RX0XSCroJxwl2Z2HUQuOEj9',
      badge: t('pricing.premium.badge', 'Most Popular')
    },
    {
      name: t('pricing.professional.title', 'Professional'),
      price: 19.99,
      period: t('pricing.professional.period', 'month'),
      features: t('pricing.professional.features', { returnObjects: true }) || [
        'Everything in Premium',
        'Batch vehicle analysis',
        'Comparison tools',
        'Market value analysis',
        'Dealership integration',
        'Unlimited search history',
        'API access',
        '24/7 priority support',
      ],
      priceId: 'price_1RX0XsCroJxwl2Z2ZpMU6s1V'
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
      const token = getToken();
      
      // Create a checkout session on the server
      const response = await fetch('/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: plan.priceId
        }),
      });
      
      if (response.status === 401) {
        // Handle expired token
        router.push({
          pathname: '/login',
          query: { returnUrl: '/pricing' },
        });
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('errors.checkoutFailed', 'Failed to create checkout session'));
      }
      
      const { sessionId, url } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert(`${t('errors.somethingWentWrong', 'Something went wrong. Please try again.')} ${err.message}`);
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <Layout title={t('pricing.title')}>
      <div className="pricing-container">
        <h1>{t('pricing.title', 'Choose Your Plan')}</h1>
        <p className="pricing-description">{t('pricing.description', 'Access the vehicle reliability data you need with our flexible subscription plans')}</p>
        
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.name} className={`plan-card ${plan.isPopular ? 'popular' : ''}`}>
              {plan.isPopular && <div className="popular-badge">{plan.badge}</div>}
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <span className="currency">$</span>
                <span className="amount">{plan.price}</span>
              </div>
              <div className="plan-period">{t('pricing.per', 'per')} {plan.period}</div>
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
                {loading && selectedPlan === plan.name 
                  ? t('pricing.processing', 'Processing...') 
                  : t('pricing.subscribeNow', 'Subscribe Now')}
              </button>
            </div>
          ))}
        </div>

        <style jsx>{`
          .pricing-container {
            width: 100%;
            margin: 0 auto;
          }
          
          h1 {
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
          
          @media (max-width: 768px) {
            .plans-grid {
              grid-template-columns: 1fr;
              max-width: 400px;
              margin: 0 auto;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}