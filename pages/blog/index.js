// pages/blog/index.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '../../components/Layout';

// Sample blog posts data - in a real application, this would come from an API or CMS
const BLOG_POSTS = [
  {
    id: '5-most-reliable-used-cars-under-10k-malta-2025',
    title: '5 Most Reliable Used Cars Under €10k in Malta (2025 Edition)',
    excerpt: 'Discover the most reliable used cars under €10,000 in Malta for 2025. Expert analysis of Toyota, Honda, Mazda and other dependable vehicles.',
    date: '2025-01-15',
    author: 'Lemnaed Team',
    category: 'Car Buying Guide',
    image: '/images/blog/reliable-cars-malta-2025.jpg',
    readTime: '8 min read',
    slug: '5-most-reliable-used-cars-under-10k-malta-2025'
  },
  {
    id: 'how-to-avoid-lemon-used-car-buying-malta',
    title: 'How to Avoid Buying a Lemon When Purchasing a Used Car in Malta',
    excerpt: 'Complete guide to avoiding lemon cars in Malta. Learn the warning signs, inspection tips, and red flags when buying used cars.',
    date: '2025-01-20',
    author: 'Lemnaed Team',
    category: 'Car Buying Guide',
    image: '/images/blog/avoid-lemon-cars-malta.jpg',
    readTime: '12 min read',
    slug: 'how-to-avoid-lemon-used-car-buying-malta'
  },
  {
    id: 'understanding-reliability-scores',
    title: 'Understanding Lemnaed Reliability Scores - Complete Guide',
    excerpt: 'Learn what reliability scores really mean and how they can help you make better car-buying decisions in Malta.',
    date: '2025-01-10',
    author: 'Emma Rodriguez',
    category: 'Car Analysis',
    image: '/images/blog/blog1.png',
    readTime: '6 min read',
    content: `
      <h2>What Do Lemnaed Scores Really Mean?</h2>
      <p>When you're searching for your next vehicle, reliability scores can be one of the most important factors in your decision-making process. But what exactly do these numbers mean, and how are they calculated?</p>
      
      <h3>How Reliability Scores Are Calculated</h3>
      <p>Lemnaed scores are comprehensive assessments that incorporate multiple data points across various vehicle systems. At Lemnaed, our reliability algorithm analyzes:</p>
      <ul>
        <li>Historical maintenance records from thousands of vehicles</li>
        <li>Reported problems from certified mechanics</li>
        <li>Recall information and technical service bulletins</li>
        <li>Owner-reported issues across major forums and databases</li>
        <li>Parts replacement frequency data</li>
      </ul>
      
      <p>Unlike simple star ratings, our 100-point scoring system provides nuanced insights into exactly how dependable a vehicle will be throughout its lifetime. A score above 85 indicates exceptional reliability, while scores below 60 suggest caution may be warranted.</p>
      
      <h3>Breaking Down Category Scores</h3>
      <p>Beyond the overall reliability score, understanding the category breakdowns can help you identify potential weaknesses in specific vehicle systems:</p>
      <ul>
        <li><strong>Engine (30% weight)</strong>: The heart of your vehicle and typically the most expensive to repair</li>
        <li><strong>Transmission (25% weight)</strong>: Critical for power delivery and often costly to replace</li>
        <li><strong>Electrical System (15% weight)</strong>: Controls everything from entertainment to essential safety functions</li>
        <li><strong>Brakes (10% weight)</strong>: A critical safety system where failures can be dangerous</li>
        <li><strong>Suspension (10% weight)</strong>: Affects comfort, handling, and long-term structural integrity</li>
        <li><strong>Fuel System (10% weight)</strong>: Impacts both safety and efficiency</li>
      </ul>
      
      <p>By examining these individual scores, you can make more informed decisions based on what matters most to you. For example, if you're primarily concerned about avoiding expensive repairs, paying close attention to engine and transmission scores would be wise.</p>
      
      <h3>How to Use Reliability Data in Your Car Search</h3>
      <p>When comparing vehicles, remember that reliability scores should be just one part of your decision-making process alongside:</p>
      <ol>
        <li>Your specific driving needs and conditions</li>
        <li>Available features and technologies</li>
        <li>Budget constraints for both purchase and maintenance</li>
        <li>Personal preferences for style, comfort, and driving experience</li>
      </ol>
      
      <p>Our premium reliability reports provide additional context by estimating the likely repair costs and maintenance schedules for specific issues, giving you a clearer picture of the total cost of ownership beyond the purchase price.</p>
    `
  },
  {
    id: 'vehicle-evolution-timeline',
    title: 'The Timeline of Vehicle Evolution - What Every Buyer Should Know',
    excerpt: 'Discover why understanding a vehicle\'s generation and design history is crucial for making smart purchase decisions.',
    date: '2025-04-22',
    author: 'Marcus Chen',
    category: 'Reliability Research',
    image: '/images/blog/blog2.webp',
    readTime: '8 min read',
    content: `
      <h2>Understanding Vehicle Generations and Design Changes</h2>
      <p>When researching a specific car model, understanding its design history and evolution can provide valuable insights into its current reliability. Vehicle generations aren't just about aesthetic changes—they often represent significant engineering improvements or occasional steps backward.</p>
      
      <h3>Why Vehicle Timelines Matter</h3>
      <p>Every car model evolves through generations, with each iteration bringing design changes, engineering modifications, and new features. These changes can dramatically impact reliability in ways that aren't immediately obvious:</p>
      <ul>
        <li><strong>Engineering Improvements</strong>: Manufacturers often address known problems with each new generation</li>
        <li><strong>Platform Changes</strong>: Moving to new underlying platforms can introduce or resolve reliability issues</li>
        <li><strong>Technology Integration</strong>: New technologies may improve performance but can sometimes decrease reliability during initial implementation</li>
        <li><strong>Manufacturing Process Changes</strong>: Shifts in production methods or facilities can affect build quality</li>
      </ul>
      
      <p>At Lemnaed, our premium timeline feature traces the full engineering history of your vehicle, identifying the critical changes that impact long-term reliability.</p>
      
      <h3>The Most Critical Vehicle Generation Changes</h3>
      <p>Some generation changes bring dramatic improvements in reliability, while others introduce new problems. Here are examples of significant generation changes that substantially affected reliability:</p>
      <ol>
        <li><strong>Toyota Camry (2006 to 2007)</strong>: The transition from the fifth to sixth generation brought dramatically improved electrical system reliability, resolving previous issues with the electronic control module.</li>
        <li><strong>Ford F-150 (2004 to 2005)</strong>: The introduction of the 11th generation addressed transmission issues that had plagued earlier models, significantly improving drivetrain durability.</li>
        <li><strong>Honda Accord (2002 to 2003)</strong>: The seventh generation introduced new automatic transmission designs that unfortunately experienced higher failure rates than previous generations.</li>
      </ol>
      
      <p>Understanding where a particular model year sits within its generation cycle can help you make smarter buying decisions—especially with used vehicles.</p>
      
      <h3>Using Timeline Data for Smarter Purchases</h3>
      <p>When evaluating a potential purchase:</p>
      <ul>
        <li><strong>Check for recent redesigns</strong>: Vehicles in the first year of a new generation often have more issues as manufacturers work out design flaws</li>
        <li><strong>Look for mid-cycle refreshes</strong>: These minor updates often include fixes for known problems without complete redesigns</li>
        <li><strong>Research specific engineering changes</strong>: Some seemingly minor updates (like revised cooling systems or updated engine management software) can dramatically improve reliability</li>
        <li><strong>Consider end-of-generation models</strong>: The final years of a generation often have most issues resolved while maintaining older, proven technology</li>
      </ul>
      
      <p>Our premium timeline feature allows you to see exactly where any vehicle sits in its evolutionary cycle and what critical changes impact the specific model year you're considering.</p>
    `
  },
  {
    id: 'decoding-common-issues',
    title: 'Decoding Common Issues - What the Check Engine Light Is Really Telling You',
    excerpt: 'Go beyond warning lights to understand vehicle problem patterns and prevent costly repairs.',
    date: '2025-04-15',
    author: 'Sophia Williams',
    category: 'Car Maintenance',
    image: '/images/blog/blog2.png',
    readTime: '7 min read',
    content: `
      <h2>Beyond the Warning Light: Understanding Vehicle Problem Patterns</h2>
      <p>That dreaded check engine light can mean anything from a loose gas cap to an imminent major failure. Understanding the common patterns of vehicle issues can help you make better-informed decisions when buying, maintaining, or repairing your car.</p>
      
      <h3>The Most Common Issues by Vehicle System</h3>
      <p>Our database of millions of vehicle reliability reports has identified clear patterns in how problems typically manifest across different vehicle systems:</p>
      
      <h4>Engine Issues:</h4>
      <ul>
        <li><strong>Early Warning Signs</strong>: Rough idling, decreased fuel economy, unusual noises, or hesitation during acceleration</li>
        <li><strong>Most Common Problems</strong>: Oxygen sensor failures, spark plug/ignition coil failures, and catalytic converter degradation</li>
        <li><strong>Cost Impact</strong>: Engine repairs range from minor ($150-300 for sensor replacements) to catastrophic ($3,000-10,000 for complete rebuilds)</li>
      </ul>
      
      <h4>Transmission Issues:</h4>
      <ul>
        <li><strong>Early Warning Signs</strong>: Delayed or harsh shifting, slipping, whining noises, or fluid leaks</li>
        <li><strong>Most Common Problems</strong>: Solenoid failures, torque converter issues, and valve body malfunctions</li>
        <li><strong>Cost Impact</strong>: Transmission repairs are typically high ($1,200-4,500 for rebuilds or replacements)</li>
      </ul>
      
      <h4>Electrical System Issues:</h4>
      <ul>
        <li><strong>Early Warning Signs</strong>: Intermittent electrical components, dim lights, battery issues, or computer errors</li>
        <li><strong>Most Common Problems</strong>: Battery-to-alternator charging problems, wiring harness degradation, and control module failures</li>
        <li><strong>Cost Impact</strong>: Can range from inexpensive ($100-300) to costly ($800-2,000) depending on the affected components</li>
      </ul>
      
      <h3>How Mileage Affects Problem Patterns</h3>
      <p>Vehicle issues follow predictable patterns based on mileage milestones:</p>
      <ul>
        <li><strong>30,000-50,000 miles</strong>: Typically when factory warranties expire and initial quality issues become apparent</li>
        <li><strong>60,000-80,000 miles</strong>: Common failure point for wear items like brakes, suspension components, and certain sensors</li>
        <li><strong>90,000-120,000 miles</strong>: Major systems like transmissions and engine components begin showing age-related issues</li>
        <li><strong>150,000+ miles</strong>: Comprehensive assessment of multiple systems typically needed</li>
      </ul>
      
      <p>Our premium reliability reports provide mileage-specific predictions for when particular issues are most likely to occur, allowing for preventative maintenance that can save thousands in repair costs.</p>
      
      <h3>Using Problem Pattern Data in Real-World Decisions</h3>
      <p>Understanding common issues can guide both purchasing and maintenance decisions:</p>
      <ol>
        <li><strong>When buying used</strong>: Know exactly which issues to check for based on the vehicle's current mileage</li>
        <li><strong>When maintaining</strong>: Schedule preventative maintenance based on statistical failure rates rather than just general recommendations</li>
        <li><strong>When troubleshooting</strong>: Identify the most likely causes of symptoms based on your specific vehicle's known issue patterns</li>
        <li><strong>When budgeting</strong>: Plan for future expenses based on the statistical likelihood of major repairs</li>
      </ol>
      
      <p>Our premium issue analysis includes not just what commonly breaks, but when it breaks, how much it costs to fix, and which repair facilities specialize in addressing these specific issues in your area.</p>
      
      <p>By understanding problem patterns, you transform unexpected breakdowns into planned maintenance, potentially saving thousands in emergency repair costs and avoiding the inconvenience of unexpected vehicle downtime.</p>
    `
  },
  {
    id: 'buying-vs-leasing',
    title: 'Buying vs. Leasing: Using Reliability Data to Make Smarter Financial Decisions',
    excerpt: 'How understanding vehicle reliability can help you decide whether to buy or lease your next car.',
    date: '2025-04-08',
    author: 'James Taylor',
    category: 'Car Buying',
    image: '/images/blog/buylease.webp',
    readTime: '5 min read',
    content: ''
  },
  {
    id: 'suv-reliability-rankings',
    title: '2025 SUV Reliability Rankings: The Most Dependable Models This Year',
    excerpt: 'Our comprehensive analysis of the most reliable SUVs of 2025 based on real-world data.',
    date: '2025-03-25',
    author: 'Emma Rodriguez',
    category: 'Vehicle Rankings',
    image: '/images/blog/suvranking.png',
    readTime: '9 min read',
    content: ''
  },
  {
    id: 'electric-car-reliability',
    title: 'The Truth About Electric Car Reliability: What the Data Shows',
    excerpt: 'Are electric vehicles more or less reliable than gas cars? Our data analysis provides surprising answers.',
    date: '2025-03-15',
    author: 'Marcus Chen',
    category: 'Electric Vehicles',
    image: '/images/blog/elecvspetrol.webp',
    readTime: '7 min read',
    content: ''
  }
];

// Categories for filtering
const CATEGORIES = [
  'All',
  'Car Buying',
  'Car Maintenance',
  'Reliability Research',
  'Vehicle Rankings',
  'Electric Vehicles'
];

export default function Blog() {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  // State for category filter
  const [activeCategory, setActiveCategory] = useState('All');
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter posts based on category and search query
  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <Layout title={t('blog.title') || 'Lemnaed Blog'}>
      <div className="blog-container">
        <div className="blog-header">
          <h1>{t('blog.title') || 'Lemnaed Blog'}</h1>
          <p className="blog-subtitle">
            {t('blog.subtitle') || 'Expert insights on vehicle reliability, smart car buying, and maintenance'}
          </p>
          
          {/* Search and filter section */}
          <div className="blog-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder={t('blog.searchPlaceholder') || 'Search articles...'}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            
            <div className="category-filter">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  className={`category-button ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Featured post (first post) */}
        {filteredPosts.length > 0 && (
          <div className="featured-post">
            <Link href={`/blog/${filteredPosts[0].id}`} className="featured-post-link">
              <div className="featured-post-image" style={{ backgroundImage: `url(${filteredPosts[0].image || '/images/blog/placeholder.jpg'})` }}>
                <div className="featured-post-tag">{t('blog.featured') || 'Featured'}</div>
              </div>
              <div className="featured-post-content">
                <h2>{filteredPosts[0].title}</h2>
                <p className="featured-post-excerpt">{filteredPosts[0].excerpt}</p>
                <div className="post-meta">
                  <span className="post-author">{filteredPosts[0].author}</span>
                  <span className="post-date">{new Date(filteredPosts[0].date).toLocaleDateString(router.locale, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="post-read-time">{filteredPosts[0].readTime}</span>
                </div>
              </div>
            </Link>
          </div>
        )}
        
        {/* Blog post grid - excluding the featured post */}
        <div className="blog-grid">
          {filteredPosts.length > 1 ? (
            filteredPosts.slice(1).map((post) => (
              <div key={post.id} className="blog-card">
                <Link href={`/blog/${post.id}`} className="blog-card-link">
                  <div className="blog-card-image" style={{ backgroundImage: `url(${post.image || '/images/blog/placeholder.jpg'})` }}>
                    <div className="blog-card-category">{post.category}</div>
                  </div>
                  <div className="blog-card-content">
                    <h3>{post.title}</h3>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <div className="post-meta">
                      <span className="post-author">{post.author}</span>
                      <span className="post-date">{new Date(post.date).toLocaleDateString(router.locale, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="post-read-time">{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : filteredPosts.length === 0 ? (
            <div className="no-results">
              <p>{t('blog.noResults') || 'No articles found matching your search criteria.'}</p>
              <button 
                className="reset-button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
              >
                {t('blog.resetFilters') || 'Reset Filters'}
              </button>
            </div>
          ) : null}
        </div>
        
        {/* Newsletter signup */}
        {/* <div className="newsletter-section">
          <div className="newsletter-content">
            <h2>{t('blog.newsletterTitle') || 'Stay Updated'}</h2>
            <p>{t('blog.newsletterDescription') || 'Subscribe to our newsletter to receive the latest Lemnaed insights directly to your inbox.'}</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder={t('blog.emailPlaceholder') || 'Your email address'} 
                required 
              />
              <button type="submit">{t('blog.subscribe') || 'Subscribe'}</button>
            </form>
          </div>
        </div> */}
      </div>
      
      <style jsx>{`
        .blog-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .blog-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #333;
        }
        
        .blog-subtitle {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 2rem;
        }
        
        .blog-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .search-box {
          position: relative;
          max-width: 500px;
          margin: 0 auto;
          width: 100%;
        }
        
        .search-box input {
          width: 100%;
          padding: 1rem 1rem 1rem 2.5rem;
          border: 1px solid #ddd;
          border-radius: 30px;
          font-size: 1rem;
        }
        
        .search-box svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }
        
        .category-filter {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .category-button {
          padding: 0.5rem 1rem;
          background: none;
          border: 1px solid #ddd;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        .category-button:hover {
          background-color: #f5f5f5;
        }
        
        .category-button.active {
          background-color: #0070f3;
          color: white;
          border-color: #0070f3;
        }
        
        /* Featured post styles */
        .featured-post {
          margin-bottom: 3rem;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .featured-post:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .featured-post-link {
          display: flex;
          flex-direction: column;
          color: inherit;
          text-decoration: none;
        }
        
        .featured-post-image {
          height: 400px;
          width: 100%;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .featured-post-tag {
          position: absolute;
          top: 20px;
          left: 20px;
          background-color: #0070f3;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .featured-post-content {
          padding: 2rem;
          background-color: white;
        }
        
        .featured-post-content h2 {
          font-size: 1.8rem;
          margin-bottom: 1rem;
          color: #333;
        }
        
        .featured-post-excerpt {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        /* Blog grid styles */
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }
        
        .blog-card {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s, box-shadow 0.3s;
          background-color: white;
          height: 100%;
        }
        
        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }
        
        .blog-card-link {
          display: flex;
          flex-direction: column;
          height: 100%;
          color: inherit;
          text-decoration: none;
        }
        
        .blog-card-image {
          height: 200px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .blog-card-category {
          position: absolute;
          bottom: 15px;
          left: 15px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
        }
        
        .blog-card-content {
          padding: 1.5rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        
        .blog-card-content h3 {
          font-size: 1.3rem;
          margin-bottom: 0.8rem;
          color: #333;
        }
        
        .blog-card-excerpt {
          font-size: 0.95rem;
          color: #666;
          margin-bottom: 1.2rem;
          line-height: 1.6;
          flex-grow: 1;
        }
        
        .post-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.85rem;
          color: #888;
        }
        
        .post-author {
          font-weight: 600;
        }
        
        .post-date, .post-read-time {
          position: relative;
          padding-left: 1rem;
        }
        
        .post-date:before, .post-read-time:before {
          content: '•';
          position: absolute;
          left: 0;
        }
        
        /* No results */
        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          background-color: #f9f9f9;
          border-radius: 10px;
        }
        
        .no-results p {
          margin-bottom: 1.5rem;
          color: #666;
        }
        
        .reset-button {
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s;
        }
        
        .reset-button:hover {
          background-color: #0060df;
        }
        
        /* Newsletter styles */
        .newsletter-section {
          background-color: #f0f7ff;
          padding: 3rem;
          border-radius: 12px;
          margin-bottom: 3rem;
        }
        
        .newsletter-content {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
        
        .newsletter-content h2 {
          margin-bottom: 1rem;
          color: #333;
        }
        
        .newsletter-content p {
          margin-bottom: 1.5rem;
          color: #555;
        }
        
        .newsletter-form {
          display: flex;
          gap: 0.5rem;
        }
        
        .newsletter-form input {
          flex-grow: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        .newsletter-form button {
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          white-space: nowrap;
        }
        
        .newsletter-form button:hover {
          background-color: #0060df;
        }
        
        /* Responsive styles */
        @media (min-width: 768px) {
          .featured-post a {
            flex-direction: row;
          }
          
          .featured-post-image {
            width: 50%;
            height: auto;
          }
          
          .featured-post-content {
            width: 50%;
          }
          
          .blog-controls {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
          
          .search-box {
            margin: 0;
          }
        }
        
        @media (max-width: 767px) {
          .newsletter-form {
            flex-direction: column;
          }
          
          .newsletter-form button {
            width: 100%;
          }
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