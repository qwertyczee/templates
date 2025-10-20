export interface EmailTemplate<T = Record<string, unknown>> {
  component: React.ComponentType<T>;
  subject: string;
  data: T;
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  appName?: string;
  loginUrl?: string;
}

export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  expiryHours?: number;
}

export interface NotificationEmailData {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  userName?: string;
}