---
title: "Routing - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/guides/routing"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Routing

Learn how to use and customize the routing system in Metronic Next.js.

# Routing

Metronic Next.js uses the App Router for handling navigation between different pages. This guide explains the routing system architecture and how to work with it.

## Routing Architecture

The App Router in Next.js 15.3 is a file-system based router where:

- Folders define the route structure

- page.tsx files define UI for a route segment

- layout.tsx files define shared UI for a segment and its children

- Route Groups (folders with parentheses) organize routes without affecting URL paths

## Project Structure

The Metronic Next.js project organizes routes in the app directory:

```text
app/
├── (auth)/                 # Authentication route group (not included in URL)
│   ├── signin/             # Sign-in page
│   ├── signup/             # Sign-up page
│   └── forgot-password/    # Password recovery
├── (protected)/            # Protected routes requiring authentication
│   ├── account/            # Account settings section
│   │   ├── activity/       # Account activity page
│   │   ├── billing/        # Billing page
│   │   └── security/       # Security settings
│   ├── page.tsx            # Dashboard page (default protected route)
│   └── layout.tsx          # Layout for all protected routes
├── api/                    # API routes
│   ├── auth/               # Authentication API endpoints
│   └── [...]/              # Other API endpoints
├── components/             # Shared UI components used across pages
│   ├── layouts/            # Layout components (demo1-demo10)
│   └── ui/                 # UI components
├── models/                 # Data models and interfaces
└── layout.tsx              # Root layout (applies to all pages)
```

## Creating Pages

To create a new page, add a page.tsx file in the appropriate directory:

```text
// Basic page component
export default function AccountPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      <p>Manage your account preferences</p>
    </div>
  );
}
```

For client-side interactivity, add the 'use client' directive:

```text
'use client';
 
import { useState } from 'react';
 
export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
 
  return (
    <div>
      <h1>Settings</h1>
      {saved && <div>Settings saved!</div>}
      <button onClick={() => setSaved(true)}>Save Settings</button>
    </div>
  );
}
```

## Layouts

Layouts provide a consistent UI structure for route segments:

```text
// Basic layout component
export default function AccountLayout({ children }) {
  return (
    <div className="account-layout">
      <nav className="account-nav">
        {/* Navigation elements */}
      </nav>
      <main>{children}</main>
    </div>
  );
}
```

The children prop represents the page content or nested layouts.

## Route Groups

Route groups, indicated by folders with parentheses, allow you to organize routes without affecting the URL structure:

```text
app/
├── (auth)/       # Authentication routes that don't include "(auth)" in URL
│   ├── signin/   # URL: /signin
│   └── signup/   # URL: /signup
└── (protected)/  # Protected routes that don't include "(protected)" in URL
    └── account/  # URL: /account
```

## Authentication Protection

Create protected layouts that check for authentication:

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

## Navigation

### Link Component

For navigation between routes, use the Link component:

```text
import Link from 'next/link';
 
// Basic link
<Link href="/dashboard">Dashboard</Link>
 
// Link with additional props
<Link href="/profile" prefetch={false} className="profile-link">
  Profile
</Link>
```

### Programmatic Navigation

For programmatic navigation (e.g., after form submission), use the useRouter hook:

```text
'use client';
 
import { useRouter } from 'next/navigation';
 
function LoginForm() {
  const router = useRouter();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Login logic...
    router.push('/dashboard');
  };
 
  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

## Dynamic Routes

Create dynamic routes with parameters using brackets in folder names:

```text
app/
└── user/
    └── [id]/
        └── page.tsx  # Matches /user/123, /user/abc, etc.
```

Access the parameter with the params prop:

```text
export default function UserProfile({ params }) {
  return <div>User ID: {params.id}</div>;
}
```

## Catch-all Routes

For catch-all routes, use triple dots in the folder name:

```text
// Basic page component
export default function AccountPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      <p>Manage your account preferences</p>
    </div>
  );
}
```0

Access the parameters:

```text
// Basic page component
export default function AccountPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      <p>Manage your account preferences</p>
    </div>
  );
}
```1

## Special Files

Next.js App Router supports several special files:

### Loading States

Create a loading.tsx file to show a loading UI:

```text
// Basic page component
export default function AccountPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      <p>Manage your account preferences</p>
    </div>
  );
}
```2

### Error Handling

Create an error.tsx file to handle errors:

```text
// Basic page component
export default function AccountPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      <p>Manage your account preferences</p>
    </div>
  );
}
```3

### Not Found Pages

Create a not-found.tsx file for 404 errors:

```text
// Basic page component
export default function AccountPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      <p>Manage your account preferences</p>
    </div>
  );
}
```4

## Advanced Routing Features

### Parallel Routes

For advanced cases, use parallel routes to show multiple pages simultaneously:

```text
// Basic page component
export default function AccountPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      <p>Manage your account preferences</p>
    </div>
  );
}
```5

### Intercepting Routes

Use intercepting routes to show UI while keeping the current page, useful for modals:

```text
// Basic page component
export default function AccountPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      <p>Manage your account preferences</p>
    </div>
  );
}
```6

For more information on App Router features, refer to the Next.js documentation.

PreviousLayoutsNextProviders

On This Page

- Routing

- Routing Architecture
- Project Structure
- Creating Pages
- Layouts
- Route Groups
- Authentication Protection
- Navigation
- Dynamic Routes
- Catch-all Routes
- Special Files
- Advanced Routing Features

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Routing - Metronic NextJS
-
-
