---
title: "Authentication - Shoplit"
url: "https://docs.keenthemes.com/shoplit/shoplit/authentication"
section: "shoplit"
---
Purchase

#### Getting Started

IntroductionInstallationPrismaSupabaseComponentsReferencesPricingFAQChangelog

#### Guides

RTLDeploymenti18nRoutingAuthentication

Getting Started

# Authentication

Learn how to implement authentication in Shoplit.

# Authentication

Shoplit provides a comprehensive authentication system with built-in security features and form validation.

## Demo Access

For quick testing, use these demo credentials:

```text
Email: "demo@shoplit.com"
Password: "demo123"
```

## Password Requirements

Shoplit enforces strong password requirements:

- Minimum 8 characters

- At least one uppercase letter

- At least one lowercase letter

- At least one number

- At least one special character (!@#$%^&*(),.?":{}|<>)

## Form Validation

### Login Schema

```text
// app/shared/schemas/login-schema.ts
export const getLoginSchema = () => {
  return z.object({
    email: z
      .string()
      .email({ message: 'Please enter a valid email address.' })
      .min(1, { message: 'Email is required.' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long.' })
      .min(1, { message: 'Password is required.' }),
    rememberMe: z.boolean().optional(),
  });
};
```

### Registration Schema

```text
// app/shared/schemas/register-schema.ts
export const getRegisterSchema = () => {
  return z
    .object({
      name: z
        .string()
        .min(2, { message: 'Name must be at least 2 characters long.' })
        .min(1, { message: 'Name is required.' }),
      email: z
        .string()
        .email({ message: 'Please enter a valid email address.' })
        .min(1, { message: 'Email is required.' }),
      password: getPasswordSchema(), // Enforces strong password requirements
      passwordConfirmation: z.string().min(1, {
        message: 'Password confirmation is required.',
      }),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Passwords do not match.',
      path: ['passwordConfirmation'],
    });
};
```

### Password Schema

```text
// app/shared/schemas/password-schema.ts
export const getPasswordSchema = (minLength = 8) => {
  return z
    .string()
    .min(minLength, {
      message: `Password must be at least ${minLength} characters long.`,
    })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter.',
    })
    .regex(/\d/, {
      message: 'Password must contain at least one number.',
    })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: 'Password must contain at least one special character.',
    });
};
```

## Authentication Forms

### Login Form Features

- Email/Password login

- Google OAuth option

- Remember Me functionality

- Password visibility toggle

- Forgot password link

- Demo credentials alert

- Real-time validation

- Responsive error handling

### Registration Form Features

- Name, Email, Password fields

- Password strength requirements

- Password confirmation

- Google OAuth signup option

- Real-time validation

- Password visibility toggles

- Automatic redirect after signup

## Error Messages

Shoplit provides user-friendly error messages for common scenarios:

```text
// Login Errors
{
  400: 'Please enter both email and password.',
  401: 'Invalid credentials. Incorrect password.',
  403: 'Account not activated. Please verify your email.',
  404: 'User not found. Please register first.',
}
 
// Registration Errors
{
  400: 'Invalid registration data.',
  409: 'Email already exists.',
  422: 'Password does not meet requirements.',
}
```

## Role Assignment

New users are automatically assigned roles based on registration method:

-

Email Registration

- Requires email verification

- Assigned default role

- Status set to 'PENDING' until verified

-

Google OAuth

- Auto-verified email

- Assigned default role

- Status set to 'ACTIVE'

- Profile synced from Google

## Session Tracking

Shoplit tracks user sessions with:

```text
interface UserSession {
  id: string;
  email: string;
  name: string | null;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  roleId: string;
  roleName: string;
  avatar: string | null;
  lastSignInAt: Date;
}
```

## Security Features

-

Password Security

- bcrypt hashing with salt rounds

- Strong password requirements

- Password visibility toggle

- Password confirmation

-

Email Security

- Email verification required

- Secure password reset flow

- Rate-limited email sending

- HTML escape for email content

-

OAuth Security

- Secure state validation

- Email account linking

- Profile data syncing

- Default role assignment

PreviousRouting

On This Page

- Authentication

- Demo Access
- Password Requirements
- Form Validation
- Authentication Forms
- Error Messages
- Role Assignment
- Session Tracking
- Security Features

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Authentication - Shoplit
-
-
