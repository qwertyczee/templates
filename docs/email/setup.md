# Email System Setup

## Environment Variables

Create a `.env.local` file in your project root:

```env
# Resend API Key
RESEND_API_KEY=your_resend_api_key_here

# Email configuration
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your App Name
```

## Domain Configuration

1. Sign up for a Resend account at [resend.com](https://resend.com)
2. Verify your domain in the Resend dashboard
3. Get your API key and add it to the environment variables

## Installation

The email system is already configured in this project. No additional installation is required.

### Dependencies

The following packages are already included:
- `resend` - Email delivery service
- `react-email` - Component-based email templates
- `next` - Next.js framework
