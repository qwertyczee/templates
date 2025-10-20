# Email Usage Guide

## Server-Side Functions

Import the email functions in your server components or API routes:

```typescript
import { 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendNotificationEmail 
} from '@/lib/email';
```

## Welcome Email

Send a welcome email to new users after registration:

```typescript
await sendWelcomeEmail('user@example.com', {
  userName: 'John Doe',
  userEmail: 'john@example.com',
  appName: 'Your App',
  loginUrl: 'https://yourapp.com/login'
});
```

**Parameters:**
- `to` (string): Recipient email address
- `data.userName` (string): User's name
- `data.userEmail` (string): User's email address
- `data.appName` (string): Your application name
- `data.loginUrl` (string): URL to login page

## Password Reset Email

Send a password reset email when users request to reset their password:

```typescript
await sendPasswordResetEmail('user@example.com', {
  userName: 'John Doe',
  resetUrl: 'https://yourapp.com/reset?token=abc123',
  expiryHours: 24
});
```

**Parameters:**
- `to` (string): Recipient email address
- `data.userName` (string): User's name
- `data.resetUrl` (string): URL with reset token
- `data.expiryHours` (number): Hours until reset link expires

## Notification Email

Send generic notification emails for various events:

```typescript
await sendNotificationEmail('user@example.com', {
  title: 'New Feature Available',
  message: 'Check out our latest features!',
  actionUrl: 'https://yourapp.com/features',
  actionText: 'View Features',
  userName: 'John Doe'
});
```

**Parameters:**
- `to` (string): Recipient email address
- `data.title` (string): Email title/subject
- `data.message` (string): Email message content
- `data.actionUrl` (string): URL for action button
- `data.actionText` (string): Text for action button
- `data.userName` (string, optional): User's name

## API Endpoint

Send emails via HTTP POST to `/api/email`:

```bash
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "to": "user@example.com",
    "data": {
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "appName": "Your App",
      "loginUrl": "https://yourapp.com/login"
    }
  }'
```

### API Response

Success response:
```json
{
  "success": true,
  "messageId": "abc123def456",
  "message": "Email sent successfully"
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Failed to send email"
}
```
