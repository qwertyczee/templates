import {
  EmailTemplate,
  WelcomeEmailData,
  PasswordResetEmailData,
  NotificationEmailData
} from '../types';
import { WelcomeEmail } from './WelcomeEmail';
import { PasswordResetEmail } from './PasswordResetEmail';
import { NotificationEmail } from './NotificationEmail';

// Template registry for easy future additions
export const emailTemplates = {
  welcome: {
    component: WelcomeEmail,
    subject: 'Welcome to Your App!',
  },
  
  passwordReset: {
    component: PasswordResetEmail,
    subject: 'Reset Your Password',
  },
  
  notification: {
    component: NotificationEmail,
    subject: 'Notification',
  },
} as const;

// Export individual templates for direct use
export { WelcomeEmail, PasswordResetEmail, NotificationEmail };

// Export types for template data
export type { 
  EmailTemplate, 
  WelcomeEmailData, 
  PasswordResetEmailData, 
  NotificationEmailData 
} from '../types';

// Helper function to get template by name
export function getTemplate<T extends keyof typeof emailTemplates>(
  templateName: T
): typeof emailTemplates[T] {
  return emailTemplates[templateName];
}

// Helper function to get all available template names
export function getAvailableTemplates(): string[] {
  return Object.keys(emailTemplates);
}