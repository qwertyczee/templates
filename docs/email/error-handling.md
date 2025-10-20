# Error Handling

All email functions return a `SendEmailResult` object that contains error information:

```typescript
interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
```

## Checking for Errors

Always check the `success` field before proceeding:

```typescript
const result = await sendWelcomeEmail(email, data);

if (!result.success) {
  console.error('Email failed to send:', result.error);
  // Handle error appropriately
  return;
}

console.log('Email sent with ID:', result.messageId);
```

## Common Error Scenarios

### Missing API Key
If `RESEND_API_KEY` is not set, you'll receive an error about missing credentials.

### Invalid Email Address
Resend validates email addresses. Invalid formats will be rejected.

### Template Rendering Errors
If template props are missing or incorrect, rendering will fail with a descriptive error.

### Network Errors
Connection issues to Resend API will be caught and returned in the error field.

## Error Logging

Enable detailed logging by checking the browser console and server logs:

```typescript
// Server-side logging
console.error('Email error:', result.error);

// Client-side (in test dashboard)
console.log('Response:', result);
```

## Retry Strategy

For production, implement retry logic for transient failures:

```typescript
async function sendEmailWithRetry(
  to: string,
  data: any,
  maxRetries = 3
): Promise<SendEmailResult> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await sendWelcomeEmail(to, data);
    if (result.success) return result;
    
    // Wait before retrying (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
  }
  
  return { success: false, error: 'Max retries exceeded' };
}
```
