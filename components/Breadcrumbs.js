// components/Breadcrumbs.js - SEO-friendly breadcrumb navigation
import Link from 'next/link';
import { useRouter } from 'next/router';

const Breadcrumbs = ({ customBreadcrumbs = null }) => {
  const router = useRouter();
  
  // If custom breadcrumbs are provided, use them
  if (customBreadcrumbs) {
    return (
      <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
        <ol className="breadcrumb-list">
          {customBreadcrumbs.map((crumb, index) => (
            <li key={index} className="breadcrumb-item">
              {crumb.href && index < customBreadcrumbs.length - 1 ? (
                <Link href={crumb.href}>{crumb.label}</Link>
              ) : (
                <span className="current">{crumb.label}</span>
              )}
              {index < customBreadcrumbs.length - 1 && (
                <span className="separator" aria-hidden="true">›</span>
              )}
            </li>
          ))}
        </ol>

        <style jsx>{`
          .breadcrumbs {
            margin: 1rem 0;
            font-size: 0.9rem;
          }

          .breadcrumb-list {
            display: flex;
            align-items: center;
            list-style: none;
            padding: 0;
            margin: 0;
            flex-wrap: wrap;
          }

          .breadcrumb-item {
            display: flex;
            align-items: center;
          }

          .breadcrumb-item a {
            color: #0070f3;
            text-decoration: none;
            padding: 0.25rem 0;
          }

          .breadcrumb-item a:hover {
            text-decoration: underline;
          }

          .breadcrumb-item .current {
            color: #666;
            font-weight: 500;
          }

          .separator {
            margin: 0 0.5rem;
            color: #999;
          }

          @media (max-width: 768px) {
            .breadcrumbs {
              font-size: 0.8rem;
            }
            
            .separator {
              margin: 0 0.3rem;
            }
          }
        `}</style>

        {/* Structured data for breadcrumbs */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": customBreadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.label,
                "item": crumb.href ? `https://lemnaed.com${crumb.href}` : undefined
              }))
            })
          }}
        />
      </nav>
    );
  }

  // Auto-generate breadcrumbs from path
  const pathArray = router.asPath.split('/').filter(path => path);
  
  const breadcrumbs = [
    { label: 'Home', href: '/' }
  ];

  // Build breadcrumbs from path
  let currentPath = '';
  pathArray.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Clean up path names for display
    let label = path
      .replace(/-/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Special cases for common pages
    const pathMappings = {
      'search': 'Car Search',
      'blog': 'Blog',
      'pricing': 'Pricing',
      'profile': 'My Profile',
      'saved-vehicles': 'Saved Vehicles',
      'search-history': 'Search History'
    };

    if (pathMappings[path]) {
      label = pathMappings[path];
    }

    breadcrumbs.push({
      label,
      href: index === pathArray.length - 1 ? null : currentPath
    });
  });

  // Don't show breadcrumbs on homepage
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="breadcrumb-item">
            {crumb.href ? (
              <Link href={crumb.href}>{crumb.label}</Link>
            ) : (
              <span className="current">{crumb.label}</span>
            )}
            {index < breadcrumbs.length - 1 && (
              <span className="separator" aria-hidden="true">›</span>
            )}
          </li>
        ))}
      </ol>

      <style jsx>{`
        .breadcrumbs {
          margin: 1rem 0;
          font-size: 0.9rem;
        }

        .breadcrumb-list {
          display: flex;
          align-items: center;
          list-style: none;
          padding: 0;
          margin: 0;
          flex-wrap: wrap;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
        }

        .breadcrumb-item a {
          color: #0070f3;
          text-decoration: none;
          padding: 0.25rem 0;
        }

        .breadcrumb-item a:hover {
          text-decoration: underline;
        }

        .breadcrumb-item .current {
          color: #666;
          font-weight: 500;
        }

        .separator {
          margin: 0 0.5rem;
          color: #999;
        }

        @media (max-width: 768px) {
          .breadcrumbs {
            font-size: 0.8rem;
          }
          
          .separator {
            margin: 0 0.3rem;
          }
        }
      `}</style>

      {/* Structured data for breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": crumb.label,
              "item": crumb.href ? `https://lemnaed.com${crumb.href}` : undefined
            }))
          })
        }}
      />
    </nav>
  );
};

export default Breadcrumbs;