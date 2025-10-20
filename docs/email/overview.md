# Email System Overview

This document describes the email system built with Resend and React Email for your Next.js application.

## Overview

The email system provides a server-side solution for sending transactional emails using:
- **Resend** - Email delivery service
- **React Email** - Component-based email templates
- **Shadcn-inspired components** - Consistent, polished email design

## Features

- ✅ Server-side email sending only
- ✅ Pre-built templates (Welcome, Password Reset, Notification)
- ✅ Custom email components with shadcn styling
- ✅ Easy template registry system for future additions
- ✅ TypeScript support
- ✅ Error handling and logging

## Quick Start

1. Set up environment variables (see [setup.md](./setup.md))
2. Import email functions from `@/lib/email`
3. Send emails using the provided functions
4. Check [usage.md](./usage.md) for detailed examples

## Available Templates

- **Welcome Email** - Sent to new users after registration
- **Password Reset Email** - Sent when users request password reset
- **Notification Email** - Generic template for various notifications

For detailed information about each template, see [templates.md](./templates.md).
