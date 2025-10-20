import * as React from 'react';
import { Html } from '@react-email/components';
import { Container, Heading, Text, Button } from '../components';
import { PasswordResetEmailData } from '../types';

interface PasswordResetEmailProps {
  data: PasswordResetEmailData;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({ data }) => {
  const { userName, resetUrl, expiryHours = 24 } = data;

  return (
    <Html>
      <Container>
        <Heading>Reset Your Password</Heading>
        
        <Text>
          Hi {userName},
        </Text>
        
        <Text>
          We received a request to reset your password. Click the button below to 
          create a new password:
        </Text>
        
        <Button href={resetUrl}>
          Reset Password
        </Button>
        
        <Text>
          This link will expire in {expiryHours} hours for security reasons. 
          If you didn&apos;t request a password reset, you can safely ignore this email.
        </Text>
        
        <Text>
          If you have any trouble clicking the reset button, copy and paste the 
          following link into your browser:
        </Text>
        
        <Text style={{ wordBreak: 'break-all', backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '4px' }}>
          {resetUrl}
        </Text>
        
        <Text>
          For security reasons, please make sure to:
        </Text>
        
        <Text>
          • Choose a strong password with at least 8 characters<br />
          • Include a mix of letters, numbers, and symbols<br />
          • Don&apos;t reuse passwords from other accounts
        </Text>
        
        <Text>
          If you didn&apos;t request this password reset, please contact our support 
          team immediately.
        </Text>
        
        <Text>
          Best regards,<br />
          The Security Team
        </Text>
      </Container>
    </Html>
  );
};