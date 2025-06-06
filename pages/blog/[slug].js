// pages/blog/[slug].js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '../../components/Layout';
import Head from 'next/head';

// Sample blog posts data - in a real application, this would come from an API or CMS
const BLOG_POSTS = [
  {
    id: 'understanding-reliability-scores',
    title: 'Understanding Lemnaed Scores',
    excerpt: 'Learn what reliability scores really mean and how they can help you make better car-buying decisions.',
    date: '2025-05-01',
    author: 'Emma Rodriguez',
    authorTitle: 'Senior Automotive Analyst',
    authorImage: '/images/blog/placeholder.png',
    category: 'Car Buying',
    image: '/images/blog/check-engine.webp',
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
    authorTitle: 'Automotive Engineering Specialist',
    authorImage: '/images/blog/placeholder.png',
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
    authorTitle: 'Certified Master Technician',
    authorImage: '/images/blog/placeholder.png',
    category: 'Car Maintenance',
    image: '/images/blog/check-engine.webp',
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
    authorTitle: 'Automotive Financial Analyst',
    authorImage: '/images/authors/james-taylor.jpg',
    category: 'Car Buying',
    image: '/images/blog/buylease.webp',
    readTime: '5 min read',
    content: `
  <p>When you’re in the market for a new vehicle, the age-old question resurfaces: should you buy or lease? Both options have financial pros and cons, but one crucial factor that rarely gets the attention it deserves is reliability—how often a make and model needs repairs, and what those repairs cost over time.</p>
  
  <h2>Why Reliability Data Matters</h2>
  <p>Traditional lease vs. buy analyses focus on depreciation curves, monthly payments, insurance and taxes. But reliability data adds a fourth dimension:</p>
  <ul>
    <li><strong>Unexpected Cost Mitigation:</strong> High-reliability models often incur fewer out-of-warranty expenses, reducing your total cost of ownership.</li>
    <li><strong>Residual Value Impact:</strong> Vehicles with strong reliability scores hold their value better at lease turn-in or resale.</li>
    <li><strong>Downtime Considerations:</strong> If your livelihood depends on your car, less time in the shop equals more time on the road.</li>
  </ul>
  
  <h2>Leasing: The Safety Net of Short-Term Reliability</h2>
  <p>Leases typically run 24–36 months. During this window, most factory warranties cover major defects. If you choose a model with average or slightly below-average reliability, you can often avoid surprise repair bills because repairs fall under warranty. In this scenario:</p>
  <ul>
    <li><strong>Lower Up-Front Cash:</strong> You’re not tying up capital in depreciation.</li>
    <li><strong>Predictable Costs:</strong> Lease payments + warranty = minimal unexpected expenses.</li>
    <li><strong>More Frequent Turn-Ins:</strong> You can upgrade to newer safety and tech features before reliability issues surface.</li>
  </ul>
  
  <h2>Buying: Long-Term Reliability Pays Off</h2>
  <p>If you plan to drive a car beyond warranty—say, 5–10 years—then a high-reliability model can save you thousands. Our data shows that top-rated brands average <strong>40% lower out-of-warranty repair costs</strong> at the 60,000–100,000 mile marks. When you own outright:</p>
  <ul>
    <li><strong>No Mileage Caps:</strong> Ideal for high-mileage drivers who risk lease overage fees.</li>
    <li><strong>Equity Buildup:</strong> Every payment builds toward ownership.</li>
    <li><strong>Lower Lifetime Cost:</strong> For vehicles with <em>excellent</em> reliability scores, total cost of ownership often undercuts lease + buy-out at term.</li>
  </ul>
  
  <h2>How to Use Reliability Data in Your Decision</h2>
  <ol>
    <li><strong>Check 0–5 Year Reliability Scores:</strong> If you’re leasing ≤3 years, focus on whether a model’s “initial defects” rank in the top quartile.</li>
    <li><strong>Analyze 5–10 Year Repair Costs:</strong> For buying, compare average out-of-warranty spend per 10,000 miles across contenders.</li>
    <li><strong>Weigh Residual Values:</strong> High-reliability cars tend to lose value more slowly—critical if you plan to sell or trade.</li>
  </ol>
  
  <h2>Bottom Line</h2>
  <p>There’s no one-size-fits-all answer. If you crave peace-of-mind on a short term and don’t mind perpetual payments, leasing a reliable model under warranty makes sense. If you’re planning to keep your car long after the factory warranty expires—and you rack up miles—owning a top-rated reliability leader will reward you with lower maintenance bills and stronger resale value.</p>
  
  <p>Use real-world reliability scores as a fourth pillar alongside payment, insurance, and depreciation—and you’ll drive away with a decision that’s financially—and mechanically—sound.</p>
  `
  },
  {
    id: 'suv-reliability-rankings',
    title: '2025 SUV Reliability Rankings: The Most Dependable Models This Year',
    excerpt: 'Our comprehensive analysis of the most reliable SUVs of 2025 based on real-world data.',
    date: '2025-03-25',
    author: 'Emma Rodriguez',
    authorTitle: 'Senior Automotive Analyst',
    authorImage: '/images/blog/placeholder.png',
    category: 'Vehicle Rankings',
    image: '/images/blog/suvranking.webp',
    readTime: '9 min read',
    content: `
  <p>SUVs continue to dominate new-vehicle sales, but dependability varies widely across brands and price points. We’ve aggregated data from over <strong>200,000</strong> real-world vehicles to bring you the definitive 2025 SUV Reliability Rankings.</p>
  
  <h2>Methodology in Brief</h2>
  <p>Our analysis incorporates:</p>
  <ul>
    <li><strong>Warranty Claim Frequency:</strong> Incidents per 1,000 vehicles in first 3 years.</li>
    <li><strong>Out-of-Warranty Repair Cost:</strong> Average spending per 10,000 miles from years 4–7.</li>
    <li><strong>Severity Index:</strong> Weighting for powertrain vs. minor trim/electrical fixes.</li>
    <li><strong>Owner Satisfaction Surveys:</strong> Real-time feedback from active SUV owners.</li>
  </ul>
  
  <h2>Top 5 Most Reliable SUVs of 2025</h2>
  <ol>
    <li><strong>Brand A Model X</strong> — <em>Luxury Compact</em><br>Minimal warranty claims, stellar powertrain durability, and sub-$200 annual OOW costs.</li>
    <li><strong>Brand B SportTrail</strong> — <em>Midsize Crossover</em><br>Best-in-class electrical reliability and tight build tolerances keep downtime near zero.</li>
    <li><strong>Brand C Adventurer</strong> — <em>Off-Road Ready</em><br>Robust chassis and conservative engine tuning translate to fewer repairs under harsh conditions.</li>
    <li><strong>Brand D UrbanCruise</strong> — <em>Subcompact</em><br>Excellent for city dwellers: low repair severity and highest owner satisfaction rating.</li>
    <li><strong>Brand E FamilyHauler</strong> — <em>Three-Row</em><br>Strong fuel system components and reliable HVAC make it ideal for large families.</li>
  </ol>
  
  <h2>Notable Category Winners</h2>
  <p><strong>Luxury SUVs:</strong> Model X and Y both score above 90/100, but X’s lower electronics failure rate gives it the edge.</p>
  <p><strong>Electric SUVs:</strong> EV-SUV Z leads, with <strong>30% fewer</strong> battery-related visits compared to the segment average.</p>
  <p><strong>Budget-Friendly:</strong> Several sub-$30K crossovers from Brand F and G rank in the top 10 for engine and transmission reliability.</p>
  
  <h2>Key Takeaways for Buyers</h2>
  <ul>
    <li><strong>Warranty vs. OOW Costs:</strong> Compare both short-term peace of mind and long-term ownership expense.</li>
    <li><strong>Dealer Network Strength:</strong> Rapid factory-trained service can halve your downtime.</li>
    <li><strong>Driving Habits Matter:</strong> Powertrain reliability on highways may differ from stop-and-go city use—choose accordingly.</li>
  </ul>
  
  <h2>Conclusion</h2>
  <p>Your next SUV purchase should balance style, features—and above all, reliability. Lean on these rankings to target models that minimize service visits and maximize resale value. In 2025’s competitive SUV market, dependability isn’t just a luxury—it’s a must.</p>
  `
  },
  {
    id: 'electric-car-reliability',
    title: 'The Truth About Electric Car Reliability: What the Data Shows',
    excerpt: 'Are electric vehicles more or less reliable than gas cars? Our data analysis provides surprising answers.',
    date: '2025-03-15',
    author: 'Marcus Chen',
    authorTitle: 'Automotive Engineering Specialist',
    authorImage: '/images/blog/placeholder.jpg',
    category: 'Electric Vehicles',
    image: '/images/blog/elecvspetrol.webp',
    readTime: '7 min read',
    content: `
  <p>Electric vehicles (EVs) have surged in popularity—but how do they stack up when it comes to reliability? Early adopters loved the simplicity of electric drivetrains, but battery concerns, software glitches, and charging-system issues have tempered some expectations.</p>
  
  <h2>Comparing Failure Modes</h2>
  <table>
    <thead>
      <tr><th>Component</th><th>EV Failure Rate (per 10k miles)</th><th>ICE Failure Rate (per 10k miles)</th></tr>
    </thead>
    <tbody>
      <tr><td>Drivetrain & Motor</td><td>1.2</td><td>3.4</td></tr>
      <tr><td>Battery & Charging</td><td>2.1</td><td>N/A</td></tr>
      <tr><td>Transmission</td><td>0.3</td><td>1.8</td></tr>
      <tr><td>Cooling System</td><td>0.9</td><td>2.5</td></tr>
      <tr><td>Software/Electrical</td><td>2.8</td><td>1.7</td></tr>
    </tbody>
  </table>
  
  <h2>What’s Driving the Numbers?</h2>
  <ul>
    <li><strong>Fewer Moving Parts:</strong> EV motors and single-speed gearboxes have drastically fewer failure points than multi-gear ICE transmissions.</li>
    <li><strong>Battery Degradation:</strong> Modern lithium-ion packs show <strong>85–90%</strong> capacity retention at 100,000 miles, but thermal management remains critical.</li>
    <li><strong>Software Complexity:</strong> Frequent OTA updates can introduce new bugs; top OEMs mitigate this with rigorous testing pipelines.</li>
  </ul>
  
  <h2>Real-World Owner Insights</h2>
  <p>In our survey of 5,000 EV owners:</p>
  <ul>
    <li><strong>85%</strong> report zero unscheduled service visits in their first 3 years.</li>
    <li><strong>10%</strong> experienced a minor software recall.</li>
    <li><strong>5%</strong> needed battery-coolant system repairs after extended fast-charging use.</li>
  </ul>
  
  <h2>EV vs. ICE: Total Cost of Reliability</h2>
  <p>When you combine routine maintenance, unscheduled repairs, and depreciation due to reliability issues, EV ownership costs are on average <strong>15% lower</strong> than comparable gas models over a 5-year span. Key drivers:</p>
  <ul>
    <li>No oil changes, spark plugs or timing belt replacements.</li>
    <li>Lower brake wear thanks to regenerative braking.</li>
    <li>Potential high-cost battery repairs—but these remain rare under proper usage.</li>
  </ul>
  
  <h2>Choosing an Electric Vehicle You Can Trust</h2>
  <ol>
    <li><strong>Review Battery Warranty Terms:</strong> Look for 8-year/100,000+ mile coverage.</li>
    <li><strong>Analyze Software Update Track Record:</strong> Pick brands with few post-launch patches.</li>
    <li><strong>Check After-Sales Service Network:</strong> Adequate charging-station availability and trained technicians matter.</li>
  </ol>
  
  <h2>Final Thoughts</h2>
  <p>Electric cars aren’t just greener—they’re often more reliable than their internal-combustion counterparts. While battery and software issues occasionally surface, the simplicity of the electric drivetrain and the elimination of many traditional repair items give EVs a clear reliability advantage. Armed with the right data, you can drive into the electric future with confidence.</p>
  `
  }
];

// Get related posts function - finds posts in the same category or by the same author
const getRelatedPosts = (currentPost, limit = 3) => {
  return BLOG_POSTS
    .filter(post => post.id !== currentPost.id)
    .filter(post => post.category === currentPost.category || post.author === currentPost.author)
    .slice(0, limit);
};

export default function BlogPost() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { slug } = router.query;
  
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Find the current post and related posts
  useEffect(() => {
    if (slug) {
      // Find current post
      const currentPost = BLOG_POSTS.find(post => post.id === slug);
      
      if (currentPost) {
        setPost(currentPost);
        // Find related posts
        setRelatedPosts(getRelatedPosts(currentPost));
      } else {
        // Handle post not found - redirect to blog listing
        router.push('/blog');
      }
      
      setLoading(false);
    }
  }, [slug, router]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString(router.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle share functionality
  const handleShare = (platform) => {
    if (!post) return;
    
    const url = `${window.location.origin}/blog/${post.id}`;
    const title = post.title;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`, '_blank');
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!');
        });
    }
  };
  
  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading article...</p>
        </div>
      </Layout>
    );
  }
  
  if (!post) {
    return (
      <Layout title="Article Not Found">
        <div className="not-found">
          <h1>Article Not Found</h1>
          <p>The article you're looking for doesn't exist or has been moved.</p>
          <Link href="/blog">
            <a className="back-button">Back to All Articles</a>
          </Link>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title={post.title}>
      <Head>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      <div className="blog-post-container">
        {/* Hero section */}
        <div className="post-hero">
          <div className="post-hero-content">
            <div className="post-category">{post.category}</div>
            <h1>{post.title}</h1>
            <p className="post-excerpt">{post.excerpt}</p>
            
            <div className="post-meta">
              <div className="author-info">
                <div className="author-image" style={{ backgroundImage: `url(${post.authorImage || '/images/authors/default.jpg'})` }}></div>
                <div className="author-details">
                  <div className="author-name">{post.author}</div>
                  <div className="author-title">{post.authorTitle}</div>
                </div>
              </div>
              
              <div className="post-details">
                <div className="post-date">{formatDate(post.date)}</div>
                <div className="post-read-time">{post.readTime}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured image */}
        <div className="post-featured-image" style={{ backgroundImage: `url(${post.image || '/images/blog/placeholder.png'})` }}></div>
        
        {/* Social sharing sidebar */}
        <div className="social-sidebar">
          <div className="social-buttons">
            <button onClick={() => handleShare('twitter')} aria-label="Share on Twitter" className="social-button twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </button>
            <button onClick={() => handleShare('facebook')} aria-label="Share on Facebook" className="social-button facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </button>
            <button onClick={() => handleShare('linkedin')} aria-label="Share on LinkedIn" className="social-button linkedin">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </button>
            <button onClick={() => handleShare('email')} aria-label="Share via Email" className="social-button email">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </button>
            <button onClick={() => handleShare('copy')} aria-label="Copy Link" className="social-button copy">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="post-content-wrapper">
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }}></div>
          
          {/* Tags section */}
          <div className="post-tags">
            <div className="tags-title">Related Topics:</div>
            <div className="tags-list">
              <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="tag">
                {post.category}
              </Link>
              <Link href="/blog?tag=reliability" className="tag">
                Reliability
              </Link>
              <Link href="/blog?tag=car-buying" className="tag">
                Car Buying
              </Link>
              <Link href="/blog?tag=maintenance" className="tag">
                Maintenance
              </Link>
            </div>
          </div>
          
          {/* Author section */}
          <div className="author-section">
            <div className="author-image-large" style={{ backgroundImage: `url(${post.authorImage || '/images/authors/default.jpg'})` }}></div>
            <div className="author-bio">
              <h3>About {post.author}</h3>
              <div className="author-title">{post.authorTitle}</div>
              <p className="author-description">
                {post.author} is a {post.authorTitle} at Lemnaed with over 10 years of experience in the automotive industry. 
                Their expertise includes vehicle reliability analysis, maintenance best practices, and consumer advocacy in the automotive space.
              </p>
            </div>
          </div>
        </div>
        
        {/* Related articles */}
        {relatedPosts.length > 0 && (
          <div className="related-posts">
            <h2>Related Articles</h2>
            <div className="related-posts-grid">
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost.id} className="related-post-card">
                  <Link href={`/blog/${relatedPost.id}`} className="related-post-link">
                    <div className="related-post-image" style={{ backgroundImage: `url(${relatedPost.image || '/images/blog/placeholder.png'})` }}></div>
                    <div className="related-post-content">
                      <h3>{relatedPost.title}</h3>
                      <div className="related-post-meta">
                        <span className="related-post-date">{formatDate(relatedPost.date)}</span>
                        <span className="related-post-read-time">{relatedPost.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Comments section - could be integrated with a real comments system */}
        {/* <div className="comments-section">
          <h2>Discussion</h2>
          <div className="comment-form">
            <textarea placeholder="Share your thoughts or ask a question..."></textarea>
            <button className="comment-button">Post Comment</button>
          </div>
          <div className="comments-login-prompt">
            <p>Please <Link href="/login" className="login-link">sign in</Link> to join the discussion.</p>
          </div>
        </div> */}
        
        {/* Newsletter signup */}
        {/* <div className="post-newsletter">
          <div className="newsletter-content">
            <h2>Stay Updated on Car Reliability</h2>
            <p>Subscribe to our newsletter to receive the latest reliability insights directly to your inbox.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Your email address" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div> */}
      </div>
      
      <style jsx>{`
        .blog-post-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          position: relative;
        }
        
        /* Hero section */
        .post-hero {
          text-align: center;
          margin-bottom: 2rem;
          padding: 2rem 0;
        }
        
        .post-hero-content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .post-category {
          display: inline-block;
          background-color: #f0f7ff;
          color: #0070f3;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }
        
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          color: #333;
          line-height: 1.3;
        }
        
        .post-excerpt {
          font-size: 1.25rem;
          color: #666;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .post-meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 2rem;
        }
        
        .author-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .author-image {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
        }
        
        .author-details {
          text-align: left;
        }
        
        .author-name {
          font-weight: 600;
          color: #333;
        }
        
        .author-title {
          font-size: 0.9rem;
          color: #666;
        }
        
        .post-details {
          display: flex;
          gap: 1rem;
          color: #666;
          font-size: 0.9rem;
        }
        
        /* Featured image */
        .post-featured-image {
          height: 500px;
          width: 100%;
          background-size: cover;
          background-position: center;
          border-radius: 12px;
          margin-bottom: 3rem;
        }
        
        /* Social sharing sidebar */
        .social-sidebar {
          position: sticky;
          top: 100px;
          left: 0;
          height: 0;
          z-index: 10;
        }
        
        .social-buttons {
          position: absolute;
          left: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .social-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: white;
          color: #333;
          border: 1px solid #ddd;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .social-button:hover {
          transform: translateY(-2px);
        }
        
        .social-button.twitter:hover {
          background-color: #1DA1F2;
          color: white;
          border-color: #1DA1F2;
        }
        
        .social-button.facebook:hover {
          background-color: #4267B2;
          color: white;
          border-color: #4267B2;
        }
        
        .social-button.linkedin:hover {
          background-color: #0077B5;
          color: white;
          border-color: #0077B5;
        }
        
        .social-button.email:hover {
          background-color: #EA4335;
          color: white;
          border-color: #EA4335;
        }
        
        .social-button.copy:hover {
          background-color: #0070f3;
          color: white;
          border-color: #0070f3;
        }
        
        /* Post content */
        .post-content-wrapper {
          max-width: 740px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .post-content {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #333;
          margin-bottom: 3rem;
        }
        
        .post-content h2 {
          font-size: 1.8rem;
          margin: 2rem 0 1rem;
          color: #333;
        }
        
        .post-content h3 {
          font-size: 1.5rem;
          margin: 1.5rem 0 1rem;
          color: #444;
        }
        
        .post-content h4 {
          font-size: 1.2rem;
          margin: 1.5rem 0 1rem;
          color: #555;
        }
        
        .post-content p {
          margin-bottom: 1.5rem;
        }
        
        .post-content ul, .post-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .post-content li {
          margin-bottom: 0.5rem;
        }
        
        .post-content strong {
          font-weight: 600;
        }
        
        /* Tags section */
        .post-tags {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
        }
        
        .tags-title {
          font-weight: 600;
          margin-right: 1rem;
        }
        
        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .tag {
          background-color: #f5f5f5;
          padding: 0.4rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #555;
          text-decoration: none;
          transition: background-color 0.2s;
        }
        
        .tag:hover {
          background-color: #e5e5e5;
        }
        
        /* Author section */
        .author-section {
          display: flex;
          align-items: center;
          gap: 2rem;
          background-color: #f9fafb;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 3rem;
        }
        
        .author-image-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          flex-shrink: 0;
        }
        
        .author-bio {
          flex-grow: 1;
        }
        
        .author-bio h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
        }
        
        .author-bio .author-title {
          color: #0070f3;
          margin-bottom: 1rem;
        }
        
        .author-description {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #555;
          margin: 0;
        }
        
        /* Related posts */
        .related-posts {
          margin-bottom: 3rem;
        }
        
        .related-posts h2 {
          text-align: center;
          margin-bottom: 2rem;
          font-size: 1.8rem;
          color: #333;
        }
        
        .related-posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .related-post-card {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .related-post-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }
        
        .related-post-link {
          display: block;
          color: inherit;
          text-decoration: none;
        }
        
        .related-post-image {
          height: 180px;
          background-size: cover;
          background-position: center;
        }
        
        .related-post-content {
          padding: 1.5rem;
        }
        
        .related-post-content h3 {
          font-size: 1.1rem;
          margin-top: 0;
          margin-bottom: 1rem;
          color: #333;
        }
        
        .related-post-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #666;
        }
        
        /* Comments section */
        .comments-section {
          margin-bottom: 3rem;
        }
        
        .comments-section h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }
        
        .comment-form {
          margin-bottom: 1.5rem;
          display: none; /* Hide by default, show when logged in */
        }
        
        .comment-form textarea {
          width: 100%;
          height: 120px;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
        }
        
        .comment-button {
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          float: right;
        }
        
        .comments-login-prompt {
          background-color: #f5f5f5;
          padding: 2rem;
          text-align: center;
          border-radius: 8px;
        }
        
        .comments-login-prompt a.login-link {
          color: #0070f3;
          text-decoration: none;
          font-weight: 600;
        }
        
        .comments-login-prompt a.login-link:hover {
          text-decoration: underline;
        }
        
        /* Newsletter */
        .post-newsletter {
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
        
        /* Loading state */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        }
        
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0070f3;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Not found state */
        .not-found {
          text-align: center;
          padding: 3rem 1rem;
        }
        
        .not-found h1 {
          margin-bottom: 1rem;
        }
        
        .not-found p {
          margin-bottom: 2rem;
          color: #666;
        }
        
        .back-button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border-radius: 6px;
          text-decoration: none;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          h1 {
            font-size: 2rem;
          }
          
          .post-excerpt {
            font-size: 1.1rem;
          }
          
          .post-featured-image {
            height: 300px;
          }
          
          .social-sidebar {
            display: none;
          }
          
          .post-content-wrapper {
            padding: 0;
          }
          
          .author-section {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }
          
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

export async function getStaticPaths() {
  // Generate paths for all blog posts
  const paths = BLOG_POSTS.map((post) => ({
    params: { slug: post.id },
  }));

  return {
    paths,
    fallback: false, // 404 for paths not returned by getStaticPaths
  };
}

export async function getStaticProps({ params, locale }) {
  // Find the post with matching slug
  const post = BLOG_POSTS.find((post) => post.id === params.slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      post,
    },
  };
}