import { Resend } from 'resend';
import { render } from '@react-email/render';
import * as React from 'react';
import { WelcomeEmail } from '../emails/templates/WelcomeEmail';
import { PasswordResetEmail } from '../emails/templates/PasswordResetEmail';
import { NotificationEmail } from '../emails/templates/NotificationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
const FROM_NAME = process.env.FROM_NAME || 'Your App Name';

export interface EmailOptions {
  to: string | string[];
  subject?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  to: string,
  data: {
    userName: string;
    userEmail: string;
    appName?: string;
    loginUrl?: string;
  }
): Promise<SendEmailResult> {
  try {
    const html = await render(<WelcomeEmail data={data} />);
    
    const { data: result, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject: 'Welcome to Your App!',
      html,
      replyTo: FROM_EMAIL,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      messageId: result?.id
    };
  } catch (err) {
    console.error('Email sending error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  data: {
    userName: string;
    resetUrl: string;
    expiryHours?: number;
  }
): Promise<SendEmailResult> {
  try {
    const html = await render(<PasswordResetEmail data={data} />);
    
    const { data: result, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject: 'Reset Your Password',
      html,
      replyTo: FROM_EMAIL,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      messageId: result?.id
    };
  } catch (err) {
    console.error('Email sending error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}

/**
 * Send generic notification email
 */
export async function sendNotificationEmail(
  to: string,
  data: {
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    userName?: string;
  }
): Promise<SendEmailResult> {
  try {
    const html = await render(<NotificationEmail data={data} />);
    
    const { data: result, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject: data.title,
      html,
      replyTo: FROM_EMAIL,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      messageId: result?.id
    };
  } catch (err) {
    console.error('Email sending error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get email delivery status
 */
export async function getEmailStatus(emailId: string) {
  try {
    const { data, error } = await resend.emails.get(emailId);
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (err) {
    console.error('Email status error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred'
    };
  }
}