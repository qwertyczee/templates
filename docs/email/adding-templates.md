# Adding New Email Templates

This guide explains how to create and integrate new email templates into the system.

## Step 1: Create Template Component

Create a new file in `src/emails/templates/` directory:

```typescript
// src/emails/templates/CustomEmail.tsx
import * as React from 'react';
import { Html } from '@react-email/components';
import { Container, Heading, Text, Button } from '../components';

interface CustomEmailData {
  userName: string;
  customField: string;
}

interface CustomEmailProps {
  data: CustomEmailData;
}

export const CustomEmail: React.FC<CustomEmailProps> = ({ data }) => {
  const { userName, customField } = data;

  return (
    <Html>
      <Container>
        <Heading>Custom Email</Heading>
        <Text>Hi {userName},</Text>
        <Text>{customField}</Text>
      </Container>
    </Html>
  );
};
```

## Step 2: Add Type Definitions

Update `src/emails/types.ts` with your new data interface:

```typescript
// src/emails/types.ts
export interface CustomEmailData {
  userName: string;
  customField: string;
}
```

## Step 3: Update Template Registry

Register your template in `src/emails/templates/index.ts`:

```typescript
// src/emails/templates/index.ts
export const emailTemplates = {
  // ... existing templates
  custom: {
    component: CustomEmail,
    subject: 'Custom Email Subject',
  },
} as const;
```

## Step 4: Add Email Service Function

Create a new function in `src/lib/email.tsx`:

```typescript
// src/lib/email.tsx
export async function sendCustomEmail(
  to: string,
  data: CustomEmailData
): Promise<SendEmailResult> {
  try {
    const html = await render(<CustomEmail data={data} />);
    
    const { data: result, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject: 'Custom Email Subject',
      html,
      replyTo: FROM_EMAIL,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: result?.id };
  } catch (err) {
    console.error('Error sending custom email:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}
```

## Step 5: Export New Function

Add the export to `src/lib/email.tsx`:

```typescript
export { sendCustomEmail };
```

## Complete Example

Here's a complete example of adding an "Invoice Email" template:

### 1. Create Template

```typescript
// src/emails/templates/InvoiceEmail.tsx
import * as React from 'react';
import { Html } from '@react-email/components';
import { Container, Heading, Text, Button } from '../components';

interface InvoiceEmailData {
  userName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  invoiceUrl: string;
}

interface InvoiceEmailProps {
  data: InvoiceEmailData;
}

export const InvoiceEmail: React.FC<InvoiceEmailProps> = ({ data }) => {
  const { userName, invoiceNumber, amount, dueDate, invoiceUrl } = data;

  return (
    <Html>
      <Container>
        <Heading>Invoice #{invoiceNumber}</Heading>
        <Text>Hi {userName},</Text>
        <Text>Your invoice is ready for review.</Text>
        <Text>Amount: ${amount.toFixed(2)}</Text>
        <Text>Due Date: {dueDate}</Text>
        <Button href={invoiceUrl}>View Invoice</Button>
      </Container>
    </Html>
  );
};
```

### 2. Add Types

```typescript
// src/emails/types.ts
export interface InvoiceEmailData {
  userName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  invoiceUrl: string;
}
```

### 3. Register Template

```typescript
// src/emails/templates/index.ts
import { InvoiceEmail } from './InvoiceEmail';

export const emailTemplates = {
  welcome: { /* ... */ },
  passwordReset: { /* ... */ },
  notification: { /* ... */ },
  invoice: {
    component: InvoiceEmail,
    subject: 'Invoice Ready',
  },
} as const;
```

### 4. Create Service Function

```typescript
// src/lib/email.tsx
export async function sendInvoiceEmail(
  to: string,
  data: InvoiceEmailData
): Promise<SendEmailResult> {
  try {
    const html = await render(<InvoiceEmail data={data} />);
    
    const { data: result, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject: 'Invoice Ready',
      html,
      replyTo: FROM_EMAIL,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: result?.id };
  } catch (err) {
    console.error('Error sending invoice email:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}
```

## Best Practices

1. **Keep templates simple** - Email clients have limited CSS support
2. **Use semantic HTML** - Ensures compatibility across email clients
3. **Test thoroughly** - Use the test dashboard before deploying
4. **Validate data** - Always validate input data before rendering
5. **Use consistent styling** - Leverage existing components for consistency
6. **Mobile-friendly** - Design for mobile-first approach
7. **Accessible** - Use proper heading hierarchy and alt text for images
