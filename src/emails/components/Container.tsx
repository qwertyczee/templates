import * as React from 'react';
import { Container as EmailContainer } from '@react-email/components';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '',
  style = {}
}) => {
  const defaultStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px',
    ...style
  };

  return (
    <EmailContainer 
      className={className}
      style={defaultStyle}
    >
      {children}
    </EmailContainer>
  );
};