// pages/terms.js
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '../components/Layout';

export default function TermsOfService() {
  const { t } = useTranslation('common');

  return (
    <Layout title={t('legal.termsTitle')}>
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: April 17, 2025</p>
        
        <section>
          <h2>1. Introduction</h2>
          <p>Welcome to CarReliability.com ("we," "our," or "us"). By accessing or using our website, mobile applications, or any other products or services we offer (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms").</p>
          <p>Please read these Terms carefully. They contain important information about your legal rights and obligations. If you do not agree with these Terms, please do not access or use our Services.</p>
        </section>
        
        <section>
          <h2>2. Account Registration</h2>
          <p>To access certain features of our Services, you may need to register for an account. When you register, you agree to provide accurate, current, and complete information and to update this information to maintain its accuracy.</p>
          <p>You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
        </section>
        
        <section>
          <h2>3. Subscription Services</h2>
          <p>Our Services include subscription-based offerings ("Subscriptions"). By purchasing a Subscription, you agree to the following:</p>
          <ul>
            <li>Payment of all applicable fees as described on our website</li>
            <li>Automatic renewal of your Subscription unless canceled at least 24 hours before the end of the current period</li>
            <li>Potential changes to Subscription fees upon renewal, with notice provided at least 30 days in advance</li>
          </ul>
          <p>You may cancel your Subscription at any time through your account settings or by contacting our customer support team.</p>
        </section>
        
        <section>
          <h2>4. Use of Services</h2>
          <p>You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree not to:</p>
          <ul>
            <li>Use the Services in any way that violates applicable laws or regulations</li>
            <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Services</li>
            <li>Attempt to gain unauthorized access to any part of the Services or any systems or networks connected to the Services</li>
            <li>Use automated means to access or collect data from the Services without our prior written consent</li>
            <li>Attempt to interfere with the proper functioning of the Services</li>
          </ul>
        </section>
        
        <section>
          <h2>5. Intellectual Property</h2>
          <p>Our Services and all content, features, and functionality thereof, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, software, and the design, selection, and arrangement thereof, are owned by us, our licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
          <p>You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Services, except as follows:</p>
          <ul>
            <li>Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials</li>
            <li>You may store files that are automatically cached by your Web browser for display enhancement purposes</li>
            <li>You may print or download one copy of a reasonable number of pages of the website for your own personal, non-commercial use and not for further reproduction, publication, or distribution</li>
          </ul>
        </section>
        
        <section>
          <h2>6. User Content</h2>
          <p>Our Services may allow you to post, submit, publish, display, or transmit content or materials (collectively, "User Content"). By providing any User Content, you grant us and our affiliates and service providers a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, perform, and display such User Content throughout the world in any media.</p>
          <p>You represent and warrant that:</p>
          <ul>
            <li>You own or control all rights in and to the User Content you provide</li>
            <li>All User Content you provide complies with these Terms</li>
            <li>User Content does not violate the rights of any third party</li>
          </ul>
        </section>
        
        <section>
          <h2>7. Disclaimer of Warranties</h2>
          <p>YOUR USE OF OUR SERVICES IS AT YOUR SOLE RISK. THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</p>
          <p>WE SPECIFICALLY DISCLAIM ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT OUR SERVICES WILL MEET YOUR REQUIREMENTS, THAT THEY WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT ANY DEFECTS WILL BE CORRECTED.</p>
          <p>INFORMATION OBTAINED THROUGH OUR SERVICES REGARDING VEHICLE RELIABILITY IS FOR INFORMATIONAL PURPOSES ONLY AND SHOULD NOT BE RELIED UPON AS THE SOLE BASIS FOR MAKING DECISIONS ABOUT VEHICLE PURCHASES, REPAIRS, OR MAINTENANCE. ALWAYS CONSULT A QUALIFIED MECHANIC OR AUTOMOTIVE PROFESSIONAL.</p>
        </section>
        
        <section>
          <h2>8. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:</p>
          <ul>
            <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES</li>
            <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES</li>
            <li>ANY CONTENT OBTAINED FROM THE SERVICES</li>
            <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
          </ul>
          <p>OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF THE SERVICES SHALL NOT EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR ACCESSING OUR SERVICES DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE DATE OF THE CLAIM.</p>
        </section>
        
        <section>
          <h2>9. Indemnification</h2>
          <p>You agree to defend, indemnify, and hold harmless us, our affiliates, licensors, and service providers, and our and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Services.</p>
        </section>
        
        <section>
          <h2>10. Termination</h2>
          <p>We may terminate or suspend your account and access to our Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.</p>
          <p>Upon termination, your right to use the Services will immediately cease. If you wish to terminate your account, you may simply discontinue using the Services, or you may contact us to request account deletion.</p>
        </section>
        
        <section>
          <h2>11. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. If we make material changes to these Terms, we will provide notice through our Services, or by other means, to provide you the opportunity to review the changes before they become effective.</p>
          <p>Your continued use of our Services after we publish or send a notice about our changes to these Terms means that you consent to the updated Terms.</p>
        </section>
        
        <section>
          <h2>12. Governing Law</h2>
          <p>These Terms and your use of the Services shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any choice or conflict of law provision or rule.</p>
        </section>
        
        <section>
          <h2>13. Dispute Resolution</h2>
          <p>Any dispute arising from or relating to these Terms or your use of the Services shall be resolved through binding arbitration in accordance with the American Arbitration Association's rules. The arbitration will be conducted in San Francisco, California, unless you and we both agree to another location.</p>
          <p>Nothing in this section shall prevent either party from seeking injunctive or other equitable relief from the courts for matters related to data security, intellectual property, or unauthorized access to the Services.</p>
        </section>
        
        <section>
          <h2>14. Entire Agreement</h2>
          <p>These Terms, together with our Privacy Policy and any other legal notices published by us on the Services, shall constitute the entire agreement between you and us concerning the Services.</p>
        </section>
        
        <section>
          <h2>15. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>CarReliability.com<br />
          legal@carreliability.com<br />
          123 Auto Plaza Drive<br />
          San Francisco, CA 94105</p>
        </section>
        
        <div className="related-links">
          <Link href="/privacy" className="legal-link">
            View our Privacy Policy
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