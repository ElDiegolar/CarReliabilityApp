// pages/privacy.js
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '../components/Layout';

export default function PrivacyPolicy() {
  const { t } = useTranslation('common');

  return (
    <Layout title={t('legal.privacyTitle')}>
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: April 17, 2025</p>
        
        <section className="intro">
          <p>At CarReliability.com ("we," "our," or "us"), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
          <p>Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.</p>
        </section>
        
        <section>
          <h2>1. Information We Collect</h2>
          
          <h3>1.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us when you:</p>
          <ul>
            <li>Register for an account</li>
            <li>Subscribe to our services</li>
            <li>Request information</li>
            <li>Participate in surveys or promotions</li>
            <li>Contact our customer support</li>
          </ul>
          <p>The personal information we collect may include:</p>
          <ul>
            <li>Contact information (such as name, email address)</li>
            <li>Account credentials (such as password)</li>
            <li>Payment information (such as credit card details)</li>
            <li>Demographic information (such as your location)</li>
            <li>Preferences and vehicle information you provide</li>
          </ul>
          
          <h3>1.2 Usage Information</h3>
          <p>We automatically collect certain information about your device and how you interact with our services, including:</p>
          <ul>
            <li>IP address and device identifiers</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Referring website</li>
            <li>Pages you view and how you navigate our website</li>
            <li>Time spent on pages</li>
            <li>Search queries and vehicles you look up</li>
            <li>Date and time of your visit</li>
          </ul>
        </section>
        
        <section>
          <h2>2. How We Collect Information</h2>
          
          <h3>2.1 Direct Collection</h3>
          <p>We collect information directly from you when you provide it to us through forms, account creation, subscriptions, or communications with us.</p>
          
          <h3>2.2 Automated Collection</h3>
          <p>We use cookies, web beacons, and similar technologies to automatically collect information about your browsing activities. These technologies help us personalize your experience, analyze website traffic, and improve our services.</p>
          <p>You can set your browser to refuse all or some browser cookies or to alert you when cookies are being sent. However, if you disable or refuse cookies, some parts of our service may be inaccessible or not function properly.</p>
          
          <h3>2.3 Information from Third Parties</h3>
          <p>We may receive information about you from third parties, such as business partners, advertising networks, analytics providers, and search information providers. We may combine this information with the information we collect directly from you.</p>
        </section>
        
        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We may use the information we collect for various purposes, including to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and manage your account</li>
            <li>Personalize your experience and deliver content relevant to your interests</li>
            <li>Send you technical notices, updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Communicate with you about products, services, offers, and promotions</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>
        
        <section>
          <h2>4. How We Share Your Information</h2>
          <p>We may share your information in the following circumstances:</p>
          
          <h3>4.1 Service Providers</h3>
          <p>We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf, such as payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</p>
          
          <h3>4.2 Business Transfers</h3>
          <p>If we are involved in a merger, acquisition, financing, reorganization, bankruptcy, or sale of company assets, your information may be transferred as part of that transaction.</p>
          
          <h3>4.3 Legal Requirements</h3>
          <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).</p>
          
          <h3>4.4 Protection of Rights</h3>
          <p>We may disclose your information to protect and defend the rights, property, or safety of us, our users, or third parties.</p>
          
          <h3>4.5 With Your Consent</h3>
          <p>We may share your information with third parties when we have your consent to do so.</p>
        </section>
        
        <section>
          <h2>5. Data Security</h2>
          <p>We have implemented appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
          <p>We regularly review our security procedures and consider appropriate new security technology and methods. However, despite our efforts, no security measures are perfect or impenetrable.</p>
        </section>
        
        <section>
          <h2>6. Data Retention</h2>
          <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need to use your information, we will remove it from our systems or anonymize it so that it can no longer be associated with you.</p>
        </section>
        
        <section>
          <h2>7. Children's Privacy</h2>
          <p>Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us. If we become aware that we have collected personal information from a child under 13 without verification of parental consent, we will take steps to remove that information from our servers.</p>
        </section>
        
        <section>
          <h2>8. Your Privacy Rights</h2>
          
          <h3>8.1 Access and Control</h3>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul>
            <li>The right to access your personal information</li>
            <li>The right to correct inaccurate or incomplete information</li>
            <li>The right to request deletion of your personal information</li>
            <li>The right to restrict or object to processing of your personal information</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          <p>To exercise these rights, please contact us using the information provided in the "Contact Us" section below.</p>
          
          <h3>8.2 California Privacy Rights</h3>
          <p>If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA) and the California Online Privacy Protection Act (CalOPPA). These include the right to request disclosure of the categories and specific pieces of personal information we have collected about you, the right to request deletion of your personal information, and the right to opt-out of the sale of your personal information.</p>
          <p>We do not sell personal information as defined by the CCPA. However, we may share personal information with third parties for business purposes.</p>
          
          <h3>8.3 Do Not Track Signals</h3>
          <p>We currently do not respond to "Do Not Track" signals or similar mechanisms that preference signals from your browser.</p>
        </section>
        
        <section>
          <h2>9. Third-Party Links</h2>
          <p>Our services may contain links to third-party websites, services, or content that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You should review the privacy policies of these third parties.</p>
        </section>
        
        <section>
          <h2>10. International Data Transfers</h2>
          <p>Your information may be transferred to, and processed in, countries other than the country in which you reside. These countries may have data protection laws that are different from the laws of your country. By using our services, you consent to the transfer of your information to countries outside your country of residence, including the United States.</p>
          <p>If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we comply with applicable data protection laws when transferring your personal information outside these areas.</p>
        </section>
        
        <section>
          <h2>11. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. If we make material changes, we will notify you by revising the "Last Updated" date at the top of this Privacy Policy, and in some cases, we may provide additional notice (such as adding a statement to our website or sending you a notification).</p>
          <p>Your continued use of our services after the revised Privacy Policy has become effective indicates that you have read, understood, and agreed to the current version of this Privacy Policy.</p>
        </section>
        
        <section>
          <h2>12. Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:</p>
          <p>CarReliability.com<br />
          privacy@carreliability.com<br />
          123 Auto Plaza Drive<br />
          San Francisco, CA 94105</p>
        </section>
        
        <div className="related-links">
          <Link href="/terms" className="legal-link">
            View our Terms of Service
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .legal-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .last-updated {
          color: #666;
          font-style: italic;
          margin-bottom: 2rem;
        }
        
        section {
          margin-bottom: 2rem;
        }
        
        h2 {
          font-size: 1.5rem;
          color: #0070f3;
          margin-top: 0;
          margin-bottom: 1rem;
        }
        
        h3 {
          font-size: 1.2rem;
          color: #333;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        ul {
          margin-bottom: 1rem;
          padding-left: 2rem;
        }
        
        ul li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }
        
        .related-links {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eaeaea;
        }
        
        .legal-link {
          display: inline-block;
          color: #0070f3;
          text-decoration: none;
          font-weight: 500;
        }
        
        .legal-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
}