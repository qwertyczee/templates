import * as React from 'react';
import { Heading as EmailHeading } from '@react-email/components';

interface HeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  style?: React.CSSProperties;
}

export const Heading: React.FC<HeadingProps> = ({ 
  children, 
  as = 'h2',
  className = '',
  style = {}
}) => {
  const baseStyle = {
    color: '#111827',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '32px',
    margin: '0 0 20px 0',
    textAlign: 'left' as const,
    ...style
  };

  return (
    <EmailHeading 
      as={as}
      className={className}
      style={baseStyle}
    >
      {children}
    </EmailHeading>
  );
};