---
title: "Authentication - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/guides/authentication"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Authentication

Learn how to use the Next Auth authentication system in Metronic Next.js.

Metronic Next.js includes a complete authentication system powered by NextAuth.js, providing user authentication, protected routes, and profile management with Prisma ORM integration.

## Overview

The authentication system consists of:

- Auth Provider: Provides session state and authentication methods

- NextAuth API Routes: Handle authentication requests

- Prisma Adapter: Connects NextAuth to the database

- Protected Layouts: Guards routes that require authentication

- Credential & OAuth Providers: Support multiple authentication methods

## File Structure

The authentication system is organized in the following structure:

```text
app/
├── (auth)/                   # Authentication routes
│   ├── signin/               # Sign in page
│   ├── signup/               # Sign up page
│   └── reset-password/       # Password reset page
├── api/
│   └── auth/
│       └── [...nextauth]/    # NextAuth API routes
│           ├── auth-options.ts  # NextAuth configuration
│           └── route.ts      # API route handler
├── components/
│   └── ui/                   # UI components for forms
prisma/
└── schema.prisma             # Database schema with User model
providers/
└── auth-provider.tsx         # NextAuth SessionProvider
```

## Environment Setup

Configure your .env file with NextAuth and OAuth credentials:

```text
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000/
NEXTAUTH_SECRET=your-nextauth-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Using Authentication

### Accessing User Session

Get the current user session in any client component:

```text
'use client';
 
import { useSession } from 'next-auth/react';
 
function ProfileDisplay() {
  const { data: session, status } = useSession();
 
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
 
  if (status !== 'authenticated') {
    return <div>You need to sign in</div>;
  }
 
  return (
    <div>
      <img src={session.user.image || '/default-avatar.png'} alt="Profile" />
      <h2>{session.user.name}</h2>
      <p>{session.user.email}</p>
    </div>
  );
}
```

### Authentication Actions

Perform sign in, sign out and check session status:

```text
'use client';
 
import { signIn, signOut, useSession } from 'next-auth/react';
 
function AuthActions() {
  const { status } = useSession();
 
  if (status === 'authenticated') {
    return <button onClick={() => signOut()}>Sign out</button>;
  }
 
  return <button onClick={() => signIn()}>Sign in</button>;
}
```

### Social Authentication

Implement social login with minimal code:

```text
import { signIn } from 'next-auth/react';
 
function SocialLogin() {
  return (
    <div>
      <button onClick={() => signIn('google', { callbackUrl: '/' })}>
        Sign in with Google
      </button>
      <button onClick={() => signIn('github', { callbackUrl: '/' })}>
        Sign in with GitHub
      </button>
    </div>
  );
}
```

### Protecting Routes

Create protected route layouts to secure parts of your application:

```text
'use client';
 
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
 
export default function ProtectedLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();
 
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);
 
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
 
  return status === 'authenticated' ? children : null;
}
```

### Role-Based Access Control

Check user roles for conditional rendering:

```text
'use client';
 
import { useSession } from 'next-auth/react';
 
function AdminContent() {
  const { data: session } = useSession();
 
  if (!session?.user.roles?.includes('admin')) {
    return <div>Access denied</div>;
  }
 
  return <div>Admin dashboard content</div>;
}
```

### Credentials Login Form

Create a login form with credentials:

```text
'use client';
 
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
 
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
 
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
 
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
 
    if (result?.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
  }
 
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Getting Session on the Server

Access the session in server components:

```text
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
 
export default async function ServerComponent() {
  const session = await getServerSession(authOptions);
 
  if (!session) {
    return <div>Please sign in to view this content</div>;
  }
 
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>
    </div>
  );
}
```

## Common Authentication Patterns

### Redirecting After Login

Customize redirect paths after authentication:

```text
// Redirect to a specific page after login
signIn('credentials', {
  redirect: true,
  callbackUrl: '/dashboard',
  email,
  password,
});
 
// Redirect to a specific page after logout
signOut({ callbackUrl: '/signin' });
```

### Checking Auth Status Before Loading Data

Wait for authentication before loading sensitive data:

```text
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000/
NEXTAUTH_SECRET=your-nextauth-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```0

For more information about NextAuth.js, refer to the official documentation.

PreviousProvidersNextInternationalization

On This Page

- Overview
- File Structure
- Environment Setup
- Using Authentication

- Accessing User Session
- Authentication Actions
- Social Authentication
- Protecting Routes
- Role-Based Access Control
- Credentials Login Form
- Getting Session on the Server

- Common Authentication Patterns

- Redirecting After Login
- Checking Auth Status Before Loading Data

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Authentication - Metronic NextJS
-
-
