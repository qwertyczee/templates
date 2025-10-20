import * as React from 'react';
import { Button as EmailButton } from '@react-email/components';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({ 
  href, 
  children, 
  className = '',
  style = {}
}) => {
  const defaultStyle = {
    backgroundColor: '#000000',
    borderRadius: '6px',
    color: '#ffffff',
    display: 'inline-block',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '24px',
    padding: '12px 24px',
    textAlign: 'center' as const,
    textDecoration: 'none',
    width: '100%',
    ...style
  };

  return (
    <EmailButton 
      href={href} 
      className={className}
      style={defaultStyle}
    >
      {children}
    </EmailButton>
  );
};