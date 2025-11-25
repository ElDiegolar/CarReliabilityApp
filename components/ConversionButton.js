// components/ConversionButton.js - Next.js optimized trackable CTA buttons
import Link from 'next/link';
import { trackMicroConversion } from '../lib/analytics';

const ConversionButton = ({ 
  children, 
  onClick, 
  href,
  nextLink = false,
  conversionAction = 'button_click',
  conversionSource = 'unknown',
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props 
}) => {
  const handleClick = (e) => {
    // Track the micro-conversion
    trackMicroConversion(conversionAction, conversionSource);
    
    // Call the original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };

  // Inline styles for Next.js compatibility (avoiding Tailwind dependency)
  const getButtonStyles = () => {
    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      borderRadius: '8px',
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      border: 'none',
      textDecoration: 'none',
    };

    const variants = {
      primary: {
        backgroundColor: '#0070f3',
        color: 'white',
      },
      secondary: {
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: '1px solid #d1d5db',
      },
      success: {
        backgroundColor: '#10b981',
        color: 'white',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#0070f3',
        border: '2px solid #0070f3',
      }
    };

    const sizes = {
      small: {
        padding: '6px 12px',
        fontSize: '14px',
      },
      medium: {
        padding: '8px 16px',
        fontSize: '16px',
      },
      large: {
        padding: '12px 24px',
        fontSize: '18px',
      }
    };

    return {
      ...base,
      ...variants[variant],
      ...sizes[size],
    };
  };

  const buttonStyle = getButtonStyles();

  if (href && nextLink) {
    return (
      <Link href={href}>
        <a 
          onClick={handleClick}
          style={buttonStyle}
          className={className}
          {...props}
        >
          {children}
        </a>
      </Link>
    );
  }

  if (href) {
    return (
      <a 
        href={href}
        onClick={handleClick}
        style={buttonStyle}
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={handleClick}
      style={buttonStyle}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export default ConversionButton;