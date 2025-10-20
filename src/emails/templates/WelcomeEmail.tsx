import * as React from 'react';
import { Html } from '@react-email/components';
import { Container, Heading, Text, Button } from '../components';
import { WelcomeEmailData } from '../types';

interface WelcomeEmailProps {
  data: WelcomeEmailData;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ data }) => {
  const { userName, userEmail, appName = 'Your App', loginUrl } = data;

  return (
    <Html>
      <Container>
        <Heading>Welcome to {appName}!</Heading>
        
        <Text>
          Hi {userName},
        </Text>
        
        <Text>
          Thank you for signing up to {appName}! We're excited to have you on board. 
          Your account has been successfully created with the email address: {userEmail}
        </Text>
        
        <Text>
          Get started by clicking the button below to access your dashboard:
        </Text>
        
        {loginUrl && (
          <Button href={loginUrl}>
            Get Started
          </Button>
        )}
        
        <Text>
          If you have any questions, feel free to reply to this email. We're here to help!
        </Text>
        
        <Text>
          Best regards,<br />
          The {appName} Team
        </Text>
      </Container>
    </Html>
  );
};