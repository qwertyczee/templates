import * as React from 'react';
import { Html } from '@react-email/components';
import { Container, Heading, Text, Button } from '../components';
import { NotificationEmailData } from '../types';

interface NotificationEmailProps {
  data: NotificationEmailData;
}

export const NotificationEmail: React.FC<NotificationEmailProps> = ({ data }) => {
  const { title, message, actionUrl, actionText, userName } = data;

  return (
    <Html>
      <Container>
        <Heading>{title}</Heading>
        
        {userName && (
          <Text>
            Hi {userName},
          </Text>
        )}
        
        <Text>
          {message}
        </Text>
        
        {actionUrl && actionText && (
          <Button href={actionUrl}>
            {actionText}
          </Button>
        )}
        
        <Text>
          If you have any questions or need assistance, please don&apos;t hesitate 
          to contact our support team.
        </Text>
        
        <Text>
          Best regards,<br />
          The Team
        </Text>
      </Container>
    </Html>
  );
};