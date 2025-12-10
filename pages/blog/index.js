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
    id: '5-most-reliable-used-cars-under-15k-worldwide-2025',
    title: '5 Most Reliable Used Cars Under $15k Worldwide (2025 Edition)',
    excerpt: 'Discover the most reliable used cars under $15,000 globally for 2025. Expert analysis of Toyota, Honda, Mazda and other dependable vehicles.',
    date: '2025-01-15',
    author: 'Lemnaed Team',
    category: 'Car Buying Guide',
    image: '/images/blog/reliable-cars-worldwide-2025.jpg',
    readTime: '8 min read',
    slug: '5-most-reliable-used-cars-under-15k-worldwide-2025'
  },
  {
    id: 'how-to-avoid-lemon-used-car-buying-worldwide',
    title: 'How to Avoid Buying a Lemon When Purchasing a Used Car Worldwide',
    excerpt: 'Complete guide to avoiding lemon cars globally. Learn the warning signs, inspection tips, and red flags when buying used cars anywhere.',
    date: '2025-01-20',
    author: 'Lemnaed Team',
    category: 'Car Buying Guide',
    image: '/images/blog/avoid-lemon-cars-worldwide.jpg',
    readTime: '12 min read',
    slug: 'how-to-avoid-lemon-used-car-buying-worldwide'
  },
  {
    id: 'most-reliable-electronics-2025',
    title: 'Most Reliable Consumer Electronics to Buy in 2025',
    excerpt: 'Discover which smartphones, laptops, tablets and other electronics have the best reliability ratings and longest lifespan in 2025.',
    date: '2025-02-01',
    author: 'Lemnaed Team',
    category: 'Electronics Guide',
    image: '/images/blog/reliable-electronics-2025.jpg',
    readTime: '10 min read',
    slug: 'most-reliable-electronics-2025',
    content: `
      <h2>Top Electronics for Reliability in 2025</h2>
      <p>When investing in consumer electronics, reliability is crucial. Here's our comprehensive guide to the most dependable electronics based on extensive testing and user feedback.</p>
      
      <h3>Smartphones: Built to Last</h3>
      <p>The most reliable smartphones combine durable hardware with long-term software support:</p>
      <ul>
        <li><strong>Apple iPhone 15 Pro</strong> - Exceptional build quality, 5+ years of iOS updates, industry-leading durability</li>
        <li><strong>Samsung Galaxy S24</strong> - Premium materials, 4 years of OS updates, excellent water resistance</li>
        <li><strong>Google Pixel 8</strong> - Pure Android experience, 7 years of updates, reliable performance</li>
      </ul>
      
      <h3>Laptops: Dependability Matters</h3>
      <p>For laptops that won't let you down:</p>
      <ul>
        <li><strong>Apple MacBook Air M3</strong> - No moving parts, excellent battery life, proven reliability</li>
        <li><strong>Lenovo ThinkPad T14s</strong> - Business-grade durability, spill-resistant keyboard, extensive testing</li>
        <li><strong>Dell XPS 15</strong> - Premium build quality, reliable components, excellent support</li>
      </ul>
      
      <h3>Tablets and E-Readers</h3>
      <p>Devices designed for longevity:</p>
      <ul>
        <li><strong>Apple iPad Pro</strong> - Industry-leading performance, long software support</li>
        <li><strong>Amazon Kindle Paperwhite</strong> - Simple, reliable design focused on reading</li>
        <li><strong>Samsung Galaxy Tab S9</strong> - Durable construction, excellent display</li>
      </ul>
      
      <h3>Key Reliability Factors</h3>
      <p>When evaluating electronics reliability, consider:</p>
      <ol>
        <li><strong>Build Quality</strong> - Premium materials and solid construction</li>
        <li><strong>Software Support</strong> - Length of guaranteed updates</li>
        <li><strong>Battery Health</strong> - Capacity retention over time</li>
        <li><strong>Warranty Coverage</strong> - Manufacturer support policies</li>
        <li><strong>Repair Options</strong> - Availability of parts and service</li>
      </ol>
      
      <h3>Making Your Electronics Last</h3>
      <p>Maximize the lifespan of your devices:</p>
      <ul>
        <li>Use quality protective cases and screen protectors</li>
        <li>Avoid extreme temperatures and humidity</li>
        <li>Keep software updated for security and performance</li>
        <li>Practice good charging habits to preserve battery health</li>
        <li>Clean devices regularly to prevent damage from dust and debris</li>
      </ul>
    `
  },
  {
    id: 'best-kitchen-appliances-reliability',
    title: 'Best Kitchen Appliances for Reliability and Longevity',
    excerpt: 'Find out which refrigerators, dishwashers, ovens and other kitchen appliances offer the best reliability and value for money.',
    date: '2025-02-05',
    author: 'Lemnaed Team',
    category: 'Appliances Guide',
    image: '/images/blog/kitchen-appliances-reliability.jpg',
    readTime: '9 min read',
    slug: 'best-kitchen-appliances-reliability',
    content: `
      <h2>Most Reliable Kitchen Appliances for Your Home</h2>
      <p>Kitchen appliances represent significant investments that should last for years. Here's our expert guide to the most reliable brands and models based on repair rates and customer satisfaction.</p>
      
      <h3>Refrigerators: The Heart of Your Kitchen</h3>
      <p>Top performers in reliability:</p>
      <ul>
        <li><strong>Whirlpool</strong> - Consistently low repair rates, excellent value, 10-year parts availability</li>
        <li><strong>LG</strong> - Innovative features with solid reliability, good energy efficiency</li>
        <li><strong>Samsung</strong> - Modern designs, improving reliability scores year over year</li>
        <li><strong>Bosch</strong> - European engineering, premium reliability for higher budgets</li>
      </ul>
      
      <h3>Dishwashers: Reliability Meets Convenience</h3>
      <p>Brands that consistently perform:</p>
      <ul>
        <li><strong>Bosch</strong> - Industry-leading reliability, quiet operation, excellent cleaning</li>
        <li><strong>Miele</strong> - Premium quality, 20+ year lifespan common, exceptional durability</li>
        <li><strong>Whirlpool</strong> - Great value, reliable performance, widely available parts</li>
        <li><strong>KitchenAid</strong> - Strong build quality, good service network</li>
      </ul>
      
      <h3>Ranges and Ovens</h3>
      <p>Cooking appliances built to last:</p>
      <ul>
        <li><strong>GE Profile</strong> - Proven reliability, consistent performance, good support</li>
        <li><strong>Frigidaire</strong> - Value-oriented reliability, simple controls</li>
        <li><strong>Bosch</strong> - Premium European quality, precise temperature control</li>
        <li><strong>Wolf</strong> - Professional-grade durability for serious cooks</li>
      </ul>
      
      <h3>Microwaves and Small Appliances</h3>
      <p>Dependable daily-use appliances:</p>
      <ul>
        <li><strong>Panasonic</strong> - Inverter technology, consistent heating, durable</li>
        <li><strong>Sharp</strong> - Reliable drawer models, good longevity</li>
        <li><strong>Cuisinart</strong> - Small appliances with excellent track records</li>
        <li><strong>KitchenAid</strong> - Mixers and processors known for decades of service</li>
      </ul>
      
      <h3>What Makes Appliances Reliable?</h3>
      <p>Key factors in appliance longevity:</p>
      <ol>
        <li><strong>Simple Mechanics</strong> - Fewer electronic controls mean fewer failure points</li>
        <li><strong>Quality Components</strong> - Commercial-grade parts in residential products</li>
        <li><strong>Parts Availability</strong> - Extended availability for repairs</li>
        <li><strong>Service Network</strong> - Local repair technicians familiar with the brand</li>
        <li><strong>Warranty Length</strong> - Manufacturers confident in their products offer longer coverage</li>
      </ol>
      
      <h3>Maintenance Tips for Longevity</h3>
      <p>Make your appliances last:</p>
      <ul>
        <li>Clean refrigerator coils every 6 months</li>
        <li>Run dishwasher monthly with cleaning tablets</li>
        <li>Use proper cookware to protect range surfaces</li>
        <li>Address minor issues before they become major repairs</li>
        <li>Follow manufacturer maintenance schedules</li>
      </ul>
    `
  },
  {
    id: 'most-durable-power-tools-2025',
    title: 'Most Durable Power Tools for DIY and Professional Use 2025',
    excerpt: 'Professional review of the most reliable drills, saws, sanders and other power tools that stand the test of time.',
    date: '2025-02-10',
    author: 'Lemnaed Team',
    category: 'Tools Guide',
    image: '/images/blog/durable-power-tools.jpg',
    readTime: '11 min read',
    slug: 'most-durable-power-tools-2025',
    content: `
      <h2>Most Reliable Power Tools for 2025</h2>
      <p>Whether you're a professional contractor or weekend DIYer, tool reliability can make or break a project. Here are the brands and models that professionals trust.</p>
      
      <h3>Cordless Drills: The Essential Tool</h3>
      <p>Top performers for reliability and power:</p>
      <ul>
        <li><strong>Milwaukee M18 FUEL</strong> - Brushless motors, exceptional battery life, professional-grade durability</li>
        <li><strong>DeWalt 20V MAX XR</strong> - Industry standard, vast accessory ecosystem, proven longevity</li>
        <li><strong>Makita 18V LXT</strong> - Compact yet powerful, excellent ergonomics, reliable Japanese engineering</li>
        <li><strong>Bosch 18V</strong> - Innovative features, solid build quality, good value</li>
      </ul>
      
      <h3>Circular Saws and Miter Saws</h3>
      <p>Cutting tools built for the long haul:</p>
      <ul>
        <li><strong>DeWalt DWS780</strong> - Professional miter saw, accurate and durable</li>
        <li><strong>Milwaukee 6390-21</strong> - Circular saw workhorse, 15-amp motor</li>
        <li><strong>Makita 5007MG</strong> - Magnesium construction, lightweight but tough</li>
        <li><strong>Festool Kapex</strong> - Premium quality, unmatched precision</li>
      </ul>
      
      <h3>Impact Drivers and Wrenches</h3>
      <p>High-torque tools that last:</p>
      <ul>
        <li><strong>Milwaukee M18 FUEL Impact</strong> - 2,000+ in-lbs torque, exceptional runtime</li>
        <li><strong>DeWalt DCF887</strong> - Three-speed settings, great control</li>
        <li><strong>Ridgid R86034</strong> - Lifetime service agreement, excellent value</li>
      </ul>
      
      <h3>Sanders and Grinders</h3>
      <p>Finishing tools professionals rely on:</p>
      <ul>
        <li><strong>Bosch ROS20VSC</strong> - Random orbit sander, smooth operation</li>
        <li><strong>Makita 9557PBX1</strong> - Angle grinder, durable gearbox</li>
        <li><strong>Festool ETS EC 150</strong> - Premium sander, dust extraction excellence</li>
      </ul>
      
      <h3>What Makes Professional-Grade Tools Reliable?</h3>
      <p>Key features of durable power tools:</p>
      <ol>
        <li><strong>Motor Quality</strong> - Brushless motors last longer and perform better</li>
        <li><strong>Housing Materials</strong> - Metal gearboxes and reinforced housings</li>
        <li><strong>Battery Technology</strong> - Lithium-ion with overcharge protection</li>
        <li><strong>Warranty Support</strong> - 3-5 year coverage standard for pro tools</li>
        <li><strong>Parts Availability</strong> - Service centers and replacement parts network</li>
      </ol>
      
      <h3>Tool Maintenance for Longevity</h3>
      <p>Keep your tools running strong:</p>
      <ul>
        <li>Clean dust and debris after each use</li>
        <li>Store batteries properly - not fully charged or depleted</li>
        <li>Lubricate moving parts according to manufacturer specs</li>
        <li>Replace worn carbon brushes in brushed motors</li>
        <li>Keep blades and bits sharp to reduce motor strain</li>
      </ul>
    `
  },
  {
    id: 'reliable-furniture-brands-guide',
    title: 'Guide to Buying Reliable Furniture That Lasts',
    excerpt: 'Learn which furniture brands and materials offer the best durability and reliability for sofas, beds, tables and more.',
    date: '2025-02-15',
    author: 'Lemnaed Team',
    category: 'Furniture Guide',
    image: '/images/blog/reliable-furniture-guide.jpg',
    readTime: '8 min read',
    slug: 'reliable-furniture-brands-guide',
    content: `
      <h2>Investing in Furniture That Stands the Test of Time</h2>
      <p>Quality furniture is an investment in your home's comfort and aesthetics. Here's how to identify brands and construction methods that ensure longevity.</p>
      
      <h3>Sofas and Sectionals: Built to Last</h3>
      <p>Brands known for exceptional durability:</p>
      <ul>
        <li><strong>Crate & Barrel</strong> - Solid frames, quality upholstery, good warranty coverage</li>
        <li><strong>Pottery Barn</strong> - Traditional construction, extensive fabric options</li>
        <li><strong>Room & Board</strong> - American-made, lifetime warranty on frames</li>
        <li><strong>La-Z-Boy</strong> - Proven durability, excellent reclining mechanisms</li>
        <li><strong>Ethan Allen</strong> - Premium craftsmanship, customization options</li>
      </ul>
      
      <h3>Beds and Mattresses</h3>
      <p>Sleep solutions that last years:</p>
      <ul>
        <li><strong>Tempurpur-Pedic</strong> - Memory foam leader, 10-year warranty standard</li>
        <li><strong>Sealy Posturepedic</strong> - Proven coil technology, good support retention</li>
        <li><strong>West Elm</strong> - Modern bed frames, solid wood construction</li>
        <li><strong>Casper</strong> - Innovative foam designs, excellent customer service</li>
      </ul>
      
      <h3>Dining Tables and Chairs</h3>
      <p>Pieces for daily family use:</p>
      <ul>
        <li><strong>Amish Furniture</strong> - Handcrafted solid wood, generational quality</li>
        <li><strong>Bassett</strong> - American craftsmanship, good value</li>
        <li><strong>Canadel</strong> - Customizable solid wood tables</li>
        <li><strong>Stickley</strong> - Premium mission-style furniture, heirloom quality</li>
      </ul>
      
      <h3>Storage and Office Furniture</h3>
      <p>Functional pieces built to endure:</p>
      <ul>
        <li><strong>Herman Miller</strong> - Office chairs with 12-year warranties</li>
        <li><strong>Steelcase</strong> - Commercial-grade durability</li>
        <li><strong>IKEA PAX System</strong> - Modular storage, surprising longevity for the price</li>
        <li><strong>California Closets</strong> - Custom storage solutions, professional installation</li>
      </ul>
      
      <h3>Signs of Quality Construction</h3>
      <p>What to look for when evaluating furniture:</p>
      <ol>
        <li><strong>Frame Material</strong> - Solid hardwood or plywood, not particleboard</li>
        <li><strong>Joinery Methods</strong> - Mortise-and-tenon or dovetail joints, not staples</li>
        <li><strong>Cushion Quality</strong> - High-density foam with good rebound</li>
        <li><strong>Fabric Grade</strong> - Higher double-rub counts indicate durability</li>
        <li><strong>Hardware</strong> - Metal brackets and screws, not plastic</li>
      </ol>
      
      <h3>Care and Maintenance</h3>
      <p>Protect your furniture investment:</p>
      <ul>
        <li>Rotate cushions regularly to ensure even wear</li>
        <li>Keep furniture away from direct sunlight and heat sources</li>
        <li>Use coasters and placemats to prevent surface damage</li>
        <li>Clean spills immediately with appropriate cleaners</li>
        <li>Tighten hardware annually to prevent joint loosening</li>
      </ul>
    `
  },
  {
    id: 'best-outdoor-equipment-reliability',
    title: 'Best Outdoor Equipment for Reliability in All Weather',
    excerpt: 'Discover the most reliable camping gear, grills, patio furniture and outdoor equipment tested in extreme conditions.',
    date: '2025-02-20',
    author: 'Lemnaed Team',
    category: 'Outdoor Guide',
    image: '/images/blog/outdoor-equipment-reliability.jpg',
    readTime: '10 min read',
    slug: 'best-outdoor-equipment-reliability',
    content: `
      <h2>Outdoor Equipment That Withstands the Elements</h2>
      <p>Outdoor gear faces harsh conditions. Here are the brands and products that consistently perform in extreme weather and heavy use.</p>
      
      <h3>Grills: Built for Years of Cookouts</h3>
      <p>Most reliable outdoor cooking equipment:</p>
      <ul>
        <li><strong>Weber Genesis II</strong> - Stainless steel construction, 10-year warranty, proven durability</li>
        <li><strong>Traeger Pro Series</strong> - Wood pellet reliability, excellent temperature control</li>
        <li><strong>Big Green Egg</strong> - Ceramic construction lasts decades, versatile cooking</li>
        <li><strong>Char-Broil TRU-Infrared</strong> - Great value, reliable performance</li>
      </ul>
      
      <h3>Patio Furniture</h3>
      <p>Weather-resistant outdoor living:</p>
      <ul>
        <li><strong>Polywood</strong> - Recycled plastic lumber, 20-year warranty, no maintenance</li>
        <li><strong>Tropitone</strong> - Commercial-grade aluminum, powder-coated finish</li>
        <li><strong>Brown Jordan</strong> - Premium outdoor furniture, exceptional weather resistance</li>
        <li><strong>Teak Warehouse</strong> - Grade A teak, naturally weather-resistant</li>
      </ul>
      
      <h3>Camping and Hiking Gear</h3>
      <p>Equipment for serious outdoor enthusiasts:</p>
      <ul>
        <li><strong>REI Co-op</strong> - Excellent quality-to-price ratio, satisfaction guarantee</li>
        <li><strong>Patagonia</strong> - Lifetime guarantee, exceptional durability, sustainable practices</li>
        <li><strong>The North Face</strong> - Professional-grade tents and sleeping bags</li>
        <li><strong>Yeti</strong> - Premium coolers with legendary ice retention</li>
        <li><strong>MSR</strong> - Reliable camping stoves and water filters</li>
      </ul>
      
      <h3>Garden Tools and Equipment</h3>
      <p>Professional-grade tools for your yard:</p>
      <ul>
        <li><strong>Fiskars</strong> - Lifetime warranty on many tools, ergonomic design</li>
        <li><strong>Corona</strong> - Professional-grade pruners and saws</li>
        <li><strong>Honda</strong> - Lawnmowers known for reliability</li>
        <li><strong>Echo</strong> - Professional-grade string trimmers and blowers</li>
      </ul>
      
      <h3>What Makes Outdoor Equipment Durable?</h3>
      <p>Key factors for outdoor gear longevity:</p>
      <ol>
        <li><strong>Weather-Resistant Materials</strong> - Stainless steel, aluminum, treated wood</li>
        <li><strong>UV Protection</strong> - Fade-resistant finishes and fabrics</li>
        <li><strong>Rust Prevention</strong> - Powder coating or stainless construction</li>
        <li><strong>Reinforced Stress Points</strong> - Extra support where needed</li>
        <li><strong>Warranty Coverage</strong> - Long warranties indicate manufacturer confidence</li>
      </ol>
      
      <h3>Maintenance for Outdoor Equipment</h3>
      <p>Extend the life of your outdoor gear:</p>
      <ul>
        <li>Cover furniture and grills when not in use</li>
        <li>Clean and oil metal surfaces annually</li>
        <li>Store cushions indoors during winter months</li>
        <li>Inspect camping gear after each trip</li>
        <li>Winterize outdoor equipment properly</li>
      </ul>
    `
  },
  {
    id: 'most-durable-sports-equipment-2025',
    title: 'Most Durable Sports Equipment and Gear 2025',
    excerpt: 'Find the most reliable bikes, fitness equipment, and sports gear that professionals and enthusiasts trust.',
    date: '2025-02-25',
    author: 'Lemnaed Team',
    category: 'Sports Guide',
    image: '/images/blog/durable-sports-equipment.jpg',
    readTime: '9 min read',
    slug: 'most-durable-sports-equipment-2025',
    content: `
      <h2>Sports Equipment That Goes the Distance</h2>
      <p>Quality sports equipment performs better and lasts longer. Here's our guide to the most reliable gear for serious athletes and fitness enthusiasts.</p>
      
      <h3>Bicycles: Built for Miles</h3>
      <p>Most reliable bike brands:</p>
      <ul>
        <li><strong>Trek</strong> - Lifetime warranty on frames, excellent dealer network, proven quality</li>
        <li><strong>Specialized</strong> - Innovative designs, professional-grade components</li>
        <li><strong>Cannondale</strong> - American engineering, durable aluminum and carbon frames</li>
        <li><strong>Giant</strong> - Great value, reliable components, world's largest manufacturer</li>
        <li><strong>Surly</strong> - Steel frames built to last generations, touring specialists</li>
      </ul>
      
      <h3>Home Fitness Equipment</h3>
      <p>Gym-quality machines for home use:</p>
      <ul>
        <li><strong>Peloton</strong> - Premium build quality, excellent customer support, connected experience</li>
        <li><strong>Concept2</strong> - Rowing machines used by professionals, 5-year warranty</li>
        <li><strong>Rogue Fitness</strong> - Commercial-grade strength equipment, lifetime warranty</li>
        <li><strong>NordicTrack</strong> - Reliable treadmills and ellipticals, good value</li>
        <li><strong>Bowflex</strong> - Space-saving designs with proven durability</li>
      </ul>
      
      <h3>Running and Training Gear</h3>
      <p>Equipment for serious athletes:</p>
      <ul>
        <li><strong>Brooks Running</strong> - Shoes engineered for high mileage</li>
        <li><strong>Asics</strong> - Gel technology, consistent quality</li>
        <li><strong>Garmin</strong> - GPS watches with excellent longevity</li>
        <li><strong>Nike Pro</strong> - Compression gear that lasts</li>
      </ul>
      
      <h3>Team Sports Equipment</h3>
      <p>Gear for competitive play:</p>
      <ul>
        <li><strong>Wilson</strong> - Footballs, basketballs, tennis equipment - pro standard</li>
        <li><strong>Rawlings</strong> - Baseball gloves that break in perfectly and last years</li>
        <li><strong>Bauer</strong> - Hockey equipment trusted by NHL players</li>
        <li><strong>Mikasa</strong> - Volleyball standard for quality and durability</li>
      </ul>
      
      <h3>What Makes Sports Equipment Reliable?</h3>
      <p>Quality indicators in sports gear:</p>
      <ol>
        <li><strong>Material Quality</strong> - High-grade metals, composite materials, quality leather</li>
        <li><strong>Construction Methods</strong> - Welded frames, reinforced stitching</li>
        <li><strong>Component Selection</strong> - Branded parts from reputable manufacturers</li>
        <li><strong>Testing Standards</strong> - Professional athlete tested and approved</li>
        <li><strong>Warranty Terms</strong> - Comprehensive coverage indicates quality</li>
      </ol>
      
      <h3>Maintaining Your Sports Equipment</h3>
      <p>Get more life from your gear:</p>
      <ul>
        <li>Clean and lubricate bike chains regularly</li>
        <li>Rotate running shoes to extend their life</li>
        <li>Store equipment in climate-controlled areas</li>
        <li>Inspect equipment before each use</li>
        <li>Follow manufacturer maintenance schedules</li>
        <li>Replace worn parts before they cause damage</li>
      </ul>
    `
  },
  {
    id: 'reliable-home-improvement-products',
    title: 'Most Reliable Home Improvement Products and Materials',
    excerpt: 'Expert guide to choosing durable HVAC systems, water heaters, flooring and other home improvement products.',
    date: '2025-03-01',
    author: 'Lemnaed Team',
    category: 'Home Guide',
    image: '/images/blog/home-improvement-reliability.jpg',
    readTime: '12 min read',
    slug: 'reliable-home-improvement-products',
    content: `
      <h2>Reliable Home Improvement Products for Lasting Value</h2>
      <p>Home improvement represents major investments. Choose products and materials known for reliability to avoid costly replacements and repairs.</p>
      
      <h3>HVAC Systems: Comfort You Can Count On</h3>
      <p>Most reliable heating and cooling brands:</p>
      <ul>
        <li><strong>Trane</strong> - "It's hard to stop a Trane" - exceptional reliability, 12-year warranties</li>
        <li><strong>Carrier</strong> - Industry pioneer, consistent performance, wide service network</li>
        <li><strong>Lennox</strong> - High efficiency with good reliability scores</li>
        <li><strong>American Standard</strong> - Great value, reliable performance</li>
        <li><strong>Rheem</strong> - Strong track record in both HVAC and water heating</li>
      </ul>
      
      <h3>Water Heaters</h3>
      <p>Long-lasting hot water solutions:</p>
      <ul>
        <li><strong>Rheem Marathon</strong> - Lifetime tank warranty, plastic tank won't rust</li>
        <li><strong>Bradford White</strong> - Commercial-grade residential heaters</li>
        <li><strong>A.O. Smith</strong> - Consistent quality, good warranty coverage</li>
        <li><strong>Rinnai</strong> - Tankless leader, 12-year warranties on heat exchanger</li>
      </ul>
      
      <h3>Flooring Materials</h3>
      <p>Durable surfaces for every room:</p>
      <ul>
        <li><strong>Bruce Hardwood</strong> - Solid hardwood with 50+ year lifespan</li>
        <li><strong>Shaw Floors</strong> - Carpet and LVP with excellent warranties</li>
        <li><strong>Mohawk</strong> - Wide range of products, good reliability</li>
        <li><strong>Daltile</strong> - Ceramic and porcelain tile, lifetime residential warranty</li>
        <li><strong>COREtec</strong> - Waterproof LVP, 25-year residential warranty</li>
      </ul>
      
      <h3>Windows and Doors</h3>
      <p>Energy efficiency meets durability:</p>
      <ul>
        <li><strong>Pella</strong> - Premium windows, excellent warranties, local service</li>
        <li><strong>Andersen</strong> - Industry standard for reliability</li>
        <li><strong>Marvin</strong> - High-end wood windows, exceptional craftsmanship</li>
        <li><strong>Therma-Tru</strong> - Fiberglass entry doors, won't rot or warp</li>
      </ul>
      
      <h3>Roofing Materials</h3>
      <p>Protection that lasts:</p>
      <ul>
        <li><strong>GAF Timberline HDZ</strong> - 30-year limited warranty, wind resistance</li>
        <li><strong>CertainTeed Landmark</strong> - Excellent reliability, algae resistance</li>
        <li><strong>Owens Corning Duration</strong> - Strong warranty, good durability</li>
        <li><strong>Metal Roofing</strong> - 50+ year lifespan with minimal maintenance</li>
      </ul>
      
      <h3>Key Reliability Factors</h3>
      <p>What to prioritize in home improvements:</p>
      <ol>
        <li><strong>Energy Efficiency</strong> - Lower operating costs over time</li>
        <li><strong>Warranty Length</strong> - Longer coverage indicates manufacturer confidence</li>
        <li><strong>Professional Installation</strong> - Proper installation critical for longevity</li>
        <li><strong>Material Quality</strong> - Premium materials last longer</li>
        <li><strong>Maintenance Requirements</strong> - Lower maintenance means fewer costs</li>
        <li><strong>Local Service</strong> - Available parts and qualified technicians</li>
      </ol>
      
      <h3>Home Maintenance Schedule</h3>
      <p>Protect your investments:</p>
      <ul>
        <li>HVAC: Replace filters monthly, professional service annually</li>
        <li>Water Heater: Flush tank annually, check anode rod every 3 years</li>
        <li>Flooring: Regular cleaning per manufacturer specs, refinish hardwood every 10 years</li>
        <li>Windows: Clean tracks and lubricate annually</li>
        <li>Roof: Inspect twice yearly, address issues promptly</li>
      </ul>
    `
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
        <li>Owner-reported issues across major forums 
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