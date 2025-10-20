# Email Templates

## Available Templates

### 1. Welcome Email (`WelcomeEmail`)

Sent to new users after registration.

**Purpose**: Greet new users and provide login information

**Required Fields**:
- `userName` - User's display name
- `userEmail` - User's email address

**Optional Fields**:
- `appName` - Application name (default: "Your App")
- `loginUrl` - URL to login page

**Example**:
```typescript
await sendWelcomeEmail('user@example.com', {
  userName: 'John Doe',
  userEmail: 'john@example.com',
  appName: 'Your App',
  loginUrl: 'https://yourapp.com/login'
});
```

### 2. Password Reset Email (`PasswordResetEmail`)

Sent when users request password reset.

**Purpose**: Provide secure password reset link with expiry information

**Required Fields**:
- `userName` - User's display name
- `resetUrl` - URL to password reset page with token

**Optional Fields**:
- `expiryHours` - Hours until reset link expires (default: 24)

**Example**:
```typescript
await sendPasswordResetEmail('user@example.com', {
  userName: 'John Doe',
  resetUrl: 'https://yourapp.com/reset?token=abc123',
  expiryHours: 24
});
```

### 3. Notification Email (`NotificationEmail`)

Generic template for various notifications.

**Purpose**: Send customizable notifications to users

**Required Fields**:
- `title` - Email subject/title
- `message` - Main message content

**Optional Fields**:
- `actionUrl` - URL for call-to-action button
- `actionText` - Text for call-to-action button
- `userName` - User's name for personalization

**Example**:
```typescript
await sendNotificationEmail('user@example.com', {
  title: 'New Feature Available',
  message: 'Check out our latest features!',
  actionUrl: 'https://yourapp.com/features',
  actionText: 'View Features',
  userName: 'John Doe'
});
```

## Template Structure

Each template follows this TypeScript structure:

```typescript
interface TemplateData {
  // Template-specific fields
}

interface TemplateProps {
  data: TemplateData;
}

export const Template: React.FC<TemplateProps> = ({ data }) => {
  // Template implementation using React Email components
};
```

## Template Location

All templates are located in `src/emails/templates/`:
- `WelcomeEmail.tsx`
- `PasswordResetEmail.tsx`
- `NotificationEmail.tsx`

## Template Registry

Templates are registered in `src/emails/templates/index.ts`:

```typescript
export const emailTemplates = {
  welcome: {
    component: WelcomeEmail,
    subject: 'Welcome to Your App',
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
```
