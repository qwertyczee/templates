# Email Components

Custom email components built with shadcn design patterns for consistent, polished email design.

## Available Components

### Container

Main email container with styling and layout.

```typescript
import { Container } from '@/emails/components';

<Container>
  {/* Email content */}
</Container>
```

### Heading

Styled headings for email sections.

```typescript
import { Heading } from '@/emails/components';

<Heading>Your Subject</Heading>
```

### Text

Styled paragraphs and text content.

```typescript
import { Text } from '@/emails/components';

<Text>Your message here</Text>
```

### Button

Call-to-action buttons with styling.

```typescript
import { Button } from '@/emails/components';

<Button href="https://example.com">Action</Button>
```

## Using Custom Components

```typescript
import { Container, Heading, Text, Button } from '@/emails/components';

export const CustomEmail: React.FC<{ data: CustomData }> = ({ data }) => (
  <Html>
    <Container>
      <Heading>Your Subject</Heading>
      <Text>Your message here</Text>
      <Button href="https://example.com">Action</Button>
    </Container>
  </Html>
);
```

## Component Structure

All components follow React Email conventions and are designed to work seamlessly with the email rendering system. They provide consistent styling and layout across all email templates.
