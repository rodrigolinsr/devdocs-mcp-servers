---
title: "Routing - Shoplit"
url: "https://docs.keenthemes.com/shoplit/shoplit/routing"
section: "shoplit"
---
Purchase

#### Getting Started

IntroductionInstallationPrismaSupabaseComponentsReferencesPricingFAQChangelog

#### Guides

RTLDeploymenti18nRoutingAuthentication

Getting Started

# Routing

Learn how to use Shoplit's routing system.

# Routing

Shoplit uses Next.js App Router with a structured routing system that includes route groups, protected routes, and authentication-based routing.

## Route Structure

```text
app/
├── (auth)/                   # Authentication routes
│   ├── login/
│   ├── register/
│   ├── change-password/
│   ├── reset-password/
│   └── verify-email/
│
├── (protected)/             # Protected routes (require authentication)
│   ├── dashboard/
│   ├── products/
│   ├── orders/
│   ├── customers/
│   ├── categories/
│   ├── settings/
│   ├── account/
│   ├── activity-logs/
│   └── user-management/
│
├── api/                     # API routes
│   └── ...
│
└── shared/                  # Shared components and utilities
    └── ...
```

## Route Groups

Shoplit uses route groups for logical organization:

-

Authentication Group (auth)

- Contains all authentication-related pages

- Uses AuthLayout with centered content

- Public access

-

Protected Group (protected)

- Contains all authenticated user pages

- Uses DefaultLayout with sidebar navigation

- Requires authentication

## Protected Routes

Protected routes are implemented using a layout wrapper:

```text
// app/(protected)/layout.tsx
'use client';
 
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
 
export default function ProtectedLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
 
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
 
  if (status === 'loading') {
    return <ScreenLoader />;
  }
 
  return session ? <DefaultLayout>{children}</DefaultLayout> : null;
}
```

## Navigation

### Page Navigation

Use the useRouter hook for programmatic navigation:

```text
import { useRouter } from 'next/navigation';
 
export function ProductList() {
  const router = useRouter();
 
  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
  };
}
```

### Link Component

Use the Link component for declarative navigation:

```text
import Link from 'next/link';
 
export function Navigation() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/products">Products</Link>
      <Link href="/orders">Orders</Link>
    </nav>
  );
}
```

## Route Layouts

### Auth Layout

Used for authentication pages with centered content:

```text
// app/(auth)/layout.tsx
export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {children}
    </div>
  );
}
```

### Default Layout

Used for protected pages with sidebar navigation:

```text
// app/components/layouts/default.tsx
export function DefaultLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## Route Protection

### Authentication Check

Routes in the (protected) group are automatically protected:

-

Session Check

- Verifies user authentication status

- Redirects to login if unauthenticated

- Shows loading state during check

-

Role-Based Access

- Verifies user permissions

- Redirects to dashboard if unauthorized

- Shows appropriate error messages

### Example Protected Route

```text
// app/(protected)/products/page.tsx
export default function ProductsPage() {
  const { data: session } = useSession();
  const hasAccess = session?.user.permissions.includes('products.view');
 
  if (!hasAccess) {
    return <AccessDenied />;
  }
 
  return <ProductList />;
}
```

## Route Loading States

Shoplit provides consistent loading states:

-

Screen Loader

- Full-screen loading for route changes

- Used during authentication checks

-

Skeleton Loading

- Content-specific loading states

- Maintains layout structure during data fetch

```text
// Example loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
```

## Error Handling

### Error Pages

Custom error pages for different scenarios:

-

Not Found (404)

```text
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="text-center">
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}
```

-

Error Boundary

```text
// app/error.tsx
'use client';
 
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="text-center">
      <h1>Something went wrong</h1>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Best Practices

-

Route Organization

- Use route groups for logical separation

- Keep related routes together

- Follow consistent naming conventions

-

Performance

- Implement loading states

- Use dynamic imports for large components

- Optimize page transitions

-

Security

- Always verify authentication in protected routes

- Implement proper role checks

- Handle sensitive data appropriately

-

User Experience

- Provide clear navigation paths

- Show appropriate loading states

- Handle errors gracefully

Previousi18nNextAuthentication

On This Page

- Routing

- Route Structure
- Route Groups
- Protected Routes
- Navigation
- Route Layouts
- Route Protection
- Route Loading States
- Error Handling
- Best Practices

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Routing - Shoplit
-
-
