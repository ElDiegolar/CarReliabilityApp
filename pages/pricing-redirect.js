// pages/pricing.js - Redirects to search since all features are now free
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function PricingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/search');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      flexDirection: 'column',
      padding: '2rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)'
    }}>
      <h1>🎉 All Features Now Free!</h1>
      <p>Redirecting you to start analyzing vehicles...</p>
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}