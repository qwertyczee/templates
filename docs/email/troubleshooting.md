# Troubleshooting

## Common Issues

### 1. API Key Not Found

**Problem**: `RESEND_API_KEY` is not set or not recognized.

**Solution**:
- Ensure `RESEND_API_KEY` is set in `.env.local`
- Restart the development server after adding environment variables
- Verify the key is valid in your Resend dashboard

### 2. Domain Not Verified

**Problem**: Emails are not being sent from your domain.

**Solution**:
- Verify your domain in the Resend dashboard
- Use the verified domain in `FROM_EMAIL`
- Check DNS records are properly configured

### 3. Email Not Sending

**Problem**: Email sending fails silently or with errors.

**Solution**:
- Check the browser console for errors
- Verify the API endpoint is receiving correct data
- Check Resend dashboard for delivery status
- Ensure all required fields are provided in the request

### 4. Template Rendering Issues

**Problem**: Emails are not rendering correctly or templates are missing.

**Solution**:
- Ensure all required props are provided to templates
- Check for TypeScript errors in template files
- Test templates individually using the test dashboard
- Verify component imports are correct

### 5. Type Errors in Custom Templates

**Problem**: TypeScript errors when creating custom email templates.

**Solution**:
- Ensure template data interfaces match the component props
- Import types from `@/emails/types`
- Use proper React.FC typing for components
- Check that all required fields are included

## Debug Mode

Enable debug logging by setting:

```env
DEBUG=email
```

This will output detailed logs to help identify issues.

## Getting Help

For issues related to:
- **Resend API**: Check [Resend Documentation](https://resend.com/docs)
- **React Email**: Check [React Email Documentation](https://react.email/docs)
- **This Implementation**: Review the email system documentation in this folder
