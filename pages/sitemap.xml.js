// pages/sitemap.xml.js - Dynamic sitemap generator for SEO
import { GetServerSideProps } from 'next'

const EXTERNAL_DATA_URL = 'https://lemnaed.com';

// List of static pages
const STATIC_PAGES = [
  '',
  '/search',
  '/pricing', 
  '/privacy',
  '/terms',
  '/blog',
  '/login',
  '/profile'
];

// List of blog posts - in a real app this would come from a CMS/API
const BLOG_POSTS = [
  '/blog/5-most-reliable-used-cars-under-15k-worldwide-2025',
  '/blog/how-to-avoid-lemon-used-car-buying-worldwide',
  '/blog/understanding-reliability-scores'
];

// Popular car searches to include in sitemap for SEO
const POPULAR_CAR_SEARCHES = [
  // Toyota searches
  '/search?year=2018&make=Toyota&model=Corolla',
  '/search?year=2017&make=Toyota&model=Camry',
  '/search?year=2019&make=Toyota&model=RAV4',
  '/search?year=2016&make=Toyota&model=Yaris',
  
  // Honda searches
  '/search?year=2018&make=Honda&model=Civic',
  '/search?year=2017&make=Honda&model=Accord',
  '/search?year=2019&make=Honda&model=CR-V',
  '/search?year=2016&make=Honda&model=Fit',
  
  // BMW searches
  '/search?year=2018&make=BMW&model=3 Series',
  '/search?year=2017&make=BMW&model=X3',
  '/search?year=2019&make=BMW&model=5 Series',
  
  // Mercedes searches
  '/search?year=2018&make=Mercedes-Benz&model=C-Class',
  '/search?year=2017&make=Mercedes-Benz&model=E-Class',
  '/search?year=2019&make=Mercedes-Benz&model=GLC',
  
  // Volkswagen searches
  '/search?year=2018&make=Volkswagen&model=Golf',
  '/search?year=2017&make=Volkswagen&model=Passat',
  '/search?year=2019&make=Volkswagen&model=Tiguan',
  
  // Ford searches
  '/search?year=2018&make=Ford&model=Focus',
  '/search?year=2017&make=Ford&model=Fiesta',
  '/search?year=2019&make=Ford&model=Kuga',
  
  // Nissan searches
  '/search?year=2018&make=Nissan&model=Qashqai',
  '/search?year=2017&make=Nissan&model=Micra',
  '/search?year=2019&make=Nissan&model=X-Trail'
];

function generateSiteMap(pages) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${pages
       .map(({ loc, lastmod, changefreq, priority }) => {
         return `
       <url>
           <loc>${loc}</loc>
           <lastmod>${lastmod}</lastmod>
           <changefreq>${changefreq}</changefreq>
           <priority>${priority}</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps = async ({ res }) => {
  const baseUrl = EXTERNAL_DATA_URL;
  const currentDate = new Date().toISOString();

  // Build the sitemap URLs array
  const pages = [];

  // Add static pages
  STATIC_PAGES.forEach(page => {
    pages.push({
      loc: `${baseUrl}${page}`,
      lastmod: currentDate,
      changefreq: page === '' ? 'daily' : 'weekly',
      priority: page === '' ? '1.0' : '0.8'
    });
  });

  // Add blog posts
  BLOG_POSTS.forEach(post => {
    pages.push({
      loc: `${baseUrl}${post}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7'
    });
  });

  // Add popular car search URLs
  POPULAR_CAR_SEARCHES.forEach(search => {
    pages.push({
      loc: `${baseUrl}${search}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.6'
    });
  });

  // Generate the XML sitemap
  const sitemap = generateSiteMap(pages);

  res.setHeader('Content-Type', 'text/xml');
  // Cache for 24 hours
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  
  // Send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;