# Email Testing Guide

## Test Dashboard

Visit `/test-email` to test all email templates with a web interface.

### Manual Testing

```typescript
// Test in API route or server component
const result = await sendWelcomeEmail('test@example.com', {
  userName: 'Test User',
  userEmail: 'test@example.com',
  appName: 'Test App',
  loginUrl: 'https://testapp.com/login'
});

console.log(result);
```

## Testing Best Practices

1. **Use Test Email Addresses**: Always use test email addresses when testing
2. **Check Resend Dashboard**: Verify delivery status in the Resend dashboard
3. **Test All Templates**: Test each template type before deploying
4. **Validate Data**: Ensure all required fields are provided
5. **Check Email Rendering**: Test emails in different email clients
