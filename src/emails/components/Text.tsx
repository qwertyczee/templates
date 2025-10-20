import * as React from 'react';
import { Text as EmailText } from '@react-email/components';

interface TextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({ 
  children, 
  className = '',
  style = {}
}) => {
  const defaultStyle = {
    color: '#6b7280',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 20px 0',
    ...style
  };

  return (
    <EmailText 
      className={className}
      style={defaultStyle}
    >
      {children}
    </EmailText>
  );
};