# Best Practices

Follow these best practices when working with the email system:

## Security

1. **Environment Variables**: Never commit API keys to version control
   - Use `.env.local` for local development
   - Use environment variables in production

2. **Validation**: Always validate email addresses and required fields before sending
   ```typescript
   if (!isValidEmail(to)) {
     throw new Error('Invalid email address');
   }
   ```

3. **Rate Limiting**: Implement rate limiting for email endpoints to prevent abuse
   ```typescript
   // Use a rate limiting library like express-rate-limit
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   ```

## Template Design

1. **Mobile-Friendly**: Design emails to be responsive and mobile-friendly
   - Use inline CSS for better compatibility
   - Test on multiple email clients
   - Keep line length under 600px

2. **Accessibility**: Ensure emails are accessible
   - Use semantic HTML
   - Provide alt text for images
   - Use sufficient color contrast

3. **Performance**: Keep email file size small
   - Optimize images
   - Minimize CSS
   - Avoid heavy JavaScript

## Error Handling

1. **Always Check Results**: Always check the `success` field before proceeding
   ```typescript
   const result = await sendWelcomeEmail(email, data);
   if (!result.success) {
     console.error('Email failed:', result.error);
     // Handle error appropriately
   }
   ```

2. **Logging**: Log all email operations for debugging
   ```typescript
   console.log('Email sent:', {
     to,
     type,
     messageId: result.messageId,
     timestamp: new Date().toISOString()
   });
   ```

3. **Retry Logic**: Implement retry logic for failed emails
   ```typescript
   async function sendWithRetry(fn, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   }
   ```

## Testing

1. **Use Test Dashboard**: Always test templates using the test dashboard before sending to users

2. **Test Data**: Use realistic test data that matches production scenarios

3. **Email Clients**: Test emails in multiple email clients:
   - Gmail
   - Outlook
   - Apple Mail
   - Mobile clients

## Monitoring

1. **Track Delivery**: Monitor email delivery status in Resend dashboard

2. **Bounce Handling**: Implement bounce handling for invalid emails

3. **Metrics**: Track email metrics:
   - Sent count
   - Delivery rate
   - Open rate
   - Click rate

## Content Guidelines

1. **Subject Lines**: Keep subject lines concise and descriptive
   - Avoid spam trigger words
   - Include relevant keywords
   - Keep under 50 characters for mobile

2. **From Address**: Use a consistent, recognizable from address
   - Include company name
   - Use noreply@ for transactional emails
   - Verify domain in Resend

3. **Unsubscribe**: Include unsubscribe links for marketing emails
   - Required by law in many jurisdictions
   - Use Resend's built-in unsubscribe feature

4. **Call-to-Action**: Make CTAs clear and prominent
   - Use action-oriented text
   - Provide clear value proposition
   - Limit to 1-2 CTAs per email
